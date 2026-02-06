import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OrderSuccessPage = () => {
    const { orderId } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrder = async () => {
            try {
                const API_URL =
                    process.env.REACT_APP_API_URL || 'https://swaadanna.shop/api';

                const res = await axios.get(`${API_URL}/orders/${orderId}`);
                setOrder(res.data);
            } catch (err) {
                console.error("Failed to fetch order:", err);
                setError("Failed to load order details.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    // ⬇️ PRE-COMPUTE EVERYTHING (important)
    const items = useMemo(() => {
        return order?.products || [];
    }, [order]);

    const formattedDate = useMemo(() => {
        if (!order?.timestamp) return "";
        return new Date(order.timestamp).toLocaleString();
    }, [order]);

    if (loading) {
        return <div className="text-center py-20">Loading order details...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-20 text-red-500">
                {error}
            </div>
        );
    }

    if (!order) {
        return <div className="text-center py-20">Order not found.</div>;
    }

    return (
        <div className="min-h-screen bg-background py-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                        ✓
                    </div>
                    <h1 className="font-serif text-3xl font-bold mb-2">
                        Order Placed Successfully!
                    </h1>
                    <p className="text-muted-foreground">
                        Thank you for shopping with Swaadanna.
                    </p>
                </div>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Order ID</span>
                            <span className="font-mono font-medium">
                                {order.order_id}
                            </span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Date</span>
                            <span>{formattedDate}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Payment Method</span>
                            <span className="uppercase">{order.payment_method}</span>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-medium mb-3">Items</h3>

                            <div className="space-y-3">
                                {items.map((item, idx) => {
                                    const lineTotal = item.price * item.quantity;

                                    return (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span>
                                                {item.name}{" "}
                                                <span className="text-muted-foreground">
                                                    x{item.quantity}
                                                </span>
                                            </span>
                                            <span>₹{lineTotal}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="border-t pt-4 flex justify-between font-bold text-lg">
                            <span>Total Amount</span>
                            <span>₹{order.total_amount}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-center">
                    <Link to="/products">
                        <Button className="px-8">
                            Continue Shopping
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
