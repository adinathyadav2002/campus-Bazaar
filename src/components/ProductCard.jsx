import React, { useState, useEffect, useMemo } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import SignupModal from "./auth/SignupModal";
import LoginModal from "./auth/LoginModal";

// Enhanced icon components with better styling
const Tag = () => <span className="text-emerald-500">🏷️</span>;
const MapPin = () => <span className="text-blue-500">📍</span>;
const Clock = () => <span className="text-amber-500">⏰</span>;

const ProductCard = ({
  _id,
  images,
  userId,
  price,
  title,
  createdAt,
  category,
  description,
  likeCount,
  isLiked: initialIsLiked = false,
  isFeatured = false,
}) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(initialIsLiked);
  const [isLiking, setIsLiking] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setLiked(initialIsLiked);
  }, [initialIsLiked]);

  // Optimized Date Formatting
  const formattedDate = useMemo(() => {
    return new Date(createdAt).toLocaleDateString("en-GB", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  }, [createdAt]);

  // Format price with currency symbol
  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  }, [price]);

  const handleCardClick = () => {
    navigate(`/detail`, {
      state: {
        images,
        price,
        title,
        createdAt,
        category,
        description,
        likeCount,
        userId,
        _id,
      },
    });
  };

  const handleLikeClick = async (e) => {
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsLiking(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND}/api/posts/likePost/${_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setLiked(!liked);
        toast.success(liked ? "Removed from favorites" : "Added to favorites!");

        // Trigger refresh of liked posts in ProductList
        window.dispatchEvent(new CustomEvent("likedPostsUpdated"));
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.message ||
            `Failed to ${liked ? "remove from" : "add to"} favorites`
        );
      }
    } catch (error) {
      console.error("Error handling like:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <>
      <motion.div
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.03, y: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative flex flex-col rounded-2xl overflow-hidden shadow-lg cursor-pointer bg-white border border-gray-100 transition-all duration-300 hover:shadow-xl"
      >
        {/* Image Section with Gradient Overlay */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">
          <motion.img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500"
            loading="lazy"
            animate={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Semi-transparent overlay on hover */}
          <motion.div
            className="absolute inset-0 bg-black pointer-events-none"
            animate={{ opacity: isHovered ? 0.1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Price Tag */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-emerald-600 font-bold px-3 py-1.5 rounded-lg shadow-sm">
            {formattedPrice}
          </div>

          {/* Like Button with enhanced animation */}
          <motion.button
            onClick={handleLikeClick}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.15 }}
            className={`absolute top-4 right-4 p-2.5 rounded-full ${
              liked ? "bg-red-50" : "bg-white/80 backdrop-blur-sm"
            } shadow-md hover:shadow-lg transition-all duration-300`}
          >
            <motion.div
              animate={{
                scale: liked ? [1, 1.4, 1] : 1,
                rotate: liked ? [0, 15, -15, 0] : 0,
              }}
              transition={{ duration: 0.4 }}
            >
              {isLiking ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
              ) : (
                <Heart
                  size={20}
                  className={
                    liked ? "text-red-500 fill-red-500" : "text-gray-700"
                  }
                  fill={liked ? "currentColor" : "none"}
                  strokeWidth={2.5}
                />
              )}
            </motion.div>
          </motion.button>

          {/* Featured Badge with animation */}
          {isFeatured && (
            <motion.div
              className="absolute bottom-4 left-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-xs font-bold px-4 py-1.5 rounded-full text-white shadow-md flex items-center space-x-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="text-yellow-100">⭐</span>
              <span>Featured</span>
            </motion.div>
          )}
        </div>

        {/* Content Section with improved layout */}
        <div className="p-5 flex flex-col flex-grow bg-gradient-to-b from-white to-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2 leading-tight">
            {title}
          </h3>

          {/* Category tag with improved styling */}
          <div className="inline-flex items-center bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium mb-3 w-fit">
            <Tag size={14} className="mr-1.5" />
            <span className="capitalize">{category}</span>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-2"></div>

          {/* Info footer with improved readability */}
          <div className="flex items-center justify-between text-xs mt-2 text-gray-600">
            <div className="flex items-center truncate max-w-[60%] bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
              <MapPin size={14} className="mr-1 flex-shrink-0" />
              <span className="truncate font-medium">
                {userId?.address || "Not specified"}
              </span>
            </div>
            <div className="flex items-center bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
              <Clock size={14} className="mr-1" />
              <span className="font-medium">{formattedDate}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modals with Smooth Animations */}
      {isLoginModalOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onSignupClick={() => {
              setIsLoginModalOpen(false);
              setIsSignupModalOpen(true);
            }}
          />
        </motion.div>
      )}

      {isSignupModalOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <SignupModal
            isOpen={isSignupModalOpen}
            onClose={() => setIsSignupModalOpen(false)}
            onLoginClick={() => {
              setIsSignupModalOpen(false);
              setIsLoginModalOpen(true);
            }}
          />
        </motion.div>
      )}
    </>
  );
};

export default ProductCard;
