/**
 * CustomTailoring.jsx
 * 4-step premium wizard for submitting a custom tailoring request.
 * Step 1: Body Measurements
 * Step 2: Design Customizations  (sleeve, neckline, length, embroidery)
 * Step 3: Fabric Preference      (seller's fabric or provide your own)
 * Step 4: Review & Submit
 */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { tailoringService, productService } from '../../services/api';

// ── Step config ───────────────────────────────────────────────────────────────
const STEPS = [
    { id: 1, label: 'Measurements', icon: '📐' },
    { id: 2, label: 'Design', icon: '✏️' },
    { id: 3, label: 'Fabric', icon: '🧵' },
    { id: 4, label: 'Review', icon: '✅' },
];

const SLEEVE_OPTIONS = ['full', 'half', '3/4th', 'sleeveless', 'custom'];
const NECKLINE_OPTIONS = ['round', 'v-neck', 'boat', 'square', 'mandarin', 'sweetheart', 'custom'];
const LENGTH_OPTIONS = ['standard', 'short', 'long', 'custom'];
const EMBROIDERY_OPTIONS = ['none', 'light', 'heavy', 'custom'];
const FABRIC_TYPES = ['silk', 'cotton', 'chiffon', 'georgette', 'net', 'velvet', 'linen', 'polyester', 'other'];

// ── Default form state ────────────────────────────────────────────────────────
const defaultMeasurements = { chest: '', waist: '', hips: '', shoulder: '', length: '', sleeveLength: '', inseam: '', notes: '' };
const defaultCustomizations = { sleeveStyle: 'full', neckline: 'round', lengthAdjustment: 'standard', customLengthCm: '', embroidery: 'none', additionalNotes: '' };
const defaultFabric = { useOwnFabric: false, fabricType: 'cotton', fabricColor: '', fabricDescription: '', shippingInstructions: '' };

// ── Small reusable UI pieces ──────────────────────────────────────────────────

const OptionPill = ({ value, selected, onClick, label }) => (
    <button
        type="button"
        onClick={() => onClick(value)}
        className={`px-4 py-2 text-[9px] font-serif tracking-[0.2em] uppercase border transition-all capitalize ${selected
                ? 'border-[var(--athenic-gold)] bg-[var(--athenic-gold)] text-white'
                : 'border-gray-200 text-gray-500 hover:border-[var(--athenic-gold)] hover:text-[var(--athenic-gold)]'
            }`}
    >
        {label || value}
    </button>
);

