import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const OrderDetails = ({ order, formatDate, onClose }) => {
    if (!order) return null;

    // Move calculations out of JSX
    const shipping = 100;
    const subtotal = Math.round(order.total_amount / 1.28) - shipping;

    return (
        <div className="space-y-6 pt-4">
            {/* Customer & Shipping Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none bg-muted/30">
                    <CardContent className="p-4 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Customer Information</h4>
                        <div className="text-sm space-y-1 font-sans">
                            <p className="font-semibold">{order.customer_name}</p>
                            <p className="text-muted-foreground">{order.customer_email}</p>
                            <p className="text-muted-foreground">{order.phone}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-muted/30">
                    <CardContent className="p-4 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Shipping Address</h4>
                        <div className="text-sm space-y-1 font-sans">
                            <p className="text-muted-foreground leading-relaxed">
                                {order.address}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">Order Items</h4>
                <div className="space-y-4">
                    {order.products.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center font-sans">
                            <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <i className="fa-solid fa-box text-muted-foreground/30 text-lg"></i>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground">QTY: {item.quantity}</p>
                            </div>
                            <div className="text-sm font-semibold text-nowrap">₹{item.price * item.quantity}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Summary */}
            <div className="pt-4 border-t border-dashed space-y-2 font-sans">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>₹{shipping}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 text-primary">
                    <span>Total Amount</span>
                    <span>₹{order.total_amount}</span>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={onClose} size="sm">
                    Close Details
                </Button>
            </div>
        </div>
    );
};

export default OrderDetails;
