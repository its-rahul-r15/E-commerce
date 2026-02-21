import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');
    const [updating, setUpdating] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await adminService.getUsers(1, roleFilter);
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (userId) => {
        if (!confirm('Block this user?')) return;
        setUpdating(true);
        try {
            await adminService.blockUser(userId);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to block user');
        } finally {
            setUpdating(false);
        }
    };

    const handleUnblockUser = async (userId) => {
        setUpdating(true);
        try {
            await adminService.unblockUser(userId);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to unblock user');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Delete this user permanently? This action cannot be undone.')) return;
        setUpdating(true);
        try {
            await adminService.deleteUser(userId);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to delete user');
        } finally {
            setUpdating(false);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-purple-600';
            case 'seller': return 'bg-blue-600';
            case 'customer': return 'bg-emerald-600';
            default: return 'bg-slate-600';
        }
    };

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8 meander-pattern pb-1">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-widest text-white">User Management</h1>
                    <p className="text-[var(--gold)] mt-2 text-[10px] uppercase tracking-[0.2em] font-bold">Manage user roles, status, and permissions</p>
                </div>
                <div className="bg-[var(--mehron)] px-6 py-2 rounded-none border border-[var(--gold)] shadow-lg">
                    <span className="text-[var(--gold)]/70 text-[10px] uppercase tracking-widest font-bold">Total Users: </span>
                    <span className="text-white font-bold text-lg">{users.length}</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-none p-2 mb-6 inline-flex space-x-2 border border-[var(--border-mehron)] shadow-sm">
                {[
                    { value: '', label: 'All Users' },
                    { value: 'customer', label: 'Customers' },
                    { value: 'seller', label: 'Sellers' },
                    { value: 'admin', label: 'Admins' }
                ].map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setRoleFilter(filter.value)}
                        className={`px-6 py-2 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all ${roleFilter === filter.value
                            ? 'bg-[var(--mehron)] text-white shadow-lg border border-[var(--gold)]'
                            : 'text-gray-500 hover:text-[var(--mehron)] hover:bg-[var(--cream)]'
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="flex items-center justify-center h-64 bg-white/5 border border-[var(--border-mehron)]/10">
                    <div className="animate-spin rounded-none h-10 w-10 border-2 border-[var(--gold)] border-t-transparent"></div>
                </div>
            ) : users.length === 0 ? (
                <div className="bg-white rounded-none p-12 text-center border border-[var(--border-mehron)] shadow-sm">
                    <svg className="w-16 h-16 mx-auto mb-4 text-[var(--gold)]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-[var(--mehron)] text-sm uppercase tracking-widest font-bold">No users found in this role</p>
                </div>
            ) : (
                <div className="bg-white rounded-none border border-[var(--border-mehron)] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[var(--border-mehron)]/10">
                            <thead className="bg-[var(--mehron)]/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">User Name</th>
                                    <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Email Address</th>
                                    <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Role</th>
                                    <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Joined On</th>
                                    <th className="px-6 py-4 text-right text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-mehron)]/10">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-[var(--mehron)]/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-[var(--mehron)] text-[var(--gold)] rounded-none flex items-center justify-center font-bold text-sm border border-[var(--gold)]/20 shadow-inner">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="font-bold text-[var(--mehron)] uppercase tracking-wider text-sm">{user.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">{user.phone || 'No direct link'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-none border ${user.role === 'admin'
                                                ? 'bg-[var(--mehron)] text-white border-[var(--gold)]'
                                                : user.role === 'seller'
                                                    ? 'bg-[var(--gold-pale)] text-[var(--mehron)] border-[var(--gold)]/30'
                                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                                }`}>
                                                {user.role === 'customer' ? 'Customer' : user.role === 'seller' ? 'Seller' : user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-none border ${user.isBlocked
                                                ? 'bg-red-900 text-white border-red-700'
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                }`}>
                                                {user.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {user.isBlocked ? (
                                                <button
                                                    onClick={() => handleUnblockUser(user._id)}
                                                    disabled={updating}
                                                    className="px-3 py-1 bg-[var(--mehron)] hover:bg-[var(--mehron-deep)] text-white text-[9px] font-bold uppercase tracking-widest border border-[var(--gold)] rounded-none transition-all disabled:opacity-50"
                                                >
                                                    Unblock
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleBlockUser(user._id)}
                                                    disabled={updating}
                                                    className="px-3 py-1 bg-[var(--charcoal)] hover:bg-black text-[var(--gold)] text-[9px] font-bold uppercase tracking-widest border border-white/20 rounded-none transition-all disabled:opacity-50"
                                                >
                                                    Block
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                disabled={updating}
                                                className="px-3 py-1 bg-white hover:bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-widest border border-red-200 rounded-none transition-all disabled:opacity-50"
                                            >
                                                Expunge
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminUsers;
