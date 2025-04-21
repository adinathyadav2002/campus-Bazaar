import React, { useState, useEffect, useMemo } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SignupModal from "./auth/SignupModal";
import LoginModal from "./auth/LoginModal";

// Enhanced icon components
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

  // Default placeholder image if none provided
  const imageUrl =
    images && images.length > 0 ? images[0] : "/placeholder-image.jpg";

  return (
    <>
      <div
        onClick={handleCardClick}
        className="relative flex flex-col rounded-2xl overflow-hidden shadow-md hover:shadow-xl cursor-pointer bg-white border border-gray-100 transition-all duration-300 h-full"
      >
        {/* Image Container with proper containment */}
        <div
          className="relative overflow-hidden bg-gray-100"
          style={{ height: "220px" }}
        >
          {/* Image wrapper with overflow control */}
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-contain transition-transform duration-300 hover:scale-110 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder-image.jpg";
              }}
            />
          </div>

          {/* Price Tag */}
          <div className="absolute top-3 left-3 bg-white text-emerald-600 font-bold px-3 py-1.5 rounded-lg shadow-md border border-emerald-50">
            {formattedPrice}
          </div>

          {/* Like Button */}
          <button
            onClick={handleLikeClick}
            className={`absolute top-3 right-3 p-2.5 rounded-full ${
              liked
                ? "bg-red-50 border border-red-100"
                : "bg-white border border-gray-50"
            } shadow-md transition-all duration-200`}
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
          </button>

          {/* Featured Badge */}
          {isFeatured && (
            <div className="absolute bottom-3 left-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-xs font-bold px-4 py-1.5 rounded-full text-white shadow-md flex items-center">
              <span>⭐ Featured</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 leading-tight mb-3">
            {title}
          </h3>

          {/* Category Tag */}
          <div className="inline-flex items-center bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium w-fit mb-3">
            <Tag />
            <span className="capitalize ml-1.5">{category}</span>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 mb-3"></div>

          {/* Info Footer */}
          <div className="flex items-center justify-between text-xs text-gray-600 mt-auto">
            <div className="flex items-center truncate max-w-[60%] bg-blue-50 text-blue-700 px-3 py-2 rounded-full">
              <MapPin />
              <span className="truncate font-medium ml-1.5">
                {userId?.address || "Not specified"}
              </span>
            </div>
            <div className="flex items-center bg-amber-50 text-amber-700 px-3 py-2 rounded-full">
              <Clock />
              <span className="font-medium ml-1.5">{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSignupClick={() => {
            setIsLoginModalOpen(false);
            setIsSignupModalOpen(true);
          }}
        />
      )}

      {isSignupModalOpen && (
        <SignupModal
          isOpen={isSignupModalOpen}
          onClose={() => setIsSignupModalOpen(false)}
          onLoginClick={() => {
            setIsSignupModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />
      )}
    </>
  );
};

export default ProductCard;
