import { useState } from 'react';
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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
                    price: item.price
                })),
                total_amount: getCartTotal(),
                payment_method: formData.paymentMethod
            };

            // Replace with your actual backend URL in production
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

            await axios.post(`${API_URL}/orders`, orderData);

            toast.success('Order placed successfully!', {
                description: 'Check your email for confirmation.',
                duration: 5000,
            });

            clearCart();
            navigate('/');

        } catch (error) {
            console.error('Order submission failed:', error);
            toast.error('Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cart.length === 0) {
        navigate('/products');
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
                            <CardTitle>Contact Information</CardTitle>
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
                            <CardTitle>Shipping Address</CardTitle>
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

                    {/* Payment Method */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Method</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                defaultValue="upi"
                                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                                className="space-y-4"
                            >
                                <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem value="upi" id="upi" />
                                    <Label htmlFor="upi" className="flex-1 cursor-pointer">
                                        <span className="font-semibold block">UPI / QR Code</span>
                                        <span className="text-sm text-muted-foreground">Pay using GPay, PhonePe, Paytm</span>
                                    </Label>
                                    <i className="fa-solid fa-qrcode text-xl text-muted-foreground"></i>
                                </div>
                                <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem value="cod" id="cod" />
                                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                                        <span className="font-semibold block">Cash on Delivery</span>
                                        <span className="text-sm text-muted-foreground">Pay when you receive your order</span>
                                    </Label>
                                    <i className="fa-solid fa-money-bill-wave text-xl text-muted-foreground"></i>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Order Summary Footer */}
                    <div className="bg-muted/30 p-6 rounded-xl space-y-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total Amount</span>
                            <span>₹{getCartTotal()}</span>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-sans bg-primary hover:bg-primary/90"
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
                        <p className="text-xs text-center text-muted-foreground">
                            By placing this order, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};