const MeasurementField = ({ label, name, value, onChange, unit = 'cm', hint }) => (
    <div>
        <label className="block text-[9px] font-serif uppercase tracking-[0.25em] text-gray-500 mb-1.5">
            {label} <span className="opacity-50">({unit})</span>
        </label>
        <input
            type="number"
            name={name}
            value={value}
            onChange={onChange}
            min="0"
            placeholder="0"
            className="w-full px-4 py-3 border border-gray-200 text-sm font-serif text-[var(--athenic-blue)] focus:outline-none focus:border-[var(--athenic-gold)] transition-colors bg-white"
        />
        {hint && <p className="text-[8px] text-gray-400 mt-1 font-serif italic">{hint}</p>}
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const CustomTailoring = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated, user } = useAuth();
    const productId = searchParams.get('product');

    const [currentStep, setCurrentStep] = useState(1);
    const [product, setProduct] = useState(null);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [requestId, setRequestId] = useState(null);

    const [measurements, setMeasurements] = useState(defaultMeasurements);
    const [customizations, setCustomizations] = useState(defaultCustomizations);
    const [fabric, setFabric] = useState(defaultFabric);

    // ── Redirect if not logged in ─────────────────────────────────────────────
    useEffect(() => {
        if (!isAuthenticated) navigate('/login');
    }, [isAuthenticated]);

    // ── Load product ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!productId) { setLoadingProduct(false); return; }
        productService.getProductById(productId)
            .then(d => setProduct(d.product))
            .catch(() => setProduct(null))
            .finally(() => setLoadingProduct(false));
    }, [productId]);

    // ── Generic change handlers ───────────────────────────────────────────────
    const handleMeasurementChange = e => {
        setMeasurements(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // ── Validation ────────────────────────────────────────────────────────────
    const validateStep1 = () => {
        const required = ['chest', 'waist', 'shoulder', 'length'];
        return required.every(k => measurements[k] && parseFloat(measurements[k]) > 0);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!productId) { alert('No product selected. Please go back to a product page.'); return; }
        setSubmitting(true);
        try {
            const payload = {
                productId,
                measurements: Object.fromEntries(
                    Object.entries(measurements).filter(([, v]) => v !== '' && v !== undefined)
                        .map(([k, v]) => [k, k === 'notes' ? v : parseFloat(v) || v])
                ),
                customizations,
                fabric,
            };
            const result = await tailoringService.submitRequest(payload);
            setRequestId(result.request._id);
            setSubmitted(true);
        } catch (err) {
            alert(err.response?.data?.error || 'Could not submit tailoring request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Success Screen ────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="min-h-screen bg-[var(--athenic-bg)] flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 border-2 border-[var(--athenic-gold)] flex items-center justify-center mx-auto mb-8 text-4xl">✂️</div>
                    <h1 className="text-3xl font-serif tracking-[0.1em] text-[var(--athenic-blue)] uppercase mb-4">Request Sent!</h1>
                    <div className="w-10 h-px bg-[var(--athenic-gold)] mx-auto mb-6" />
                    <p className="text-[10px] font-serif text-gray-500 uppercase tracking-widest leading-loose mb-8">
                        Your tailoring request has been submitted. The seller will review your measurements and confirm within 24–48 hours.
                    </p>
                    {requestId && (
                        <p className="text-[9px] font-mono text-[var(--athenic-gold)] mb-8 opacity-70">
                            Reference: #{requestId.slice(-8).toUpperCase()}
                        </p>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/tailoring/requests')}
                            className="py-4 border border-[var(--athenic-gold)] text-[var(--athenic-gold)] text-[9px] font-serif tracking-widest uppercase hover:bg-[var(--athenic-gold)] hover:text-white transition-all"
                        >
                            My Requests
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="py-4 bg-[var(--athenic-blue)] text-white text-[9px] font-serif tracking-widest uppercase hover:opacity-90 transition-opacity"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

    return (
        <div className="min-h-screen bg-[var(--athenic-bg)] pb-20">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-[var(--mehron-deep,#7c2d12)] to-[var(--mehron,#9a3412)] py-10 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-[9px] tracking-[0.5em] font-serif uppercase text-orange-200 opacity-70 mb-3">
                        Klyra Atelier
                    </p>
                    <h1 className="text-3xl md:text-4xl font-serif tracking-[0.15em] text-white uppercase">
                        Custom Tailoring
                    </h1>
                    <div className="w-12 h-px bg-orange-300 mx-auto mt-4 mb-4 opacity-60" />
                    <p className="text-[10px] font-serif italic text-orange-200 opacity-80 tracking-wide">
                        Crafted to your exact measurements — a garment that is truly yours
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-10">

                {/* ── Product Card ─────────────────────────────────────────── */}
                {!loadingProduct && product && (
                    <div className="flex items-center space-x-4 mb-8 p-4 bg-white border border-[var(--athenic-gold)] border-opacity-30">
                        <div className="w-14 h-16 overflow-hidden flex-shrink-0 bg-gray-50">
                            <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="text-[9px] font-serif uppercase tracking-widest text-gray-400">Selected Garment</p>
                            <h3 className="text-sm font-serif text-[var(--athenic-blue)] font-medium mt-0.5">{product.name}</h3>
                            <p className="text-[10px] font-serif text-[var(--athenic-gold)] mt-0.5">
                                ₹{(product.discountedPrice || product.price)?.toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Step Progress Bar ─────────────────────────────────────── */}
                <div className="mb-10">
                    {/* Progress line */}
                    <div className="relative h-[1px] bg-gray-200 mb-6">
                        <div
                            className="absolute top-0 left-0 h-full bg-[var(--athenic-gold)] transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {/* Step labels */}
                    <div className="flex justify-between">
                        {STEPS.map(s => (
                            <button
                                key={s.id}
                                onClick={() => s.id < currentStep && setCurrentStep(s.id)}
                                className={`flex flex-col items-center space-y-1 transition-opacity ${s.id > currentStep ? 'opacity-30 cursor-default' : s.id < currentStep ? 'opacity-60 cursor-pointer hover:opacity-100' : 'opacity-100 cursor-default'}`}
                            >
                                <span className={`text-base ${s.id === currentStep ? 'scale-125' : ''} transition-transform`}>{s.icon}</span>
                                <span className={`text-[8px] font-serif uppercase tracking-widest hidden sm:block ${s.id === currentStep ? 'text-[var(--athenic-gold)]' : 'text-gray-400'}`}>
                                    {s.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════════
                    STEP 1 — BODY MEASUREMENTS
                ════════════════════════════════════════════════════════════ */}
                {currentStep === 1 && (
                    <div>
                        <div className="mb-8">
                            <h2 className="text-2xl font-serif tracking-[0.1em] text-[var(--athenic-blue)] uppercase mb-2">📐 Body Measurements</h2>
                            <p className="text-[9px] font-serif text-gray-400 uppercase tracking-widest">All measurements in centimetres (cm)</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-6">
                            <MeasurementField label="Chest *" name="chest" value={measurements.chest} onChange={handleMeasurementChange} hint="Fullest part of chest" />
                            <MeasurementField label="Waist *" name="waist" value={measurements.waist} onChange={handleMeasurementChange} hint="Natural waistline" />
                            <MeasurementField label="Hips" name="hips" value={measurements.hips} onChange={handleMeasurementChange} hint="Fullest part of hips" />
                            <MeasurementField label="Shoulder *" name="shoulder" value={measurements.shoulder} onChange={handleMeasurementChange} hint="Shoulder seam to seam" />
                            <MeasurementField label="Length *" name="length" value={measurements.length} onChange={handleMeasurementChange} hint="Neckline to hem" />
                            <MeasurementField label="Sleeve Length" name="sleeveLength" value={measurements.sleeveLength} onChange={handleMeasurementChange} />
                            <MeasurementField label="Inseam" name="inseam" value={measurements.inseam} onChange={handleMeasurementChange} hint="For trousers / lehenga" />
                        </div>

                        <div className="mb-8">
                            <label className="block text-[9px] font-serif uppercase tracking-[0.25em] text-gray-500 mb-1.5">
                                Additional Notes
                            </label>
                            <textarea
                                value={measurements.notes}
                                onChange={e => setMeasurements(p => ({ ...p, notes: e.target.value }))}
                                rows={3}
                                placeholder="Any special fitting concerns or body notes..."
                                className="w-full px-4 py-3 border border-gray-200 text-sm font-serif text-[var(--athenic-blue)] focus:outline-none focus:border-[var(--athenic-gold)] transition-colors bg-white resize-none"
                            />
                        </div>

                        {/* Measurement guide tip */}
                        <div className="p-4 bg-amber-50 border border-amber-200 mb-8">
                            <p className="text-[9px] font-serif uppercase tracking-widest text-amber-700">
                                💡 Tip: Use a soft measuring tape. For best results, measure over light clothing or undergarments. Fields marked * are required.
                            </p>
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════════
                    STEP 2 — DESIGN CUSTOMIZATIONS
                ════════════════════════════════════════════════════════════ */}
                {currentStep === 2 && (
                    <div>
                        <div className="mb-8">
                            <h2 className="text-2xl font-serif tracking-[0.1em] text-[var(--athenic-blue)] uppercase mb-2">✏️ Design Options</h2>
                            <p className="text-[9px] font-serif text-gray-400 uppercase tracking-widest">Personalise your garment's style</p>
                        </div>

                        <div className="space-y-8">
                            {/* Sleeve Style */}
                            <div>
                                <h4 className="text-[10px] font-serif uppercase tracking-[0.25em] text-[var(--athenic-blue)] mb-3">Sleeve Style</h4>
                                <div className="flex flex-wrap gap-2">
                                    {SLEEVE_OPTIONS.map(o => (
                                        <OptionPill key={o} value={o} selected={customizations.sleeveStyle === o} onClick={v => setCustomizations(p => ({ ...p, sleeveStyle: v }))} />
                                    ))}
                                </div>
                            </div>

                            {/* Neckline */}
                            <div>
                                <h4 className="text-[10px] font-serif uppercase tracking-[0.25em] text-[var(--athenic-blue)] mb-3">Neckline</h4>
                                <div className="flex flex-wrap gap-2">
                                    {NECKLINE_OPTIONS.map(o => (
                                        <OptionPill key={o} value={o} selected={customizations.neckline === o} onClick={v => setCustomizations(p => ({ ...p, neckline: v }))} />
                                    ))}
                                </div>
                            </div>

                            {/* Length Adjustment */}
                            <div>
                                <h4 className="text-[10px] font-serif uppercase tracking-[0.25em] text-[var(--athenic-blue)] mb-3">Length Adjustment</h4>
                                <div className="flex flex-wrap gap-2">
                                    {LENGTH_OPTIONS.map(o => (
                                        <OptionPill key={o} value={o} selected={customizations.lengthAdjustment === o} onClick={v => setCustomizations(p => ({ ...p, lengthAdjustment: v }))} />
                                    ))}
                                </div>
                                {customizations.lengthAdjustment === 'custom' && (
                                    <div className="mt-3 max-w-xs">
                                        <MeasurementField label="Custom length" name="customLengthCm"
                                            value={customizations.customLengthCm}
                                            onChange={e => setCustomizations(p => ({ ...p, customLengthCm: e.target.value }))} />
                                    </div>
                                )}
                            </div>

                            {/* Embroidery */}
                            <div>
                                <h4 className="text-[10px] font-serif uppercase tracking-[0.25em] text-[var(--athenic-blue)] mb-3">Embroidery Work</h4>
                                <div className="flex flex-wrap gap-2">
                                    {EMBROIDERY_OPTIONS.map(o => (
                                        <OptionPill key={o} value={o} selected={customizations.embroidery === o} onClick={v => setCustomizations(p => ({ ...p, embroidery: v }))} label={o === 'none' ? 'No Embroidery' : o} />
                                    ))}
                                </div>
                            </div>

                            {/* Additional notes */}
                            <div>
                                <label className="block text-[9px] font-serif uppercase tracking-[0.25em] text-gray-500 mb-1.5">
                                    Special Requests
                                </label>
                                <textarea
                                    value={customizations.additionalNotes}
                                    onChange={e => setCustomizations(p => ({ ...p, additionalNotes: e.target.value }))}
                                    rows={3}
                                    placeholder="Describe any other design changes (pocket style, lining preference, etc.)..."
                                    className="w-full px-4 py-3 border border-gray-200 text-sm font-serif focus:outline-none focus:border-[var(--athenic-gold)] transition-colors bg-white resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════════
                    STEP 3 — FABRIC CHOICE
                ════════════════════════════════════════════════════════════ */}
                {currentStep === 3 && (
                    <div>
                        <div className="mb-8">
                            <h2 className="text-2xl font-serif tracking-[0.1em] text-[var(--athenic-blue)] uppercase mb-2">🧵 Fabric Choice</h2>
                            <p className="text-[9px] font-serif text-gray-400 uppercase tracking-widest">Choose the seller's fabric or provide your own</p>
                        </div>

                        {/* Fabric source toggle */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <button
                                type="button"
                                onClick={() => setFabric(p => ({ ...p, useOwnFabric: false }))}
                                className={`p-6 border-2 text-center transition-all ${!fabric.useOwnFabric ? 'border-[var(--athenic-gold)] bg-[var(--ivory,#fffdf8)]' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                <span className="block text-2xl mb-2">🏪</span>
                                <span className="text-[10px] font-serif uppercase tracking-widest text-[var(--athenic-blue)]">Seller's Fabric</span>
                                <p className="text-[8px] text-gray-400 font-serif mt-1">Choose type &amp; color from available options</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFabric(p => ({ ...p, useOwnFabric: true }))}
                                className={`p-6 border-2 text-center transition-all ${fabric.useOwnFabric ? 'border-[var(--athenic-gold)] bg-[var(--ivory,#fffdf8)]' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                <span className="block text-2xl mb-2">📦</span>
                                <span className="text-[10px] font-serif uppercase tracking-widest text-[var(--athenic-blue)]">My Own Fabric</span>
                                <p className="text-[8px] text-gray-400 font-serif mt-1">Ship your fabric to the seller for stitching</p>
                            </button>
                        </div>

                        {/* Seller's fabric options */}
                        {!fabric.useOwnFabric && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-serif uppercase tracking-[0.25em] text-[var(--athenic-blue)] mb-3">Fabric Type</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {FABRIC_TYPES.map(t => (
                                            <OptionPill key={t} value={t} selected={fabric.fabricType === t} onClick={v => setFabric(p => ({ ...p, fabricType: v }))} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-serif uppercase tracking-[0.25em] text-gray-500 mb-1.5">Preferred Color</label>
                                    <input
                                        type="text"
                                        value={fabric.fabricColor}
                                        onChange={e => setFabric(p => ({ ...p, fabricColor: e.target.value }))}
                                        placeholder="e.g. Deep Burgundy, Ivory White, Peacock Blue..."
                                        className="w-full px-4 py-3 border border-gray-200 text-sm font-serif focus:outline-none focus:border-[var(--athenic-gold)] transition-colors bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-serif uppercase tracking-[0.25em] text-gray-500 mb-1.5">Fabric Description / Additional Preferences</label>
                                    <textarea
                                        value={fabric.fabricDescription}
                                        onChange={e => setFabric(p => ({ ...p, fabricDescription: e.target.value }))}
                                        rows={3}
                                        placeholder="Any specific texture, weight, or pattern preferences..."
                                        className="w-full px-4 py-3 border border-gray-200 text-sm font-serif focus:outline-none focus:border-[var(--athenic-gold)] transition-colors bg-white resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Own fabric instructions */}
                        {fabric.useOwnFabric && (
                            <div className="space-y-4">
                                <div className="p-4 border border-orange-200 bg-orange-50">
                                    <p className="text-[9px] font-serif uppercase tracking-widest text-orange-700 leading-loose">
                                        📦 After placing your tailoring request, you'll receive the seller's shipping address to courier your fabric.
                                        Please ensure you send at least 10–15% extra fabric than the garment length to account for cutting and stitching margins.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-serif uppercase tracking-[0.25em] text-gray-500 mb-1.5">Describe Your Fabric</label>
                                    <textarea
                                        value={fabric.fabricDescription}
                                        onChange={e => setFabric(p => ({ ...p, fabricDescription: e.target.value }))}
                                        rows={3}
                                        placeholder="Fabric type, color, pattern, weight (e.g., Heavy Banarasi Silk in Navy Blue with gold zari weave)..."
                                        className="w-full px-4 py-3 border border-gray-200 text-sm font-serif focus:outline-none focus:border-[var(--athenic-gold)] transition-colors bg-white resize-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════════
                    STEP 4 — REVIEW & SUBMIT
                ════════════════════════════════════════════════════════════ */}
                {currentStep === 4 && (
                    <div>
                        <div className="mb-8">
                            <h2 className="text-2xl font-serif tracking-[0.1em] text-[var(--athenic-blue)] uppercase mb-2">✅ Review & Submit</h2>
                            <p className="text-[9px] font-serif text-gray-400 uppercase tracking-widest">Confirm your tailoring details before submitting</p>
                        </div>

                        {/* Summary cards */}
                        <div className="space-y-4 mb-8">

                            {/* Measurements summary */}
                            <div className="border border-[var(--athenic-gold)] border-opacity-30 p-5 bg-white">
                                <h4 className="text-[9px] font-serif uppercase tracking-[0.3em] text-[var(--athenic-gold)] mb-4">📐 Measurements</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.entries(measurements).filter(([k, v]) => v && k !== 'notes').map(([k, v]) => (
                                        <div key={k}>
                                            <p className="text-[8px] font-serif uppercase tracking-wider text-gray-400 capitalize">{k}</p>
                                            <p className="text-xs font-serif text-[var(--athenic-blue)]">{v} cm</p>
                                        </div>
                                    ))}
                                </div>
                                {measurements.notes && (
                                    <p className="text-[9px] font-serif text-gray-500 mt-3 pt-3 border-t border-gray-100 italic">"{measurements.notes}"</p>
                                )}
                            </div>

                            {/* Customizations summary */}
                            <div className="border border-[var(--athenic-gold)] border-opacity-30 p-5 bg-white">
                                <h4 className="text-[9px] font-serif uppercase tracking-[0.3em] text-[var(--athenic-gold)] mb-4">✏️ Design</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        ['Sleeve', customizations.sleeveStyle],
                                        ['Neckline', customizations.neckline],
                                        ['Length', customizations.lengthAdjustment],
                                        ['Embroidery', customizations.embroidery],
                                    ].map(([label, val]) => (
                                        <div key={label}>
                                            <p className="text-[8px] font-serif uppercase tracking-wider text-gray-400">{label}</p>
                                            <p className="text-xs font-serif text-[var(--athenic-blue)] capitalize">{val}</p>
                                        </div>
                                    ))}
                                </div>
                                {customizations.additionalNotes && (
                                    <p className="text-[9px] font-serif text-gray-500 mt-3 pt-3 border-t border-gray-100 italic">"{customizations.additionalNotes}"</p>
                                )}
                            </div>

                            {/* Fabric summary */}
                            <div className="border border-[var(--athenic-gold)] border-opacity-30 p-5 bg-white">
                                <h4 className="text-[9px] font-serif uppercase tracking-[0.3em] text-[var(--athenic-gold)] mb-4">🧵 Fabric</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-[8px] font-serif uppercase tracking-wider text-gray-400">Source</p>
                                        <p className="text-xs font-serif text-[var(--athenic-blue)]">{fabric.useOwnFabric ? 'My Own Fabric' : "Seller's Fabric"}</p>
                                    </div>
                                    {!fabric.useOwnFabric && fabric.fabricType && (
                                        <div>
                                            <p className="text-[8px] font-serif uppercase tracking-wider text-gray-400">Type</p>
                                            <p className="text-xs font-serif text-[var(--athenic-blue)] capitalize">{fabric.fabricType}</p>
                                        </div>
                                    )}
                                    {fabric.fabricColor && (
                                        <div>
                                            <p className="text-[8px] font-serif uppercase tracking-wider text-gray-400">Color</p>
                                            <p className="text-xs font-serif text-[var(--athenic-blue)]">{fabric.fabricColor}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Estimated timeline */}
                        <div className="p-4 bg-[var(--ivory,#fffdf8)] border border-[var(--athenic-gold)] border-opacity-30 mb-8">
                            <p className="text-[9px] font-serif uppercase tracking-widest text-[var(--athenic-gold)] text-center">
                                ✨ Estimated delivery: 15–21 working days after confirmation
                            </p>
                        </div>

                        {/* Terms note */}
                        <p className="text-[8px] font-serif text-gray-400 text-center tracking-widest uppercase mb-8 leading-loose">
                            By submitting, you agree that measurements are final. The seller will confirm availability and pricing within 24–48 hrs.
                        </p>
                    </div>
                )}

                {/* ── Navigation Buttons ────────────────────────────────────── */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                    {currentStep > 1 ? (
                        <button
                            onClick={() => setCurrentStep(s => s - 1)}
                            className="px-8 py-4 text-[9px] font-serif uppercase tracking-[0.25em] border border-gray-200 text-gray-500 hover:border-gray-300 transition-colors"
                        >
                            ← Back
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate(-1)}
                            className="px-8 py-4 text-[9px] font-serif uppercase tracking-[0.25em] border border-gray-200 text-gray-500 hover:border-gray-300 transition-colors"
                        >
                            ← Product
                        </button>
                    )}

                    {currentStep < STEPS.length ? (
                        <button
                            onClick={() => {
                                if (currentStep === 1 && !validateStep1()) {
                                    alert('Please fill in the required measurements: Chest, Waist, Shoulder, Length');
                                    return;
                                }
                                setCurrentStep(s => s + 1);
                            }}
                            className="px-8 py-4 bg-[var(--athenic-gold)] text-white text-[9px] font-serif uppercase tracking-[0.25em] hover:opacity-90 transition-opacity"
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-10 py-4 bg-[var(--mehron-deep,#7c2d12)] text-white text-[9px] font-serif uppercase tracking-[0.25em] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {submitting ? (
                                <>
                                    <span className="animate-spin text-base">⏳</span>
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <>
                                    <span>✂️</span>
                                    <span>Submit Request</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default CustomTailoring;
