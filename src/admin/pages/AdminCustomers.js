import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Trash2, RefreshCw, Mail, Calendar } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import API_BASE_URL from '../../config/api';

const AdminCustomers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedUsers = [...users].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'role') {
            aValue = a.isAdmin ? 'Admin' : 'Customer';
            bValue = b.isAdmin ? 'Admin' : 'Customer';
        }

        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.get(`${API_BASE_URL}/users`, config);

            // Filter to show only non-admin users if desired, 
            // or show all but highlight admins. Let's show all for now.
            setUsers(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch customers');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const deleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };
                await axios.delete(`${API_BASE_URL}/users/${id}`, config);
                fetchUsers();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    return (
        <AdminLayout
            title="Customers"
            actions={
                <button onClick={fetchUsers} className="action-btn">
                    <RefreshCw size={18} />
                </button>
            }
        >
            <div className="admin-card">
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading customers...</div>
                ) : error ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>
                ) : (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
                                        Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => requestSort('email')} style={{ cursor: 'pointer' }}>
                                        Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => requestSort('createdAt')} style={{ cursor: 'pointer' }}>
                                        Joined {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => requestSort('role')} style={{ cursor: 'pointer' }}>
                                        Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#00806015',
                                                    color: '#008060',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: '600',
                                                    marginRight: '10px'
                                                }}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: '500' }}>{user.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', color: '#666' }}>
                                                <Mail size={14} style={{ marginRight: '6px' }} />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', color: '#666' }}>
                                                <Calendar size={14} style={{ marginRight: '6px' }} />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.isAdmin ? 'active' : ''}`}>
                                                {user.isAdmin ? 'Admin' : 'Customer'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {!user.isAdmin && (
                                                <button
                                                    className="action-btn"
                                                    onClick={() => deleteUser(user._id)}
                                                    title="Delete Customer"
                                                    style={{ color: '#ef4444' }}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                            No customers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminCustomers;
