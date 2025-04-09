import { useState, useEffect, useRef, useContext } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  Heart,
  User,
  Menu,
  X,
  LogOut,
  ShoppingBag,
  Bell,
  Settings,
} from "lucide-react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import AnimatedSearchInput from "./AnimatedSearchInput";

import LoginModal from "./auth/LoginModal";
import SignupModal from "./auth/SignupModal";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import AppContext from "../context/AppContext";
import apiRequest from "../utils/ApiRequest";
import { showToast } from "./ToastComponent";

const Navbar = ({ onCategorySelect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, setLocation] = useState("PCCOE");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const routeLocation = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const handleLocationSelect = (loc) => {
    setLocation(loc);
    setIsLocationDropdownOpen(false);
  };

  const { login, setLogin } = useContext(AppContext);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Add useEffect to check login status
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [login]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle category selection and fetch products
  const handleCategoryClick = async (category, e) => {
    e.preventDefault();

    try {
      const url = `${process.env.REACT_APP_BACKEND}/api/search/cat/${category}`;
      const { resStatus, data, error } = await apiRequest(url, "GET");

      if (resStatus) {
        // Call the callback function to update products in parent component
        if (onCategorySelect && typeof onCategorySelect === "function") {
          onCategorySelect(data, category);
        }

        // Navigate to the category page
        navigate(`/${category}`);
      } else {
        showToast(error?.message || "Failed to fetch products", "error");
        navigate("/");
      }
    } catch (err) {
      showToast("Error fetching products", "error");
    }
  };

  // Updated login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/api/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: e.target.email.value,
            password: e.target.password.value,
          }),
        }
      );

      const data = await response.json();

      if (data.status) {
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
        setLogin(true);
        setIsLoginModalOpen(false);
        toast.success("Successfully logged in!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error(data.message || "Login failed", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setError(data.message || "Login failed");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Updated signup handler
  const handleSignup = async (data) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/api/user/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setIsSignupModalOpen(false);
        setIsLoginModalOpen(true);
        toast.success("Successfully signed up! Please login.");
      } else {
        setError(result.message || "Signup failed");
        toast.error(result.message || "Signup failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkUserDetails = async () => {
    let url = String(process.env.REACT_APP_BACKEND);
    url += "/api/user/checkUser";

    const { resStatus, data, error } = await apiRequest(url, "GET", {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    });

    if (resStatus) return true;
    else {
      showToast(error.message, "error");
      return false;
    }
  };

  // Modified sell button handler
  const handleSellClick = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
    } else {
      if (await checkUserDetails()) navigate("/post-ad");
    }
  };

  const handleLogout = () => {
    setLogin(false);
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
    showToast("Successfully logged out", "success");
  };

  // Handle search input
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      try {
        const response = await fetch(
          `${
            process.env.REACT_APP_BACKEND
          }/api/search?title=${encodeURIComponent(searchQuery)}`
        );

        if (response.status) {
          // Call the callback function to update products in parent component
          if (onCategorySelect && typeof onCategorySelect === "function") {
            onCategorySelect(response, "search-results");
          }

          // Navigate to search results page
          navigate(
            `/search?q=${encodeURIComponent(
              searchQuery
            )}&location=${encodeURIComponent(location)}`
          );
        } else {
          showToast(error?.message || "Failed to search products", "error");
        }
      } catch (err) {
        showToast("Error searching products", "error");
      }
    }
  };

  // Update these navigation handlers
  const handleProfileClick = () => {
    setIsUserDropdownOpen(false); // Close dropdown before navigation
    navigate("/user-profile");
  };

  const handleMyPostsClick = () => {
    setIsUserDropdownOpen(false); // Close dropdown before navigation
    navigate("/my-posts");
  };

  return (
    <div
      className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
        scrolled ? "shadow-md py-1" : "shadow-sm py-3"
      }`}
    >
      {/* Main Navbar */}
      <div className="w-full h-full">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <span className="text-3xl font-extrabold">
                  <span className="text-[#3a77ff]">Campus</span>
                  <span className="text-[#ffce32]">Bazzar</span>
                </span>
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Desktop Search and Location */}
            <div className="hidden md:flex flex-grow mx-8">
              <form className="flex w-full" onSubmit={(e) => handleSearch(e)}>
                <AnimatedSearchInput
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </form>
            </div>

            {/* Right side links */}
            <div className="hidden md:flex items-center space-x-5">
              {/* Only show login button if not logged in */}
              {!isLoggedIn && (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-[#002f34] font-semibold px-4 py-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
                >
                  Login
                </button>
              )}

              {isLoggedIn && (
                <div className="relative" ref={dropdownRef}>
                  {/* User Icon with Dropdown Toggle */}
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 text-[#002f34] p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <UserCircleIcon className="h-8 w-8 text-gray-600" />
                    <ChevronDown size={16} className="text-gray-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border rounded-xl shadow-xl z-20 overflow-hidden">
                      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-yellow-50">
                        <p className="font-semibold text-gray-800">
                          My Account
                        </p>
                        <p className="text-xs text-gray-500">
                          Manage your Campus Bazzar
                        </p>
                      </div>

                      <button
                        onClick={handleProfileClick}
                        className="flex items-center px-4 py-3 w-full text-left hover:bg-gray-50 transition-colors"
                      >
                        <User size={18} className="mr-3 text-blue-600" />
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={handleMyPostsClick}
                        className="flex items-center px-4 py-3 w-full text-left hover:bg-gray-50 transition-colors"
                      >
                        <ShoppingBag
                          size={18}
                          className="mr-3 text-yellow-600"
                        />
                        <span>My Posts</span>
                      </button>

                      <div className="border-t my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} className="mr-3" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Modified Sell button */}
              <button
                onClick={handleSellClick}
                className="group flex items-center bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-semibold px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Plus
                  size={20}
                  className="mr-2 group-hover:rotate-90 transition-transform duration-300"
                />
                SELL
              </button>
            </div>
          </div>

          {/* Mobile Search - visible on mobile only */}
          <div className="mt-4 md:hidden">
            <form className="flex w-full" onSubmit={(e) => handleSearch(e)}>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for anything..."
                  className="w-full border-2 border-gray-200 rounded-l-full py-2.5 pl-4 pr-10 outline-none focus:border-blue-400 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 p-2.5 rounded-r-full"
                >
                  <Search size={22} className="text-white" />
                </button>
              </div>
            </form>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 py-3 space-y-3 bg-white rounded-xl shadow-lg border">
              {!isLoggedIn && (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center w-full px-4 py-3 text-[#002f34] font-medium hover:bg-gray-50"
                >
                  <User size={20} className="mr-3 text-blue-600" />
                  Login
                </button>
              )}

              {isLoggedIn && (
                <>
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center w-full px-4 py-3 text-[#002f34] hover:bg-gray-50"
                  >
                    <User size={20} className="mr-3 text-blue-600" />
                    Profile
                  </button>

                  <button
                    onClick={handleMyPostsClick}
                    className="flex items-center w-full px-4 py-3 text-[#002f34] hover:bg-gray-50"
                  >
                    <ShoppingBag size={20} className="mr-3 text-yellow-600" />
                    My Posts
                  </button>

                  <div className="border-t my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-red-600 font-medium hover:bg-red-50"
                  >
                    <LogOut size={20} className="mr-3" />
                    Logout
                  </button>
                </>
              )}

              <div className="border-t my-1"></div>

              <button
                onClick={handleSellClick}
                className="flex items-center justify-center w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-medium px-4 py-3 mx-4 rounded-full"
              >
                <Plus size={20} className="mr-2" /> SELL
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Replace modal components with imported ones */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSignupClick={() => {
          setIsLoginModalOpen(false);
          setIsSignupModalOpen(true);
        }}
        error={error}
        loading={loading}
        handleLogin={handleLogin}
      />

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onLoginClick={() => {
          setIsSignupModalOpen(false);
          setIsLoginModalOpen(true);
        }}
        error={error}
        loading={loading}
        handleSignup={handleSignup}
      />
    </div>
  );
};

export default Navbar;
