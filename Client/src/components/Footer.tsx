import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import ovenExpressLogo from '@/assets/oven-express-logo.png';

const Footer = () => {
  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  const quickLinks = [
    { label: "About Us", href: "#" },
    { label: "Menu", href: "#menu" },
    { label: "Offers", href: "#offers" },
    { label: "Contact", href: "#contact" },
    { label: "Careers", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ];

  return (
    <footer id="contact" className="bg-rich-brown text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <img
                  src={ovenExpressLogo}
                  alt="Oven Express"
                  className="h-14 w-14 rounded-full border-2 border-warm-orange/30"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-warm-orange rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-3xl font-bold bg-gradient-to-r from-warm-orange to-deep-red bg-clip-text text-transparent">
                  Oven Express
                </span>
                <p className="text-warm-orange/80 text-sm font-medium">Delivered Fresh & Hot</p>
              </div>
            </div>
            <p className="text-white/90 leading-relaxed mb-8 max-w-md text-lg">
              🍕 Bringing authentic Italian flavors to your doorstep with lightning-fast delivery. 
              Experience culinary excellence in every bite! 
              <span className="text-warm-orange font-semibold">Order now and taste the difference!</span>
            </p>
            
            {/* Newsletter Signup */}
            <div className="bg-gradient-to-r from-warm-orange/10 to-deep-red/10 rounded-2xl p-6 mb-8 border border-warm-orange/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-warm-orange rounded-full flex items-center justify-center">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-warm-orange">Join Our Food Family!</h3>
              </div>
              <p className="text-white/90 mb-6 leading-relaxed">
                🎉 Get exclusive deals, early access to new dishes, and mouth-watering updates delivered to your inbox!
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Your email address..."
                  className="flex-1 px-4 py-3 rounded-xl bg-white/15 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:border-warm-orange focus:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                />
                <button className="bg-gradient-to-r from-warm-orange to-deep-red hover:from-warm-orange/90 hover:to-deep-red/90 px-8 py-3 rounded-xl font-bold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg shadow-warm-orange/20">
                  Subscribe Now! 🚀
                </button>
              </div>
            </div>
            
            <div className="flex gap-3">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-12 h-12 bg-gradient-to-br from-warm-orange/20 to-deep-red/20 hover:from-warm-orange hover:to-deep-red border border-warm-orange/30 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12 group"
                  >
                    <IconComponent className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-200" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-warm-orange transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-warm-orange mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white/80">
                    123 Culinary Street<br />
                    Food District, NY 10001
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-warm-orange flex-shrink-0" />
                <a
                  href="tel:+1234567890"
                  className="text-white/80 hover:text-warm-orange transition-colors duration-200"
                >
                  +1 (234) 567-8900
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-warm-orange flex-shrink-0" />
                <a
                  href="mailto:hello@ovenexpress.com"
                  className="text-white/80 hover:text-warm-orange transition-colors duration-200"
                >
                  hello@ovenexpress.com
                </a>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3 text-warm-orange">Operating Hours</h4>
              <div className="text-sm space-y-1 text-white/80">
                <p>Monday - Friday: 11:00 AM - 11:00 PM</p>
                <p>Saturday - Sunday: 10:00 AM - 12:00 AM</p>
              </div>
            </div>
          </div>
        </div>


        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/60 text-sm">
            © 2024 Oven Express. All rights reserved. Made with ❤️ for food lovers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;