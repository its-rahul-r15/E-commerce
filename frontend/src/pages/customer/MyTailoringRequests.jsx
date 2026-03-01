/**
 * MyTailoringRequests.jsx
 * Customer-facing page to track all submitted tailoring requests.
 * Shows: status timeline, measurements, design choices, seller notes, quoted price.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tailoringService } from '../../services/api';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    pending: { emoji: '⏳', label: 'Pending Review', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
    confirmed: { emoji: '✅', label: 'Confirmed', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    in_progress: { emoji: '🧵', label: 'Being Stitched', color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
    completed: { emoji: '🎉', label: 'Ready / Done', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    cancelled: { emoji: '❌', label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-400' },
};

const TIMELINE_STEPS = ['pending', 'confirmed', 'in_progress', 'completed'];

// ── Tiny label/value helper ───────────────────────────────────────────────────
const Info = ({ label, value }) =>
    value ? (
        <div className="flex flex-col">
            <span className="text-[8px] font-serif uppercase tracking-widest text-gray-400">{label}</span>
            <span className="text-[11px] font-serif text-[var(--athenic-blue)] capitalize">{value}</span>
        </div>
    ) : null;

// ── Main Page ─────────────────────────────────────────────────────────────────
const MyTailoringRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [expanded, setExpanded] = useState(null);

    useEffect(() => { fetchRequests(); }, [filter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await tailoringService.getMyRequests(1, filter);
            setRequests(data.data || []);
        } catch (err) {
            console.error('Error fetching tailoring requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const stepIndex = (status) => TIMELINE_STEPS.indexOf(status);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--ivory)]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[var(--athenic-gold)] border-t-transparent mx-auto mb-4" />
                <p className="text-[9px] font-serif uppercase tracking-widest text-gray-400">Loading your requests...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--ivory)] py-12 px-4">
            <div className="max-w-4xl mx-auto">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="mb-8">
                    <p className="text-[9px] font-serif uppercase tracking-[0.4em] text-[var(--athenic-gold)] mb-2">
                        My Account
                    </p>
                    <h1 className="text-3xl font-serif font-bold text-[var(--athenic-blue)] uppercase tracking-wider">
                        ✂️ My Tailoring Requests
                    </h1>
                    <p className="text-[10px] font-serif uppercase tracking-widest text-gray-400 mt-1">
                        Track the status of your custom stitching orders
                    </p>
                </div>

                {/* ── Filter Tabs ─────────────────────────────────────────── */}
                <div className="bg-white border border-[var(--athenic-gold)] border-opacity-30 mb-6 overflow-x-auto">
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
                                className={`px-5 py-3.5 font-serif text-[9px] uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${filter === tab.key
                                        ? 'border-[var(--athenic-gold)] text-[var(--athenic-gold)] bg-[var(--athenic-gold)]/5'
                                        : 'border-transparent text-gray-400 hover:text-[var(--athenic-blue)]'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Empty State ─────────────────────────────────────────── */}
                {requests.length === 0 ? (
                    <div className="bg-white border border-[var(--athenic-gold)] border-opacity-30 p-14 text-center">
                        <div className="text-5xl mb-4">✂️</div>
                        <h3 className="text-lg font-serif font-bold text-[var(--athenic-blue)] uppercase tracking-widest mb-2">
                            No Tailoring Requests Yet
                        </h3>
                        <p className="text-[10px] font-serif uppercase tracking-widest text-gray-400 mb-6">
                            {filter ? `No ${filter} requests found` : 'Browse our ethnic collection and request custom tailoring'}
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-3 bg-[var(--athenic-gold)] text-white font-serif text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity"
                        >
                            Browse Collection →
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map(req => {
                            const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                            const isExpanded = expanded === req._id;
                            const currentStep = stepIndex(req.status);

                            return (
                                <div key={req._id} className="bg-white border border-[var(--athenic-gold)] border-opacity-30 overflow-hidden shadow-sm">

                                    {/* ── Card Header ──────────────────────── */}
                                    <div
                                        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => setExpanded(isExpanded ? null : req._id)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <span className="text-2xl">{cfg.emoji}</span>
                                            <div>
                                                <div className="flex items-center space-x-3 mb-0.5">
                                                    <h3 className="text-[11px] font-serif font-bold text-[var(--athenic-blue)] uppercase tracking-widest">
                                                        Request #{req._id.slice(-8).toUpperCase()}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 text-[8px] font-serif font-bold border uppercase tracking-wider ${cfg.color}`}>
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                                <p className="text-[9px] font-serif text-gray-400 uppercase tracking-widest">
                                                    {req.productId?.name || 'Garment'} ·{' '}
                                                    {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            {req.quotedPrice ? (
                                                <div className="text-right">
                                                    <p className="text-[8px] font-serif uppercase tracking-widest text-gray-400">Quoted Price</p>
                                                    <p className="text-sm font-serif font-bold text-[var(--athenic-gold)]">₹{req.quotedPrice.toLocaleString()}</p>
                                                </div>
                                            ) : null}
                                            <span className="text-gray-300 text-sm">{isExpanded ? '▲' : '▼'}</span>
                                        </div>
                                    </div>

                                    {/* ── Status Timeline ───────────────────── */}
                                    {req.status !== 'cancelled' && (
                                        <div className="px-6 pb-4 border-t border-gray-50">
                                            <div className="flex items-center mt-4">
                                                {TIMELINE_STEPS.map((step, idx) => {
                                                    const done = idx <= currentStep;
                                                    const active = idx === currentStep;
                                                    return (
                                                        <div key={step} className="flex items-center flex-1 last:flex-none">
                                                            <div className="flex flex-col items-center">
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] border-2 transition-all ${done
                                                                        ? 'bg-[var(--athenic-gold)] border-[var(--athenic-gold)] text-white'
                                                                        : 'bg-white border-gray-200 text-gray-300'
                                                                    } ${active ? 'ring-2 ring-[var(--athenic-gold)] ring-offset-1' : ''}`}>
                                                                    {done ? '✓' : idx + 1}
                                                                </div>
                                                                <p className={`text-[7px] font-serif uppercase tracking-wider mt-1 text-center ${done ? 'text-[var(--athenic-gold)]' : 'text-gray-300'
                                                                    }`}>
                                                                    {STATUS_CONFIG[step]?.label?.split(' ')[0]}
                                                                </p>
                                                            </div>
                                                            {idx < TIMELINE_STEPS.length - 1 && (
                                                                <div className={`flex-1 h-0.5 mx-1 mb-4 ${idx < currentStep ? 'bg-[var(--athenic-gold)]' : 'bg-gray-100'
                                                                    }`} />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Expanded Details ──────────────────── */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-50 p-6">

                                            {/* Seller Note / Cancel Reason */}
                                            {(req.sellerNotes || req.cancelReason) && (
                                                <div className={`mb-5 p-4 border-l-4 ${req.status === 'cancelled'
                                                        ? 'border-red-400 bg-red-50'
                                                        : 'border-[var(--athenic-gold)] bg-[var(--athenic-gold)]/5'
                                                    }`}>
                                                    <p className="text-[8px] font-serif uppercase tracking-widest text-gray-400 mb-1">
                                                        {req.status === 'cancelled' ? '❌ Cancellation Reason' : '📝 Seller Note'}
                                                    </p>
                                                    <p className="text-[11px] font-serif italic text-gray-700">
                                                        "{req.cancelReason || req.sellerNotes}"
                                                    </p>
                                                </div>
                                            )}

                                            {/* Delivery Estimate */}
                                            {req.estimatedDeliveryDays && req.status !== 'cancelled' && (
                                                <div className="mb-5 p-4 bg-emerald-50 border border-emerald-100">
                                                    <p className="text-[8px] font-serif uppercase tracking-widest text-emerald-600 mb-1">⏱ Estimated Delivery</p>
                                                    <p className="text-sm font-serif font-bold text-emerald-700">
                                                        {req.estimatedDeliveryDays} days from confirmation
                                                    </p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                                {/* Product */}
                                                <div>
                                                    <h4 className="text-[9px] font-serif uppercase tracking-[0.25em] text-[var(--athenic-gold)] mb-3 font-bold">👗 Product</h4>
                                                    {req.productId?.images?.[0] && (
                                                        <img
                                                            src={req.productId.images[0]}
                                                            alt={req.productId.name}
                                                            className="w-20 h-24 object-cover border border-gray-100 mb-3 cursor-pointer"
                                                            onClick={() => navigate(`/product/${req.productId._id}`)}
                                                        />
                                                    )}
                                                    <div className="space-y-2">
                                                        <Info label="Name" value={req.productId?.name} />
                                                        <Info label="Category" value={req.productId?.category} />
                                                    </div>

                                                    {/* Measurements */}
                                                    <h4 className="text-[9px] font-serif uppercase tracking-[0.25em] text-[var(--athenic-gold)] mb-3 mt-5 font-bold">📐 Measurements</h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {req.measurements && Object.entries(req.measurements)
                                                            .filter(([k, v]) => v && k !== 'notes')
                                                            .map(([k, v]) => (
                                                                <Info key={k} label={k} value={`${v} cm`} />
                                                            ))
                                                        }
                                                    </div>
                                                    {req.measurements?.notes && (
                                                        <p className="text-[9px] font-serif italic text-gray-400 mt-2">"{req.measurements.notes}"</p>
                                                    )}
                                                </div>

                                                {/* Design */}
                                                <div>
                                                    <h4 className="text-[9px] font-serif uppercase tracking-[0.25em] text-[var(--athenic-gold)] mb-3 font-bold">✏️ Design</h4>
                                                    <div className="space-y-2">
                                                        <Info label="Sleeve Style" value={req.customizations?.sleeveStyle} />
                                                        <Info label="Neckline" value={req.customizations?.neckline} />
                                                        <Info label="Length" value={req.customizations?.lengthAdjustment} />
                                                        <Info label="Custom Length" value={req.customizations?.customLengthCm ? `${req.customizations.customLengthCm} cm` : null} />
                                                        <Info label="Embroidery" value={req.customizations?.embroidery} />
                                                    </div>
                                                    {req.customizations?.additionalNotes && (
                                                        <p className="text-[9px] font-serif italic text-gray-400 mt-2">"{req.customizations.additionalNotes}"</p>
                                                    )}

                                                    {/* Fabric */}
                                                    <h4 className="text-[9px] font-serif uppercase tracking-[0.25em] text-[var(--athenic-gold)] mb-3 mt-5 font-bold">🧵 Fabric</h4>
                                                    <div className="space-y-2">
                                                        <Info label="Source" value={req.fabric?.useOwnFabric ? "My Own Fabric" : "Seller's Fabric"} />
                                                        <Info label="Type" value={req.fabric?.fabricType} />
                                                        <Info label="Color" value={req.fabric?.fabricColor} />
                                                    </div>
                                                    {req.fabric?.fabricDescription && (
                                                        <p className="text-[9px] font-serif italic text-gray-400 mt-2">"{req.fabric.fabricDescription}"</p>
                                                    )}
                                                    {req.fabric?.shippingInstructions && (
                                                        <p className="text-[9px] font-serif text-gray-400 mt-1">📦 {req.fabric.shippingInstructions}</p>
                                                    )}
                                                </div>

                                                {/* Status & Pricing */}
                                                <div>
                                                    <h4 className="text-[9px] font-serif uppercase tracking-[0.25em] text-[var(--athenic-gold)] mb-3 font-bold">💰 Pricing & Timeline</h4>
                                                    <div className="space-y-3">
                                                        {req.quotedPrice ? (
                                                            <div className="p-3 border border-[var(--athenic-gold)] border-opacity-30">
                                                                <p className="text-[8px] font-serif uppercase tracking-widest text-gray-400 mb-1">Quoted Price</p>
                                                                <p className="text-xl font-serif font-bold text-[var(--athenic-gold)]">₹{req.quotedPrice.toLocaleString()}</p>
                                                            </div>
                                                        ) : (
                                                            <div className="p-3 bg-gray-50 border border-gray-100">
                                                                <p className="text-[9px] font-serif uppercase tracking-widest text-gray-400">Pricing pending seller confirmation</p>
                                                            </div>
                                                        )}

                                                        {req.estimatedDeliveryDays && (
                                                            <div className="p-3 border border-emerald-100 bg-emerald-50">
                                                                <p className="text-[8px] font-serif uppercase tracking-widest text-gray-400 mb-1">Est. Delivery</p>
                                                                <p className="text-sm font-serif font-bold text-emerald-700">{req.estimatedDeliveryDays} days</p>
                                                            </div>
                                                        )}

                                                        <div className="p-3 bg-gray-50 border border-gray-100">
                                                            <p className="text-[8px] font-serif uppercase tracking-widest text-gray-400 mb-1">Submitted On</p>
                                                            <p className="text-[10px] font-serif text-gray-700">
                                                                {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="mt-5 space-y-2">
                                                        {req.productId?._id && (
                                                            <button
                                                                onClick={() => navigate(`/product/${req.productId._id}`)}
                                                                className="w-full py-2.5 border border-[var(--athenic-gold)] border-opacity-50 text-[var(--athenic-gold)] font-serif text-[9px] uppercase tracking-widest hover:bg-[var(--athenic-gold)] hover:text-white transition-all"
                                                            >
                                                                View Product →
                                                            </button>
                                                        )}
                                                        {req.status === 'pending' && (
                                                            <p className="text-[8px] font-serif italic text-gray-400 text-center mt-2">
                                                                Seller will confirm your request soon. You'll see price & timeline once confirmed.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTailoringRequests;
