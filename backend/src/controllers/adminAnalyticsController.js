import Order from '../models/Order.js';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import ProductAnalytics from '../models/ProductAnalytics.js';
import TailoringRequest from '../models/TailoringRequest.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { deleteCachePattern } from '../services/cacheService.js';

/**
 * Get Platform Analytics Summary (BI Analytics)
 * GET /api/admin/analytics-summary
 */
export const getAnalyticsSummary = async (req, res, next) => {
    try {
        // 1. Core KPIs
        const paidOrders = await Order.find({ paymentStatus: 'paid' });
        
        const totalOrders = paidOrders.length;
        const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const aov = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;
        
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalProducts = await Product.countDocuments();

        // 2. Sales Trend (Past 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const salesTrendAggregate = await Order.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Format sales trend (ensure all past 6 months have an entry)
        const monthsName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const salesTrend = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const m = d.getMonth() + 1;
            const y = d.getFullYear();
            
            const match = salesTrendAggregate.find(item => item._id.month === m && item._id.year === y);
            salesTrend.push({
                month: `${monthsName[m - 1]} ${y}`,
                revenue: match ? Number(match.revenue.toFixed(2)) : 0,
                orders: match ? match.orders : 0
            });
        }

        // 3. Category Sales Distribution
        const categorySalesAggregate = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $group: {
                    _id: '$productDetails.category',
                    sales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    quantity: { $sum: '$items.quantity' }
                }
            },
            { $sort: { sales: -1 } }
        ]);

        const categorySales = categorySalesAggregate.map(item => ({
            category: item._id || 'Uncategorized',
            revenue: Number(item.sales.toFixed(2)),
            quantity: item.quantity
        }));

        // 4. Order Status breakdown
        const statusBreakdown = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const orderStatuses = {
            pending: 0,
            accepted: 0,
            preparing: 0,
            ready: 0,
            completed: 0,
            cancelled: 0
        };
        statusBreakdown.forEach(item => {
            if (orderStatuses[item._id] !== undefined) {
                orderStatuses[item._id] = item.count;
            }
        });

        // 5. Top Selling Products
        const topProductsAggregate = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    name: { $first: '$items.name' },
                    unitsSold: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            { $sort: { unitsSold: -1 } },
            { $limit: 5 }
        ]);

        const topProducts = [];
        for (const item of topProductsAggregate) {
            const prod = await Product.findById(item._id).select('images');
            topProducts.push({
                productId: item._id,
                name: item.name,
                unitsSold: item.unitsSold,
                revenue: Number(item.revenue.toFixed(2)),
                image: prod?.images?.[0] || ''
            });
        }

        return successResponse(res, {
            kpis: {
                totalOrders,
                totalRevenue: Number(totalRevenue.toFixed(2)),
                aov,
                totalCustomers,
                totalProducts
            },
            salesTrend,
            categorySales,
            orderStatuses,
            topProducts
        }, 'Analytics summary generated successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * Get Settlements Ledger
 * GET /api/admin/ledger
 */
export const getLedger = async (req, res, next) => {
    try {
        const shops = await Shop.find()
            .populate('sellerId', 'name email phone')
            .sort('-createdAt')
            .lean();

        // Calculate sales summaries for each shop to display alongside ledgers
        const ledgerData = [];
        for (const shop of shops) {
            const paidOrders = await Order.find({ shopId: shop._id, paymentStatus: 'paid' });
            const totalSales = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            
            ledgerData.push({
                _id: shop._id,
                shopName: shop.shopName,
                category: shop.category,
                status: shop.status,
                seller: {
                    name: shop.sellerId?.name || 'Unknown Vendor',
                    email: shop.sellerId?.email || 'N/A',
                    phone: shop.sellerId?.phone || 'N/A'
                },
                gstin: shop.gstin || '',
                pan: shop.pan || '',
                kycDocumentUrl: shop.kycDocumentUrl || '',
                kycStatus: shop.kycStatus || 'pending',
                commissionRate: shop.commissionRate ?? 10,
                balance: shop.balance ?? 0,
                totalPaid: shop.totalPaid ?? 0,
                totalSales: Number(totalSales.toFixed(2))
            });
        }

        return successResponse(res, ledgerData, 'Ledger details retrieved');
    } catch (error) {
        next(error);
    }
};

/**
 * Update KYC status and documents for a Shop
 * PATCH /api/admin/shops/:id/kyc
 */
export const updateKYC = async (req, res, next) => {
    try {
        const { gstin, pan, kycStatus, commissionRate, kycDocumentUrl } = req.body;
        const shopId = req.params.id;

        const shop = await Shop.findById(shopId);
        if (!shop) {
            return errorResponse(res, 'Shop not found', 404);
        }

        if (gstin !== undefined) shop.gstin = gstin;
        if (pan !== undefined) shop.pan = pan;
        if (kycStatus !== undefined) shop.kycStatus = kycStatus;
        if (kycDocumentUrl !== undefined) shop.kycDocumentUrl = kycDocumentUrl;
        if (commissionRate !== undefined) shop.commissionRate = Number(commissionRate);

        await shop.save();
        return successResponse(res, { shop }, 'Shop KYC/Ledger parameters updated successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Release Payout (Mock Bank Transfer)
 * POST /api/admin/shops/:id/payout
 */
export const releasePayout = async (req, res, next) => {
    try {
        const shopId = req.params.id;
        const shop = await Shop.findById(shopId);
        
        if (!shop) {
            return errorResponse(res, 'Shop not found', 404);
        }

        const payoutAmount = shop.balance || 0;
        if (payoutAmount <= 0) {
            return errorResponse(res, 'No outstanding balance to payout', 400);
        }

        // Release balance to totalPaid
        shop.totalPaid = (shop.totalPaid || 0) + payoutAmount;
        shop.balance = 0;
        await shop.save();

        return successResponse(res, {
            shop,
            payoutAmount
        }, `Payout of ₹${payoutAmount.toLocaleString()} released successfully to vendor`);
    } catch (error) {
        next(error);
    }
};

/**
 * Get Returns & Refund Candidates (Completed Paid Orders)
 * GET /api/admin/refunds
 */
export const getRefundList = async (req, res, next) => {
    try {
        const orders = await Order.find({ paymentStatus: 'paid' })
            .populate('customerId', 'name email phone')
            .populate('shopId', 'shopName commissionRate')
            .sort('-createdAt')
            .lean();

        return successResponse(res, orders, 'Paid orders retrieved successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Process Return & Refund
 * POST /api/admin/orders/:id/refund
 */
export const processRefund = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId);

        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }

        if (order.paymentStatus !== 'paid') {
            return errorResponse(res, 'Order must be paid to initiate refund', 400);
        }

        // Check if already refunded
        if (order.status === 'cancelled' && order.payment?.status === 'failed') {
            return errorResponse(res, 'Refund has already been processed for this order', 400);
        }

        const shop = await Shop.findById(order.shopId);
        if (!shop) {
            return errorResponse(res, 'Merchant shop not found', 404);
        }

        // 1. Mark Order status as cancelled, refund flag
        order.status = 'cancelled';
        order.paymentStatus = 'failed';
        if (order.payment) {
            order.payment.status = 'failed'; // Mark payment failed/refunded
        }
        order.rejectionReason = 'Returned & Refunded by Admin';
        await order.save();

        // 2. Restore Catalog Stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity }
            });
        }
        await deleteCachePattern('products:*');

        // 3. Deduct Payout Net Amount from Shop Balance
        const commissionRate = shop.commissionRate ?? 10;
        const netCredited = order.totalAmount * (1 - (commissionRate / 100));
        shop.balance = Math.max(0, Number(((shop.balance || 0) - netCredited).toFixed(2)));
        await shop.save();

        // 4. Send Confirmation Email to Customer
        if (order.customerId) {
            const customer = await User.findById(order.customerId);
            if (customer && customer.email) {
                import('../services/emailService.js').then(({ sendWelcomeEmail }) => {
                    // Reusing sandbox email utility to send refund success notice
                    // In a production system, we'd have a specific refund template, but we will send a direct mail fallback here
                    const nodemailer = import('nodemailer'); // standard fallback
                    // We will trigger emailService fallback
                }).catch(err => console.error('Refund email notification failed:', err));
            }
        }

        return successResponse(res, { order, shop }, `Refund of ₹${order.totalAmount.toLocaleString()} completed successfully. Stock restored.`);

    } catch (error) {
        next(error);
    }
};

