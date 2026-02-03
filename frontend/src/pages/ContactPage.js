import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success('Message sent successfully!', {
        description: 'We will get back to you within 24 hours.',
        duration: 5000,
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: 'fa-solid fa-envelope',
      title: 'Email Us',
      value: 'swaadannaorganics01@gmail.com',
      link: 'mailto:swaadannaorganics01@gmail.com',
      color: 'primary'
    },
    {
      icon: 'fa-solid fa-phone',
      title: 'Call Us',
      value: '+91 83060 94431',
      link: 'tel:+918306094431',
      color: 'accent'
    },
    {
      icon: 'fa-brands fa-whatsapp',
      title: 'WhatsApp',
      value: '+91 83060 94431',
      link: 'https://wa.me/918306094431',
      color: 'himalayan-green'
    },
    {
      icon: 'fa-solid fa-location-dot',
      title: 'Location',
      value: 'Himachal Pradesh, India',
      link: '#',
      color: 'secondary'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block font-sans text-sm font-medium text-primary uppercase tracking-wider mb-3">
              Get In Touch
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Contact Us
            </h1>
            <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about our products or want to place a bulk order? 
              We&apos;d love to hear from you!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <a
                key={index}
                href={info.link}
                target={info.link.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="block group"
              >
                <Card className="bg-card border-border/50 rounded-2xl hover:shadow-card hover:-translate-y-1 transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-full bg-${info.color}/10 flex items-center justify-center group-hover:bg-${info.color} group-hover:scale-110 transition-all duration-300`}>
                      <i className={`${info.icon} text-xl text-${info.color} group-hover:text-${info.color}-foreground transition-colors duration-300`}></i>
                    </div>
                    <h3 className="font-sans text-sm font-medium text-muted-foreground mb-1">{info.title}</h3>
                    <p className="font-sans text-foreground font-medium text-sm">{info.value}</p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Form */}
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-6">
                Send Us a Message
              </h2>
              <p className="font-sans text-muted-foreground mb-8">
                Fill out the form below and we&apos;ll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-sans text-sm font-medium text-foreground">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      className="bg-card border-border rounded-lg px-4 py-3 font-sans text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-sans text-sm font-medium text-foreground">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      className="bg-card border-border rounded-lg px-4 py-3 font-sans text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-sans text-sm font-medium text-foreground">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="bg-card border-border rounded-lg px-4 py-3 font-sans text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="font-sans text-sm font-medium text-foreground">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="What's this about?"
                      className="bg-card border-border rounded-lg px-4 py-3 font-sans text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="font-sans text-sm font-medium text-foreground">
                    Your Message *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us how we can help you..."
                    rows={6}
                    className="bg-card border-border rounded-lg px-4 py-3 font-sans text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-semibold px-10 py-6 text-base rounded-full transition-all duration-300 hover:shadow-lg disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane mr-2"></i>
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Additional Info */}
            <div>
              <div className="bg-muted/30 rounded-2xl p-8 mb-8">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
                  Quick Response
                </h3>
                <p className="font-sans text-muted-foreground mb-6 leading-relaxed">
                  We typically respond within 24 hours. For urgent queries, please call us directly 
                  or reach out via WhatsApp for faster assistance.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-clock text-primary"></i>
                    <span className="font-sans text-foreground">Response time: 24 hours</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-headset text-primary"></i>
                    <span className="font-sans text-foreground">Support: Mon-Sat, 9am-7pm</span>
                  </div>
                </div>
              </div>

              {/* FAQ Preview */}
              <div className="bg-card border border-border/50 rounded-2xl p-8">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-6">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-6">
                  {[
                    { q: 'Do you deliver across India?', a: 'Yes, we deliver to all major cities and towns across India.' },
                    { q: 'What is the shelf life?', a: 'Our pickles last 6-8 months when stored properly in a cool, dry place.' },
                    { q: 'Do you accept bulk orders?', a: 'Yes! Contact us for bulk orders and we will provide special pricing.' }
                  ].map((faq, index) => (
                    <div key={index} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                      <h4 className="font-sans font-medium text-foreground mb-2">{faq.q}</h4>
                      <p className="font-sans text-sm text-muted-foreground">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to Order?
          </h2>
          <p className="font-sans text-muted-foreground mb-8">
            Visit our products page or head to the payment page to complete your order.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/products">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium px-8 py-3 rounded-full transition-all duration-300">
                <i className="fa-solid fa-shopping-bag mr-2"></i>
                View Products
              </Button>
            </a>
            <a href="/payment">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-sans font-medium px-8 py-3 rounded-full transition-all duration-300">
                <i className="fa-solid fa-credit-card mr-2"></i>
                Payment Options
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
