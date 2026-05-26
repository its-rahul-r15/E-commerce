import { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminEmails = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('templates'); // 'templates' or 'broadcast'

    // Template Editing state
    const [selectedTemplateName, setSelectedTemplateName] = useState('');
    const [templateSubject, setTemplateSubject] = useState('');
    const [templateBody, setTemplateBody] = useState('');
    const [templateVariables, setTemplateVariables] = useState([]);
    const [savingTemplate, setSavingTemplate] = useState(false);

    // Broadcast state
    const [broadcastSubject, setBroadcastSubject] = useState('');
    const [broadcastBody, setBroadcastBody] = useState(`
<div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #faf9f7; border: 1px solid #e5e0d8;">
    <div style="background: #1a2332; padding: 30px; text-align: center;">
        <h1 style="color: #d4af37; font-size: 28px; margin: 0; letter-spacing: 4px;">KLYRA</h1>
        <p style="color: #ffffff80; font-size: 10px; letter-spacing: 3px; margin-top: 5px;">ANNOUNCEMENT</p>
    </div>
    <div style="padding: 40px 30px; background: #ffffff;">
        <h2 style="color: #1a2332; font-size: 20px; font-weight: normal; margin-bottom: 20px; text-align: center;">Dear {userName},</h2>
        <p style="color: #555; font-size: 14px; line-height: 1.8; margin-bottom: 25px;">
            We have a special announcement just for you! Enter your content here...
        </p>
    </div>
    <div style="background: #1a2332; padding: 20px; text-align: center;">
        <p style="color: #ffffff50; font-size: 10px; letter-spacing: 2px; margin: 0;">KLYRA — ROYAL COUTURE</p>
    </div>
</div>`);
    const [sendingBroadcast, setSendingBroadcast] = useState(false);
    const [broadcastStatus, setBroadcastStatus] = useState(null);

    // Targeted email states
    const [targetType, setTargetType] = useState('all'); // 'all' | 'selected' | 'custom'
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [customEmails, setCustomEmails] = useState('');
    const [allCustomers, setAllCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchTemplates();
        fetchCustomers();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/admin/emails/templates');
            const data = response.data.data || [];
            setTemplates(data);
            if (data.length > 0) {
                selectTemplate(data[0]);
            }
        } catch (error) {
            console.error('Error fetching email templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            setLoadingCustomers(true);
            const response = await axios.get('/admin/users?role=customer&limit=500'); // Fetch first 500 customers
            setAllCustomers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoadingCustomers(false);
        }
    };

    // Filter customers for display
    const filteredCustomers = allCustomers.filter(cust => {
        const term = customerSearch.toLowerCase().trim();
        if (!term) return true;
        return (cust.name || '').toLowerCase().includes(term) || (cust.email || '').toLowerCase().includes(term);
    });

    const handleToggleCustomer = (cust) => {
        const isSelected = selectedCustomers.some(c => c._id === cust._id);
        if (isSelected) {
            setSelectedCustomers(selectedCustomers.filter(c => c._id !== cust._id));
        } else {
            setSelectedCustomers([...selectedCustomers, cust]);
        }
    };

    const handleSelectAllFiltered = () => {
        const newSelected = [...selectedCustomers];
        filteredCustomers.forEach(cust => {
            if (!newSelected.some(c => c._id === cust._id)) {
                newSelected.push(cust);
            }
        });
        setSelectedCustomers(newSelected);
    };

    const handleDeselectAllFiltered = () => {
        const filteredIds = filteredCustomers.map(c => c._id);
        setSelectedCustomers(selectedCustomers.filter(c => !filteredIds.includes(c._id)));
    };

    const handleRemoveCustomer = (id) => {
        setSelectedCustomers(selectedCustomers.filter(c => c._id !== id));
    };

    const selectTemplate = (tpl) => {
        setSelectedTemplateName(tpl.name);
        setTemplateSubject(tpl.subject);
        setTemplateBody(tpl.htmlBody);
        setTemplateVariables(tpl.variables || []);
    };

    const handleTemplateChange = (e) => {
        const tplName = e.target.value;
        const tpl = templates.find(t => t.name === tplName);
        if (tpl) selectTemplate(tpl);
    };

    const handleSaveTemplate = async (e) => {
        e.preventDefault();
        if (!templateSubject.trim() || !templateBody.trim()) {
            alert('Subject and Body are required.');
            return;
        }

        try {
            setSavingTemplate(true);
            const data = {
                subject: templateSubject.trim(),
                htmlBody: templateBody
            };
            await axios.put(`/admin/emails/templates/${selectedTemplateName}`, data);
            alert('Template updated successfully!');
            // Update local list
            setTemplates(templates.map(t => t.name === selectedTemplateName ? { ...t, ...data } : t));
        } catch (error) {
            console.error('Error updating template:', error);
            alert(error.response?.data?.message || 'Error updating template');
        } finally {
            setSavingTemplate(false);
        }
    };

    const handleSendBroadcast = async (e) => {
        e.preventDefault();
        if (!broadcastSubject.trim() || !broadcastBody.trim()) {
            alert('Subject and Body are required.');
            return;
        }

        const payload = {
            subject: broadcastSubject.trim(),
            htmlBody: broadcastBody
        };

        let confirmMsg = 'Are you sure you want to send this email to all platform customers? This action cannot be undone.';

        if (targetType === 'selected') {
            if (selectedCustomers.length === 0) {
                alert('Please select at least one customer.');
                return;
            }
            payload.userIds = selectedCustomers.map(c => c._id);
            confirmMsg = `Are you sure you want to send this email to the ${selectedCustomers.length} selected customer(s)?`;
        } else if (targetType === 'custom') {
            const parsedEmails = customEmails
                .split(',')
                .map(em => em.trim())
                .filter(em => em.length > 0 && em.includes('@'));

            if (parsedEmails.length === 0) {
                alert('Please enter at least one valid email address.');
                return;
            }
            payload.emails = parsedEmails;
            confirmMsg = `Are you sure you want to send this email to the ${parsedEmails.length} custom email address(es)?`;
        }

        if (!confirm(confirmMsg)) return;

        try {
            setSendingBroadcast(true);
            setBroadcastStatus('Sending email campaign...');
            const response = await axios.post('/admin/emails/broadcast', payload);
            const data = response.data.data;
            setBroadcastStatus(`Campaign completed! Total: ${data.total}, Success: ${data.success}, Failed: ${data.failed}`);
            alert('Campaign emails sent!');
        } catch (error) {
            console.error('Error sending email campaign:', error);
            setBroadcastStatus('Campaign failed.');
            alert(error.response?.data?.message || 'Error sending campaign');
        } finally {
            setSendingBroadcast(false);
        }
    };

    const formatTemplateName = (name) => {
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-8 meander-pattern pb-1">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-widest text-white">Communications Manager</h1>
                    <p className="text-[var(--gold)] mt-2 text-[10px] uppercase tracking-[0.2em] font-bold">Customize customer notification templates and broadcast custom newsletters</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-4 mb-8 border-b border-[var(--border-mehron)]/20 pb-4">
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`px-6 py-2.5 text-xs font-bold uppercase tracking-widest border transition-all ${activeTab === 'templates'
                        ? 'bg-[var(--gold)] text-[var(--mehron)] border-[var(--gold)] shadow-md'
                        : 'bg-[var(--mehron-deep)] text-[var(--gold)] border-[var(--gold)]/20 hover:bg-[var(--mehron)]'
                        }`}
                >
                    Template Customizer
                </button>
                <button
                    onClick={() => setActiveTab('broadcast')}
                    className={`px-6 py-2.5 text-xs font-bold uppercase tracking-widest border transition-all ${activeTab === 'broadcast'
                        ? 'bg-[var(--gold)] text-[var(--mehron)] border-[var(--gold)] shadow-md'
                        : 'bg-[var(--mehron-deep)] text-[var(--gold)] border-[var(--gold)]/20 hover:bg-[var(--mehron)]'
                        }`}
                >
                    Broadcast Newsletter
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="animate-spin rounded-none h-12 w-12 border-2 border-[var(--gold)] border-t-transparent"></div>
                </div>
            ) : activeTab === 'templates' ? (
                /* ── TEMPLATES MANAGER TAB ── */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    
                    {/* Editor Form */}
                    <div className="bg-white border border-[var(--border-mehron)] p-8 shadow-md relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--mehron)] meander-pattern"></div>
                        <h2 className="text-lg font-bold text-[var(--mehron)] uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">Edit Template</h2>

                        <form onSubmit={handleSaveTemplate} className="space-y-6">
                            {/* Template selector */}
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-2">Select Template</label>
                                <select
                                    value={selectedTemplateName}
                                    onChange={handleTemplateChange}
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[var(--border-mehron)] rounded-none focus:ring-0 focus:border-[var(--gold)] outline-none font-bold text-[var(--mehron)] uppercase tracking-widest text-[11px]"
                                >
                                    {templates.map(tpl => (
                                        <option key={tpl.name} value={tpl.name}>{formatTemplateName(tpl.name)}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Placeholders helper */}
                            <div className="bg-[var(--gold-pale)] border border-[var(--gold)]/20 p-4">
                                <span className="block text-[9px] font-bold text-[var(--mehron)] uppercase tracking-wider mb-1.5">Available Variables (Must include brackets):</span>
                                <div className="flex flex-wrap gap-2">
                                    {templateVariables.map(v => (
                                        <span key={v} className="bg-white border border-[var(--gold)]/15 px-2 py-0.5 text-[10px] font-mono text-[var(--mehron)] font-semibold">
                                            {`{${v}}`}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-2">Email Subject</label>
                                <input
                                    type="text"
                                    value={templateSubject}
                                    onChange={(e) => setTemplateSubject(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[var(--border-mehron)] rounded-none focus:ring-0 focus:border-[var(--gold)] outline-none font-bold text-[var(--mehron)] placeholder:text-gray-300"
                                    required
                                />
                            </div>

                            {/* HTML Body */}
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-2">HTML Body (Templates styling supported)</label>
                                <textarea
                                    value={templateBody}
                                    onChange={(e) => setTemplateBody(e.target.value)}
                                    className="w-full h-80 px-4 py-2.5 bg-[#FAF9F6] border border-[var(--border-mehron)] rounded-none focus:ring-0 focus:border-[var(--gold)] outline-none font-mono text-xs text-gray-800"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={savingTemplate}
                                className="w-full py-3 bg-[var(--mehron)] text-white rounded-none border border-[var(--gold)] hover:bg-[var(--mehron-deep)] font-bold uppercase tracking-widest text-[10px] shadow-lg disabled:opacity-50 transition-all"
                            >
                                {savingTemplate ? 'Saving Changes...' : 'Save Template'}
                            </button>
                        </form>
                    </div>

                    {/* Preview Box */}
                    <div className="bg-[var(--charcoal)] border border-[var(--gold)]/20 p-8 shadow-md rounded-none">
                        <h2 className="text-lg font-bold text-[var(--gold)] uppercase tracking-widest mb-6 border-b border-[var(--gold)]/10 pb-3">Live Sandbox Preview</h2>
                        <div className="bg-white border border-[var(--border-mehron)] p-4 overflow-y-auto max-h-[500px] shadow-inner text-black">
                            <div className="border-b border-gray-100 pb-3 mb-4 font-sans text-xs">
                                <span className="font-bold text-gray-400 uppercase mr-2">Subject:</span>
                                <span className="font-semibold text-gray-800">{templateSubject}</span>
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: templateBody }} />
                        </div>
                    </div>

                </div>
            ) : (
                /* ── BROADCAST TAB ── */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    
                    {/* Composing Form */}
                    <div className="bg-white border border-[var(--border-mehron)] p-8 shadow-md relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--mehron)] meander-pattern"></div>
                        <h2 className="text-lg font-bold text-[var(--mehron)] uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">Compose Broadcast</h2>

                        <form onSubmit={handleSendBroadcast} className="space-y-6">
                            
                            {/* Broadcast help banner */}
                            <div className="bg-[var(--gold-pale)] border border-[var(--gold)]/20 p-4 text-[11px] text-[var(--mehron)] leading-relaxed">
                                <p className="font-bold uppercase tracking-wider mb-1">📢 Email Campaign Tips:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>This will send an email immediately to the targeted customers.</li>
                                    <li>You can use the placeholder <span className="font-mono font-bold">{`{userName}`}</span> to inject the customer's name dynamically.</li>
                                    <li>Ensure the HTML format matches templates for visual brand consistency.</li>
                                </ul>
                            </div>

                            {/* Target Recipients Selector */}
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-3">Recipients</label>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setTargetType('all')} 
                                        className={`p-3 border text-center font-bold uppercase tracking-wider text-[10px] transition-all ${targetType === 'all' ? 'border-[var(--gold)] bg-[var(--gold-pale)] text-[var(--mehron)]' : 'border-gray-200 bg-[#FAF9F6] text-gray-500 hover:border-gray-300'}`}
                                    >
                                        All Customers
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setTargetType('selected')} 
                                        className={`p-3 border text-center font-bold uppercase tracking-wider text-[10px] transition-all ${targetType === 'selected' ? 'border-[var(--gold)] bg-[var(--gold-pale)] text-[var(--mehron)]' : 'border-gray-200 bg-[#FAF9F6] text-gray-500 hover:border-gray-300'}`}
                                    >
                                        Select Specific
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setTargetType('custom')} 
                                        className={`p-3 border text-center font-bold uppercase tracking-wider text-[10px] transition-all ${targetType === 'custom' ? 'border-[var(--gold)] bg-[var(--gold-pale)] text-[var(--mehron)]' : 'border-gray-200 bg-[#FAF9F6] text-gray-500 hover:border-gray-300'}`}
                                    >
                                        Custom Emails
                                    </button>
                                </div>

                                {targetType === 'selected' && (
                                    <div className="space-y-4 border border-dashed border-[var(--gold)]/30 p-4 bg-[#FAF9F6]">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-wider">
                                                Select Customers ({selectedCustomers.length} selected)
                                            </span>
                                            <div className="space-x-2">
                                                <button type="button" onClick={handleSelectAllFiltered} className="text-[9px] text-[var(--gold)] hover:text-yellow-600 font-bold uppercase tracking-widest">Select Filtered</button>
                                                <span className="text-gray-300">|</span>
                                                <button type="button" onClick={handleDeselectAllFiltered} className="text-[9px] text-red-500 hover:text-red-700 font-bold uppercase tracking-widest font-semibold">Clear Filtered</button>
                                            </div>
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Search customer by name or email..."
                                            value={customerSearch}
                                            onChange={(e) => setCustomerSearch(e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-[var(--border-mehron)] rounded-none focus:ring-0 focus:border-[var(--gold)] outline-none text-xs text-[var(--mehron)] placeholder:text-gray-300"
                                        />

                                        {loadingCustomers ? (
                                            <div className="text-center py-6 text-xs text-gray-400 font-bold uppercase">Loading customers list...</div>
                                        ) : (
                                            <div className="border border-gray-200 bg-white max-h-48 overflow-y-auto p-2 space-y-1">
                                                {filteredCustomers.length > 0 ? (
                                                    filteredCustomers.map(cust => {
                                                        const isChecked = selectedCustomers.some(c => c._id === cust._id);
                                                        return (
                                                            <label 
                                                                key={cust._id} 
                                                                className={`flex items-center space-x-3 px-3 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors select-none ${isChecked ? 'bg-[var(--gold-pale)]/30' : ''}`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => handleToggleCustomer(cust)}
                                                                    className="w-3.5 h-3.5 border-gray-300 rounded-none accent-[var(--mehron)]"
                                                                />
                                                                <div className="flex-1 flex justify-between items-center text-xs">
                                                                    <span className="font-semibold text-gray-800">{cust.name}</span>
                                                                    <span className="text-[10px] text-gray-500 font-mono">{cust.email}</span>
                                                                </div>
                                                            </label>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="text-center py-6 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">No customers match search filter</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {targetType === 'custom' && (
                                    <div className="space-y-2 border border-dashed border-[var(--gold)]/30 p-4 bg-[#FAF9F6]">
                                        <label className="block text-[9px] font-bold text-[var(--mehron)] uppercase tracking-widest">Enter Comma-Separated Email Addresses</label>
                                        <textarea
                                            placeholder="customer1@gmail.com, customer2@gmail.com, test@example.com"
                                            value={customEmails}
                                            onChange={(e) => setCustomEmails(e.target.value)}
                                            className="w-full h-20 px-3 py-2 bg-white border border-[var(--border-mehron)] rounded-none focus:ring-0 focus:border-[var(--gold)] outline-none text-xs text-gray-800"
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Broadcast Subject */}
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-2">Email Subject</label>
                                <input
                                    type="text"
                                    value={broadcastSubject}
                                    onChange={(e) => setBroadcastSubject(e.target.value)}
                                    placeholder="e.g., Klyra Festive Season Launch — Flat 20% OFF!"
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[var(--border-mehron)] rounded-none focus:ring-0 focus:border-[var(--gold)] outline-none font-bold text-[var(--mehron)] placeholder:text-gray-300"
                                    required
                                />
                            </div>

                            {/* Broadcast HTML */}
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-2">HTML Body Content</label>
                                <textarea
                                    value={broadcastBody}
                                    onChange={(e) => setBroadcastBody(e.target.value)}
                                    className="w-full h-80 px-4 py-2.5 bg-[#FAF9F6] border border-[var(--border-mehron)] rounded-none focus:ring-0 focus:border-[var(--gold)] outline-none font-mono text-xs text-gray-800"
                                    required
                                />
                            </div>

                            {/* Status */}
                            {broadcastStatus && (
                                <div className="p-3 bg-[var(--mehron-soft)] border border-[var(--gold)]/20 text-[10px] font-bold uppercase tracking-wider text-[var(--mehron)] text-center">
                                    {broadcastStatus}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={sendingBroadcast}
                                className="w-full py-3 bg-[var(--mehron)] text-white rounded-none border border-[var(--gold)] hover:bg-[var(--mehron-deep)] font-bold uppercase tracking-widest text-[10px] shadow-lg disabled:opacity-50 transition-all"
                            >
                                {sendingBroadcast ? 'Sending Emails...' : 'Send Email Campaign'}
                            </button>
                        </form>
                    </div>

                    {/* Preview Box */}
                    <div className="bg-[var(--charcoal)] border border-[var(--gold)]/20 p-8 shadow-md rounded-none">
                        <h2 className="text-lg font-bold text-[var(--gold)] uppercase tracking-widest mb-6 border-b border-[var(--gold)]/10 pb-3">Broadcast Sandbox Preview</h2>
                        <div className="bg-white border border-[var(--border-mehron)] p-4 overflow-y-auto max-h-[500px] shadow-inner text-black">
                            <div className="border-b border-gray-100 pb-3 mb-4 font-sans text-xs">
                                <span className="font-bold text-gray-400 uppercase mr-2">Subject:</span>
                                <span className="font-semibold text-gray-800">{broadcastSubject || '(Empty Subject)'}</span>
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: broadcastBody }} />
                        </div>
                    </div>

                </div>
            )}
        </AdminLayout>
    );
};

export default AdminEmails;
