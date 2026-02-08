import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [bulkStatus, setBulkStatus] = useState('Accept');
    const [pendingChanges, setPendingChanges] = useState({}); // { order_id: new_status }

    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://www.swaadanna.shop/api';
    // const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
        if (isAuthenticated !== 'true') {
            navigate('/count/a=a/adps');
        } else {
            fetchOrders();
        }
    }, [navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/orders`);
            setOrders(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setLoading(false);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
            const orderDate = new Date(order.timestamp).toISOString().split('T')[0];
            const matchesDate = !dateFilter || orderDate === dateFilter;
            const matchesSearch = !searchQuery || order.order_id.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesDate && matchesSearch;
        });
    }, [orders, statusFilter, dateFilter, searchQuery]);

    const handleStatusChange = (orderId, newStatus) => {
        setPendingChanges(prev => ({
            ...prev,
            [orderId]: newStatus
        }));
    };

    const saveStatusUpdate = async (orderId) => {
        const newStatus = pendingChanges[orderId];
        if (!newStatus) return;

        try {
            await axios.patch(`${API_BASE_URL}/orders/${orderId}/status`, { status: newStatus });
            setOrders(orders.map(order =>
                order.order_id === orderId ? { ...order, status: newStatus } : order
            ));
            setPendingChanges(prev => {
                const next = { ...prev };
                delete next[orderId];
                return next;
            });
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleBulkUpdate = async () => {
        if (selectedOrderIds.length === 0) return;

        try {
            await axios.post(`${API_BASE_URL}/orders/bulk-status`, {
                order_ids: selectedOrderIds,
                status: bulkStatus
            });

            setOrders(orders.map(order =>
                selectedOrderIds.includes(order.order_id) ? { ...order, status: bulkStatus } : order
            ));
            setSelectedOrderIds([]);
            alert(`Successfully updated ${selectedOrderIds.length} orders to ${bulkStatus}`);
        } catch (err) {
            alert('Bulk update failed');
        }
    };

    const toggleSelectOrder = (orderId) => {
        setSelectedOrderIds(prev =>
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedOrderIds.length === filteredOrders.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(filteredOrders.map(o => o.order_id));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isAdminAuthenticated');
        navigate('/count/a=a/adps');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="admin-dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>Orders Dashboard</h1>
                    <p>Manage and track all Swaadanna orders</p>
                </div>
                <button onClick={handleLogout} className="logout-button">Logout</button>
            </header>

            <div className="filters-bar">
                <div className="filter-group search-input">
                    <label>Search Order ID</label>
                    <input
                        type="text"
                        placeholder="e.g. ORD-12345678"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label>Status Filter</label>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Accept">Accept</option>
                        <option value="Reject">Reject</option>
                        <option value="Delivered">Delivered</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Date Filter</label>
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="orders-table-container">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</div>
                ) : (
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Phone</th>
                                <th>Amount</th>
                                <th>Items</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <tr key={order.order_id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedOrderIds.includes(order.order_id)}
                                                onChange={() => toggleSelectOrder(order.order_id)}
                                            />
                                        </td>
                                        <td style={{ fontWeight: '600' }}>{order.order_id}</td>
                                        <td>{formatDate(order.timestamp)}</td>
                                        <td>
                                            <div style={{ fontWeight: '500' }}>{order.customer_name}</div>
                                        </td>
                                        <td>{order.phone}</td>
                                        <td>₹{order.total_amount}</td>
                                        <td>{order.products.length} items</td>
                                        <td>
                                            <span className={`status-badge status-${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <select
                                                    className="action-select"
                                                    value={pendingChanges[order.order_id] || order.status}
                                                    onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Accept">Accept</option>
                                                    <option value="Reject">Reject</option>
                                                    <option value="Delivered">Delivered</option>
                                                </select>
                                                <button
                                                    className="update-button"
                                                    disabled={!pendingChanges[order.order_id]}
                                                    onClick={() => saveStatusUpdate(order.order_id)}
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>No orders found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedOrderIds.length > 0 && (
                <div className="bulk-actions-bar">
                    <span>{selectedOrderIds.length} orders selected</span>
                    <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
                        <option value="Pending">Set to Pending</option>
                        <option value="Accept">Set to Accept</option>
                        <option value="Reject">Set to Reject</option>
                        <option value="Delivered">Set to Delivered</option>
                    </select>
                    <button className="bulk-apply-button" onClick={handleBulkUpdate}>Apply To All</button>
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;
