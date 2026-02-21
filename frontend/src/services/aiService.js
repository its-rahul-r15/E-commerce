/**
 * aiService.js — AI service powered by Groq (llama-3.3-70b)
 *
 * SETUP: frontend/.env already has VITE_GROQ_API_KEY set.
 * Works WITHOUT API key using the built-in rule-based parser as fallback.
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // fast, free, accurate

const responseCache = new Map();

async function callAI(prompt) {
    if (!GROQ_API_KEY) return null;

    const cacheKey = prompt.slice(0, 100);
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < 5 * 60 * 1000) return cached.text;

    try {
        const res = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 512,
            }),
        });

        if (!res.ok) return null; // silently fall back on any error
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || '';
        responseCache.set(cacheKey, { text, ts: Date.now() });
        return text;
    } catch {
        return null; // always fall back gracefully
    }
}

// =============================================================================
// RULE-BASED PARSER — works instantly without any API
// =============================================================================

const PRODUCT_KEYWORDS = [
    'kurta', 'kurti', 'saree', 'sari', 'lehenga', 'salwar', 'dupatta',
    'shirt', 'tshirt', 't-shirt', 'top', 'blouse', 'gown', 'dress',
    'palazzo', 'dhoti', 'sherwani', 'ethnic', 'western', 'indo-western',
    'jacket', 'coat', 'suit', 'blazer', 'jeans', 'trouser', 'pant',
    'silk', 'cotton', 'linen', 'chiffon', 'georgette', 'velvet', 'wool',
    'embroidered', 'printed', 'plain', 'designer', 'handloom', 'zari',
    'accessories', 'jewelry', 'jewellery', 'dupatta', 'stole', 'scarf',
];

const COLORS = [
    'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'black', 'white',
    'orange', 'brown', 'grey', 'gray', 'gold', 'silver', 'maroon', 'navy',
    'cream', 'beige', 'off-white', 'teal', 'cyan', 'violet', 'indigo',
    'magenta', 'peach', 'lavender', 'mint', 'coral', 'turquoise', 'mustard',
];

const SIZES = ['xs', 'small', 'medium', 'large', 'xl', 'xxl', 'xxxl', '2xl', '3xl',
    'free size', 'freesize', 's', 'm', 'l'];

function ruleBasedParser(input) {
    const text = input.toLowerCase().trim();

    // Strip common filler/intent words first to get clean product keywords
    const fillerPattern = /^(?:find(?:\s+me)?|show(?:\s+me)?|i(?:\s+need|'?m\s+looking\s+for|\s+want)|get(?:\s+me)?|search(?:\s+for)?|looking\s+for|display|give\s+me|fetch|can\s+you\s+(?:show|find|get)(?:\s+me)?|please(?:\s+show)?|suggest(?:\s+me)?)\s+/i;
    const cleanText = text.replace(fillerPattern, '');

    // Extract max price — "under 2000", "below 2000", "less than 2000", "upto 2000"
    let maxPrice = null;
    const maxMatch = cleanText.match(/(?:under|below|less than|upto|up to|within|max|atmost|at most)\s*[₹rs.]?\s*(\d[\d,]*)/i);
    if (maxMatch) maxPrice = parseInt(maxMatch[1].replace(/,/g, ''));

    // Extract min price — "above 500", "more than 500"
    let minPrice = null;
    const minMatch = cleanText.match(/(?:above|over|more than|atleast|at least|starting from|from|minimum|min)\s*[₹rs.]?\s*(\d[\d,]*)/i);
    if (minMatch) minPrice = parseInt(minMatch[1].replace(/,/g, ''));

    // Price range: "between 500 and 2000"
    const rangeMatch = cleanText.match(/between\s*[₹rs.]?\s*(\d[\d,]*)\s*(?:and|to|-)\s*[₹rs.]?\s*(\d[\d,]*)/i);
    if (rangeMatch) {
        minPrice = parseInt(rangeMatch[1].replace(/,/g, ''));
        maxPrice = parseInt(rangeMatch[2].replace(/,/g, ''));
    }

    // Bare number — "kurta 2000" → treat as maxPrice if no other price extracted
    if (!maxPrice && !minPrice && !rangeMatch) {
        const bareNum = cleanText.match(/[₹]?\s*(\d{3,5})\b/);
        if (bareNum) maxPrice = parseInt(bareNum[1]);
    }

    // Extract colors
    const color = COLORS.find(c => cleanText.includes(c)) || null;

    // Extract size
    const sizeMatch = SIZES.find(s => {
        const re = new RegExp(`\\b${s}\\b`, 'i');
        return re.test(cleanText);
    });
    const size = sizeMatch || null;

    // Extract product keywords — remove price fragments and filler, keep product words
    const stripped = cleanText
        .replace(/(?:under|below|above|upto|less than|more than|between|and|within)\s*[₹rs.]?\s*\d[\d,]*/gi, '')
        .replace(/[₹₹]\s*\d[\d,]*/g, '')
        .replace(/\d[\d,]*\s*(?:rs|rupees?)?/gi, '')
        .replace(/\b(?:in|of|for|with|a|an|the|some|any|me|my|please|good|nice|best|cheap|affordable|budget|premium|luxury)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Find matching product keywords in the cleaned text
    const foundKeywords = PRODUCT_KEYWORDS.filter(k => stripped.includes(k));

    // Build searchQuery: prefer extracted keywords, else use cleaned text
    let searchQuery;
    if (foundKeywords.length > 0) {
        searchQuery = foundKeywords.slice(0, 3).join(' ');
    } else {
        // Use remaining words after removing price info
        searchQuery = stripped || cleanText.split(/\s+/).slice(0, 3).join(' ');
    }

    // Category: first non-fabric keyword found
    const fabricWords = ['silk', 'cotton', 'linen', 'chiffon', 'georgette', 'velvet', 'embroidered', 'printed', 'plain', 'handloom', 'zari', 'wool'];
    const category = foundKeywords.find(k => !fabricWords.includes(k)) || null;

    return {
        searchQuery: searchQuery.trim(),
        category,
        maxPrice,
        minPrice,
        color,
        size,
        intent: 'search',
    };
}

