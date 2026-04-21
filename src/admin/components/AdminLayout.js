import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Globe,
    Package,
    Mail,
    BarChart3,
    Tag,
    Sparkles,
    Clock,
    BookOpen
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { useSettings } from '../../context/SettingsContext';
import '../AdminStyles.css';
import '../AdminEnhanced.css';

const AdminLayout = ({ children, title, actions }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { settings } = useSettings();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Default items
    const defaultNavItems = [
        { id: 'dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { id: 'banners', path: '/admin/banners', icon: <Sparkles size={20} />, label: 'Banners' },
        { id: 'products', path: '/admin/products', icon: <Package size={20} />, label: 'Products' },
        { id: 'categories', path: '/admin/categories', icon: <Package size={20} />, label: 'Categories' },
        { id: 'offers', path: '/admin/offers', icon: <Tag size={20} />, label: 'Offers' },
        { id: 'orders', path: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'Orders' },
        { id: 'customers', path: '/admin/customers', icon: <Users size={20} />, label: 'Customers' },
        { id: 'messages', path: '/admin/messages', icon: <Mail size={20} />, label: 'Messages' },
        { id: 'analytics', icon: <BarChart3 size={20} />, label: 'Analytics', path: '/admin/analytics' },
        { id: 'about-section', icon: <BookOpen size={20} />, label: 'About', path: '/admin/settings?tab=heritage' },
        { id: 'deal-preview', path: '/deal-of-the-week', icon: <Clock size={20} />, label: 'Weekly Deal' },
        { id: 'settings', icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
    ];

    // Load saved order or use default
    const [navItems, setNavItems] = useState(() => {
        const saved = localStorage.getItem('adminNavOrder');
        if (saved) {
            try {
                const savedIds = JSON.parse(saved);
                // Get saved items in order
                const items = savedIds.map(id => defaultNavItems.find(item => item.id === id)).filter(Boolean);

                // Check if there are any new items in defaultNavItems that aren't in savedIds
                const missingItems = defaultNavItems.filter(item => !savedIds.includes(item.id));

                return [...items, ...missingItems];
            } catch (e) {
                return defaultNavItems;
            }
        }
        return defaultNavItems;
    });

    const [draggedItemIndex, setDraggedItemIndex] = useState(null);

    const onDragStart = (e, index) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = "move";
        // Ghost image styling or class can be added via CSS
    };

    const onDragOver = (e, index) => {
        e.preventDefault();
        if (draggedItemIndex === null || draggedItemIndex === index) return;

        const newItems = [...navItems];
        const draggedItem = newItems[draggedItemIndex];
        newItems.splice(draggedItemIndex, 1);
        newItems.splice(index, 0, draggedItem);

        setDraggedItemIndex(index);
        setNavItems(newItems);
    };

    const onDragEnd = () => {
        setDraggedItemIndex(null);
        localStorage.setItem('adminNavOrder', JSON.stringify(navItems.map(item => item.id)));
    };

    const handleLogout = () => {
        sessionStorage.removeItem('userInfo');
        navigate('/admin/login');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const [activeNotifications, setActiveNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
                if (!userInfo || !userInfo.token) return;

                const config = {
                    headers: { Authorization: `Bearer ${userInfo.token} ` }
                };

                const [ordersRes, messagesRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/orders`, config),
                    axios.get(`${API_BASE_URL}/contact`, config)
                ]);

                const pendingOrders = ordersRes.data.filter(o => o.status === 'Pending').length > 0;
                const hasMessages = messagesRes.data.length > 0;

                const newNotifications = [];
                if (pendingOrders) newNotifications.push('orders');
                if (hasMessages) newNotifications.push('messages');

                setActiveNotifications(newNotifications);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        };

        fetchNotifications();

        // Optional: Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleNavClick = (id) => {
        // Optimistic removal
        if (activeNotifications.includes(id)) {
            setActiveNotifications(prev => prev.filter(itemId => itemId !== id));
        }
        closeSidebar();
    };

    return (
        <div className={`admin-container ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div className="admin-overlay" onClick={closeSidebar}></div>
            )}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="admin-sidebar-header">
                    <div className="admin-brand">
                        <span style={{ color: '#008060' }}>{isCollapsed ? (settings.shopName || 'P').charAt(0) : (settings.shopName || 'Perfume')}</span>{!isCollapsed && 'Admin'}
                    </div>
                    {/* Desktop Collapse Toggle */}
                    <button className="collapse-toggle-btn" onClick={toggleCollapse}>
                        <Menu size={18} />
                    </button>
                    {/* Close button for mobile */}
                    <button className="mobile-close-btn" onClick={closeSidebar}>
                        <X size={24} color="#fff" />
                    </button>
                </div>

                <nav className="admin-nav">
                    {navItems.map((item, index) => {
                        const hasNotification = activeNotifications.includes(item.id);

                        return (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                className={({ isActive }) =>
                                    `admin-nav-item ${isActive ? 'active' : ''} ${draggedItemIndex === index ? 'dragging' : ''}`
                                }
                                onClick={() => handleNavClick(item.id)}
                                draggable
                                onDragStart={(e) => onDragStart(e, index)}
                                onDragOver={(e) => onDragOver(e, index)}
                                onDragEnd={onDragEnd}
                                style={{ '--index': index }}
                            >
                                <div className="item-icon">{item.icon}</div>
                                <span className="nav-label">{item.label}</span>
                                {hasNotification && <span className="notification-dot"></span>}
                                {isCollapsed && <div className="collapsed-tooltip">{item.label}</div>}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="admin-user">
                    <button onClick={handleLogout} className="admin-nav-item" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                        <div className="item-icon"><LogOut size={20} /></div>
                        <span className="nav-label">Logout</span>
                        {isCollapsed && <div className="collapsed-tooltip">Logout</div>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <button className="mobile-toggle-btn" onClick={toggleSidebar} style={{
                            background: '#008060',
                            color: 'white',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <Menu size={20} />
                        </button>
                        <h1 className="admin-title">{title}</h1>
                    </div>
                    {actions && (
                        <div className="admin-actions">
                            {actions}
                        </div>
                    )}
                </header>

                <div className="admin-content">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
