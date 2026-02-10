import { Card, CardContent } from '@/components/ui/card';
import { features } from '@/data/products';

const ABOUT_HERO = "https://images.unsplash.com/photo-1718894294953-92e3f9a17559?w=1920&h=800&fit=crop";
const SPICES_IMG = "https://images.unsplash.com/photo-1624935984039-395c058e3944?w=800&h=600&fit=crop";
const LOGO_URL = "/logo.png";

export const AboutPage = () => {
  const timeline = [
    {
      year: 'Heritage',
      title: 'Traditional Recipes',
      description: 'Our recipes have been passed down through generations of Pahadi families, preserving the authentic taste of the Himalayas.'
    },
    {
      year: 'Sourcing',
      title: 'Local Ingredients',
      description: 'We source all our ingredients directly from local farmers in Himachal Pradesh, ensuring freshness and supporting local communities.'
    },
    {
      year: 'Crafting',
      title: 'Handmade Process',
      description: 'Every jar is handcrafted using traditional methods - sun-drying, stone-grinding, and slow cooking to perfection.'
    },
    {
      year: 'Delivery',
      title: 'To Your Doorstep',
      description: 'We carefully pack and deliver the taste of the mountains directly to your home, anywhere in India.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={ABOUT_HERO} alt="Himalayan Mountains" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block font-sans text-sm font-medium text-secondary uppercase tracking-wider mb-3">
            Our Story
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4">
            About Swaadanna
          </h1>
          <p className="font-sans text-lg text-primary-foreground/80 max-w-xl">
            Bringing the authentic flavors of the Himalayas to your table, one jar at a time.
          </p>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content */}
            <div>
              <span className="inline-block font-sans text-sm font-medium text-primary uppercase tracking-wider mb-3">
                Taste the Origin
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-6 leading-tight">
                Swaad + Ann made = <br />
                <span className="text-primary">Swaadanna tasty food</span>
              </h2>
              <div className="space-y-4 font-sans text-muted-foreground leading-relaxed">
                <p>
                  Swaadanna brings you the authentic taste of homemade goodness. We believe that food
                  should be simple, pure, and full of love - just like home.
                </p>
                <p>
                  These aren&apos;t just recipes to us - they&apos;re memories, traditions, and a way of life that
                  we want to preserve and share. Every jar of Swaadanna carries the essence of our mountains,
                  the warmth of our kitchens, and the love of countless generations.
                </p>
                <p>
                  We believe in keeping things simple and pure. No preservatives, no artificial colors,
                  no shortcuts. Just authentic Pahadi flavors made the way they&apos;ve always been made -
                  with patience, care, and respect for tradition.
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-hover">
                <img src={SPICES_IMG} alt="Traditional Spices" className="w-full h-[450px] object-cover" />
              </div>
              {/* Logo Overlay */}
              <div className="absolute -bottom-8 -left-8 bg-card p-6 rounded-2xl shadow-card hidden md:block">
                <img src={LOGO_URL} alt="Swaadanna Logo" className="h-24 w-auto object-contain mix-blend-multiply" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process Timeline */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block font-sans text-sm font-medium text-primary uppercase tracking-wider mb-3">
              How We Do It
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
              From Mountains to Your Table
            </h2>
            <p className="font-sans text-muted-foreground max-w-2xl mx-auto">
              Our journey from sourcing to delivery, maintaining authenticity at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {timeline.map((item, index) => (
              <div key={index} className="relative">
                <Card className="bg-card border-border/50 rounded-2xl hover:shadow-card transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-5">
                      <span className="font-serif text-lg font-bold text-primary-foreground">{index + 1}</span>
                    </div>
                    <h3 className="font-sans text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                      {item.year}
                    </h3>
                    <h4 className="font-serif text-xl font-semibold text-foreground mb-3">{item.title}</h4>
                    <p className="font-sans text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
                {/* Connector Line */}
                {index < timeline.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block font-sans text-sm font-medium text-primary uppercase tracking-wider mb-3">
              Our Promise
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose Swaadanna
            </h2>
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

      {/* Our Values */}
      <section className="py-20 bg-accent text-accent-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block font-sans text-sm font-medium text-secondary uppercase tracking-wider mb-3">
                What We Believe
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-6">
                Our Core Values
              </h2>
              <p className="font-sans text-accent-foreground/80 mb-8 leading-relaxed">
                At Swaadanna, our values guide everything we do - from sourcing ingredients to
                delivering the final product to your doorstep.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { icon: 'fa-solid fa-heart', title: 'Authenticity', desc: 'We never compromise on traditional methods and recipes.' },
                { icon: 'fa-solid fa-hands-holding-circle', title: 'Community', desc: 'Supporting local farmers and preserving Pahadi heritage.' },
                { icon: 'fa-solid fa-seedling', title: 'Purity', desc: 'No preservatives, no shortcuts - just pure, natural goodness.' },
                { icon: 'fa-solid fa-star', title: 'Excellence', desc: 'Quality in every jar, satisfaction in every bite.' }
              ].map((value, index) => (
                <div key={index} className="flex items-start gap-4 bg-accent-foreground/10 rounded-xl p-5">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <i className={`${value.icon} text-secondary-foreground`}></i>
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-semibold mb-1">{value.title}</h4>
                    <p className="font-sans text-sm text-accent-foreground/80">{value.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
