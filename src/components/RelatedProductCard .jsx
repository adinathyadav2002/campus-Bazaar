import React from "react";
import { motion } from "framer-motion";

// Card Component for each related product
const RelatedProductCard = ({ product }) => {
  return (
    <motion.div
      className="p-4 bg-gray-50 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {product.image && (
        <img
          src={product.image}
          alt={product.title}
          className="h-40 w-full object-cover rounded"
        />
      )}
      <h4 className="text-gray-800 font-semibold mt-2">{product.title}</h4>
      <p className="text-gray-600">₹{product.price}</p>
    </motion.div>
  );
};



export default RelatedProductCard;
