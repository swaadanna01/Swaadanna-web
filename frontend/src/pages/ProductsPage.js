import { useState, useMemo } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { products } from '@/data/products';

export const ProductsPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Featured');

  const categories = ['All', 'Pickle', 'Honey'];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Sorting
    switch (sortBy) {
      case 'Price: Low to High':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'Newest':
        result.sort((a, b) => b.id - a.id);
        break;
      default:
        // Featured - keep as is or by id ascending
        result.sort((a, b) => a.id - b.id);
    }

    return result;
  }, [activeCategory, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block font-sans text-sm font-medium text-primary uppercase tracking-wider mb-3">
              Our Products
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Authentic Pahadi Delights
            </h1>
            <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our collection of handcrafted pickles and pure honey, made with traditional recipes
              from the heart of the Himalayas.
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter & Sort Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-border">
            <div className="flex flex-wrap items-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-2 rounded-full font-sans text-sm font-medium transition-all duration-300 ${activeCategory === category
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 mr-4">
                <span className="font-sans text-sm text-muted-foreground">Showing</span>
                <span className="font-sans text-sm font-semibold text-foreground">{filteredProducts.length} products</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-sans text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-card border border-border rounded-lg px-4 py-2 font-sans text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-10"
                >
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 min-h-[400px]">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-muted-foreground font-sans">No products found for this category.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Product Info Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quality Assurance */}
            <div className="bg-card rounded-2xl p-8 border border-border/50 hover:shadow-card transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mb-5">
                <i className="fa-solid fa-shield-halved text-accent text-2xl"></i>
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3">Quality Guaranteed</h3>
              <p className="font-sans text-muted-foreground leading-relaxed">
                Every product undergoes strict quality checks to ensure you receive only the best
                authentic Pahadi flavors.
              </p>
            </div>

            {/* Shipping Info */}
            <div className="bg-card rounded-2xl p-8 border border-border/50 hover:shadow-card transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mb-5">
                <i className="fa-solid fa-truck-fast text-secondary text-2xl"></i>
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3">Fast Delivery</h3>
              <p className="font-sans text-muted-foreground leading-relaxed">
                We deliver across India. Flat rate shipping of ₹100 applies to all orders. Your order will be
                carefully packed and dispatched.
              </p>
            </div>

            {/* Fresh Products */}
            <div className="bg-card rounded-2xl p-8 border border-border/50 hover:shadow-card transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-5">
                <i className="fa-solid fa-leaf text-primary text-2xl"></i>
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3">Always Fresh</h3>
              <p className="font-sans text-muted-foreground leading-relaxed">
                Our products are made in small batches to ensure freshness. No preservatives,
                just pure traditional goodness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                <i className="fa-solid fa-info-circle text-primary text-2xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">How to Order</h3>
                <p className="font-sans text-muted-foreground leading-relaxed">
                  Add your favorite products to the cart, proceed to checkout, and enter your details to place the order. Our team will contact you on WhatsApp with payment options (UPI or Bank Transfer). Your order will be confirmed after payment verification. For bulk orders or queries, contact us at{' '}
                  <a href="tel:+916239560292" className="text-primary hover:underline">+91 62395 60292</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
