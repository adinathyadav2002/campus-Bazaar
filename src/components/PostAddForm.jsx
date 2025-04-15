import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "./ToastComponent";
import apiRequest from "../utils/ApiRequest";

const PostAdForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    tags: [],
    category: "",
    images: null,
  });

  const [inputTag, setInputTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "price" && !/^\d*\.?\d*$/.test(value)) {
      return; // Reject invalid input (only numbers and one decimal point allowed)
    }

    if (name === "images" && files) {
      // Create preview URLs for selected images
      const imageUrls = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setPreviewImages(imageUrls);
      setFormData((prev) => ({ ...prev, images: files }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "price" ? value : value,
      }));
    }
  };

  const handleTagChange = (e) => {
    setInputTag(e.target.value);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" && inputTag.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(inputTag.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, inputTag.trim()],
        }));
      }
      setInputTag(""); // Clear input field after adding tag
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const checkUserDetails = async () => {
    let url = String(import.meta.env.VITE_BACKEND);
    url += "/api/user/checkUser";

    const { resStatus, data, error } = await apiRequest(url, "GET", {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    });

    if (resStatus) return true;
    else {
      showToast(error.message, "error");
      return false;
    }
  };

  useEffect(() => {
    const verifyUser = async () => {
      const isUserValid = await checkUserDetails();
      if (!isUserValid) {
        showToast("Please Login or Update the User Details", "error");
        navigate("/");
      }
    };
    verifyUser();

    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }
      const userdataResponse = await fetch(
        `${import.meta.env.VITE_BACKEND}/api/user/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userdata = await userdataResponse.json();

      // Create a new array instead of modifying the original
      const allTags = [...formData.tags];
      allTags.push(userdata.user.address);
      allTags.push(userdata.user.college);

      const data = new FormData();
      data.append("title", formData.title);
      data.append("price", Number(formData.price));
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("tags", allTags);

      Array.from(formData.images || []).forEach((image) => {
        data.append("images", image);
      });

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND}/api/posts/add`,
        {
          method: "POST",
          body: data,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        showToast("Ad Posted Successfully!", "success");
        setTimeout(() => navigate("/"), 2000);
      } else {
        showToast("Failed to post the ad. Please try again.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-12 border border-gray-100">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 relative">
        <span className="bg-blue-500 h-1 w-16 absolute bottom-0 left-1/2 transform -translate-x-1/2 rounded-full"></span>
        Add Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="group">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="Enter product name"
            required
          />
        </div>

        <div className="group">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Price (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">₹</span>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 pl-7 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="Describe your product in detail..."
            required
          />
        </div>

        <div className="group">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            required
          >
            <option value="">Select a category</option>
            <option value="books-stationery">Books &amp; Stationery</option>
            <option value="study-tools-electronics">
              Study Tools &amp; Electronics
            </option>
            <option value="uniforms-apparel">Uniforms &amp; Apparel</option>
            <option value="educational-accessories">
              Educational Accessories
            </option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="group">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Tags
            <span className="text-xs text-gray-500 ml-1 font-normal">
              (Press Enter to add)
            </span>
          </label>
          <div className="border border-gray-300 p-3 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200">
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.length > 0 ? (
                formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      &times;
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm italic">
                  No tags yet. Add relevant keywords to increase visibility.
                </span>
              )}
            </div>
            <input
              type="text"
              value={inputTag}
              onChange={handleTagChange}
              onKeyDown={handleTagKeyDown}
              className="w-full border border-gray-200 p-2 rounded-lg focus:outline-none"
              placeholder="Type a tag and press Enter..."
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Images
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors duration-200">
            <input
              type="file"
              name="images"
              onChange={handleChange}
              className="hidden"
              id="images"
              multiple
              accept="image/*"
            />
            <label
              htmlFor="images"
              className="cursor-pointer flex flex-col items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="mt-2 text-base text-gray-600">
                Click to select images
              </span>
              <span className="mt-1 text-xs text-gray-500">
                JPG, PNG, GIF up to 10MB
              </span>
            </label>
          </div>

          {/* Image previews */}
          {previewImages.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Selected Images:
              </p>
              <div className="grid grid-cols-3 gap-3">
                {previewImages.map((url, index) => (
                  <div
                    key={index}
                    className="relative rounded-lg overflow-hidden h-24 bg-gray-100"
                  >
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg w-full flex justify-center items-center font-medium transition-colors duration-200"
            disabled={loading}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Post Your Ad"
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-4 text-gray-600 hover:text-gray-800 w-full text-center py-2 font-medium transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostAdForm;
