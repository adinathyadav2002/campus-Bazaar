import React, { useState, useEffect, useMemo } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import SignupModal from "./auth/SignupModal";
import LoginModal from "./auth/LoginModal";

const Tag = () => <span>🏷️</span>;
const MapPin = () => <span>📍</span>;
const Clock = () => <span>⏰</span>;

const ProductDisplay = ({ product }) => {
  // Destructure product object
  const {
    _id,
    images,
    userId,
    price,
    title,
    createdAt,
    category,
    description,
    likeCount,
    isLiked = false,
    isFeatured = false,
  } = product;

  const navigate = useNavigate();
  const [liked, setLiked] = useState(isLiked);
  const [isLiking, setIsLiking] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  // Optimized Date Formatting
  const formattedDate = useMemo(() => {
    return new Date(createdAt).toLocaleDateString("en-GB", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  }, [createdAt]);

  // Navigate to the detail page, passing the entire product as state
  const handleCardClick = () => {
    // navigate(`/detail`, { state: { product } });
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

  // Handle like button click
  const handleLikeClick = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoginModalOpen(true);
      return;
    }
    if (isLiking || liked) return;
    setIsLiking(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND}/api/posts/likePost/${_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setLiked(true);
        toast.success("Product added to favorites!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to add to favorites");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <>
      <motion.div
        onClick={handleCardClick}
        whileHover={{
          scale: 1.03,
          boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)",
          y: -3,
        }}
        transition={{ duration: 0.3 }}
        className="relative flex flex-col rounded-xl overflow-hidden object-cover shadow-md cursor-pointer bg-white border border-gray-200 transition-transform"
      >
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <motion.img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover transition-opacity duration-300 ease-in-out"
            loading="lazy"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />

          {/* Like Button */}
          <motion.button
            onClick={handleLikeClick}
            disabled={liked || isLiking}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            className={`absolute top-3 right-3 p-2 rounded-full ${
              liked ? "bg-red-50" : "bg-white"
            } shadow-md hover:shadow-lg transition-all duration-200`}
          >
            <motion.div
              animate={{ scale: liked ? [1, 1.3, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              {isLiking ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
              ) : (
                <Heart
                  size={18}
                  className={
                    liked ? "text-red-500 fill-red-500" : "text-gray-700"
                  }
                  fill={liked ? "currentColor" : "none"}
                />
              )}
            </motion.div>
          </motion.button>

          {/* Featured Tag */}
          {isFeatured && (
            <motion.div
              className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-xs font-bold px-3 py-1 rounded-full text-white shadow-md"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              Featured
            </motion.div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-2">
            {title}
          </h3>
          <div className="flex items-center text-xs text-gray-600">
            <Tag size={14} className="mr-1.5 text-gray-500" />
            <span className="capitalize">{category}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            <div className="flex items-center truncate max-w-[60%]">
              <MapPin size={14} className="mr-1 flex-shrink-0" />
              <span className="truncate">
                {userId?.address || "Not specified"}
              </span>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modals for Login/Signup */}
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

export default ProductDisplay;
