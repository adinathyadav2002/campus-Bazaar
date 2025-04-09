import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageCircle,
  ArrowLeft,
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with back button */}
      <header className="bg-[#002f34] text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center">
          <button
            onClick={onBack}
            className="mr-4 hover:bg-white/10 p-2 rounded-full"
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
        <div className="w-full max-w-lg">
          <img
            src="https://lh6.googleusercontent.com/proxy/d5ic8EViVASRN3q_uFkC8IQJ0x-WTCcXQvKXTpdRqZ2CjUkAz_kp-E7JpAlVJMTMuNF6DkUWm_eXcDWQzwRe0ENntTTsl63bHyb6"
            alt="Coming Soon"
            className="w-full h-auto rounded-lg shadow-lg mb-8"
          />

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
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

  useEffect(() => {
    if (!location.state) {
      navigate("/");
    }
  }, [location, navigate]);

  // Fetch similar posts using axios
  useEffect(() => {
    if (_id) {
      axios
        .get(`${process.env.REACT_APP_BACKEND}/api/posts/getSimilarPost/${_id}`)
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
        `${process.env.REACT_APP_BACKEND}/api/search/getPath`,
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
      <div className="h-[300px] rounded-xl overflow-hidden filter blur-sm bg-gray-200 z-10">
        {/* Placeholder map image or gradient */}
        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 " />
      </div>
      <div className="absolute inset-0 flex items-center justify-center ">
        <div className="bg-white/90 px-6 py-4 rounded-lg shadow-lg text-center">
          <p className="text-gray-800 font-semibold mb-2">Login Required</p>
          <p className="text-sm text-gray-600">
            Please login to view the route map
          </p>
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
      <div>
        <h2 className="text-lg font-bold mb-3">Route from Seller to Buyer</h2>
        {!isLoggedIn ? (
          <BlurredMap />
        ) : mapError ? (
          <div className="h-[300px] rounded-xl bg-gray-100 flex items-center justify-center ">
            <p className="text-red-500">{mapError}</p>
          </div>
        ) : !routeData ? (
          <div className="h-[300px] rounded-xl bg-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div
            id="map"
            className="h-[300px] rounded-xl overflow-hidden z-10"
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-4xl font-bold text-gray-800 text-center">
          Product Details
        </h1>
      </header>

      {/* Main Content Container - Increased max width for side by side layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Product Details */}
        <motion.div
          className="bg-white shadow-lg rounded-xl p-6 flex flex-col border border-gray-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Image Slider - Full Width - Reduced height */}
          <div className="relative w-full">
            {images.length > 0 && (
              <div className="h-[500px] relative overflow-hidden rounded-xl">
                <AnimatePresence exitBeforeEnter>
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
              </div>
            )}
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white p-2 rounded-full shadow hover:bg-gray-700 transition"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white p-2 rounded-full shadow hover:bg-gray-700 transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Product Details - More compact spacing */}
          <motion.div
            className="w-full mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-900">₹{price}</h2>
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-gray-600 text-sm">{description}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side - Map with Seller Information below */}
        <motion.div
          className="bg-white shadow-lg rounded-xl p-4 pb-2 border border-gray-200 space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Seller Information - Moved from product details */}
          <motion.div
            className="border-b border-gray-200 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Seller Information
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between">
                <p className="text-gray-700 font-medium">
                  {userId?.name || "Unknown Seller"}
                </p>
                <p className="text-gray-500 text-sm">📅 {formattedDate}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-700 flex items-center">
                  📞 {userId?.mobileNo || "N/A"}
                </p>
                <button
                  onClick={handleStartChat}
                  className="flex items-center bg-[#002f34] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
                >
                  <MessageCircle size={16} className="mr-2" />
                  Chat Now
                </button>
              </div>
              <p className="text-gray-500 flex items-center">
                <MapPin size={14} className="mr-1 text-red-500" />{" "}
                {userId?.address || "Location not available"}
              </p>
            </div>
          </motion.div>

          {/* Map Section */}
          <div className=""></div>
          {renderMap()}
        </motion.div>
      </div>

      {/* Related Products Section - Full Width Below */}
      <div className="max-w-7xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Similar Products
        </h3>
        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              className="flex transition-all duration-300 ease-in-out"
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
                    <div className="p-4 bg-gray-50 rounded-xl overflow-hidden shadow border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="relative aspect-square overflow-hidden bg-gray-50">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-2">
                        <h4 className="text-gray-800 font-semibold text-base line-clamp-2">
                          {product.title}
                        </h4>
                        <p className="text-gray-600 text-sm mt-1">
                          ₹{product.price}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="w-full text-center py-8">
                  <p className="text-gray-600 text-sm">
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
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-gray-900 text-white p-2 rounded-full shadow hover:bg-gray-700 transition z-10"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-gray-900 text-white p-2 rounded-full shadow hover:bg-gray-700 transition z-10"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDetail;