// =============================================================================
// EXPORTED FUNCTIONS
// =============================================================================

/**
 * CUSTOMER: Parse natural language → product filter object
 * Uses rule-based parser first; Naitri Ai enhances if available.
 */
export async function parseCustomerQuery(userInput) {
    // Always parse with rules first (instant, reliable)
    const ruleResult = ruleBasedParser(userInput);
    console.log('🔧 Rule-based parser result:', ruleResult);

    // Try Groq AI for better accuracy (optional, silent fallback)
    const prompt = `You are a shopping assistant for an Indian fashion e-commerce site.
The user said: "${userInput}"
Extract a JSON object with these optional fields:
{"searchQuery":"keywords","category":"category or null","maxPrice":number or null,"minPrice":number or null,"color":"color or null","size":"size or null","intent":"search"}
- maxPrice/minPrice in INR numbers
- Return ONLY valid JSON`;

    const raw = await callAI(prompt);
    if (raw) {
        try {
            const match = raw.match(/\{[\s\S]*\}/);
            if (match) {
                const aiResult = JSON.parse(match[0]);
                const merged = {
                    ...ruleResult,
                    ...aiResult,
                    maxPrice: aiResult.maxPrice || ruleResult.maxPrice,
                    minPrice: aiResult.minPrice || ruleResult.minPrice,
                };
                console.log('🤖 Groq AI enhanced result:', merged);
                return merged;
            }
        } catch { /* use rule result */ }
    }

    console.log('📋 Using rule-based result (Groq unavailable/skipped)');
    return ruleResult;
}

/**
 * SELLER: Generate business insights from seller analytics data
 */
