import { Link } from 'react-router-dom';

// Replace with your own logo
const LOGO_URL = "/logo.png"; // Placeholder

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Payment', path: '/payment' },
  ];

  const socialLinks = [
    { icon: 'fa-brands fa-instagram', href: '#', label: 'Instagram' },
    { icon: 'fa-brands fa-facebook-f', href: '#', label: 'Facebook' },
    { icon: 'fa-brands fa-whatsapp', href: 'https://wa.me/918306094431', label: 'WhatsApp' },
    { icon: 'fa-brands fa-youtube', href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-earth-brown text-primary-foreground">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <img
                src={LOGO_URL}
                alt="Swaadanna Logo"
                className="h-20 w-auto object-contain"
              />
            </Link>
            <p className="text-primary-foreground/80 font-sans text-sm leading-relaxed max-w-md mb-6">
              Bringing the authentic taste of the Himalayas to your table. Our handcrafted pickles are made using
              traditional Pahadi recipes passed down through generations, with no preservatives and pure love.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center
                    text-primary-foreground/80 hover:bg-secondary hover:text-secondary-foreground
                    transition-all duration-300"
                  aria-label={social.label}
                >
                  <i className={`${social.icon} text-lg`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-6 text-primary-foreground">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-primary-foreground/70 hover:text-secondary font-sans text-sm 
                      transition-colors duration-200 inline-flex items-center gap-2 group"
                  >
                    <i className="fa-solid fa-chevron-right text-xs opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"></i>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-6 text-primary-foreground">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <i className="fa-solid fa-envelope text-secondary mt-1"></i>
                <div>
                  <p className="text-primary-foreground/60 text-xs font-sans mb-1">Email</p>
                  <a
                    href="mailto:swaadannaorganics01@gmail.com"
                    className="text-primary-foreground/90 hover:text-secondary font-sans text-sm transition-colors duration-200"
                  >
                    swaadannaorganics01@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <i className="fa-solid fa-phone text-secondary mt-1"></i>
                <div>
                  <p className="text-primary-foreground/60 text-xs font-sans mb-1">Phone</p>
                  <a
                    href="tel:+918306094431"
                    className="text-primary-foreground/90 hover:text-secondary font-sans text-sm transition-colors duration-200"
                  >
                    +91 83060 94431
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <i className="fa-solid fa-location-dot text-secondary mt-1"></i>
                <div>
                  <p className="text-primary-foreground/60 text-xs font-sans mb-1">Location</p>
                  <p className="text-primary-foreground/90 font-sans text-sm">
                    Himachal Pradesh, India
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-primary-foreground/60 font-sans text-sm text-center md:text-left">
              © {currentYear} Swaadanna. All rights reserved.
            </p>
            <p className="text-primary-foreground/60 font-sans text-xs flex items-center gap-2">
              Made with <i className="fa-solid fa-heart text-primary"></i> in the Himalayas
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
