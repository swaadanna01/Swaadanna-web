import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

export const CheckoutPage = () => {
    const { cart, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        pincode: '',
        paymentMethod: 'upi'
    });

    const [isOrderPlaced, setIsOrderPlaced] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const subtotal = getCartTotal();
    const shipping = 100;
    const gstRate = 0.18;
    const gstAmount = Math.round((subtotal + shipping) * gstRate);
    const totalAmount = subtotal + shipping + gstAmount;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setIsSubmitting(true);

        try {
            const orderData = {
                customer_name: formData.name,
                customer_email: formData.email,
                phone: formData.phone,
                address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
                products: cart.map(item => ({
                    product_id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image
                })),
                total_amount: totalAmount,
                payment_method: 'upi' // Defaulting to UPI as requested to remove option
            };

            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const API_URL = process.env.REACT_APP_API_URL || (isLocalhost ? 'http://localhost:8000/api' : 'https://www.swaadanna.shop/api');

            console.log('Attempting to place order to:', API_URL);
            const response = await axios.post(`${API_URL}/orders`, orderData);
            const savedOrder = response.data;
            console.log('Order saved successfully:', savedOrder);

            // Generate WhatsApp message for admin
            const adminPhone = "919596937000";
            const productsList = savedOrder.products.map(p => `- ${p.name} (x${p.quantity}): ₹${p.price * p.quantity}`).join('\n');
            const message = `*New Order from Swaadanna!* 🌿\n\n` +
                `*Order ID:* ${savedOrder.order_id}\n\n` +
                `*Customer Details:*\n` +
                `Name: ${savedOrder.customer_name}\n` +
                `Phone: ${savedOrder.phone}\n` +
                `Address: ${savedOrder.address}\n\n` +
                `*Order Summary:*\n${productsList}\n\n` +
                `*Subtotal:* ₹${subtotal}\n` +
                `*Shipping:* ₹${shipping}\n` +
                `*GST (18%):* ₹${gstAmount}\n` +
                `*Total Amount:* ₹${totalAmount}\n` +
                `*Payment Method:* UPI (Pending Achievement)`;

            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;

            toast.success('Order placed successfully!', {
                description: 'Your order will be confirmed soon. Redirecting...',
                duration: 3000,
            });

            setIsOrderPlaced(true);

            setTimeout(() => {
                clearCart();
                navigate(`/order-success/${savedOrder.order_id}`);
            }, 1500);

        } catch (error) {
            console.error('Order submission failed:', error);
            toast.error('Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!isOrderPlaced && cart.length === 0) {
            navigate('/products');
        }
    }, [cart, navigate, isOrderPlaced]);

    if (cart.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background py-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="font-serif text-3xl font-bold mb-8 text-center">Checkout</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Contact Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        required
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider">Shipping Address</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="address">Street Address</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    required
                                    value={formData.address}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pincode">Pincode</Label>
                                    <Input
                                        id="pincode"
                                        name="pincode"
                                        required
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Summary Footer */}
                    <Card className="border-none shadow-none bg-muted/30 p-6 rounded-xl">
                        <CardContent className="p-0 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>₹{shipping}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">GST (18%)</span>
                                <span>₹{gstAmount}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold border-t pt-4 mt-4">
                                <span>Total Amount</span>
                                <span>₹{totalAmount}</span>
                            </div>

                            <div className="pt-2">
                                <div className="flex items-center gap-2 text-primary font-medium text-sm">
                                    <i className="fa-solid fa-truck-fast"></i>
                                    <span>Expected delivery: 4-7 business days</span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-lg font-sans bg-primary hover:bg-primary/90 mt-4"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                        Processing...
                                    </>
                                ) : (
                                    'Place Order'
                                )}
                            </Button>
                            <p className="text-xs text-center text-muted-foreground border-t pt-4">
                                By placing this order, you agree to our Terms of Service and Privacy Policy. Direct UPI payment information will be provided after confirmation.
                            </p>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
};
