import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, ComposedChart, Scatter
} from 'recharts';
import {
    BarChart3, TrendingUp, ShoppingBag, Users, DollarSign, Package,
    RefreshCw, Eye, MousePointer2, UserCheck, Target, CreditCard, Clock, Award
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useSettings } from '../../context/SettingsContext';
import API_BASE_URL from '../../config/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const AdminAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getCurrencySymbol } = useSettings();

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.get(`${API_BASE_URL}/analytics`, config);
            setData(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch analytics data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) return (
        <AdminLayout title="Analytics">
            <div className="loading-container">
                <div className="premium-spinner"></div>
                <p>Generating Intelligence Report...</p>
            </div>
        </AdminLayout>
    );

    if (error) return (
        <AdminLayout title="Analytics">
            <div className="error-container">
                <Target size={48} color="#ef4444" />
                <p>{error}</p>
                <button onClick={fetchAnalytics} className="premium-btn">Retry Connection</button>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout
            title="Business Intelligence Dashboard"
            actions={
                <button onClick={fetchAnalytics} className="premium-refresh-btn">
                    <RefreshCw size={18} />
                    <span>Live Sync</span>
                </button>
            }
        >
            {/* Top Row: Key Performance Indicators */}
            <div className="kpi-grid">
                <div className="kpi-card glass purple">
                    <div className="kpi-icon"><DollarSign size={24} /></div>
                    <div className="kpi-data">
                        <span className="kpi-label">Revenue</span>
                        <span className="kpi-value">{getCurrencySymbol()}{(data?.summary?.totalRevenue || 0).toLocaleString()}</span>
                    </div>
                    <div className="kpi-badge">+12.5%</div>
                </div>
                <div className="kpi-card glass emerald">
                    <div className="kpi-icon"><Target size={24} /></div>
                    <div className="kpi-data">
                        <span className="kpi-label">Conv. Rate</span>
                        <span className="kpi-value">{(data?.summary?.conversionRate || 0).toFixed(2)}%</span>
                    </div>
                </div>
                <div className="kpi-card glass orange">
                    <div className="kpi-icon"><CreditCard size={24} /></div>
                    <div className="kpi-data">
                        <span className="kpi-label">Avg. Order</span>
                        <span className="kpi-value">{getCurrencySymbol()}{(data?.summary?.averageOrderValue || 0).toFixed(2)}</span>
                    </div>
                </div>
                <div className="kpi-card glass blue">
                    <div className="kpi-icon"><UserCheck size={24} /></div>
                    <div className="kpi-data">
                        <span className="kpi-label">Visitors</span>
                        <span className="kpi-value">{(data?.summary?.totalVisitors || 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="main-analytics-grid">
                {/* primary Chart: Sales Growth */}
                <div className="premium-card full-width">
                    <div className="card-header-v2">
                        <div className="header-text">
                            <h3><TrendingUp size={20} /> Revenue Growth Engine</h3>
                            <p>Daily breakdown of revenue generation over the last 30 days</p>
                        </div>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={380}>
                            <AreaChart data={data.salesOverTime}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', background: '#fff' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#revenueGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Chart: Audience funnel */}
                <div className="premium-card">
                    <div className="card-header-v2">
                        <div className="header-text">
                            <h3><Eye size={20} /> Audience Funnel</h3>
                        </div>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.trafficOverTime}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis dataKey="_id" hide />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip cursor={{ stroke: '#6366f1', strokeWidth: 2 }} />
                                <Legend iconType="circle" />
                                <Line type="step" name="Impressions" dataKey="impressions" stroke="#94a3b8" strokeWidth={2} dot={false} />
                                <Line type="monotone" name="Waiters" dataKey="visitors" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Third Chart: Brand Dominance */}
                <div className="premium-card">
                    <div className="card-header-v2">
                        <div className="header-text">
                            <h3><Award size={20} /> Brand Dominance</h3>
                        </div>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={data.brandPerformance} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="_id" type="category" width={80} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} />
                                <Tooltip />
                                <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} barSize={15} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Fourth Chart: peak Sales Hours */}
                <div className="premium-card">
                    <div className="card-header-v2">
                        <div className="header-text">
                            <h3><Clock size={20} /> peak Activity Hours</h3>
                        </div>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.salesByHour.map(h => ({ ...h, hour: `${h._id}:00` }))}>
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <YAxis hide />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Orders" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Fifth: Product Category Share */}
                <div className="premium-card">
                    <div className="card-header-v2">
                        <div className="header-text">
                            <h3><BarChart3 size={20} /> Market Share</h3>
                        </div>
                    </div>
                    <div className="chart-wrapper d-flex-center">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data.categoryDistribution}
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="revenue"
                                    nameKey="_id"
                                >
                                    {data.categoryDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <style>{`
                .loading-container {
                    padding: 15vh 0;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }
                .premium-spinner {
                    width: 60px;
                    height: 60px;
                    border: 4px solid rgba(99, 102, 241, 0.1);
                    border-top-color: #6366f1;
                    border-radius: 50%;
                    animation: spin 1s cubic-bezier(0.1, 0.7, 1.0, 0.1) infinite;
                }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 24px;
                    margin-bottom: 32px;
                }
                .kpi-card {
                    padding: 24px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.3s ease;
                }
                .kpi-card:hover { transform: translateY(-5px); }
                .kpi-card.glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); }
                .kpi-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                .purple .kpi-icon { background: linear-gradient(135deg, #818cf8, #6366f1); }
                .emerald .kpi-icon { background: linear-gradient(135deg, #34d399, #10b981); }
                .orange .kpi-icon { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
                .blue .kpi-icon { background: linear-gradient(135deg, #60a5fa, #3b82f6); }
                
                .kpi-label { font-size: 0.875rem; color: #64748b; font-weight: 500; }
                .kpi-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; display: block; }
                .kpi-badge {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: #f0fdf4;
                    color: #10b981;
                    padding: 2px 8px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .main-analytics-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;
                }
                .premium-card {
                    background: white;
                    border-radius: 20px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01);
                    display: flex;
                    flex-direction: column;
                }
                .premium-card.full-width { grid-column: span 2; }
                .card-header-v2 { padding: 24px 24px 0; margin-bottom: 20px; }
                .header-text h3 { margin: 0; font-size: 1.125rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 10px; }
                .header-text p { margin: 4px 0 0; font-size: 0.875rem; color: #94a3b8; }
                .chart-wrapper { padding: 0 16px 24px; }
                .d-flex-center { display: flex; justify-content: center; align-items: center; }

                .premium-refresh-btn {
                    background: #1e293b;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .premium-refresh-btn:hover { background: #334155; }
            `}</style>
        </AdminLayout>
    );
};

export default AdminAnalytics;
