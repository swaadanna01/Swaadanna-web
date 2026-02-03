import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// Replace with your own logo
const LOGO_URL = "/logo.png";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={LOGO_URL}
              alt="Swaadanna Logo"
              className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-sans text-sm font-medium transition-all duration-300 relative
                  ${isActive(link.path)
                    ? 'text-primary'
                    : 'text-foreground/70 hover:text-foreground'
                  }
                  after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-primary 
                  after:transition-all after:duration-300
                  ${isActive(link.path) ? 'after:w-full' : 'after:w-0 hover:after:w-full'}
                `}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Shop Now Button - Desktop */}
          <div className="hidden md:block">
            <Link to="/products">
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium px-6 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                Shop Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <i className="fa-solid fa-bars text-xl"></i>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-l border-border w-[280px]">
              <div className="flex flex-col gap-6 mt-8">
                <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                  <img src={LOGO_URL} alt="Swaadanna Logo" className="h-12 w-auto object-contain" />
                </Link>

                <div className="flex flex-col gap-4 mt-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`font-sans text-base font-medium py-2 px-4 rounded-lg transition-all duration-200
                        ${isActive(link.path)
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                        }
                      `}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>

                <Link to="/products" onClick={() => setIsOpen(false)} className="mt-4">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium py-3 rounded-full">
                    Shop Now
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
