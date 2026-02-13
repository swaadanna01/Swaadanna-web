import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import OrderDetailItem from './OrderDetailItem';

/**
 * OrderDetailsModal component
 * This is extracted and further modularized with OrderDetailItem to reduce AST complexity
 * and avoid the "Maximum call stack size exceeded" Babel build error.
 */
const OrderDetailsModal = ({ order, isOpen, onClose, formatDate }) => {
    if (!order) return null;

    const {
        order_id,
        timestamp,
        customer_name,
        customer_email,
        phone,
        address,
        products,
        total_amount
    } = order;

    // Fixed shipping cost
    const shipping = 100;
    const subtotal = Math.round(total_amount / 1.18) - shipping;

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="no-print">
                    <DialogTitle className="font-serif text-2xl text-primary flex justify-between items-center">
                        Order #{order_id}
                        <Button
                            onClick={handlePrint}
                            variant="outline"
                            size="sm"
                            className="text-[10px] font-black uppercase tracking-widest border-primary/20 hover:bg-primary/5"
                        >
                            <i className="fa-solid fa-download mr-2"></i>
                            Download Invoice
                        </Button>
                    </DialogTitle>
                    <DialogDescription className="font-sans">
                        Placed on {formatDate(timestamp)}
                    </DialogDescription>
                </DialogHeader>

                {/* Main Modal Display (Screen Only) */}
                <div className="space-y-6 pt-4 no-print">
                    {/* Customer & Shipping Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border shadow-none bg-muted/20">
                            <CardContent className="p-4 space-y-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60">Customer</h4>
                                <div className="text-sm font-sans">
                                    <p className="font-bold">{customer_name}</p>
                                    <p className="text-muted-foreground text-xs">{customer_email || 'No email provided'}</p>
                                    <p className="text-muted-foreground text-xs">{phone}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-none bg-muted/20">
                            <CardContent className="p-4 space-y-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60">Shipping Address</h4>
                                <div className="text-sm font-sans">
                                    <p className="text-muted-foreground text-xs leading-relaxed">
                                        {address}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b pb-1">Items Ordered</h4>
                        <div className="divide-y border-rounded overflow-hidden">
                            {products && products.map((item, idx) => (
                                <OrderDetailItem key={idx} item={item} />
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="pt-4 border-t border-dashed space-y-2 font-sans bg-muted/5 p-4 rounded-xl">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground uppercase font-bold tracking-tight">Subtotal</span>
                            <span className="font-semibold">₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground uppercase font-bold tracking-tight">Shipping</span>
                            <span className="font-semibold">₹{shipping}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground uppercase font-bold tracking-tight">GST (18%)</span>
                            <span className="font-medium italic">Included</span>
                        </div>
                        <div className="flex justify-between text-base font-black pt-2 text-primary border-t border-primary/10">
                            <span>TOTAL</span>
                            <span>₹{total_amount}</span>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button onClick={onClose} variant="ghost" size="sm" className="text-xs uppercase font-bold">
                            Close
                        </Button>
                    </div>
                </div>

                {/* Print Layout (Invisible on Screen) */}
                <div className="invoice-only font-sans">
                    {/* Invoice Header */}
                    <div className="invoice-header flex justify-between items-start pb-8 mb-8 border-b-2 border-primary/20">
                        <div>
                            <h1 className="text-4xl font-serif font-black text-primary mb-2 tracking-tighter">SWAADANNA</h1>
                            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground space-y-1">
                                <p>Swaadanna Organics & Naturals</p>
                                <p>Himachal Pradesh, India</p>
                                <p>Email: swaadannaorganics01@gmail.com</p>
                                <p>Phone: +91 62395 60292</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground mb-4">INVOICE</h2>
                            <div className="space-y-1 text-sm">
                                <p className="flex justify-between gap-4">
                                    <span className="text-muted-foreground font-bold uppercase text-[10px]">Invoice No:</span>
                                    <span className="font-mono font-bold">#INV-{String(order_id || '').split('-')[0].toUpperCase()}</span>
                                </p>
                                <p className="flex justify-between gap-4">
                                    <span className="text-muted-foreground font-bold uppercase text-[10px]">Order ID:</span>
                                    <span className="font-mono">#{order_id}</span>
                                </p>
                                <p className="flex justify-between gap-4">
                                    <span className="text-muted-foreground font-bold uppercase text-[10px]">Date:</span>
                                    <span>{formatDate(timestamp).split(',')[0]}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info Sections */}
                    <div className="grid grid-cols-2 gap-12 mt-10">
                        <div className="border-l-2 border-primary/10 pl-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Bill To</h3>
                            <div className="space-y-1">
                                <p className="font-bold text-lg">{customer_name}</p>
                                <p className="text-sm text-muted-foreground">{customer_email}</p>
                                <p className="text-sm text-muted-foreground">{phone}</p>
                            </div>
                        </div>
                        <div className="border-l-2 border-primary/10 pl-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Ship To</h3>
                            <div className="space-y-1">
                                <p className="font-bold text-sm">{customer_name}</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {address}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="mt-12 overflow-x-auto">
                        <table className="invoice-table w-full">
                            <thead>
                                <tr className="border-b-2 border-primary/20">
                                    <th className="pb-4 text-[10px] font-black uppercase text-primary text-left w-12">S.No.</th>
                                    <th className="pb-4 text-[10px] font-black uppercase text-primary text-left">Description</th>
                                    <th className="pb-4 text-[10px] font-black uppercase text-primary text-center w-20">Qty</th>
                                    <th className="pb-4 text-[10px] font-black uppercase text-primary text-right w-32">Price</th>
                                    <th className="pb-4 text-[10px] font-black uppercase text-primary text-right w-32">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {products && products.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="py-4 text-sm text-muted-foreground font-mono">{idx + 1}</td>
                                        <td className="py-4">
                                            <p className="font-bold text-sm text-foreground">{item.name}</p>
                                            {item.product_id && (
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
                                                    Product Code: {String(item.product_id).split('-')[0].toUpperCase()}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-4 text-center text-sm">{item.quantity}</td>
                                        <td className="py-4 text-right text-sm">₹{item.price}</td>
                                        <td className="py-4 text-right text-sm font-bold">₹{item.price * item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Final Summary */}
                    <div className="flex justify-end mt-12 pt-8 border-t-2 border-primary/10">
                        <div className="w-72 space-y-3">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>₹{shipping}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                                <span className="text-muted-foreground">GST (18%)</span>
                                <span className="italic text-primary/60">Included in price</span>
                            </div>
                            <div className="flex justify-between text-2xl font-black pt-4 mt-4 border-t-4 border-primary text-primary">
                                <span>TOTAL</span>
                                <span>₹{total_amount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Notes */}
                    <div className="invoice-footer mt-20 pt-10 border-t border-dashed text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 italic">Purely Organic • Naturally Himalayan</p>
                        <p className="text-sm text-muted-foreground mb-6">Thank you for supporting sustainable farming!</p>
                        <div className="text-[8px] uppercase tracking-tighter text-muted-foreground/50 space-y-1">
                            <p>This is a computer-generated document. No signature required.</p>
                            <p>© 2026 Swaadanna Organics. All rights reserved.</p>
                            <p className="font-bold text-primary/40">www.swaadanna.shop</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default OrderDetailsModal;
