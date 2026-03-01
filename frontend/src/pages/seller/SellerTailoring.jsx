/**
 * SellerTailoring.jsx
 * Seller dashboard page to view and manage incoming tailoring requests.
 * Matches the SellerOrders.jsx visual style (SellerLayout, same card pattern).
 */
import { useState, useEffect } from 'react';
import { tailoringService } from '../../services/api';
import SellerLayout from '../../components/layout/SellerLayout';

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_COLORS = {
    pending: 'bg-[var(--gold-pale)] text-[var(--gold)] border-[var(--gold)]/20',
    confirmed: 'bg-[var(--ivory)] text-[var(--mehron)] border-[var(--border-mehron)]',
    in_progress: 'bg-[var(--mehron-soft)] text-[var(--mehron)] border-[var(--border-mehron)]',
    completed: 'bg-[var(--mehron)] text-white border-[var(--gold)]',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

const STATUS_EMOJIS = {
    pending: '⏳', confirmed: '✅', in_progress: '🧵', completed: '🎉', cancelled: '❌',
};

const NEXT_STATUS = {
    pending: { value: 'confirmed', label: '✅ Confirm Request' },
    confirmed: { value: 'in_progress', label: '🧵 Start Stitching' },
    in_progress: { value: 'completed', label: '🎉 Mark Complete' },
};

// ── Detail Row Helper ─────────────────────────────────────────────────────────
const DetailRow = ({ label, value }) =>
    value ? (
        <div className="flex justify-between py-1 border-b border-gray-50">
            <span className="text-[8px] font-serif uppercase tracking-wider text-gray-400">{label}</span>
            <span className="text-[9px] font-serif text-[var(--mehron)] font-semibold capitalize">{value}</span>
        </div>
    ) : null;

// ── Main Component ────────────────────────────────────────────────────────────
const SellerTailoring = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [updating, setUpdating] = useState(null); // stores request ID being updated
    const [expanded, setExpanded] = useState(null);  // expanded request ID

    // Update panel state
    const [updatePanel, setUpdatePanel] = useState(null); // {id, status, notes, price, days}

    useEffect(() => { fetchRequests(); }, [filter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await tailoringService.getShopRequests(1, filter);
            setRequests(data.data || []);
        } catch (err) {
            console.error('Error fetching tailoring requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAdvance = async (req) => {
        const next = NEXT_STATUS[req.status];
        if (!next) return;
        setUpdating(req._id);
        try {
            await tailoringService.updateStatus(req._id, { status: next.value });
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.error || 'Update failed');
        } finally {
            setUpdating(null);
        }
    };

    const handleDetailUpdate = async () => {
        if (!updatePanel) return;
        setUpdating(updatePanel.id);
        try {
            await tailoringService.updateStatus(updatePanel.id, {
                status: updatePanel.status,
                sellerNotes: updatePanel.notes,
                quotedPrice: updatePanel.price ? parseFloat(updatePanel.price) : undefined,
                estimatedDeliveryDays: updatePanel.days ? parseInt(updatePanel.days) : undefined,
                cancelReason: updatePanel.status === 'cancelled' ? updatePanel.notes : undefined,
            });
            setUpdatePanel(null);
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.error || 'Update failed');
        } finally {
            setUpdating(null);
        }
    };

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        in_progress: requests.filter(r => r.status === 'in_progress').length,
        completed: requests.filter(r => r.status === 'completed').length,
    };

    if (loading) return (
        <SellerLayout>
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--gold)] border-t-transparent mx-auto" />
                    <p className="mt-4 text-gray-600 font-serif uppercase tracking-widest text-xs">Loading tailoring requests...</p>
                </div>
            </div>
        </SellerLayout>
    );

    return (
        <SellerLayout>

            {/* ── Page Header ──────────────────────────────────────────────── */}
            <div className="mb-8 meander-pattern pb-1">
                <h1 className="text-3xl font-serif font-bold text-[var(--mehron)] uppercase tracking-wider">
                    ✂️ Tailoring Requests
                </h1>
                <p className="text-gray-600 mt-1 font-serif text-[10px] uppercase tracking-widest font-bold">
                    Manage custom stitching orders from your customers
                </p>
            </div>

            {/* ── Stats Cards ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total', value: stats.total, color: 'text-[var(--mehron)]' },
                    { label: 'Pending', value: stats.pending, color: 'text-[var(--gold)]' },
                    { label: 'In Progress', value: stats.in_progress, color: 'text-[var(--mehron-deep)]' },
                    { label: 'Completed', value: stats.completed, color: 'text-emerald-600' },
                ].map(s => (
                    <div key={s.label} className="bg-white p-5 border border-[var(--border-mehron)] shadow-sm">
                        <p className="text-[9px] font-serif uppercase tracking-widest text-gray-500 mb-1 font-bold">{s.label}</p>
                        <p className={`text-3xl font-serif font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Filter Tabs ──────────────────────────────────────────────── */}
            <div className="bg-white border border-[var(--border-mehron)] mb-6 overflow-x-auto">
                <div className="flex">
                    {[
                        { key: '', label: 'All' },
                        { key: 'pending', label: '⏳ Pending' },
                        { key: 'confirmed', label: '✅ Confirmed' },
                        { key: 'in_progress', label: '🧵 In Progress' },
                        { key: 'completed', label: '🎉 Completed' },
                        { key: 'cancelled', label: '❌ Cancelled' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-5 py-3.5 font-serif text-[9px] uppercase tracking-widest border-b-2 transition-all font-bold whitespace-nowrap ${filter === tab.key
                                    ? 'border-[var(--mehron)] text-[var(--mehron)] bg-[var(--gold-pale)]/30'
                                    : 'border-transparent text-gray-500 hover:text-[var(--mehron)]'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Requests List ─────────────────────────────────────────────── */}
            {requests.length === 0 ? (
                <div className="bg-white border border-[var(--border-mehron)] p-12 text-center">
                    <div className="text-5xl mb-4">✂️</div>
                    <h3 className="text-lg font-serif font-bold text-[var(--mehron)] uppercase tracking-widest mb-2">
                        No Tailoring Requests
                    </h3>
                    <p className="text-[10px] text-gray-400 font-serif uppercase tracking-widest">
                        {filter ? `No ${filter} requests found` : 'Customer requests will appear here'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => {
                        const isExpanded = expanded === req._id;
                        const statusColor = STATUS_COLORS[req.status] || 'bg-gray-50 text-gray-400 border-gray-100';
                        const nextStep = NEXT_STATUS[req.status];

                        return (
                            <div key={req._id} className="bg-white border border-[var(--border-mehron)] shadow-sm overflow-hidden">

                                {/* ── Card Header ──────────────────────────── */}
                                <div
                                    className="px-6 py-4 border-b border-[var(--border-mehron)] bg-gradient-to-r from-[var(--cream)]/40 to-white flex items-center justify-between cursor-pointer"
                                    onClick={() => setExpanded(isExpanded ? null : req._id)}
                                >
                                    <div className="flex items-center space-x-4">
                                        <span className="text-xl">{STATUS_EMOJIS[req.status]}</span>
                                        <div>
                                            <div className="flex items-center space-x-3 mb-0.5">
                                                <h3 className="text-xs font-serif font-bold text-gray-900 uppercase tracking-widest">
                                                    Request #{req._id.slice(-8).toUpperCase()}
                                                </h3>
                                                <span className={`px-2 py-0.5 text-[8px] font-serif font-bold border uppercase tracking-widest ${statusColor}`}>
                                                    {req.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-[9px] font-serif text-gray-400 uppercase tracking-widest">
                                                {req.productId?.name || 'Product'} ·{' '}
                                                {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        {req.quotedPrice && (
                                            <span className="text-sm font-serif font-bold text-[var(--mehron)]">
                                                ₹{req.quotedPrice.toLocaleString()}
                                            </span>
                                        )}
                                        <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
                                    </div>
                                </div>

                                {/* ── Expanded Detail ───────────────────────── */}
                                {isExpanded && (
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

                                        {/* Customer Info */}
                                        <div>
                                            <h4 className="text-[9px] font-serif uppercase tracking-[0.25em] text-[var(--gold)] mb-3 font-bold">
                                                👤 Customer
                                            </h4>
                                            <div className="space-y-1">
                                                <DetailRow label="Name" value={req.customerId?.name} />
                                                <DetailRow label="Email" value={req.customerId?.email} />
                                                <DetailRow label="Phone" value={req.customerId?.phone} />
                                            </div>

                                            <h4 className="text-[9px] font-serif uppercase tracking-[0.25em] text-[var(--gold)] mb-3 mt-5 font-bold">
                                                👗 Product
                                            </h4>
                                            {req.productId?.images?.[0] && (
                                                <img
                                                    src={req.productId.images[0]}
                                                    alt={req.productId.name}
                                                    className="w-20 h-24 object-cover border border-[var(--border-mehron)] mb-2"
                                                />
                                            )}
                                            <DetailRow label="Name" value={req.productId?.name} />
                                            <DetailRow label="Category" value={req.productId?.category} />
                                        </div>

                                        {/* Measurements + Design */}
                                        <div>
                                            <h4 className="text-[9px] font-serif uppercase tracking-[0.25em] text-[var(--gold)] mb-3 font-bold">
                                                📐 Measurements (cm)
                                            </h4>
                                            {req.measurements && Object.entries(req.measurements)
                                                .filter(([k, v]) => v && k !== 'notes')
                                                .map(([k, v]) => (
                                                    <DetailRow key={k} label={k} value={`${v} cm`} />
                                                ))
                                            }
                                            {req.measurements?.notes && (
                                                <p className="text-[8px] font-serif italic text-gray-400 mt-2">"{req.measurements.notes}"</p>
                                            )}

                                            <h4 className="text-[9px] font-serif uppercase tracking-[0.25em] text-[var(--gold)] mb-3 mt-5 font-bold">
                                                ✏️ Design
                                            </h4>
                                            <DetailRow label="Sleeve" value={req.customizations?.sleeveStyle} />
                                            <DetailRow label="Neckline" value={req.customizations?.neckline} />
                                            <DetailRow label="Length" value={req.customizations?.lengthAdjustment} />
                                            <DetailRow label="Embroidery" value={req.customizations?.embroidery} />
                                            {req.customizations?.additionalNotes && (
                                                <p className="text-[8px] font-serif italic text-gray-400 mt-2">"{req.customizations.additionalNotes}"</p>
                                            )}
                                        </div>

                                        {/* Fabric + Actions */}
                                        <div>
                                            <h4 className="text-[9px] font-serif uppercase tracking-[0.25em] text-[var(--gold)] mb-3 font-bold">
                                                🧵 Fabric
                                            </h4>
                                            <DetailRow label="Source" value={req.fabric?.useOwnFabric ? "Customer's Own" : "Seller's Stock"} />
                                            <DetailRow label="Type" value={req.fabric?.fabricType} />
                                            <DetailRow label="Color" value={req.fabric?.fabricColor} />
                                            {req.fabric?.fabricDescription && (
                                                <p className="text-[8px] font-serif italic text-gray-400 mt-1">"{req.fabric.fabricDescription}"</p>
                                            )}

                                            {/* Seller Notes */}
                                            {req.sellerNotes && (
                                                <div className="mt-4">
                                                    <h4 className="text-[9px] font-serif uppercase tracking-[0.25em] text-[var(--gold)] mb-1 font-bold">📝 Your Notes</h4>
                                                    <p className="text-[9px] font-serif text-gray-500 italic">"{req.sellerNotes}"</p>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            {req.status !== 'completed' && req.status !== 'cancelled' && (
                                                <div className="mt-6 space-y-2">
                                                    {/* Quick advance */}
                                                    {nextStep && (
                                                        <button
                                                            onClick={() => handleQuickAdvance(req)}
                                                            disabled={updating === req._id}
                                                            className="w-full py-3 bg-[var(--mehron)] text-white font-serif text-[9px] uppercase tracking-[0.2em] hover:bg-[var(--mehron-deep)] border border-[var(--gold)] disabled:opacity-50 transition-all"
                                                        >
                                                            {updating === req._id ? '⏳ Updating...' : nextStep.label}
                                                        </button>
                                                    )}

                                                    {/* Detailed update */}
                                                    <button
                                                        onClick={() => setUpdatePanel({
                                                            id: req._id,
                                                            status: req.status,
                                                            notes: req.sellerNotes || '',
                                                            price: req.quotedPrice || '',
                                                            days: req.estimatedDeliveryDays || 21,
                                                        })}
                                                        className="w-full py-3 border border-[var(--border-mehron)] text-[var(--mehron)] font-serif text-[9px] uppercase tracking-[0.2em] hover:bg-[var(--cream)] transition-all"
                                                    >
                                                        📝 Add Notes / Set Price
                                                    </button>

                                                    {/* Cancel */}
                                                    <button
                                                        onClick={() => setUpdatePanel({ id: req._id, status: 'cancelled', notes: '', price: '', days: '' })}
                                                        className="w-full py-2 text-gray-400 font-serif text-[8px] uppercase tracking-widest hover:text-red-500 transition-colors"
                                                    >
                                                        ✕ Cancel Request
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Update Modal ──────────────────────────────────────────────── */}
            {updatePanel && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-[var(--border-mehron)] p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-lg font-serif uppercase tracking-widest text-[var(--mehron)] mb-6">
                            {updatePanel.status === 'cancelled' ? '✕ Cancel Request' : '📝 Update Request'}
                        </h2>

                        <div className="space-y-4">
                            {/* Status select */}
                            {updatePanel.status !== 'cancelled' && (
                                <div>
                                    <label className="block text-[9px] font-serif uppercase tracking-widest text-gray-500 mb-1.5">Status</label>
                                    <select
                                        value={updatePanel.status}
                                        onChange={e => setUpdatePanel(p => ({ ...p, status: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 font-serif text-sm focus:outline-none focus:border-[var(--gold)] bg-white"
                                    >
                                        <option value="confirmed">✅ Confirmed</option>
                                        <option value="in_progress">🧵 In Progress</option>
                                        <option value="completed">🎉 Completed</option>
                                    </select>
                                </div>
                            )}

                            {/* Quoted Price */}
                            {updatePanel.status !== 'cancelled' && (
                                <div>
                                    <label className="block text-[9px] font-serif uppercase tracking-widest text-gray-500 mb-1.5">Quoted Price (₹)</label>
                                    <input
                                        type="number"
                                        value={updatePanel.price}
                                        onChange={e => setUpdatePanel(p => ({ ...p, price: e.target.value }))}
                                        placeholder="e.g. 2500"
                                        className="w-full px-4 py-3 border border-gray-200 font-serif text-sm focus:outline-none focus:border-[var(--gold)]"
                                    />
                                </div>
                            )}

                            {/* Delivery Days */}
                            {updatePanel.status !== 'cancelled' && (
                                <div>
                                    <label className="block text-[9px] font-serif uppercase tracking-widest text-gray-500 mb-1.5">Estimated Delivery (days)</label>
                                    <input
                                        type="number"
                                        value={updatePanel.days}
                                        onChange={e => setUpdatePanel(p => ({ ...p, days: e.target.value }))}
                                        placeholder="e.g. 21"
                                        className="w-full px-4 py-3 border border-gray-200 font-serif text-sm focus:outline-none focus:border-[var(--gold)]"
                                    />
                                </div>
                            )}

                            {/* Notes / Cancel Reason */}
                            <div>
                                <label className="block text-[9px] font-serif uppercase tracking-widest text-gray-500 mb-1.5">
                                    {updatePanel.status === 'cancelled' ? 'Reason for Cancellation' : 'Notes to Customer'}
                                </label>
                                <textarea
                                    rows={3}
                                    value={updatePanel.notes}
                                    onChange={e => setUpdatePanel(p => ({ ...p, notes: e.target.value }))}
                                    placeholder={updatePanel.status === 'cancelled'
                                        ? 'Explain why this request is being cancelled...'
                                        : 'Any updates, instructions, or notes for the customer...'}
                                    className="w-full px-4 py-3 border border-gray-200 font-serif text-sm focus:outline-none focus:border-[var(--gold)] resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => setUpdatePanel(null)}
                                className="flex-1 py-3 border border-gray-200 text-gray-500 font-serif text-[9px] uppercase tracking-widest hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDetailUpdate}
                                disabled={updating}
                                className={`flex-1 py-3 font-serif text-[9px] uppercase tracking-widest disabled:opacity-50 transition-all ${updatePanel.status === 'cancelled'
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-[var(--mehron)] text-white hover:bg-[var(--mehron-deep)]'
                                    }`}
                            >
                                {updating ? '⏳ Saving...' : updatePanel.status === 'cancelled' ? 'Confirm Cancel' : 'Save Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </SellerLayout>
    );
};

export default SellerTailoring;
