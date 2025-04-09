import React, { useState, useEffect, useContext } from "react";
import { Search } from "lucide-react";
import AppContext from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const AnimatedSearchInput = ({ searchQuery, setSearchQuery }) => {
  const { setProducts } = useContext(AppContext);
  const navigate = useNavigate();

  const suggestions = [
    "Textbooks",
    "Notes & Study Material",
    "Stationery",
    "Second-hand Laptops",
    "Calculators",
    "Backpacks",
  ];

  const [placeholder, setPlaceholder] = useState(`Find ${suggestions[0]}...`);

  // Handle animated placeholder text
  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      index = (index + 1) % suggestions.length;
      setPlaceholder(`Find ${suggestions[index]}...`);
    }, 1800);

    return () => clearInterval(intervalId);
  }, [suggestions]);

  // Function to fetch all products
  const fetchAllProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/api/posts/d?page=1&limit=12`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
      navigate("/");
    } catch (error) {
      console.error("Error fetching all products:", error);
    }
  };

  // Function to handle search API call
  const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      // TODO: await fetchAllProducts();
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/api/search?query=${encodeURIComponent(
          trimmedQuery
        )}`
      );

      const data = await response.json();

      console.log("seachquery", searchQuery);
      console.log(data.posts);
      setProducts(data.status ? data.posts : []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setProducts([]);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // If input becomes empty, fetch all products and redirect
    if (!value.trim()) {
      fetchAllProducts();
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-grow items-center">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full border-2 border-r-0 py-2 px-4 outline-none focus:border-[#23e5db] transition-all duration-200"
        value={searchQuery}
        onChange={handleInputChange}
      />
      <button
        type="submit"
        className="bg-[#002f34] border-2 border-[#002f34] p-2 rounded-r-md hover:bg-[#003f44] transition-colors duration-200"
        onClick={handleSubmit}
      >
        <Search size={22} className="text-white" />
      </button>
    </form>
  );
};

export default AnimatedSearchInput;
