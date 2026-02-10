import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const OrderSuccessPage = () => {
    const { orderId } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!orderId) return;

        let pollCount = 0;
        const maxPolls = 10;
        let pollInterval;

        const fetchOrder = async () => {
            try {
                const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                const API_URL = process.env.REACT_APP_API_URL || (isLocalhost ? 'http://localhost:8000/api' : 'https://www.swaadanna.shop/api');
                const res = await axios.get(`${API_URL}/orders/${orderId}`);
                const data = res.data;
                setOrder(data);

                if (data.email_sent) {
                    clearInterval(pollInterval);
                }
            } catch (err) {
                console.error("Failed to fetch order:", err);
                setError("Failed to load order details.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();

        pollInterval = setInterval(() => {
            pollCount++;

            // Safety fallback: if database update is slow, show the message anyway after 10s
            if (pollCount > 3) {
                setOrder(prev => prev ? { ...prev, email_sent: true } : null);
                clearInterval(pollInterval);
                return;
            }

            fetchOrder();
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [orderId]);

    const items = useMemo(() => {
        return order?.products || [];
    }, [order]);

    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [items]);

    const shipping = 100;
    const gstAmount = Math.round((subtotal + shipping) * 0.18);
    const totalAmount = order?.total_amount || (subtotal + shipping + gstAmount);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center font-sans space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground animate-pulse">Confirming your order...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center font-sans text-center px-4">
                <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
                    <i className="fa-solid fa-circle-exclamation text-3xl"></i>
                </div>
                <h2 className="text-2xl font-serif font-bold mb-2">Order Not Found</h2>
                <p className="text-muted-foreground mb-8">We couldn't retrieve your order details. Please contact support if you have any questions.</p>
                <Link to="/products">
                    <Button variant="outline" className="rounded-full px-8">Back to Shop</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            {/* Success Header */}
            <section className="bg-background border-b py-16 mb-8">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
                        <i className="fa-solid fa-circle-check text-5xl"></i>
                    </div>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Your order has been placed successfully
                    </h1>
                    <p className="font-sans text-muted-foreground text-lg mb-2">
                        Order ID: <span className="text-foreground font-semibold">#{order.order_id}</span>
                    </p>
                    {order.email_sent ? (
                        <p className="font-sans text-primary text-sm font-medium flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-1 duration-500">
                            <i className="fa-solid fa-envelope"></i>
                            A confirmation email has been sent to <span className="font-bold">{order.customer_email}</span>
                        </p>
                    ) : (
                        <p className="font-sans text-muted-foreground text-xs flex items-center justify-center gap-2">
                            <i className="fa-solid fa-circle-notch animate-spin"></i>
                            Processing confirmation email...
                        </p>
                    )}
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-4 space-y-8">
                {/* Important Notice Card */}
                <Card className="border-none shadow-lg shadow-primary/5 bg-primary/5 overflow-hidden">
                    <CardContent className="p-6 sm:p-8">
                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <i className="fa-brands fa-whatsapp text-primary text-2xl"></i>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-serif text-xl font-bold text-foreground">Important Next Steps</h3>
                                <div className="space-y-3 font-sans text-muted-foreground text-sm sm:text-base leading-relaxed">
                                    <p className="flex items-start gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        Our team will contact you on WhatsApp with payment options within an hour.
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        Your order will be confirmed and processed only after payment verification.
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <Badge className="bg-primary text-primary-foreground font-sans px-3 py-1">
                                        Action Required: Wait for WhatsApp
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Order Details Card */}
                    <Card className="border-none shadow-sm bg-background">
                        <CardContent className="p-6 sm:p-8 space-y-6">
                            <h3 className="font-serif text-xl font-bold border-b pb-4">Order Details</h3>

                            <div className="space-y-6">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-center">
                                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'block';
                                                    }}
                                                />
                                            ) : null}
                                            <i className={`fa-solid fa-box text-muted-foreground/50 text-xl ${item.image ? 'hidden' : 'block'}`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-sans font-medium text-foreground truncate">{item.name}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">Quantity: {item.quantity}</p>
                                            <p className="text-sm font-semibold text-primary mt-1">₹{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-dashed space-y-4">
                                <div className="flex justify-between items-center text-sm font-sans">
                                    <span className="text-muted-foreground">Items ({items.length})</span>
                                    <span className="text-foreground">₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-sans">
                                    <span className="text-muted-foreground">Shipping Fee</span>
                                    <span className="text-foreground">₹{shipping}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-sans">
                                    <span className="text-muted-foreground">GST (18%)</span>
                                    <span className="text-foreground">₹{gstAmount}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="font-serif text-lg font-bold">Total Amount</span>
                                    <span className="font-serif text-2xl font-bold text-primary">₹{totalAmount}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Delivery Information Card */}
                    <div className="space-y-8">
                        <Card className="border-none shadow-sm bg-background h-full">
                            <CardContent className="p-6 sm:p-8 space-y-6">
                                <h3 className="font-serif text-xl font-bold border-b pb-4">Delivery Information</h3>

                                <div className="space-y-4 font-sans">
                                    <div>
                                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Shipping Address</p>
                                        <p className="text-foreground font-medium">{order.customer_name}</p>
                                        <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                                            {order.address}
                                        </p>
                                        <p className="text-muted-foreground text-sm mt-1">{order.phone}</p>
                                    </div>

                                    <div className="pt-4 border-t border-dashed">
                                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Expected Delivery</p>
                                        <div className="flex items-center gap-2 text-foreground font-medium">
                                            <i className="fa-solid fa-truck-fast text-primary"></i>
                                            <span>4-7 Business Days</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Support Line */}
                <div className="text-center pt-8 border-t border-border">
                    <p className="font-sans text-muted-foreground text-sm">
                        If you do not receive a WhatsApp message within 3 hours, contact us at{' '}
                        <a href="tel:+918306094431" className="text-primary font-bold hover:underline">+91 83060 94431</a>
                    </p>
                    <div className="mt-10">
                        <Link to="/products">
                            <Button className="rounded-full px-10 py-6 bg-foreground text-background hover:bg-foreground/90 font-sans font-bold">
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
