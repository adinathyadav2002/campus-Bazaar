import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaImage, FaPlus, FaHeart } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const token = localStorage.getItem("token");

  // State for modal & editing form
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    images: [],
  });

  // Toast configuration
  const toastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    style: {
      borderRadius: "10px",
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
    },
  };

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND}/api/posts/user`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.status) {
          setPosts(response.data.posts);
        } else {
          setError("No posts found");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          "Failed to load posts. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [token]);

  const openEditModal = (post) => {
    setSelectedPost(post);
    setEditForm({
      title: post.title,
      price: post.price,
      description: post.description,
      category: post.category,
      images: [],
    });
    setImagePreview(post.images.length > 0 ? post.images[0] : null);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    setEditForm({ ...editForm, images: files });

    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.append("title", editForm.title);
    formData.append("price", editForm.price);
    formData.append("description", editForm.description);
    formData.append("category", editForm.category);

    if (editForm.images.length > 0) {
      for (let i = 0; i < editForm.images.length; i++) {
        formData.append("images", editForm.images[i]);
      }
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND}/api/posts/editPost/${
          selectedPost._id
        }`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === selectedPost._id ? response.data.post : post
          )
        );
        toast.success("Post updated successfully!", toastConfig);
        setIsModalOpen(false);
        setSelectedPost(null);
        setImagePreview(null);
      } else {
        toast.error(
          response.data.message || "Failed to update post",
          toastConfig
        );
      }
    } catch (error) {
      console.error("Edit error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update post. Please try again.",
        toastConfig
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      setDeletingId(id);

      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND}/api/posts/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status) {
        setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
        toast.success("Post deleted successfully!", toastConfig);
      } else {
        toast.error(
          response.data.message || "Failed to delete post",
          toastConfig
        );
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to delete post. Please try again.",
        toastConfig
      );
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const confirmDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      handleDelete(id);
    }
  };

  const closeModal = () => {
    if (!isSaving) {
      setIsModalOpen(false);
      setSelectedPost(null);
      setImagePreview(null);
      setTimeout(() => {
        setEditForm({
          title: "",
          price: "",
          description: "",
          category: "",
          images: [],
        });
      }, 300);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full absolute top-0 left-0 animate-spin"></div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="text-center p-8 bg-red-50 text-red-600 rounded-xl max-w-5xl mx-auto my-8 shadow-lg border border-red-100">
        <div className="flex flex-col items-center">
          <svg
            className="w-16 h-16 text-red-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h3 className="text-xl font-bold mb-3">Error Loading Posts</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <ToastContainer />

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">My Posts</h2>
        <button className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
          <FaPlus className="mr-2" size={14} />
          <span>New Post</span>
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-10 rounded-xl text-center shadow-lg border border-gray-200">
          <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-inner">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              ></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Posts Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Start sharing your items with the community by creating your first
            post.
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            Create Your First Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 transform hover:-translate-y-1"
            >
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                {post.images && post.images.length > 0 ? (
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/400x300?text=Image+Not+Available";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <FaImage className="text-gray-300" size={48} />
                  </div>
                )}
                <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-white bg-opacity-90 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                  {formatDate(post.createdAt)}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-800 line-clamp-1 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex space-x-2 ml-2">
                    <button
                      onClick={() => openEditModal(post)}
                      className="text-blue-500 hover:text-blue-700 p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                      aria-label="Edit post"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => confirmDelete(post._id)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                      disabled={isDeleting && deletingId === post._id}
                      aria-label="Delete post"
                    >
                      {isDeleting && deletingId === post._id ? (
                        <div className="h-4 w-4 border-2 border-t-red-500 border-r-red-500 rounded-full animate-spin"></div>
                      ) : (
                        <FaTrash size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 text-sm line-clamp-2 flex-grow">
                  {post.description}
                </p>

                <div className="flex justify-between items-center mt-auto">
                  <div className="px-3 py-1.5 bg-green-50 text-green-700 font-medium rounded-lg">
                    ₹ {post.price}
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
                    {post.category}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <FaHeart className="text-red-400 mr-1" />
                    <span>{post.likeCount || 0} likes</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                    <span>Active</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Modal with Backdrop Blur */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
              onClick={closeModal}
            >
              <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100 animate-fadeIn">
              <div className="bg-white px-6 pt-6 pb-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Edit Post
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none transform transition-transform hover:rotate-90"
                    disabled={isSaving}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Image Preview Section */}
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Current Image
                    </label>
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 h-52 flex items-center justify-center shadow-inner">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/400x300?text=Preview+Not+Available";
                          }}
                        />
                      ) : (
                        <div className="text-center p-4">
                          <FaImage
                            size={40}
                            className="mx-auto text-gray-300 mb-3"
                          />
                          <p className="text-sm text-gray-500">
                            No image selected
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="block text-gray-700 font-medium mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={editForm.title}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      required
                      disabled={isSaving}
                      placeholder="Enter post title"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-gray-700 font-medium mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={editForm.price}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      required
                      disabled={isSaving}
                      placeholder="Enter price"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-gray-700 font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      rows="4"
                      required
                      disabled={isSaving}
                      placeholder="Enter post description"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-gray-700 font-medium mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={editForm.category}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white"
                      required
                      disabled={isSaving}
                    >
                      <option value="">Select Category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Books">Books</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">
                      Images
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        name="images"
                        onChange={handleFileChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0 file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
                        accept="image/*"
                        multiple
                        disabled={isSaving}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Upload new images to replace existing ones. Recommended
                      size: 1200x800px
                    </p>
                  </div>

                  <div className="flex justify-end space-x-4 mt-8">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md hover:shadow-lg font-medium flex items-center"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                          Saving Changes...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default UserPosts;
