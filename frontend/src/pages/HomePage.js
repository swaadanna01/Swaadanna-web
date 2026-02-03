import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/ProductCard';
import { products, features, testimonials } from '@/data/products';

const HERO_BG = "https://images.unsplash.com/photo-1718894294953-92e3f9a17559?w=1920&h=1080&fit=crop";
const SPICES_IMG = "https://images.unsplash.com/photo-1624935984039-395c058e3944?w=800&h=600&fit=crop";

export const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={HERO_BG} 
            alt="Himalayan Mountains" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-secondary/90 text-secondary-foreground px-4 py-2 rounded-full mb-6 animate-fade-in">
              <i className="fa-solid fa-mountain text-sm"></i>
              <span className="font-sans text-sm font-medium">From the Heart of Himalayas</span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              Authentic Pahadi <br />
              <span className="text-secondary">Pickles & Honey</span>
            </h1>
            
            <p className="font-sans text-lg text-primary-foreground/90 mb-8 leading-relaxed max-w-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
              Taste the tradition of the Himalayas with our handcrafted pickles and pure honey. 
              Made with love, no preservatives, and generations of authentic recipes.
            </p>
            
            <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Link to="/products">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-semibold px-8 py-6 text-base rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <i className="fa-solid fa-shopping-bag mr-2"></i>
                  Explore Products
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="bg-transparent border-2 border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 font-sans font-semibold px-8 py-6 text-base rounded-full transition-all duration-300">
                  Our Story
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 mt-12 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <i className="fa-solid fa-check-circle text-secondary"></i>
                <span className="font-sans text-sm">100% Natural</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <i className="fa-solid fa-check-circle text-secondary"></i>
                <span className="font-sans text-sm">No Preservatives</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <i className="fa-solid fa-check-circle text-secondary"></i>
                <span className="font-sans text-sm">Handcrafted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <i className="fa-solid fa-chevron-down text-primary-foreground/60 text-2xl"></i>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: 'fa-solid fa-truck', label: 'Pan India Delivery', value: 'Free above ₹500' },
              { icon: 'fa-solid fa-shield-check', label: 'Quality Assured', value: '100% Authentic' },
              { icon: 'fa-solid fa-box-open', label: 'Fresh Products', value: 'Made to Order' },
              { icon: 'fa-solid fa-headset', label: 'Support', value: '24/7 Available' },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center p-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <i className={`${item.icon} text-primary text-xl`}></i>
                </div>
                <h4 className="font-sans font-semibold text-foreground text-sm mb-1">{item.label}</h4>
                <p className="font-sans text-xs text-muted-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block font-sans text-sm font-medium text-primary uppercase tracking-wider mb-3">
              Our Collection
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Taste of the Mountains
            </h2>
            <p className="font-sans text-muted-foreground max-w-2xl mx-auto">
              Each product is crafted with care using traditional recipes from the hills of Himachal Pradesh.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/products">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-sans font-medium px-8 py-3 rounded-full transition-all duration-300">
                View All Products
                <i className="fa-solid fa-arrow-right ml-2"></i>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="py-20 bg-muted/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-hover">
                <img 
                  src={SPICES_IMG} 
                  alt="Traditional Indian Spices" 
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-6 -right-6 bg-card p-6 rounded-xl shadow-card max-w-[200px] hidden md:block">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <i className="fa-solid fa-award text-accent"></i>
                  </div>
                  <span className="font-serif text-2xl font-bold text-foreground">50+</span>
                </div>
                <p className="font-sans text-xs text-muted-foreground">Years of Traditional Recipe Heritage</p>
              </div>
            </div>

            {/* Content */}
            <div>
              <span className="inline-block font-sans text-sm font-medium text-primary uppercase tracking-wider mb-3">
                Our Story
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-6 leading-tight">
                Handcrafted with Love, <br />
                <span className="text-primary">From the Hills</span>
              </h2>
              <p className="font-sans text-muted-foreground mb-6 leading-relaxed">
                Swaadanna was born from a passion to preserve the authentic flavors of the Himalayas. 
                Our pickles and honey are made using recipes that have been passed down through generations, 
                using only the freshest ingredients sourced directly from local farmers.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Small-batch production for quality',
                  'Sun-dried using traditional methods',
                  'No artificial preservatives or colors',
                  'Supporting local Pahadi farmers'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <i className="fa-solid fa-check-circle text-accent"></i>
                    <span className="font-sans text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/about">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium px-8 py-3 rounded-full transition-all duration-300 hover:shadow-lg">
                  Learn More About Us
                  <i className="fa-solid fa-arrow-right ml-2"></i>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block font-sans text-sm font-medium text-primary uppercase tracking-wider mb-3">
              Why Swaadanna
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
              The Swaadanna Difference
            </h2>
            <p className="font-sans text-muted-foreground max-w-2xl mx-auto">
              What makes our pickles and honey special? It&apos;s the love, tradition, and purity in every jar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group bg-card border-border/50 rounded-2xl hover:shadow-hover hover:-translate-y-2 transition-all duration-500">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <i className={`${feature.icon} text-2xl text-primary group-hover:text-primary-foreground transition-colors duration-300`}></i>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block font-sans text-sm font-medium text-primary uppercase tracking-wider mb-3">
              Testimonials
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-card border-border/50 rounded-2xl hover:shadow-card transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <i key={i} className="fa-solid fa-star text-secondary text-sm"></i>
                    ))}
                  </div>
                  <p className="font-sans text-foreground/80 mb-6 leading-relaxed italic">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <i className="fa-solid fa-user text-primary"></i>
                    </div>
                    <div>
                      <h4 className="font-sans font-semibold text-foreground text-sm">{testimonial.name}</h4>
                      <p className="font-sans text-xs text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-secondary rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-secondary rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Taste the Himalayas?
          </h2>
          <p className="font-sans text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Order now and experience the authentic flavors of Pahadi pickles and honey, 
            delivered straight to your doorstep.
          </p>
          <Link to="/products">
            <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-sans font-semibold px-10 py-6 text-lg rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <i className="fa-solid fa-shopping-cart mr-3"></i>
              Shop Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
