import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageCircle,
  ArrowLeft,
  Tag,
  Calendar,
  Phone,
  Heart,
  Share2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const sellerIcon =
  "https://res.cloudinary.com/drzydaw9o/image/upload/v1741380064/location-icon-vector-eps-10-600nw-2477930087-removebg-preview_hzsr9a.png";
const buyerIcon =
  "https://res.cloudinary.com/drzydaw9o/image/upload/v1741379951/map-pin-icon-isolated-on-260nw-654682927-removebg-preview_1_jiaf0a.png";

// Full page chat coming soon component
const ChatComingSoon = ({ onBack, sellerName }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header with back button */}
      <header className="bg-[#002f34] text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center">
          <button
            onClick={onBack}
            className="mr-4 hover:bg-white/20 p-2 rounded-full transition-all duration-300"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold">
            Chat with {sellerName || "Seller"}
          </h1>
        </div>
      </header>

      {/* Content area */}
      <div className="flex-grow flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
        <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl">
          <img
            src="https://lh6.googleusercontent.com/proxy/d5ic8EViVASRN3q_uFkC8IQJ0x-WTCcXQvKXTpdRqZ2CjUkAz_kp-E7JpAlVJMTMuNF6DkUWm_eXcDWQzwRe0ENntTTsl63bHyb6"
            alt="Coming Soon"
            className="w-full h-auto rounded-lg shadow-lg mb-8 transform hover:scale-105 transition-transform duration-300"
          />

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#002f34] to-teal-500">
              Chat Feature Coming Soon
            </h2>
            <p className="text-lg text-gray-600">
              We are working hard to bring the feature to you soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CardDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const {
    images = [],
    price = 0,
    title = "",
    description = "",
    category = "other",
    userId = {},
    _id = "",
    createdAt = new Date().toISOString(),
  } = state;

  const [currentImage, setCurrentImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [routeData, setRouteData] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!location.state) {
      navigate("/");
    }
  }, [location, navigate]);

  // Fetch similar posts using axios
  useEffect(() => {
    if (_id) {
      axios
        .get(`${import.meta.env.VITE_BACKEND}/api/posts/getSimilarPost/${_id}`)
        .then((response) => {
          const data = response.data;
          if (data.status) {
            setRelatedProducts(data.data);
          } else {
            console.error("Failed to fetch similar posts");
          }
        })
        .catch((error) =>
          console.error("Error fetching similar posts:", error)
        );
    }
  }, [_id]);

  // Function to fetch route data
  const fetchRouteData = async () => {
    try {
      let token = localStorage.getItem("token");
      const buyerAddress = localStorage.getItem("userAddress") || "PCCOE";

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND}/api/search/getPath`,
        {
          sellerAddress: userId?.address,
          buyerAddress: buyerAddress,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status) {
        setRouteData(response.data);
        setMapError(null);
      } else {
        setMapError("Unable to load route data");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      setMapError("Failed to load route information");
    }
  };

  // Modified map initialization useEffect
  useEffect(() => {
    if (!userId?.address) return; // Don't initialize map without address

    fetchRouteData();
  }, [userId?.address]);

  // Add a new component for the blurred map
  const BlurredMap = () => (
    <div className="relative">
      <div className="h-[300px] rounded-2xl overflow-hidden filter blur-sm bg-gray-200 z-10">
        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/90 px-8 py-6 rounded-xl shadow-xl text-center transform hover:scale-105 transition-transform duration-300">
          <p className="text-gray-800 font-semibold text-lg mb-2">
            Login Required
          </p>
          <p className="text-sm text-gray-600">
            Please login to view the route map
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 bg-[#002f34] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-300"
          >
            Login Now
          </button>
        </div>
      </div>
    </div>
  );

  const createCustomIcon = (iconUrl) => {
    return L.icon({
      iconUrl: iconUrl,
      iconSize: [35, 35],
      iconAnchor: [17, 35],
      popupAnchor: [0, -35],
    });
  };

  // Update the map initialization useEffect
  useEffect(() => {
    if (!routeData || !routeData.route || showChat) return;

    try {
      const map = L.map("map");

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Create custom icons
      const buyerMarkerIcon = createCustomIcon(buyerIcon);
      const sellerMarkerIcon = createCustomIcon(sellerIcon);

      // Add markers with custom icons
      if (routeData.buyerLocation) {
        const buyerAddress = localStorage.getItem("userAddress") || "PCCOE";
        L.marker([routeData.buyerLocation[0], routeData.buyerLocation[1]], {
          icon: buyerMarkerIcon,
        })
          .addTo(map)
          .bindPopup(`Buyer Location (${buyerAddress})`)
          .openPopup();
      }

      if (routeData.sellerLocation) {
        L.marker([routeData.sellerLocation[0], routeData.sellerLocation[1]], {
          icon: sellerMarkerIcon,
        })
          .addTo(map)
          .bindPopup("Seller Location");
      }

      // Add route from the route object
      const coordinates = routeData.route.features[0].geometry.coordinates;
      if (coordinates && coordinates.length > 0) {
        // Convert coordinates from [lng, lat] to [lat, lng] format
        const latLngs = coordinates.map((coord) => [coord[1], coord[0]]);

        // Draw the route polyline
        const routePolyline = L.polyline(latLngs, {
          color: "#3b82f6",
          weight: 4,
          opacity: 0.8,
          lineJoin: "round",
        }).addTo(map);

        // Set bounds using the bbox from the route
        const bbox = routeData.route.bbox;
        const corner1 = L.latLng(bbox[1], bbox[0]);
        const corner2 = L.latLng(bbox[3], bbox[2]);
        const bounds = L.latLngBounds(corner1, corner2);
        map.fitBounds(bounds, { padding: [50, 50] });
      }

      // Cleanup function
      return () => {
        map.remove();
      };
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize map");
    }
  }, [routeData, showChat]);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      currentSlide >= relatedProducts.length - 3 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      currentSlide <= 0 ? relatedProducts.length - 3 : prev - 1
    );
  };

  const formattedDate = useMemo(() => {
    return new Date(createdAt).toLocaleDateString("en-GB", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  }, [createdAt]);

  const imageVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  // Update the renderMap function
  const renderMap = () => {
    const isLoggedIn = !!localStorage.getItem("token");

    return (
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <MapPin size={18} className="mr-2 text-[#002f34]" />
          Route from Seller to Buyer
        </h2>
        {!isLoggedIn ? (
          <BlurredMap />
        ) : mapError ? (
          <div className="h-[300px] rounded-2xl bg-gray-100 flex items-center justify-center">
            <p className="text-red-500 font-medium">{mapError}</p>
          </div>
        ) : !routeData ? (
          <div className="h-[300px] rounded-2xl bg-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#002f34]"></div>
          </div>
        ) : (
          <div
            id="map"
            className="h-[300px] rounded-2xl overflow-hidden z-10 shadow-lg border-2 border-gray-200"
          ></div>
        )}
      </div>
    );
  };

  const handleStartChat = () => {
    const isLoggedIn = !!localStorage.getItem("token");
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    // Show the chat page
    setShowChat(true);
  };

  // If chat is shown, render the chat page instead of product details
  if (showChat) {
    return (
      <ChatComingSoon
        onBack={() => setShowChat(false)}
        sellerName={userId?.name}
      />
    );
  }

  const toggleLike = () => {
    setLiked(!liked);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="py-4 px-20 mb-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center hover:bg-white=/10 p-2 rounded-lg transition-all duration-300"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Back</span>
        </button>
      </header>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Product Images */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Image Slider */}
          <div className="relative w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {images.length > 0 && (
              <div className="h-[500px] relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage}
                    src={images[currentImage]}
                    alt="Product"
                    className="w-full h-full object-cover"
                    variants={imageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>

                {/* Image counter overlay */}
                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentImage + 1} / {images.length}
                </div>
              </div>
            )}

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex p-2 bg-gray-50 overflow-x-auto">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`h-16 w-16 mr-2 rounded-md overflow-hidden cursor-pointer transition-all duration-300 ${
                      currentImage === idx
                        ? "ring-2 ring-[#002f34] ring-offset-2"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setCurrentImage(idx)}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Navigation buttons */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Product Description */}
          <motion.div
            className="mt-6 bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-gray-800 flex items-center justify-between">
              Product Description
              <span className="bg-gray-100 text-gray-600 text-sm font-normal py-1 px-3 rounded-full">
                {category}
              </span>
            </h3>
            <div className="mt-4 text-gray-700 leading-relaxed">
              {description.split("\n").map((paragraph, idx) => (
                <p key={idx} className="mb-3">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side - Product Details and Map */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-[#002f34]">
                ₹{price.toLocaleString()}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={toggleLike}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    liked
                      ? "text-red-500 bg-red-50"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  <Heart size={20} fill={liked ? "currentColor" : "none"} />
                </button>
                <button className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-all duration-300">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            <h1 className="text-xl font-bold text-gray-800 mb-2">{title}</h1>

            <div className="flex items-center text-gray-500 text-sm mb-6">
              <Calendar size={14} className="mr-1" />
              <span>Posted on {formattedDate}</span>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Tag size={16} className="mr-2 text-[#002f34]" />
                Seller Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-3 flex items-center justify-center text-gray-500 font-bold">
                    {userId?.name ? userId.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {userId?.name || "Unknown Seller"}
                    </p>
                    <p className="text-gray-500 text-sm">Member since 2023</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone size={16} className="mr-2 text-[#002f34]" />
                  <p className="text-gray-700">{userId?.mobileNo || "N/A"}</p>
                </div>

                <div className="flex items-start">
                  <MapPin size={16} className="mr-2 mt-1 text-[#002f34]" />
                  <p className="text-gray-700">
                    {userId?.address || "Location not available"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleStartChat}
                className="w-full bg-[#002f34] text-white font-medium mt-6 py-3 px-6 rounded-xl hover:bg-opacity-90 transition-all duration-300 flex items-center justify-center"
              >
                <MessageCircle size={18} className="mr-2" />
                Chat with Seller
              </button>
            </div>
          </div>

          {/* Map Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            {renderMap()}
          </div>
        </motion.div>
      </div>

      {/* Related Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-16">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Tag size={20} className="mr-2 text-[#002f34]" />
            Similar Products
          </h3>

          <div className="relative">
            <div className="overflow-hidden">
              <motion.div
                className="flex transition-all duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${
                    currentSlide * (100 / Math.min(3, relatedProducts.length))
                  }%)`,
                }}
              >
                {relatedProducts.length > 0 ? (
                  relatedProducts.map((product) => (
                    <motion.div
                      key={product._id}
                      className={`px-2 ${
                        relatedProducts.length === 1
                          ? "w-full md:w-1/3 mx-auto"
                          : relatedProducts.length === 2
                          ? "w-1/2 md:w-1/3"
                          : "min-w-[33.333%]"
                      }`}
                      onClick={() =>
                        navigate(`/detail`, {
                          state: { ...product },
                        })
                      }
                    >
                      <div className="overflow-hidden rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02]">
                        <div className="relative aspect-square overflow-hidden bg-gray-50">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-4">
                            <p className="font-bold">
                              ₹{product.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="text-gray-800 font-semibold text-base line-clamp-2">
                            {product.title}
                          </h4>
                          <p className="text-gray-500 text-sm mt-2 flex items-center">
                            <MapPin size={12} className="mr-1" />
                            {product.userId?.address || "Unknown location"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="w-full text-center py-12">
                    <p className="text-gray-600">
                      No related products available.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Only show navigation buttons if there are more than 3 products */}
            {relatedProducts.length > 3 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetail;
