import React from 'react';
import { Loader2, AlertCircle, CheckCircle2, Info, XCircle, Search, Filter, MoreVertical } from 'lucide-react';
import '../AdminStyles.css';

// Loading States
export const SkeletonLoader = ({ count = 5, type = 'table' }) => {
    if (type === 'table') {
        return (
            <div className="skeleton-table">
                {[...Array(count)].map((_, i) => (
                    <div key={i} className="skeleton-row">
                        <div className="skeleton skeleton-avatar"></div>
                        <div className="skeleton skeleton-text"></div>
                        <div className="skeleton skeleton-text-short"></div>
                        <div className="skeleton skeleton-badge"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'card') {
        return (
            <div className="skeleton-cards">
                {[...Array(count)].map((_, i) => (
                    <div key={i} className="skeleton-card">
                        <div className="skeleton skeleton-title"></div>
                        <div className="skeleton skeleton-text"></div>
                        <div className="skeleton skeleton-text-short"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="skeleton-list">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="skeleton skeleton-line"></div>
            ))}
        </div>
    );
};

export const SpinnerLoader = ({ size = 'md', text }) => (
    <div className="spinner-loader">
        <Loader2 className={`spinner spinner-${size}`} />
        {text && <p className="spinner-text">{text}</p>}
    </div>
);

// Empty States
export const EmptyState = ({ icon: Icon, title, description, action }) => (
    <div className="empty-state">
        {Icon && <Icon className="empty-state-icon" size={64} />}
        <h3 className="empty-state-title">{title}</h3>
        {description && <p className="empty-state-description">{description}</p>}
        {action && <div className="empty-state-action">{action}</div>}
    </div>
);

// Alert/Notification Banner
export const AlertBanner = ({ type = 'info', title, message, onClose }) => {
    const icons = {
        success: CheckCircle2,
        error: XCircle,
        warning: AlertCircle,
        info: Info
    };
    const Icon = icons[type];

    return (
        <div className={`alert-banner alert-${type}`}>
            <Icon size={20} className="alert-icon" />
            <div className="alert-content">
                {title && <h4 className="alert-title">{title}</h4>}
                <p className="alert-message">{message}</p>
            </div>
            {onClose && (
                <button onClick={onClose} className="alert-close">
                    <XCircle size={18} />
                </button>
            )}
        </div>
    );
};

// Search Bar Component
export const SearchBar = ({ value, onChange, placeholder = "Search...", className = '' }) => (
    <div className={`admin-search-bar ${className}`}>
        <Search size={18} className="search-icon" />
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="search-input"
        />
        {value && (
            <button onClick={() => onChange('')} className="search-clear">
                <XCircle size={16} />
            </button>
        )}
    </div>
);

// Filter Dropdown
export const FilterDropdown = ({ label, options, value, onChange }) => (
    <div className="filter-dropdown">
        <Filter size={16} />
        <select value={value} onChange={(e) => onChange(e.target.value)} className="filter-select">
            <option value="">{label || 'All'}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

// Badge Component
export const Badge = ({ children, variant = 'default', size = 'md' }) => (
    <span className={`admin-badge badge-${variant} badge-${size}`}>
        {children}
    </span>
);

// Action Button Group
export const ActionButtons = ({ actions }) => (
    <div className="action-buttons">
        {actions.map((action, idx) => (
            <button
                key={idx}
                onClick={action.onClick}
                className={`action-btn ${action.variant || 'secondary'}`}
                title={action.label}
                disabled={action.disabled}
            >
                {action.icon}
                {action.label && <span>{action.label}</span>}
            </button>
        ))}
    </div>
);

// Dropdown Menu Component
export const DropdownMenu = ({ trigger, items }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="dropdown-menu" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="dropdown-trigger">
                {trigger || <MoreVertical size={18} />}
            </button>
            {isOpen && (
                <div className="dropdown-content">
                    {items.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                item.onClick();
                                setIsOpen(false);
                            }}
                            className={`dropdown-item ${item.danger ? 'danger' : ''}`}
                            disabled={item.disabled}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Pagination Component
export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = [];
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="pagination">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
            >
                Previous
            </button>

            {startPage > 1 && (
                <>
                    <button onClick={() => onPageChange(1)} className="pagination-page">1</button>
                    {startPage > 2 && <span className="pagination-ellipsis">...</span>}
                </>
            )}

            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                >
                    {page}
                </button>
            ))}

            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
                    <button onClick={() => onPageChange(totalPages)} className="pagination-page">{totalPages}</button>
                </>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
            >
                Next
            </button>
        </div>
    );
};

// Stat Card with Animation
export const StatCard = ({ title, value, icon, color, trend, onClick, isActive }) => (
    <div
        className={`stat-card-enhanced ${isActive ? 'active' : ''}`}
        onClick={onClick}
        style={{
            cursor: onClick ? 'pointer' : 'default',
            borderLeft: `4px solid ${color}`,
        }}
    >
        <div className="stat-card-header">
            <div className="stat-icon-wrapper" style={{ backgroundColor: `${color}15` }}>
                <div className="stat-icon" style={{ color: color }}>
                    {icon}
                </div>
            </div>
            {trend && (
                <Badge variant={trend.direction === 'up' ? 'success' : 'danger'} size="sm">
                    {trend.value}
                </Badge>
            )}
        </div>
        <div className="stat-card-content">
            <h3 className="stat-title">{title}</h3>
            <p className="stat-value">{value}</p>
            {trend && <p className="stat-trend">{trend.label}</p>}
        </div>
    </div>
);

// Confirmation Modal
export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger = false }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">{title}</h3>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    <button onClick={onClose} className="admin-btn-secondary">
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={danger ? 'admin-btn-danger' : 'admin-btn-primary'}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Toast Notification System
let toastId = 0;
const toastListeners = [];

export const showToast = (message, type = 'info', duration = 3000) => {
    const toast = {
        id: toastId++,
        message,
        type,
        duration
    };
    toastListeners.forEach(listener => listener(toast));
};

export const ToastContainer = () => {
    const [toasts, setToasts] = React.useState([]);

    React.useEffect(() => {
        const listener = (toast) => {
            setToasts(prev => [...prev, toast]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== toast.id));
            }, toast.duration);
        };
        toastListeners.push(listener);
        return () => {
            const index = toastListeners.indexOf(listener);
            if (index > -1) toastListeners.splice(index, 1);
        };
    }, []);

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast toast-${toast.type}`}>
                    {toast.type === 'success' && <CheckCircle2 size={18} />}
                    {toast.type === 'error' && <XCircle size={18} />}
                    {toast.type === 'warning' && <AlertCircle size={18} />}
                    {toast.type === 'info' && <Info size={18} />}
                    <span>{toast.message}</span>
                </div>
            ))}
        </div>
    );
};

export default {
    SkeletonLoader,
    SpinnerLoader,
    EmptyState,
    AlertBanner,
    SearchBar,
    FilterDropdown,
    Badge,
    ActionButtons,
    DropdownMenu,
    Pagination,
    StatCard,
    ConfirmModal,
    ToastContainer,
    showToast
};
