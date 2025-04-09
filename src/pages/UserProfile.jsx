import React, { useState, useEffect } from "react";
import Spinner from "../components/Spinner";

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    mobileNo: "",
    address: "",
    college: "",
    prn: "",
    profileImage: "",
    createdAt: "",
  });
  const [image, setImage] = useState("");
  const [show, setShow] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [likedItems, setLikedItems] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [likedItemsLoading, setLikedItemsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Base API URL from environment variable
  const baseUrl = process.env.REACT_APP_BACKEND;

  // Fetch User Information
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to view profile");
          setLoading(false);
          return;
        }

        const response = await fetch(`${baseUrl}/api/user/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUserInfo(data.user);
          setFormData(data.user);
          // Save user address to localStorage
          localStorage.setItem("userAddress", data.user.address || "");
        } else {
          setError(data.message || "Failed to fetch user information");
        }
      } catch (err) {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [baseUrl]);

  // Fetch Liked Items from API
  useEffect(() => {
    const fetchLikedItems = async () => {
      setLikedItemsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return;
        }

        const response = await fetch(`${baseUrl}/api/posts/getLikedPost`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setLikedItems(data.posts || []);
        } else {
          console.error("Failed to fetch liked items:", data.message);
        }
      } catch (err) {
        console.error("Error fetching liked items:", err);
      } finally {
        setLikedItemsLoading(false);
      }
    };

    fetchLikedItems();
  }, [baseUrl]);

  // Handle Profile Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setImageLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/api/user/profileImage`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setImage(data.imageUrl);
        setShow((prev) => !prev);
        setUpdateMessage("Profile image updated successfully!");

        // Update the user info with new image
        setUserInfo((prev) => ({
          ...prev,
          profileImage: data.imageUrl,
        }));

        // Hide message after 3 seconds
        setTimeout(() => setUpdateMessage(""), 3000);
      } else {
        setError(data.message || "Failed to update profile image");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setImageLoading(false);
    }
  };

  // Toggle Edit Mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
    setFormData(userInfo);
    setUpdateMessage("");
  };

  // Handle Form Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validation for mobile number (digits only, max 10)
    if (name === "mobileNo" && !/^\d{0,10}$/.test(value)) {
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to update profile");
        return;
      }

      // Validation checks
      if (formData.mobileNo && formData.mobileNo.length !== 10) {
        setUpdateMessage("Mobile number must be exactly 10 digits");
        setUpdateLoading(false);
        return;
      }

      const response = await fetch(`${baseUrl}/api/user/updateDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          college: formData.college,
          prn: formData.prn,
          address: formData.address,
          mobileNo: formData.mobileNo,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setUserInfo({ ...userInfo, ...formData });
        // Update address in localStorage when profile is updated
        localStorage.setItem("userAddress", formData.address || "");
        setUpdateMessage("Profile updated successfully!");
        setTimeout(() => {
          setEditMode(false);
          setUpdateMessage("");
        }, 2000);
      } else {
        setUpdateMessage(data.message || "Failed to update profile");
      }
    } catch (err) {
      setUpdateMessage("Something went wrong. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg shadow-md">
          <h3 className="font-medium text-lg mb-1">Error</h3>
          <p>{error}</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Notification Banner */}
        {updateMessage && (
          <div
            className={`mb-4 p-3 rounded-lg shadow-md flex items-center justify-between ${
              updateMessage.includes("success")
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}
          >
            <div className="flex items-center">
              {updateMessage.includes("success") ? (
                <svg
                  className="h-5 w-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <p>{updateMessage}</p>
            </div>
            <button
              onClick={() => setUpdateMessage("")}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-700 to-blue-500 px-8 py-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <svg
                className="w-full h-full"
                viewBox="0 0 800 800"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M435.5,141.7C429,175.8,386.9,181.5,359.9,200.9C335.5,218.3,324.7,250.6,316.9,280.5C306.1,320.7,294.8,366.3,318.3,401.3C337.8,429.7,373.9,438.8,408.1,438.7C438.2,438.7,469.7,438.6,495.1,426.7C522.5,413.9,542.3,386.2,553.3,356.8C565.7,323.6,564.1,287.9,564.2,252.4C564.3,220.1,569.7,183.2,547.7,159.2C527.8,137.5,490.5,129.1,461.8,133.2C447.3,135.3,439.7,121.9,435.5,141.7Z"
                  fill="#fff"
                />
              </svg>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
              <div className="relative group">
                <div className="h-28 w-28 rounded-full bg-gray-100 border-4 border-white overflow-hidden shadow-lg">
                  {imageLoading ? (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200 animate-pulse">
                      <span className="text-sm text-gray-600">Loading...</span>
                    </div>
                  ) : userInfo.profileImage ? (
                    <img
                      src={show ? image : userInfo.profileImage}
                      alt={userInfo.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500">
                      <span className="text-4xl font-bold text-white">
                        {userInfo.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100 transition-all duration-200 transform hover:scale-110">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold">{userInfo.name}</h1>
                <div className="flex items-center mt-1 text-blue-100">
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <p>{userInfo.email}</p>
                </div>

                <div className="mt-4 flex items-center">
                  <div className="text-xs text-blue-100 bg-blue-900 bg-opacity-30 px-3 py-1 rounded-full">
                    Member since{" "}
                    {new Date(userInfo.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={toggleEditMode}
                className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-2 backdrop-filter backdrop-blur-sm transition-all duration-200"
                aria-label={editMode ? "Cancel editing" : "Edit profile"}
              >
                {editMode ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white border-b">
            <div className="px-6 flex space-x-4">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Profile Details
              </button>
              <button
                onClick={() => setActiveTab("likes")}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors flex items-center ${
                  activeTab === "likes"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Liked Items
                {likedItems.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                    {likedItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Profile Details */}
          {activeTab === "profile" && (
            <div className="px-8 py-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <div
                      className={`p-4 rounded-lg transition-all duration-200 ${
                        editMode
                          ? "bg-white border border-gray-200 shadow-sm"
                          : "bg-gray-50"
                      }`}
                    >
                      <h2 className="text-sm font-semibold text-gray-600">
                        Mobile Number
                      </h2>
                      {editMode ? (
                        <div className="mt-2">
                          <input
                            type="text"
                            name="mobileNo"
                            value={formData.mobileNo || ""}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter 10 digit mobile number"
                            maxLength={10}
                          />
                          {formData.mobileNo &&
                            formData.mobileNo.length !== 10 && (
                              <p className="text-red-500 text-xs mt-1">
                                Mobile number must be exactly 10 digits
                              </p>
                            )}
                        </div>
                      ) : (
                        <p className="text-lg mt-1 font-medium">
                          {userInfo.mobileNo || (
                            <span className="text-gray-400 text-base italic">
                              Not provided
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-lg transition-all duration-200 ${
                        editMode
                          ? "bg-white border border-gray-200 shadow-sm"
                          : "bg-gray-50"
                      }`}
                    >
                      <h2 className="text-sm font-semibold text-gray-600">
                        College
                      </h2>
                      {editMode ? (
                        <input
                          type="text"
                          name="college"
                          value={formData.college || ""}
                          onChange={handleInputChange}
                          className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your college name"
                        />
                      ) : (
                        <p className="text-lg mt-1 font-medium">
                          {userInfo.college || (
                            <span className="text-gray-400 text-base italic">
                              Not provided
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-lg transition-all duration-200 ${
                        editMode
                          ? "bg-white border border-gray-200 shadow-sm"
                          : "bg-gray-50"
                      }`}
                    >
                      <h2 className="text-sm font-semibold text-gray-600">
                        PRN
                      </h2>
                      {editMode ? (
                        <input
                          type="text"
                          name="prn"
                          value={formData.prn || ""}
                          onChange={handleInputChange}
                          className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your PRN"
                        />
                      ) : (
                        <p className="text-lg mt-1 font-medium">
                          {userInfo.prn || (
                            <span className="text-gray-400 text-base italic">
                              Not provided
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div
                      className={`p-4 rounded-lg transition-all duration-200 ${
                        editMode
                          ? "bg-white border border-gray-200 shadow-sm"
                          : "bg-gray-50"
                      }`}
                    >
                      <h2 className="text-sm font-semibold text-gray-600">
                        Address
                      </h2>
                      {editMode ? (
                        <textarea
                          name="address"
                          value={formData.address || ""}
                          onChange={handleInputChange}
                          className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your address"
                          rows="5"
                        />
                      ) : (
                        <p className="text-lg mt-1 font-medium">
                          {userInfo.address || (
                            <span className="text-gray-400 text-base italic">
                              Not provided
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {editMode && (
                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={toggleEditMode}
                      disabled={updateLoading}
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg mr-3 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateLoading}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
                    >
                      {updateLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                          Updating...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Liked Items Section */}
          {activeTab === "likes" && (
            <div className="px-8 py-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <svg
                  className="h-5 w-5 mr-2 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                Liked Items
              </h2>

              {likedItemsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : likedItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {likedItems.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="h-48 overflow-hidden bg-gray-100">
                        <img
                          src={
                            item.images && item.images.length > 0
                              ? item.images[0]
                              : "/placeholder-image.jpg"
                          }
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder-image.jpg";
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 leading-tight line-clamp-1">
                          {item.title}
                        </h3>
                        <div className="flex justify-between items-center mt-3">
                          <p className="text-xl font-bold text-blue-600">
                            ₹{item.price}
                          </p>
                          <div className="flex items-center text-gray-500 text-sm">
                            <svg
                              className="h-4 w-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {item.address || "Location"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <svg
                    className="h-12 w-12 text-gray-400 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-600">
                    No liked items yet
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Items you like will appear here
                  </p>
                  <button
                    onClick={() => (window.location.href = "/")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Products
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
