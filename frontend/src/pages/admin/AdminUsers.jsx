import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminApi';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        try {
            const data = await adminService.getUsers(1, roleFilter);
            setUsers(data || []); // data is already the users array
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
            alert('User blocked successfully');
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
            alert('User unblocked successfully');
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
            alert('User deleted successfully');
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to delete user');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>

                {/* Filter */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="flex overflow-x-auto">
                        {['', 'customer', 'seller', 'admin'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${roleFilter === role
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {role === '' ? 'All Users' : role.charAt(0).toUpperCase() + role.slice(1) + 's'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Users Table */}
                {users.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <p className="text-gray-600">No users found</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{user.phone || 'No phone'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {user.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm space-x-3">
                                            {user.isBlocked ? (
                                                <button
                                                    onClick={() => handleUnblockUser(user._id)}
                                                    disabled={updating}
                                                    className="text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                                                >
                                                    Unblock
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleBlockUser(user._id)}
                                                    disabled={updating}
                                                    className="text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
                                                >
                                                    Block
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                disabled={updating}
                                                className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
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
            </div>
        </div>
    );
};

export default AdminUsers;
