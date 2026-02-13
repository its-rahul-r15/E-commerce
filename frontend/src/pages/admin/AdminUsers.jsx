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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-slate-400 mt-2">Manage platform users and permissions</p>
                </div>
                <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                    <span className="text-slate-400 text-sm">Total Users: </span>
                    <span className="text-white font-bold text-lg">{users.length}</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-slate-800 rounded-2xl p-2 mb-6 inline-flex space-x-2 border border-slate-700">
                {[
                    { value: '', label: 'All Users' },
                    { value: 'customer', label: 'Customers' },
                    { value: 'seller', label: 'Sellers' },
                    { value: 'admin', label: 'Admins' }
                ].map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setRoleFilter(filter.value)}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${roleFilter === filter.value
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : users.length === 0 ? (
                <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
                    <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-slate-400 text-lg">No users found</p>
                </div>
            ) : (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-700">
                        <thead className="bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-3">
                                                <p className="font-semibold text-white">{user.name}</p>
                                                <p className="text-sm text-slate-400">{user.phone || 'No phone'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-300">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)} text-white`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.isBlocked ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                                            }`}>
                                            {user.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {user.isBlocked ? (
                                            <button
                                                onClick={() => handleUnblockUser(user._id)}
                                                disabled={updating}
                                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                Unblock
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleBlockUser(user._id)}
                                                disabled={updating}
                                                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                Block
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            disabled={updating}
                                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminUsers;