export async function generateSellerInsights(sellerData) {
    const {
        totalOrders = 0,
        totalRevenue = 0,
        topProducts = [],
        recentOrders = [],
        totalProducts = 0,
        pendingOrders = 0,
        revenueGrowth = 0,
    } = sellerData;

    // Rule-based insights as reliable fallback
    const ruleInsights = [];
    if (pendingOrders > 0) ruleInsights.push({ type: 'warning', title: `${pendingOrders} Orders Need Attention`, message: `You have ${pendingOrders} pending orders waiting to be processed. Fulfilling them quickly improves your shop rating and customer satisfaction.`, icon: '⏳' });
    if (totalProducts < 10) ruleInsights.push({ type: 'tip', title: 'Expand Your Collection', message: `You have ${totalProducts} products listed. Shops with 20+ products see 3x more traffic. Consider adding more items to attract diverse customers.`, icon: '➕' });
    if (revenueGrowth > 0) ruleInsights.push({ type: 'success', title: 'Revenue Growing!', message: `Your revenue grew by ${revenueGrowth}% compared to last month. Keep maintaining product quality and timely delivery to sustain this growth.`, icon: '📈' });
    ruleInsights.push({ type: 'info', title: 'Total Revenue Summary', message: `Your store has earned ₹${totalRevenue.toLocaleString('en-IN')} from ${totalOrders} orders. Focus on high-margin products to increase revenue per order.`, icon: '💰' });

    // Try Naitri Ai for enhanced insights
    const prompt = `You are a business advisor for an Indian e-commerce seller.
Store data: total orders: ${totalOrders}, revenue: ₹${totalRevenue}, pending: ${pendingOrders}, products: ${totalProducts}, growth: ${revenueGrowth}%
Generate exactly 4 business insights as JSON array: [{"type":"success|warning|info|tip","title":"max 6 words","message":"2-3 sentences","icon":"emoji"}]
Return ONLY valid JSON array.`;

    const raw = await callAI(prompt);
    if (raw) {
        try {
            const match = raw.match(/\[[\s\S]*\]/);
            if (match) return JSON.parse(match[0]);
        } catch { /* use rule insights */ }
    }

    return ruleInsights.slice(0, 4);
}

/**
 * SELLER: Answer a question about the store
 */
export async function answerSellerQuestion(question, sellerData) {
    const d = sellerData || {};

    // ── Build a structured data brief ─────────────────────────────────
    const products = d.allProducts || d.topProducts || [];
    const orders = d.allOrders || d.recentOrders || [];

    // Revenue breakdown by month (last 3 months)
    const now = new Date();
    const monthlyRevenue = [0, 1, 2].map(mAgo => {
        const mn = new Date(now.getFullYear(), now.getMonth() - mAgo, 1);
        const label = mn.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
        const rev = orders
            .filter(o => o.status === 'completed' && new Date(o.date || o.createdAt) >= mn && new Date(o.date || o.createdAt) < new Date(mn.getFullYear(), mn.getMonth() + 1, 1))
            .reduce((s, o) => s + (o.amount || o.totalAmount || 0), 0);
        return `${label}: ₹${rev.toLocaleString('en-IN')}`;
    }).reverse().join(' | ');

    // Category breakdown
    const catMap = {};
    products.forEach(p => { catMap[p.category] = (catMap[p.category] || 0) + 1; });
    const categoryBreakdown = Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .map(([c, n]) => `${c}(${n})`)
        .join(', ') || 'No products yet';

    // Low stock products
    const lowStock = products.filter(p => p.stock < 5 && p.stock >= 0)
        .map(p => `${p.name} (stock: ${p.stock})`)
        .slice(0, 5)
        .join(', ') || 'None';

    // Top 5 products by price / revenue
    const topProductList = products
        .slice(0, 8)
        .map(p => `• ${p.name} | ₹${p.discountedPrice || p.price} | ${p.category} | Stock: ${p.stock}`)
        .join('\n') || 'No products listed';

    // Recent orders summary
    const orderStatusMap = {};
    orders.forEach(o => { orderStatusMap[o.status] = (orderStatusMap[o.status] || 0) + 1; });
    const orderStatusSummary = Object.entries(orderStatusMap)
        .map(([s, n]) => `${s}: ${n}`).join(', ') || 'No orders';

    const context = `
=== SELLER STORE BRIEF ===
Shop: ${d.shopName || 'Your Shop'}
Date: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}

--- REVENUE & GROWTH ---
Total Revenue (all time): ₹${(d.totalRevenue || 0).toLocaleString('en-IN')}
Revenue Growth (vs last month): ${d.revenueGrowth || 0}%
Monthly Breakdown: ${monthlyRevenue}

--- ORDERS ---
Total Orders: ${d.totalOrders || 0}
Today's Orders: ${d.todayOrders || 0}
Order Status: ${orderStatusSummary}

--- PRODUCTS & INVENTORY ---
Total Products Listed: ${d.totalProducts || 0}
Active Products: ${d.activeProducts || 0}
Low Stock Items (<5 units): ${lowStock}
Category Distribution: ${categoryBreakdown}

--- TOP PRODUCTS ---
${topProductList}

--- STORE HEALTH ---
Shop Rating: ${d.rating ? `${d.rating}/5` : 'No ratings yet'}
Out-of-Stock Products: ${d.outOfStock || 0}
=== END OF BRIEF ===`.trim();

    // Rule-based fast answers (always instant, no API needed)
    const q = question.toLowerCase();
    if (q.includes('revenue') || q.includes('earn') || q.includes('income') || q.includes('kitna kamaya')) {
        return `Your total revenue is ₹${(d.totalRevenue || 0).toLocaleString('en-IN')} from ${d.totalOrders || 0} orders.${d.revenueGrowth > 0 ? ` Revenue grew ${d.revenueGrowth}% compared to last month — great work! 🎉` : ' Keep adding products and promoting to boost sales.'} ${monthlyRevenue}`;
    }
    if (q.includes('pending') || q.includes('process')) {
        const pendingCount = orderStatusMap['pending'] || d.pendingOrders || 0;
        return `You have ${pendingCount} pending orders waiting to be processed. Process them quickly to maintain a good seller rating and ensure customer satisfaction.`;
    }
    if (q.includes('low stock') || q.includes('restock') || q.includes('khatam')) {
        return lowStock !== 'None'
            ? `These products are running low on stock (less than 5 units): ${lowStock}. Restock them soon to avoid losing sales!`
            : 'Good news! All your products currently have sufficient stock (5+ units).';
    }
    if (q.includes('best') || q.includes('top') || q.includes('popular') || q.includes('sabse zyada')) {
        const top = products.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price))[0];
        return top ? `Your most premium product is "${top.name}" priced at ₹${top.discountedPrice || top.price} in the ${top.category} category with ${top.stock} units in stock. Focus on keeping it well-stocked!` : 'Add more products and collect orders to identify your best sellers!';
    }
    if (q.includes('category') || q.includes('type') || q.includes('kya sell')) {
        return `Your store has products across these categories: ${categoryBreakdown}. ${Object.keys(catMap).length < 3 ? 'Consider diversifying into more categories to attract wider customers.' : 'Good variety! Focus on your top categories for maximum conversions.'}`;
    }

    // AI-powered answer with full context
    const prompt = `You are an expert AI business advisor for Indian fashion e-commerce sellers on the Athenic Wear platform.

${context}

SELLER'S QUESTION: "${question}"

Instructions:
- Answer specifically using the ACTUAL numbers from the brief above
- Use ₹ for Indian Rupees
- Be friendly, encouraging, and actionable
- Give 2-4 specific, data-backed sentences
- If you suggest an action, make it actionable and specific
- Do NOT say "I don't have access to real-time data" — the data IS provided above
- Plain text only, no markdown`;

    const raw = await callAI(prompt);
    if (raw) return raw.trim();

    return `Based on your store data: you have ₹${(d.totalRevenue || 0).toLocaleString('en-IN')} total revenue from ${d.totalOrders || 0} orders, with ${d.totalProducts || 0} products listed. Low stock items: ${lowStock}. For more detailed analysis, check your Analytics page.`;
}

