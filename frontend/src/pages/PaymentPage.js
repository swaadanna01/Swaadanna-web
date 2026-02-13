import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { products } from '@/data/products';

export const PaymentPage = () => {
  // Calculate sample order total
  const sampleOrder = {
    items: products.slice(0, 2),
    subtotal: products.slice(0, 2).reduce((sum, p) => sum + p.price, 0),
    shipping: 0,
    get total() { return this.subtotal + this.shipping; }
  };

  const paymentMethods = [
    {
      icon: 'fa-solid fa-qrcode',
      title: 'UPI Payment',
      description: 'Scan QR code or use UPI ID',
      recommended: true
    },
    {
      icon: 'fa-solid fa-mobile-screen',
      title: 'PhonePe / GPay / Paytm',
      description: 'Pay using your preferred UPI app',
      recommended: false
    },
    {
      icon: 'fa-solid fa-building-columns',
      title: 'Bank Transfer',
      description: 'Direct bank transfer (NEFT/IMPS)',
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block font-sans text-sm font-medium text-primary uppercase tracking-wider mb-3">
              Secure Payment
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Payment Options
            </h1>
            <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete your order securely using our trusted payment methods.
            </p>
          </div>
        </div>
      </section>

      {/* Payment Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Payment Methods */}
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-6">
                Choose Payment Method
              </h2>
              <p className="font-sans text-muted-foreground mb-8">
                We accept multiple payment options for your convenience. All transactions are secure.
              </p>

              {/* Payment Method Cards */}
              <div className="space-y-4 mb-10">
                {paymentMethods.map((method, index) => (
                  <Card
                    key={index}
                    className={`bg-card border-2 rounded-2xl transition-all duration-300 cursor-pointer hover:shadow-card
                      ${method.recommended ? 'border-primary' : 'border-border/50 hover:border-primary/50'}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0
                          ${method.recommended ? 'bg-primary' : 'bg-primary/10'}`}>
                          <i className={`${method.icon} text-xl ${method.recommended ? 'text-primary-foreground' : 'text-primary'}`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-sans font-semibold text-foreground">{method.title}</h3>
                            {method.recommended && (
                              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="font-sans text-sm text-muted-foreground">{method.description}</p>
                        </div>
                        <i className="fa-solid fa-chevron-right text-muted-foreground"></i>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* UPI QR Code Section */}
              <Card className="bg-card border-border/50 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="text-center">
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                      Scan QR to Pay
                    </h3>
                    <p className="font-sans text-sm text-muted-foreground mb-6">
                      Use any UPI app to scan and pay
                    </p>

                    {/* QR Code Placeholder */}
                    <div className="w-56 h-56 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-border">
                      <div className="text-center">
                        <i className="fa-solid fa-qrcode text-5xl text-muted-foreground mb-3"></i>
                        <p className="font-sans text-sm text-muted-foreground">
                          QR Code will be<br />displayed here
                        </p>
                      </div>
                    </div>

                    {/* UPI ID */}
                    <div className="bg-muted/50 rounded-lg p-4 mb-4">
                      <p className="font-sans text-xs text-muted-foreground mb-1">Or pay using UPI ID</p>
                      <p className="font-mono text-foreground font-medium select-all">swaadannaorganics@upi</p>
                    </div>

                    <p className="font-sans text-xs text-muted-foreground">
                      <i className="fa-solid fa-shield-check text-accent mr-1"></i>
                      Secure payment powered by UPI
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-6">
                Order Summary
              </h2>

              <Card className="bg-card border-border/50 rounded-2xl overflow-hidden mb-8">
                <CardContent className="p-6">
                  {/* Sample Items */}
                  <div className="space-y-4 mb-6 pb-6 border-b border-border">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-sans font-medium text-foreground text-sm truncate">
                            {product.name}
                          </h4>
                          <p className="font-sans text-xs text-muted-foreground">{product.weight}</p>
                        </div>
                        <p className="font-serif font-semibold text-foreground">₹{product.price}</p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3">
                    <div className="flex justify-between font-sans text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">₹{products.reduce((sum, p) => sum + p.price, 0)}</span>
                    </div>
                    <div className="flex justify-between font-sans text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-accent font-medium">FREE</span>
                    </div>
                    <div className="border-t border-border pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="font-sans font-semibold text-foreground">Total</span>
                        <span className="font-serif text-2xl font-bold text-primary">
                          ₹{products.reduce((sum, p) => sum + p.price, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card className="bg-primary/5 border-primary/20 rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-info-circle text-primary"></i>
                    Payment Instructions
                  </h3>
                  <ol className="space-y-3 font-sans text-sm text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0">1</span>
                      <span>Complete your order by adding items to cart and noting the total amount.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0">2</span>
                      <span>Scan the QR code above or use the UPI ID to make payment.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0">3</span>
                      <span>After payment, share the screenshot on WhatsApp: <a href="https://wa.me/916239560292" className="text-primary hover:underline">+91 62395 60292</a></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs flex-shrink-0">4</span>
                      <span>Include your delivery address with the payment screenshot.</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>

              {/* Contact for Help */}
              <div className="mt-8 text-center">
                <p className="font-sans text-sm text-muted-foreground mb-4">
                  Need help with your payment?
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a href="https://wa.me/916239560292" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-sans font-medium px-6 py-3 rounded-full transition-all duration-300">
                      <i className="fa-brands fa-whatsapp mr-2"></i>
                      WhatsApp Us
                    </Button>
                  </a>
                  <a href="tel:+916239560292">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-sans font-medium px-6 py-3 rounded-full transition-all duration-300">
                      <i className="fa-solid fa-phone mr-2"></i>
                      Call Us
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            {[
              { icon: 'fa-solid fa-shield-check', label: 'Secure Payment' },
              { icon: 'fa-solid fa-truck', label: 'Pan India Delivery' },
              { icon: 'fa-solid fa-box-open', label: 'Quality Assured' },
              { icon: 'fa-solid fa-headset', label: '24/7 Support' }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <i className={`${item.icon} text-primary text-xl`}></i>
                <span className="font-sans font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
