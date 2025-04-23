import React, { useContext, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import AppContext from "../context/AppContext";
import Spinner from "./Spinner";

const ProductList = () => {
  const { products, setProducts } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [likedPostIds, setLikedPostIds] = useState(new Set());
  const totalFetchedPosts = useRef({});

  // Function to fetch liked posts IDs
  const fetchLikedPostIds = async () => {
    const token = localStorage.getItem("token");
    if (!token) return [];

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND}/api/posts/getLikedPostId`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Liked post IDs:", data);

        if (data.status && Array.isArray(data.postId)) {
          // Store the liked post IDs
          setLikedPostIds(new Set(data.postId));
          return data.postId; // Return the array of liked post IDs
        }
      }
    } catch (error) {
      console.error("Error fetching liked posts:", error);
    }
    return [];
  };

  // Function to load products for the current page
  const loadProductsForPage = async (pageNumber, currentLikedIds) => {
    if (loading) return;

    try {
      setLoading(true);
      console.log(`Fetching page ${pageNumber} of products...`);

      // Check if we already have this page cached
      if (totalFetchedPosts.current[pageNumber]) {
        console.log(`Using cached data for page ${pageNumber}`);
        setProducts(totalFetchedPosts.current[pageNumber]);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND
        }/api/posts/get?getpage=${pageNumber}&limit=12`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.posts && Array.isArray(data.posts)) {
        // Add isLiked property to each post using the provided likedIds
        const newPosts = data.posts.map((post) => ({
          ...post,
          isLiked: currentLikedIds.includes(post._id),
        }));

        // Cache the posts for this page
        totalFetchedPosts.current[pageNumber] = newPosts;

        // Update the total pages
        if (data.totalPages) {
          setTotalPages(data.totalPages);
        }

        setProducts(newPosts);
        console.log(`Loaded ${newPosts.length} posts for page ${pageNumber}`);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // Reset states for fresh start
        totalFetchedPosts.current = {};
        setProducts([]);

        // First fetch liked posts and get the array
        const likedIds = await fetchLikedPostIds();

        // Load initial products
        await loadProductsForPage(1, likedIds || []);
      } catch (error) {
        console.error("Error during initialization:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Effect for page changes
  useEffect(() => {
    loadProductsForPage(page, Array.from(likedPostIds));
  }, [page]);

  // Listen for like/unlike events
  useEffect(() => {
    const handleLikeUpdate = async () => {
      const likedIds = await fetchLikedPostIds();

      // Update the current page with new liked statuses
      if (totalFetchedPosts.current[page]) {
        const updatedPosts = totalFetchedPosts.current[page].map((post) => ({
          ...post,
          isLiked: likedIds.includes(post._id),
        }));

        totalFetchedPosts.current[page] = updatedPosts;
        setProducts(updatedPosts);
      }
    };

    window.addEventListener("likedPostsUpdated", handleLikeUpdate);
    return () => {
      window.removeEventListener("likedPostsUpdated", handleLikeUpdate);
    };
  }, [page]);

  // Handle page changes
  const goToNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
      window.scrollTo(0, 0);
    }
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // Max number of page buttons to show

    if (totalPages <= maxVisiblePages) {
      // If we have less than or equal to maxVisiblePages, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);

      let startPage = Math.max(2, page - 1);
      let endPage = Math.min(totalPages - 1, page + 1);

      // Adjust if we're near the start or end
      if (page <= 3) {
        endPage = Math.min(maxVisiblePages - 1, totalPages - 1);
      } else if (page >= totalPages - 2) {
        startPage = Math.max(2, totalPages - maxVisiblePages + 2);
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      // Always include last page if it's not already included
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <section className="bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4">
        {loading && products.length === 0 ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products && products.length > 0 ? (
                products.map((product, index) => (
                  <motion.div
                    key={`${product._id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <ProductCard {...product} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-gray-500">
                  No products found
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap justify-center items-center gap-2">
                <button
                  onClick={goToPrevPage}
                  disabled={page === 1 || loading}
                  className={`px-4 py-2 rounded-md flex items-center justify-center transition-colors ${
                    page === 1 || loading
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center">
                  {getPaginationNumbers().map((num, index) => (
                    <button
                      key={`page-${index}`}
                      onClick={() => num !== "..." && setPage(num)}
                      disabled={num === "..." || num === page || loading}
                      className={`mx-1 min-w-[40px] h-10 flex items-center justify-center rounded-md transition-colors ${
                        num === page
                          ? "bg-blue-600 text-white font-bold"
                          : num === "..."
                          ? "bg-transparent text-gray-500 cursor-default"
                          : "bg-white text-blue-500 hover:bg-blue-100 border border-gray-300"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={page === totalPages || loading}
                  className={`px-4 py-2 rounded-md flex items-center justify-center transition-colors ${
                    page === totalPages || loading
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Next
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="mt-8 flex justify-center">
            <Spinner />
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductList;
