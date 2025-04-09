import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import AppContext from '../context/AppContext';
import Spinner from './Spinner';

const ProductList = () => {
  const { products, setProducts } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likedPostIds, setLikedPostIds] = useState(new Set());
  const observer = useRef();
  const totalFetchedPosts = useRef([]);
  
  // Debug helper - log when page changes
  useEffect(() => {
    console.log("Current page:", page);
  }, [page]);

  // Function to fetch liked posts IDs
  const fetchLikedPostIds = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/posts/getLikedPostId`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Liked post IDs:', data);
        
        if (data.status && Array.isArray(data.postId)) {
          // Store the liked post IDs
          setLikedPostIds(new Set(data.postId));
          return data.postId; // Return the array of liked post IDs
        }
      }
    } catch (error) {
      console.error('Error fetching liked posts:', error);
    }
    return [];
  };

  // Modified loadMoreProducts to take likedIds parameter
  const loadMoreProducts = useCallback(async (currentLikedIds) => {
    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/api/posts/get?getpage=${page}&limit=12`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setHasMore(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.posts && Array.isArray(data.posts)) {
        // Add isLiked property to each post using the provided likedIds
        const newPosts = data.posts.map(post => ({
          ...post,
          isLiked: currentLikedIds.includes(post._id)
        }));
        
        totalFetchedPosts.current = [...totalFetchedPosts.current, ...newPosts];
        setProducts(totalFetchedPosts.current);
        
        if (data.totalPages && page >= data.totalPages) {
          setHasMore(false);
        } else if (newPosts.length === 0) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, setProducts]);

  // Modified initial load sequence
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // First fetch liked posts and get the array
        const likedIds = await fetchLikedPostIds();
        
        // Reset products
        totalFetchedPosts.current = [];
        setProducts([]);
        
        // Load products with the liked posts data
        await loadMoreProducts(likedIds || []);
      } catch (error) {
        console.error('Error during initialization:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []); // Empty dependency array for initial load

  // Effect for page changes
  useEffect(() => {
    if (page > 1) {
      loadMoreProducts(Array.from(likedPostIds));
    }
  }, [page, loadMoreProducts]);

  // Listen for like/unlike events
  useEffect(() => {
    const handleLikeUpdate = async () => {
      const likedIds = await fetchLikedPostIds();
      // Update all existing posts with new liked status
      const updatedPosts = totalFetchedPosts.current.map(post => ({
        ...post,
        isLiked: likedIds.includes(post._id)
      }));
      setProducts(updatedPosts);
    };

    window.addEventListener('likedPostsUpdated', handleLikeUpdate);
    return () => {
      window.removeEventListener('likedPostsUpdated', handleLikeUpdate);
    };
  }, []);

  // Intersection observer for infinite scroll
  const lastProductRef = useCallback(node => {
    if (loading || !hasMore) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        console.log("Last item visible, loading more...");
        setPage(prevPage => prevPage + 1);
      }
    }, { rootMargin: '200px' });  // Increased rootMargin for earlier detection
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Manual load more function (as a backup)
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };


  return (
    <section className="bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Latest Listings</h1>
        
      
        
        {loading && products.length === 0 ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products && products.length > 0 ? (
                products.map((product, index) => {
                  // Check if this is the last item
                  const isLastItem = index === products.length - 1;
                  
                  return (
                    <motion.div
                      ref={isLastItem && hasMore ? lastProductRef : null}
                      key={`${product._id}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05, duration: 0.3 }}
                    >
                      <ProductCard {...product} />
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-10 text-gray-500">
                  No products found
                </div>
              )}
            </div>

            {/* Manual load more button as a backup */}
            {/* {hasMore && !loading && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Load More
                </button>
              </div>
            )} */}

          </>
        )}

        {/* Loading indicator for additional pages */}
        {loading && products.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Spinner />
          </div>
        )}

        {/* No more products message */}
        {/* {!hasMore && products.length > 0 && !loading && (
          <p className="text-center mt-8 text-gray-500">You've reached the end of the listings</p>
        )} */}
      </div>
    </section>
  );
};

export default ProductList;