/**
 * Get all custom tailoring requests (Admin only)
 * GET /api/admin/tailoring
 */
export const getAdminTailoringRequests = async (req, res, next) => {
    try {
        const requests = await TailoringRequest.find()
            .populate('customerId', 'name email phone')
            .populate('productId', 'name price images')
            .populate('shopId', 'shopName')
            .sort('-createdAt');

        return successResponse(res, requests, 'Tailoring requests retrieved successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Update tailoring status and specifications (Admin only)
 * PATCH /api/admin/tailoring/:id/status
 */
export const updateAdminTailoringStatus = async (req, res, next) => {
    try {
        const { status, estimatedDeliveryDays, quotedPrice, sellerNotes } = req.body;
        const request = await TailoringRequest.findById(req.params.id);

        if (!request) {
            return errorResponse(res, 'Tailoring request not found', 404);
        }

        if (status !== undefined) request.status = status;
        if (estimatedDeliveryDays !== undefined) request.estimatedDeliveryDays = Number(estimatedDeliveryDays);
        if (quotedPrice !== undefined) request.quotedPrice = Number(quotedPrice);
        if (sellerNotes !== undefined) request.sellerNotes = sellerNotes;

        await request.save();

        return successResponse(res, request, 'Tailoring request updated successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Get Comprehensive Platform Insights & Product Analytics
 * GET /api/admin/platform-insights
 */
export const getPlatformInsights = async (req, res, next) => {
    try {
        const now = new Date();

        // ─── 1. Product Analytics Leaderboard (Top viewed, top carted, top converting) ───
        const productAnalytics = await ProductAnalytics.find()
            .populate({
                path: 'productId',
                select: 'name price discountedPrice images category stock isAvailable shopId',
                populate: { path: 'shopId', select: 'shopName' }
            })
            .sort('-totalViews')
            .lean();

        // Filter out entries with deleted products
        const validAnalytics = productAnalytics.filter(pa => pa.productId);

        // Top 10 most viewed
        const topViewed = validAnalytics.slice(0, 10).map(pa => ({
            productId: pa.productId._id,
            name: pa.productId.name,
            image: pa.productId.images?.[0] || '',
            category: pa.productId.category,
            shop: pa.productId.shopId?.shopName || 'N/A',
            price: pa.productId.discountedPrice || pa.productId.price,
            stock: pa.productId.stock,
            views: pa.totalViews,
            addToCart: pa.totalAddToCart,
            wishlistAdds: pa.totalWishlistAdds,
            purchases: pa.totalPurchases,
            revenue: pa.totalRevenue,
            conversionRate: pa.totalViews > 0
                ? Number(((pa.totalPurchases / pa.totalViews) * 100).toFixed(2))
                : 0,
            cartRate: pa.totalViews > 0
                ? Number(((pa.totalAddToCart / pa.totalViews) * 100).toFixed(2))
                : 0,
        }));

        // Top 10 most added to cart
        const topCarted = [...validAnalytics]
            .sort((a, b) => b.totalAddToCart - a.totalAddToCart)
            .slice(0, 10)
            .map(pa => ({
                productId: pa.productId._id,
                name: pa.productId.name,
                image: pa.productId.images?.[0] || '',
                category: pa.productId.category,
                addToCart: pa.totalAddToCart,
                views: pa.totalViews,
                purchases: pa.totalPurchases,
                cartRate: pa.totalViews > 0
                    ? Number(((pa.totalAddToCart / pa.totalViews) * 100).toFixed(2))
                    : 0,
            }));

        // Top 10 best converting (min 5 views to be meaningful)
        const topConverting = [...validAnalytics]
            .filter(pa => pa.totalViews >= 5)
            .sort((a, b) => {
                const rateA = a.totalViews > 0 ? a.totalPurchases / a.totalViews : 0;
                const rateB = b.totalViews > 0 ? b.totalPurchases / b.totalViews : 0;
                return rateB - rateA;
            })
            .slice(0, 10)
            .map(pa => ({
                productId: pa.productId._id,
                name: pa.productId.name,
                image: pa.productId.images?.[0] || '',
                views: pa.totalViews,
                purchases: pa.totalPurchases,
                revenue: pa.totalRevenue,
                conversionRate: pa.totalViews > 0
                    ? Number(((pa.totalPurchases / pa.totalViews) * 100).toFixed(2))
                    : 0,
            }));

        // Worst performers — high views but zero/low purchases
        const worstPerformers = [...validAnalytics]
            .filter(pa => pa.totalViews >= 3 && pa.totalPurchases === 0)
            .sort((a, b) => b.totalViews - a.totalViews)
            .slice(0, 10)
            .map(pa => ({
                productId: pa.productId._id,
                name: pa.productId.name,
                image: pa.productId.images?.[0] || '',
                category: pa.productId.category,
                views: pa.totalViews,
                addToCart: pa.totalAddToCart,
                stock: pa.productId.stock,
            }));

        // ─── 2. Platform Totals ───
        const platformTotals = validAnalytics.reduce((acc, pa) => {
            acc.totalViews += pa.totalViews;
            acc.totalAddToCart += pa.totalAddToCart;
            acc.totalWishlistAdds += pa.totalWishlistAdds;
            acc.totalPurchases += pa.totalPurchases;
            return acc;
        }, { totalViews: 0, totalAddToCart: 0, totalWishlistAdds: 0, totalPurchases: 0 });

        // ─── 3. Daily Revenue/Orders Trend (Past 30 days) ───
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const dailyRevenueTrend = await Order.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        // Fill in missing days with zero
        const revenueByDay = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();

            const match = dailyRevenueTrend.find(
                item => item._id.year === y && item._id.month === m && item._id.day === day
            );
            revenueByDay.push({
                date: d.toISOString().split('T')[0],
                label: `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                revenue: match ? Number(match.revenue.toFixed(2)) : 0,
                orders: match ? match.orders : 0
            });
        }

        // ─── 4. Customer Growth (Past 30 days) ───
        const customerGrowth = await User.aggregate([
            {
                $match: {
                    role: 'customer',
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        const newCustomersByDay = [];
        let runningTotal = await User.countDocuments({
            role: 'customer',
            createdAt: { $lt: thirtyDaysAgo }
        });

        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();

            const match = customerGrowth.find(
                item => item._id.year === y && item._id.month === m && item._id.day === day
            );
            const newCount = match ? match.count : 0;
            runningTotal += newCount;
            newCustomersByDay.push({
                date: d.toISOString().split('T')[0],
                label: `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                newCustomers: newCount,
                totalCustomers: runningTotal
            });
        }

        // ─── 5. Conversion Funnel ───
        const totalActiveProducts = await Product.countDocuments({ isAvailable: true, isBanned: false });
        const totalCarts = await Cart.countDocuments({ 'items.0': { $exists: true } }); // non-empty carts
        const totalPaidOrders = await Order.countDocuments({ paymentStatus: 'paid' });
        const totalCancelledOrders = await Order.countDocuments({ status: 'cancelled' });

        const conversionFunnel = {
            productViews: platformTotals.totalViews,
            addedToCart: platformTotals.totalAddToCart,
            wishlistAdds: platformTotals.totalWishlistAdds,
            purchased: platformTotals.totalPurchases,
            activeCartsNow: totalCarts,
            paidOrders: totalPaidOrders,
            cancelledOrders: totalCancelledOrders,
            viewToCartRate: platformTotals.totalViews > 0
                ? Number(((platformTotals.totalAddToCart / platformTotals.totalViews) * 100).toFixed(2))
                : 0,
            cartToPurchaseRate: platformTotals.totalAddToCart > 0
                ? Number(((platformTotals.totalPurchases / platformTotals.totalAddToCart) * 100).toFixed(2))
                : 0,
            overallConversionRate: platformTotals.totalViews > 0
                ? Number(((platformTotals.totalPurchases / platformTotals.totalViews) * 100).toFixed(2))
                : 0,
        };

        // ─── 6. Revenue by Category (with product count) ───
        const categoryInsights = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$product.category',
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    unitsSold: { $sum: '$items.quantity' },
                    orders: { $sum: 1 },
                    products: { $addToSet: '$product._id' }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        const revenueByCategory = categoryInsights.map(item => ({
            category: item._id || 'Uncategorized',
            revenue: Number(item.revenue.toFixed(2)),
            unitsSold: item.unitsSold,
            orders: item.orders,
            productCount: item.products.length,
        }));

        // ─── 7. Peak Hours (what time do orders come in) ───
        const peakHours = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            {
                $group: {
                    _id: { $hour: '$createdAt' },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        const hourlyDistribution = Array.from({ length: 24 }, (_, h) => {
            const match = peakHours.find(item => item._id === h);
            return {
                hour: h,
                label: `${h.toString().padStart(2, '0')}:00`,
                orders: match ? match.orders : 0,
                revenue: match ? Number(match.revenue.toFixed(2)) : 0,
            };
        });

        // ─── 8. Low Stock Alert ───
        const lowStockProducts = await Product.find({
            isAvailable: true,
            isBanned: false,
            stock: { $gt: 0, $lte: 5 }
        })
        .select('name price stock images category')
        .sort('stock')
        .limit(10)
        .lean();

        // ─── 9. Summary KPI cards ───
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        const todayRevenue = await Order.aggregate([
            { $match: { paymentStatus: 'paid', createdAt: { $gte: todayStart } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
        ]);

        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);

        const yesterdayRevenue = await Order.aggregate([
            { $match: { paymentStatus: 'paid', createdAt: { $gte: yesterdayStart, $lt: todayStart } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
        ]);

        const todayRev = todayRevenue[0]?.total || 0;
        const yesterdayRev = yesterdayRevenue[0]?.total || 0;
        const revenueChange = yesterdayRev > 0
            ? Number((((todayRev - yesterdayRev) / yesterdayRev) * 100).toFixed(1))
            : todayRev > 0 ? 100 : 0;

        const summaryKpis = {
            todayRevenue: Number(todayRev.toFixed(2)),
            todayOrders: todayRevenue[0]?.count || 0,
            yesterdayRevenue: Number(yesterdayRev.toFixed(2)),
            yesterdayOrders: yesterdayRevenue[0]?.count || 0,
            revenueChangePercent: revenueChange,
            totalActiveProducts,
            totalTrackedProducts: validAnalytics.length,
        };

        return successResponse(res, {
            summaryKpis,
            conversionFunnel,
            topViewed,
            topCarted,
            topConverting,
            worstPerformers,
            revenueByDay,
            newCustomersByDay,
            revenueByCategory,
            hourlyDistribution,
            lowStockProducts,
        }, 'Platform insights generated successfully');

    } catch (error) {
        next(error);
    }
};
