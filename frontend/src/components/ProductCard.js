import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';

export const ProductCard = ({ product, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    setIsAdding(true);
    // Simulate a small delay for better UX
    setTimeout(() => {
      addToCart(product);
      setIsAdding(false);
    }, 500);
  };

  return (
    <Card
      className="group relative overflow-hidden bg-card border-border/50 rounded-2xl transition-all duration-500 hover:shadow-hover hover:-translate-y-2"
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />

        {/* Overlay */}
        <div className={`absolute inset-0 bg-foreground/5 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Weight Badge */}
        <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground font-sans text-xs px-3 py-1 rounded-full">
          {product.weight}
        </Badge>

        {/* Category Tag */}
        {product.category && (
          <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground font-sans text-xs px-3 py-1 rounded-full">
            {product.category}
          </Badge>
        )}
      </div>

      <CardContent className="p-5 flex flex-col">
        {/* Product Name */}
        <h3 className="font-serif text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
          {product.name}
        </h3>

        {/* Description */}
        <p className="font-sans text-sm text-muted-foreground mb-4 leading-relaxed">
          {product.description}
        </p>

        {/* Price and CTA */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
          <div className="flex flex-col">
            <span className="font-sans text-xs text-muted-foreground">Price</span>
            <span className="font-serif text-xl font-bold text-primary">
              ₹{product.price}
            </span>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans text-sm font-medium px-5 py-2 rounded-full transition-all duration-300 hover:shadow-lg disabled:opacity-70"
          >
            {isAdding ? (
              <i className="fa-solid fa-spinner fa-spin mr-2"></i>
            ) : (
              <i className="fa-solid fa-shopping-cart mr-2"></i>
            )}
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
