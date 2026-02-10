import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';
import OrderDetailsModal from '../components/admin/OrderDetailsModal';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [bulkStatus, setBulkStatus] = useState('Accept');
    const [pendingChanges, setPendingChanges] = useState({}); // { order_id: new_status }
    const [savingStatus, setSavingStatus] = useState({}); // { order_id: true/false }
    const [viewOrder, setViewOrder] = useState(null);

    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://www.swaadanna.shop/api';

    const fetchOrders = React.useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/orders`);
            setOrders(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setLoading(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
        if (isAuthenticated !== 'true') {
            navigate('/count/a=a/adps');
        } else {
            fetchOrders();
        }
    }, [navigate, fetchOrders]);

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
            setSavingStatus(prev => ({ ...prev, [orderId]: true }));
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
        } finally {
            setSavingStatus(prev => ({ ...prev, [orderId]: false }));
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
        <div className="min-h-screen flex flex-col bg-background">
            <main className="flex-grow admin-dashboard-container py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <header className="flex justify-between items-center mb-10 pb-6 border-b">
                        <div>
                            <h1 className="font-serif text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                            <p className="text-muted-foreground mt-1">Manage and track your organic product orders</p>
                        </div>
                        <Button onClick={handleLogout} variant="outline" className="rounded-full px-6 transition-all hover:bg-destructive hover:text-destructive-foreground">
                            Logout
                        </Button>
                    </header>

                    <div className="filters-bar bg-card shadow-sm border rounded-xl p-6 flex flex-wrap gap-6 items-end mb-8">
                        <div className="filter-group flex-1 min-w-[250px]">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Search Orders</label>
                            <input
                                type="text"
                                placeholder="Search by Order ID..."
                                className="w-full p-2 border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="filter-group w-48">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Status</label>
                            <select
                                className="w-full p-2 border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Accept">Accept</option>
                                <option value="Reject">Reject</option>
                                <option value="Delivered">Delivered</option>
                            </select>
                        </div>

                        <div className="filter-group w-48">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Date Range</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="orders-table-container bg-card shadow-sm border rounded-xl overflow-hidden mb-12">
                        {loading ? (
                            <div className="p-20 text-center text-muted-foreground flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <p className="animate-pulse">Fetching orders...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="orders-table w-full border-collapse">
                                    <thead>
                                        <tr className="bg-muted/30">
                                            <th className="p-4 border-b">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 transition-all cursor-pointer"
                                                    checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                                                    onChange={toggleSelectAll}
                                                />
                                            </th>
                                            <th className="p-4 border-b text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Info</th>
                                            <th className="p-4 border-b text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer</th>
                                            <th className="p-4 border-b text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone</th>
                                            <th className="p-4 border-b text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                                            <th className="p-4 border-b text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                            <th className="p-4 border-b text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.length > 0 ? (
                                            filteredOrders.map(order => (
                                                <tr key={order.order_id} className="hover:bg-muted/10 transition-colors">
                                                    <td className="p-4 border-b align-middle">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-gray-300 transition-all cursor-pointer"
                                                            checked={selectedOrderIds.includes(order.order_id)}
                                                            onChange={() => toggleSelectOrder(order.order_id)}
                                                        />
                                                    </td>
                                                    <td className="p-4 border-b align-middle">
                                                        <div className="font-mono text-xs font-bold text-primary">#{order.order_id}</div>
                                                        <div className="text-[10px] text-muted-foreground mt-0.5">{formatDate(order.timestamp)}</div>
                                                    </td>
                                                    <td className="p-4 border-b align-middle">
                                                        <div className="font-semibold text-sm">{order.customer_name}</div>
                                                    </td>
                                                    <td className="p-4 border-b align-middle">
                                                        <div className="text-xs text-muted-foreground font-mono">{order.phone}</div>
                                                    </td>
                                                    <td className="p-4 border-b align-middle">
                                                        <div className="font-bold text-sm">₹{order.total_amount}</div>
                                                    </td>
                                                    <td className="p-4 border-b align-middle">
                                                        <Badge className={`status-badge status-${order.status.toLowerCase()} border-0 shadow-none text-[10px] uppercase font-bold px-2 py-0.5`}>
                                                            {order.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 border-b align-middle">
                                                        <div className="flex items-center justify-center gap-3">
                                                            <div className="flex items-center gap-1">
                                                                <select
                                                                    className="p-1.5 border rounded-lg text-xs bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                                    value={pendingChanges[order.order_id] || order.status}
                                                                    onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                                                                >
                                                                    <option value="Pending">Pending</option>
                                                                    <option value="Accept">Accept</option>
                                                                    <option value="Reject">Reject</option>
                                                                    <option value="Delivered">Delivered</option>
                                                                </select>
                                                                <Button
                                                                    size="sm"
                                                                    className={`h-7 text-[10px] uppercase font-bold px-3 py-0 rounded-lg transition-all ${savingStatus[order.order_id] ? 'opacity-50' : 'opacity-100'}`}
                                                                    disabled={!pendingChanges[order.order_id] || savingStatus[order.order_id]}
                                                                    onClick={() => saveStatusUpdate(order.order_id)}
                                                                >
                                                                    {savingStatus[order.order_id] ? 'Saving...' : 'Save'}
                                                                </Button>
                                                            </div>
                                                            <div className="w-px h-6 bg-border mx-1"></div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="View Full Details"
                                                                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
                                                                onClick={() => setViewOrder(order)}
                                                            >
                                                                <i className="fa-solid fa-eye"></i>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="p-20 text-center text-muted-foreground font-sans">
                                                    <i className="fa-solid fa-folder-open text-4xl mb-4 opacity-20 block"></i>
                                                    <p>No orders found matching your criteria</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {selectedOrderIds.length > 0 && (
                        <div className="bulk-actions-bar fixed bottom-12 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-4 rounded-full flex items-center gap-6 shadow-2xl z-50 animate-in slide-in-from-bottom-8">
                            <span className="text-sm font-bold tracking-tight">{selectedOrderIds.length} SELECTED</span>
                            <div className="h-6 w-px bg-background/20"></div>
                            <div className="flex items-center gap-3">
                                <select
                                    className="bg-transparent border-none text-sm font-semibold focus:ring-0 outline-none cursor-pointer hover:opacity-80 transition-opacity"
                                    value={bulkStatus}
                                    onChange={(e) => setBulkStatus(e.target.value)}
                                >
                                    <option value="Pending" className="text-foreground">SET TO PENDING</option>
                                    <option value="Accept" className="text-foreground">SET TO ACCEPT</option>
                                    <option value="Reject" className="text-foreground">SET TO REJECT</option>
                                    <option value="Delivered" className="text-foreground">SET TO DELIVERED</option>
                                </select>
                                <Button
                                    className="h-8 bg-background text-foreground hover:bg-background/90 rounded-full px-4 text-xs font-black shadow-lg transition-all active:scale-95"
                                    onClick={handleBulkUpdate}
                                >
                                    APPLY ACTIONS
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <OrderDetailsModal
                order={viewOrder}
                isOpen={!!viewOrder}
                onClose={() => setViewOrder(null)}
                formatDate={formatDate}
            />
        </div>
    );
};

export default AdminOrdersPage;
