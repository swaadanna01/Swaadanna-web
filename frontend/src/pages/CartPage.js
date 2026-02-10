import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <i className="fa-solid fa-cart-shopping text-6xl text-muted-foreground mb-4"></i>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
                <p className="font-sans text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
                <Link to="/products">
                    <Button className="font-sans">Start Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="font-serif text-3xl font-bold mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <Card key={item.id} className="overflow-hidden">
                                <CardContent className="p-4 flex gap-4 items-center">
                                    <div className="w-24 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-serif text-lg font-semibold">{item.name}</h3>
                                        <p className="text-sm text-muted-foreground mb-2">{item.weight}</p>
                                        <p className="font-semibold text-primary">₹{item.price}</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            <i className="fa-solid fa-minus text-xs"></i>
                                        </Button>
                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <i className="fa-solid fa-plus text-xs"></i>
                                        </Button>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}

                        <div className="flex justify-end pt-4">
                            <Button variant="outline" className="text-destructive hover:text-destructive" onClick={clearCart}>
                                Clear Cart
                            </Button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardContent className="p-6">
                                <h2 className="font-serif text-xl font-bold mb-4">Order Summary</h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-muted-foreground text-sm">
                                        <span>Subtotal</span>
                                        <span>₹{getCartTotal()}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground text-sm">
                                        <span>Shipping</span>
                                        <span>₹100</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground text-sm">
                                        <span>GST (18%)</span>
                                        <span>₹{Math.round((getCartTotal() + 100) * 0.18)}</span>
                                    </div>
                                    <div className="border-t pt-3 flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>₹{getCartTotal() + 100 + Math.round((getCartTotal() + 100) * 0.18)}</span>
                                    </div>
                                </div>

                                <Link to="/checkout">
                                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-sans py-6 text-lg">
                                        Proceed to Checkout
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
