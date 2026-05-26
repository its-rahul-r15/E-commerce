import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminApi';

const AdminTailoring = () => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Edit state
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [editForm, setEditForm] = useState({
        quotedPrice: '',
        estimatedDeliveryDays: '',
        sellerNotes: '',
        status: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        filterRequests();
    }, [requests, searchTerm, statusFilter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await adminService.getTailoringRequests();
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching tailoring requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterRequests = () => {
        let temp = [...requests];
        
        if (statusFilter !== 'all') {
            temp = temp.filter(r => r.status === statusFilter);
        }

        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            temp = temp.filter(r => 
                r.customerId?.name?.toLowerCase().includes(term) ||
                r.customerId?.email?.toLowerCase().includes(term) ||
                r.productId?.name?.toLowerCase().includes(term) ||
                r._id.toLowerCase().includes(term)
            );
        }

        setFilteredRequests(temp);
    };

    const handleSelectRequest = (req) => {
        setSelectedRequest(req);
        setEditForm({
            quotedPrice: req.quotedPrice || '',
            estimatedDeliveryDays: req.estimatedDeliveryDays || 21,
            sellerNotes: req.sellerNotes || '',
            status: req.status || 'pending'
        });
    };

    const handleUpdateStatus = async (statusVal) => {
        if (!selectedRequest) return;
        setSaving(true);
        try {
            const updated = await adminService.updateTailoringStatus(selectedRequest._id, {
                status: statusVal
            });
            // Update local state
            setRequests(prev => prev.map(r => r._id === selectedRequest._id ? { ...r, status: statusVal } : r));
            setSelectedRequest(prev => ({ ...prev, status: statusVal }));
            setEditForm(prev => ({ ...prev, status: statusVal }));
        } catch (error) {
            alert('Failed to update tailoring status');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDetails = async (e) => {
        e.preventDefault();
        if (!selectedRequest) return;
        setSaving(true);
        try {
            const payload = {
                quotedPrice: editForm.quotedPrice ? Number(editForm.quotedPrice) : undefined,
                estimatedDeliveryDays: Number(editForm.estimatedDeliveryDays),
                sellerNotes: editForm.sellerNotes,
                status: editForm.status
            };
            const updated = await adminService.updateTailoringStatus(selectedRequest._id, payload);
            
            setRequests(prev => prev.map(r => r._id === selectedRequest._id ? { ...r, ...updated } : r));
            setSelectedRequest({ ...selectedRequest, ...updated });
            alert('Tailoring request updated successfully!');
        } catch (error) {
            alert('Failed to update tailoring specifications');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    // Calculate counters
    const totalCount = requests.length;
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const inProgressCount = requests.filter(r => r.status === 'in_progress').length;
    const completedCount = requests.filter(r => r.status === 'completed').length;

    // Timeline Steps
    const timelineSteps = [
        { label: 'Pending Review', value: 'pending', color: 'bg-yellow-500' },
        { label: 'Confirmed', value: 'confirmed', color: 'bg-blue-500' },
        { label: 'In Progress (Stitching)', value: 'in_progress', color: 'bg-orange-500' },
        { label: 'Completed', value: 'completed', color: 'bg-emerald-500' }
    ];

    return (
        <AdminLayout>
            {/* Header */}
            <div className="mb-8 meander-pattern pb-1">
                <h1 className="text-3xl font-bold uppercase tracking-widest text-white">Custom Stitch & Dispatch</h1>
                <p className="text-[var(--gold)] mt-2 text-[10px] uppercase tracking-[0.2em] font-bold">Manage customer ethnic body measurements, stitch timelines, and fabric allocations</p>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-4 gap-6 mb-8 text-black">
                <div className="bg-white p-5 border border-[var(--gold)]/20 flex flex-col justify-between">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">All Requests</span>
                    <span className="text-3xl font-bold text-[var(--mehron)] mt-2">{totalCount}</span>
                </div>
                <div className="bg-white p-5 border border-[var(--gold)]/20 flex flex-col justify-between">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Pending Review</span>
                    <span className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</span>
                </div>
                <div className="bg-white p-5 border border-[var(--gold)]/20 flex flex-col justify-between">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">In Stitching</span>
                    <span className="text-3xl font-bold text-orange-500 mt-2">{inProgressCount}</span>
                </div>
                <div className="bg-white p-5 border border-[var(--gold)]/20 flex flex-col justify-between">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">QC & Finished</span>
                    <span className="text-3xl font-bold text-emerald-600 mt-2">{completedCount}</span>
                </div>
            </div>

            {/* Filter and Content Split */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Requests Column List (2 cols on large screen) */}
                <div className="xl:col-span-2 space-y-4">
                    
                    {/* Search & Filter Header */}
                    <div className="bg-[var(--mehron-deep)] p-4 border border-[var(--gold)]/20 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative w-full md:w-72">
                            <input
                                type="text"
                                placeholder="Search customer, item or ID..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-[var(--charcoal)] text-white pl-10 pr-4 py-2 border border-[var(--gold)]/20 focus:border-[var(--gold)] focus:outline-none text-xs"
                            />
                            <svg className="w-4 h-4 absolute left-3 top-2.5 text-[var(--gold)]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        
                        <div className="flex gap-2 w-full md:w-auto">
                            {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(st => (
                                <button
                                    key={st}
                                    onClick={() => setStatusFilter(st)}
                                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                        statusFilter === st
                                            ? 'bg-[var(--gold)] text-[var(--mehron)] border-[var(--gold)]'
                                            : 'bg-[var(--charcoal)] text-[var(--gold)]/80 border-[var(--gold)]/10 hover:border-[var(--gold)]/30'
                                    }`}
                                >
                                    {st.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Request Cards Grid */}
                    {loading ? (
                        <div className="text-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--gold)] border-t-transparent mx-auto"></div>
                            <p className="mt-4 text-[var(--gold)] text-[10px] uppercase tracking-widest">Fetching Dispatch Orders...</p>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="text-center py-16 bg-white border border-[var(--gold)]/10 text-gray-400">
                            <span className="text-4xl">✂️</span>
                            <p className="mt-2 text-sm">No custom tailoring requests found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredRequests.map(req => {
                                const isSel = selectedRequest?._id === req._id;
                                return (
                                    <div
                                        key={req._id}
                                        onClick={() => handleSelectRequest(req)}
                                        className={`bg-white border text-black p-5 cursor-pointer transition-all hover:shadow-md relative flex flex-col justify-between ${
                                            isSel ? 'border-[var(--gold)] ring-1 ring-[var(--gold)]' : 'border-gray-200'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <span className="text-[9px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 uppercase tracking-widest border border-gray-200">
                                                        ID: {req._id.slice(-6).toUpperCase()}
                                                    </span>
                                                    <p className="font-bold text-sm text-[var(--mehron)] mt-1.5 uppercase tracking-wide">
                                                        {req.customerId?.name || 'Guest User'}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">{req.customerId?.email}</p>
                                                </div>
                                                <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${
                                                    req.status === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                                    req.status === 'confirmed' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                                    req.status === 'in_progress' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                                                    req.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                    'bg-red-50 border-red-200 text-red-700'
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </div>

                                            <div className="border-t border-gray-100 pt-3 space-y-1">
                                                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Product: <span className="font-normal text-gray-500">{req.productId?.name}</span>
                                                </p>
                                                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    Fabric Type: <span className="font-normal text-gray-500">{req.fabric?.fabricType}</span>
                                                </p>
                                                {req.fabric?.useOwnFabric && (
                                                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest bg-amber-50 px-2 py-0.5 border border-amber-200/50 inline-block">
                                                        Sends Own Fabric
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-3 mt-4 flex justify-between items-center text-xs">
                                            <span className="font-bold text-gray-800">
                                                Quote: {req.quotedPrice ? `₹${req.quotedPrice.toLocaleString()}` : 'Unquoted'}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                {req.estimatedDeliveryDays} Days Est.
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Dispatch Details & Specifications Sidebar (1 col) */}
                <div className="space-y-6">
                    {selectedRequest ? (
                        <div className="bg-white text-black p-6 border border-[var(--gold)]/20 shadow-xl space-y-6">
                            
                            {/* Summary Header */}
                            <div>
                                <h3 className="text-sm font-bold text-[var(--mehron)] uppercase tracking-wider border-b border-gray-100 pb-2 flex justify-between items-center">
                                    <span>Dispatch Sheet</span>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">#{selectedRequest._id.slice(-6).toUpperCase()}</span>
                                </h3>
                                <p className="text-xs font-bold text-gray-600 mt-3 uppercase tracking-wide">Product Details</p>
                                <div className="flex items-center space-x-3 mt-2">
                                    {selectedRequest.productId?.images?.[0] && (
                                        <img src={selectedRequest.productId.images[0]} alt="product" className="w-12 h-12 object-cover border border-gray-200" />
                                    )}
                                    <div>
                                        <p className="text-xs font-bold uppercase text-gray-800">{selectedRequest.productId?.name}</p>
                                        <p className="text-[10px] text-[var(--mehron)] font-bold">Base Price: ₹{selectedRequest.productId?.price?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Stepper Timeline */}
                            <div>
                                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Stitch Timeline Status</p>
                                <div className="flex flex-col space-y-2">
                                    {timelineSteps.map((step, idx) => {
                                        const isCompleted = selectedRequest.status === step.value || 
                                            (selectedRequest.status === 'completed') ||
                                            (selectedRequest.status === 'in_progress' && step.value === 'confirmed') ||
                                            (selectedRequest.status === 'confirmed' && step.value === 'pending');
                                        const isCurrent = selectedRequest.status === step.value;
                                        
                                        return (
                                            <button
                                                key={step.value}
                                                onClick={() => handleUpdateStatus(step.value)}
                                                disabled={saving}
                                                className={`flex items-center justify-between px-3 py-2 border transition-all text-left text-xs ${
                                                    isCurrent 
                                                        ? 'bg-[var(--mehron)] text-white border-[var(--gold)] font-bold shadow-md' 
                                                        : isCompleted 
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <span className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-[var(--gold)]' : isCompleted ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                                                    <span>{step.label}</span>
                                                </div>
                                                {isCurrent && <span className="text-[9px] font-serif uppercase tracking-widest text-[var(--gold)]">Active</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Measurement Chart */}
                            <div>
                                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-100 pb-2 mb-3">Customer Measurements (Inches)</p>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-gray-50 p-2 border border-gray-100">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase">Chest</p>
                                        <p className="text-sm font-bold text-gray-800">{selectedRequest.measurements?.chest || '-'}"</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 border border-gray-100">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase">Waist</p>
                                        <p className="text-sm font-bold text-gray-800">{selectedRequest.measurements?.waist || '-'}"</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 border border-gray-100">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase">Hips</p>
                                        <p className="text-sm font-bold text-gray-800">{selectedRequest.measurements?.hips || '-'}"</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 border border-gray-100">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase">Shoulder</p>
                                        <p className="text-sm font-bold text-gray-800">{selectedRequest.measurements?.shoulder || '-'}"</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 border border-gray-100">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase">Sleeve</p>
                                        <p className="text-sm font-bold text-gray-800">{selectedRequest.measurements?.sleeveLength || '-'}"</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 border border-gray-100">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase">Length</p>
                                        <p className="text-sm font-bold text-gray-800">{selectedRequest.measurements?.length || '-'}"</p>
                                    </div>
                                </div>
                                {selectedRequest.measurements?.notes && (
                                    <div className="mt-3 bg-gray-50 p-3 border border-gray-100 text-xs">
                                        <p className="font-bold text-gray-500 uppercase text-[9px] mb-1">Body Fit Notes:</p>
                                        <p className="text-gray-600 italic">"{selectedRequest.measurements.notes}"</p>
                                    </div>
                                )}
                            </div>

                            {/* Custom Styling Choices */}
                            <div>
                                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-100 pb-2 mb-3">Custom Style Preferences</p>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-bold uppercase text-[9px]">Sleeve Style:</span>
                                        <span className="font-semibold text-gray-800 uppercase">{selectedRequest.customizations?.sleeveStyle || 'Standard'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-bold uppercase text-[9px]">Neckline Style:</span>
                                        <span className="font-semibold text-gray-800 uppercase">{selectedRequest.customizations?.neckline || 'Round'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-bold uppercase text-[9px]">Length Adjustment:</span>
                                        <span className="font-semibold text-gray-800 uppercase">{selectedRequest.customizations?.lengthAdjustment || 'Standard'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-bold uppercase text-[9px]">Embroidery:</span>
                                        <span className="font-semibold text-gray-800 uppercase">{selectedRequest.customizations?.embroidery || 'None'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Fabric specifications */}
                            <div>
                                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-100 pb-2 mb-3">Fabric Logistics</p>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-bold uppercase text-[9px]">Fabric Choice:</span>
                                        <span className="font-semibold text-gray-800 uppercase">{selectedRequest.fabric?.useOwnFabric ? 'Customer Fabric' : 'Boutique Inventory'}</span>
                                    </div>
                                    {selectedRequest.fabric?.fabricDescription && (
                                        <div className="bg-gray-50 p-2.5 border border-gray-100">
                                            <p className="text-[9px] text-gray-400 font-bold uppercase">Fabric Details:</p>
                                            <p className="text-gray-600">{selectedRequest.fabric.fabricDescription} {selectedRequest.fabric.fabricColor && `(${selectedRequest.fabric.fabricColor})`}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Edit Form */}
                            <form onSubmit={handleSaveDetails} className="border-t border-gray-100 pt-6 space-y-4">
                                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Update Stitch Specifications</p>
                                
                                <div>
                                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Quoted Price Adjust (₹)</label>
                                    <input
                                        type="number"
                                        value={editForm.quotedPrice}
                                        onChange={e => setEditForm({ ...editForm, quotedPrice: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 text-xs focus:border-[var(--gold)] focus:outline-none"
                                        placeholder="Enter additional stitching fee"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Est. Delivery Time (Days)</label>
                                    <input
                                        type="number"
                                        value={editForm.estimatedDeliveryDays}
                                        onChange={e => setEditForm({ ...editForm, estimatedDeliveryDays: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 text-xs focus:border-[var(--gold)] focus:outline-none"
                                        placeholder="e.g. 21"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Internal Seller & Stitcher Directions</label>
                                    <textarea
                                        rows="3"
                                        value={editForm.sellerNotes}
                                        onChange={e => setEditForm({ ...editForm, sellerNotes: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 text-xs focus:border-[var(--gold)] focus:outline-none font-sans"
                                        placeholder="Add notes for tailors (e.g. heavy lining required, deliver before wedding)"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-3 bg-[var(--mehron)] hover:bg-[var(--mehron-deep)] text-white text-xs font-bold uppercase tracking-widest border border-[var(--gold)] transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : '💾 Update Stitch Directions'}
                                </button>
                            </form>

                        </div>
                    ) : (
                        <div className="bg-white border border-[var(--gold)]/15 p-12 text-center text-gray-400">
                            <span className="text-4xl">🏷️</span>
                            <p className="mt-4 text-sm font-medium uppercase tracking-wider">Select a request card</p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Click any request on the left to inspect body measurements and stitch parameters</p>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
};

export default AdminTailoring;
