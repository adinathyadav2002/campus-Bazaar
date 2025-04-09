import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Book,
  Pencil,
  Shirt,
  Laptop,
  Grid,
  Home,
  Star,
  Tag,
  User,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: "Stationery",
      path: "/stationery",
      icon: <Pencil size={16} className="mr-2" />,
    },
    {
      name: "Books",
      path: "/books",
      icon: <Book size={16} className="mr-2" />,
    },
    {
      name: "Apparel",
      path: "/apparel",
      icon: <Shirt size={16} className="mr-2" />,
    },
    {
      name: "Electronics",
      path: "/electronics",
      icon: <Laptop size={16} className="mr-2" />,
    },
    {
      name: "Other",
      path: "/other",
      icon: <Grid size={16} className="mr-2" />,
    },
  ];

  const quickLinks = [
    { name: "Home", path: "/", icon: <Home size={16} className="mr-2" /> },
    {
      name: "Recommendations",
      path: "/recommendation",
      icon: <Star size={16} className="mr-2" />,
    },
    {
      name: "Sell Item",
      path: "/post-ad",
      icon: <Tag size={16} className="mr-2" />,
    },
    {
      name: "My Profile",
      path: "/user-profile",
      icon: <User size={16} className="mr-2" />,
    },
  ];

  const socialLinks = [
    { icon: <Facebook size={20} />, url: "#", color: "hover:bg-blue-600" },
    { icon: <Twitter size={20} />, url: "#", color: "hover:bg-blue-400" },
    { icon: <Instagram size={20} />, url: "#", color: "hover:bg-pink-600" },
    { icon: <Linkedin size={20} />, url: "#", color: "hover:bg-blue-700" },
  ];

  return (
    <footer className="bg-gradient-to-b from-[#002f34] to-[#00454d] text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Section with Logo and Description */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-10 px-6">
          <div className="text-center md:text-left mb-8 md:mb-0">
            <h2 className="text-3xl font-extrabold mb-4">
              <span className="text-[#3a77ff]">Campus</span>
              <span className="text-[#ffce32]">Bazzar</span>
            </h2>
            <p className="text-gray-300 max-w-md">
              Your campus marketplace for everything students need. Connect,
              buy, sell, and trade with your fellow students!
            </p>

            {/* Social Icons */}
            <div className="flex justify-center md:justify-start mt-6 space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className={`bg-gray-700 p-2 rounded-full ${social.color} transition-all duration-300 transform hover:scale-110`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-semibold mb-4 text-[#ffce32]">
              Contact Us
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start">
                <Mail className="mr-2 text-gray-400" size={16} />
                <span className="text-gray-300">support@campusbazzar.com</span>
              </div>
              <div className="flex items-center justify-center md:justify-start">
                <Phone className="mr-2 text-gray-400" size={16} />
                <span className="text-gray-300">+91 123-456-7890</span>
              </div>
              <div className="flex items-center justify-center md:justify-start">
                <MapPin className="mr-2 text-gray-400" size={16} />
                <span className="text-gray-300">PCCOE Campus, Pune</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider with accent color */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#3a77ff] to-transparent my-8"></div>

        {/* Main Links Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 px-6">
          {/* Categories */}
          <div className="col-span-1">
            <h3 className="text-xl font-semibold mb-5 pb-2 border-b border-gray-700 inline-block text-[#ffce32]">
              Categories
            </h3>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.path}>
                  <button
                    onClick={() => navigate(category.path)}
                    className="flex items-center text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300"
                  >
                    {category.icon}
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-xl font-semibold mb-5 pb-2 border-b border-gray-700 inline-block text-[#ffce32]">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="flex items-center text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300"
                  >
                    {link.icon}
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-xl font-semibold mb-5 pb-2 border-b border-gray-700 inline-block text-[#ffce32]">
              Stay Updated
            </h3>
            <p className="text-gray-300 mb-4">
              Subscribe to our newsletter for the latest campus deals.
            </p>

            <form className="flex flex-col sm:flex-row">
              <input
                type="email"
                placeholder="Your email address"
                className="bg-gray-700 text-white px-4 py-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#3a77ff] w-full sm:w-auto"
              />
              <button
                type="submit"
                className="bg-[#3a77ff] hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-r-lg transition-colors mt-2 sm:mt-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="mt-12 pt-6 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} CampusBazzar. All Rights Reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button
              onClick={() => navigate("/terms")}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigate("/privacy")}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigate("/help")}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Help Center
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
