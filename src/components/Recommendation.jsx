import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Spinner from "./Spinner";

const Tag = () => <span>🏷️</span>;
const MapPin = () => <span>📍</span>;
const Clock = () => <span>⏰</span>;

const Recommendation = () => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/loginNew");
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND}/api/posts/getRecommendation`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        const data = await response.json();
        if (data.status && Array.isArray(data.posts)) {
          const allProducts = data.posts.flat();
          const uniqueProducts = Array.from(
            new Map(allProducts.map((item) => [item._id, item])).values()
          );
          setRecommendedProducts(uniqueProducts);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-4xl font-bold text-gray-800 text-center">
          Recommended Products
        </h1>
        <p className="text-center text-gray-600 mt-2">
          Based on your interests and browsing history
        </p>
      </header>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((product) => (
            <motion.div
              key={product._id}
              onClick={() =>
                navigate("/detail", {
                  state: { ...product },
                })
              }
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
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover transition-opacity duration-300 contain ease-in-out"
                  loading="lazy"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Content Section */}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-2">
                  {product.title}
                </h3>
                <div className="flex items-center text-xs text-gray-600">
                  <Tag size={14} className="mr-1.5 text-gray-500" />
                  <span className="capitalize">{product.category}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <div className="flex items-center truncate max-w-[60%]">
                    <MapPin size={14} className="mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {product.userId?.address || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>
                      {new Date(product.createdAt).toLocaleDateString("en-GB", {
                        year: "2-digit",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                {/* Price Tag */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
                  <span className="text-gray-900 font-semibold">
                    ₹{product.price}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {recommendedProducts.length === 0 && (
          <div className="text-center py-10">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto">
              <p className="text-gray-600 text-lg mb-2">
                No recommendations available at the moment.
              </p>
              <p className="text-gray-500">
                Try browsing more products to get personalized recommendations.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendation;
