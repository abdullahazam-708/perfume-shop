import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Trash2, RefreshCw, Calendar, User, MessageSquare, Eye } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import API_BASE_URL from '../../config/api';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.get(`${API_BASE_URL}/contact`, config);
            setMessages(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch messages');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const deleteMessage = async (id) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };
                // Assuming DELETE /api/contact/:id exists or needs to be added
                await axios.delete(`${API_BASE_URL}/contact/${id}`, config);
                fetchMessages();
                if (selectedMessage?._id === id) {
                    setIsModalOpen(false);
                    setSelectedMessage(null);
                }
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete message');
            }
        }
    };

    const openMessage = (message) => {
        setSelectedMessage(message);
        setIsModalOpen(true);
    };

    return (
        <AdminLayout
            title="User Messages"
            actions={
                <button onClick={fetchMessages} className="action-btn" title="Refresh">
                    <RefreshCw size={18} />
                </button>
            }
        >
            <div className="admin-card">
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading messages...</div>
                ) : error ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>
                ) : (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Message Snippet</th>
                                    <th>Date</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.map((msg) => (
                                    <tr key={msg._id}>
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
                                                    {msg.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: '500' }}>{msg.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', color: '#666' }}>
                                                <Mail size={14} style={{ marginRight: '6px' }} />
                                                {msg.email}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{
                                                maxWidth: '250px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                color: '#666'
                                            }}>
                                                {msg.message}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', color: '#666' }}>
                                                <Calendar size={14} style={{ marginRight: '6px' }} />
                                                {new Date(msg.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button
                                                    className="action-btn"
                                                    onClick={() => openMessage(msg)}
                                                    title="View Message"
                                                    style={{ color: '#008060' }}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    className="action-btn"
                                                    onClick={() => deleteMessage(msg._id)}
                                                    title="Delete Message"
                                                    style={{ color: '#ef4444' }}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {messages.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                            No messages found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Message Detail Modal */}
            {isModalOpen && selectedMessage && (
                <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
                        <div className="admin-modal-header">
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MessageSquare size={24} color="#008060" />
                                Message Details
                            </h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        <div className="admin-modal-content" style={{ padding: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', display: 'block' }}>Name</label>
                                    <p style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <User size={14} /> {selectedMessage.name}
                                    </p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', display: 'block' }}>Email</label>
                                    <p style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Mail size={14} /> {selectedMessage.email}
                                    </p>
                                </div>
                                {selectedMessage.phone && (
                                    <div>
                                        <label style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', display: 'block' }}>Phone</label>
                                        <p style={{ fontWeight: '500' }}>{selectedMessage.phone}</p>
                                    </div>
                                )}
                                <div>
                                    <label style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', display: 'block' }}>Date Received</label>
                                    <p style={{ fontWeight: '500' }}>{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                <label style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Message Body</label>
                                <div style={{
                                    backgroundColor: '#f8f9fa',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    lineHeight: '1.6',
                                    whiteSpace: 'pre-wrap',
                                    color: '#333'
                                }}>
                                    {selectedMessage.message}
                                </div>
                            </div>
                        </div>
                        <div className="admin-modal-footer" style={{ borderTop: '1px solid #eee', padding: '15px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                className="admin-btn-secondary"
                                onClick={() => deleteMessage(selectedMessage._id)}
                                style={{ backgroundColor: '#fff', color: '#ef4444', border: '1px solid #ef4444' }}
                            >
                                Delete Message
                            </button>
                            <button className="admin-btn-primary" onClick={() => setIsModalOpen(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .admin-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }
                .admin-modal {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    overflow: hidden;
                    animation: modalFadeIn 0.3s ease-out;
                }
                @keyframes modalFadeIn {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .admin-modal-header {
                    padding: 15px 20px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .admin-modal-header h2 {
                    font-size: 1.25rem;
                    margin: 0;
                    color: #202223;
                }
                .close-btn {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                }
                .admin-btn-secondary {
                    padding: 10px 20px;
                    border-radius: 4px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 1px solid #ddd;
                    background: #fff;
                }
                .admin-btn-secondary:hover {
                    background: #f8f9fa;
                }
            `}</style>
        </AdminLayout>
    );
};

export default AdminMessages;