/**
 * SELLER: Generate trend recommendations
 */
export async function generateTrendInsights(trendingCategories = [], sellerCategories = []) {
    const missing = trendingCategories.filter(t =>
        !sellerCategories.some(s => s?.toLowerCase().includes(t.toLowerCase()))
    );

    // Rule-based trends as fallback
    const ruleTrends = trendingCategories.slice(0, 3).map((cat, i) => ({
        category: cat,
        trendScore: 9 - i * 2,
        message: `${cat} is trending strongly this season on the platform. ${missing.includes(cat) ? "You don't have this category — adding these products could attract new customers." : "You have this category! Consider adding more variety to capture more demand."}`,
        action: missing.includes(cat) ? `Add ${cat} products to your store` : `Expand your ${cat} collection with 5+ new items`,
    }));

    // Try Naitri Ai for better insights
    const prompt = `Market trend analyst for Indian fashion marketplace.
Trending: ${JSON.stringify(trendingCategories)}. Seller has: ${JSON.stringify(sellerCategories)}
Generate 3 trend recommendations as JSON array: [{"category":"name","trendScore":1-10,"message":"2 sentences","action":"specific action"}]
Return ONLY valid JSON array.`;

    const raw = await callAI(prompt);
    if (raw) {
        try {
            const match = raw.match(/\[[\s\S]*\]/);
            if (match) return JSON.parse(match[0]);
        } catch { /* use rule trends */ }
    }

    return ruleTrends;
}
