import { Link } from "react-router-dom"
import { Facebook, Twitter, Instagram } from "lucide-react"
import logo from "../assets/logo.png"

export function Footer() {


  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  

  return (
    <footer className="bg-white pt-20 pb-10">
      

        {/* Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          <div>
            <Link to="/" className="text-2xl font-bold mb-4 block">
              <img src={logo} />
              Oven Express
            </Link>
            <div className="flex space-x-4 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-500">
                <Facebook className="w-5 h-5" />
              </a> 
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-500">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-500">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Menu</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-orange-500">
                  Home
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('packages')} 
                  className="text-gray-600 hover:text-orange-500"
                >
                  Packages
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('about')} 
                  className="text-gray-600 hover:text-orange-500"
                >
                  About us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('contact')} 
                  className="text-gray-600 hover:text-orange-500"
                >
                  Contact us
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Information</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-orange-500">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-orange-500">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-orange-500">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Get In Touch</h4>
            <ul className="space-y-2">
              <li className="text-gray-600">Question or feedback? We&apos;d love to hear from you</li>
              <li className="text-gray-600">Email: contact@ovenexpress.com</li>
              <li className="text-gray-600">Phone: +1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-gray-200">
          <p className="text-gray-600">© {new Date().getFullYear()} Oven Express. All rights reserved.</p>
        </div>
      
    </footer>
  )
}

export default Footer