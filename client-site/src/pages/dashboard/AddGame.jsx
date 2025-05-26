import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { useToasts } from "react-toast-notifications";

const GameName = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subcategory: "",
    image: "/Uploads/images/default.png",
    link: "",
    isActive: true,
  });
  const [editId, setEditId] = useState(null);
  const { addToast } = useToasts();

  // Fetch game main categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/game-main-categories`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const result = await response.json();
        console.log("Fetched categories:", result); // Debug: Check fetched categories
        setCategories(result);
      } catch (error) {
        console.error("Error fetching categories:", error);
        addToast("Failed to fetch categories", { appearance: "error" });
      }
    };

    fetchCategories();
  }, [addToast]);

  // Fetch games from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/game-name`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch games");
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching games:", error);
        addToast("Failed to fetch games", { appearance: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [addToast]);

  // Handle search
  const filteredData = data.filter((item) => {
    const title = item.title ? item.title.toLowerCase() : "";
    const category = item.category ? item.category.toLowerCase() : "";
    const subcategory = item.subcategory ? item.subcategory.toLowerCase() : "";
    const query = searchQuery.toLowerCase();

    return (
      title.includes(query) ||
      category.includes(query) ||
      subcategory.includes(query)
    );
  });

  // Open modal for adding new game
  const openAddModal = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setFormData({
      title: "",
      category: "",
      subcategory: "",
      image: "/Uploads/images/default.png",
      link: "",
      isActive: true,
    });
  };

  // Open modal for editing game
  const openEditModal = (item) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setEditId(item._id);
    setFormData({
      title: item.title || "",
      category: item.category || "",
      subcategory: item.subcategory || "",
      image: item.image || "/Uploads/images/default.png",
      link: item.link || "",
      isActive: item.isActive || false,
    });
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      // Reset subcategory when category changes
      if (name === "category") {
        newFormData.subcategory = "";
      }
      return newFormData;
    });
  };

  // Handle file upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/upload`,
        {
          method: "POST",
          body: uploadFormData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await response.json();
      setFormData({ ...formData, image: result.filePath });
      addToast("Image uploaded successfully", { appearance: "success" });
    } catch (error) {
      console.error("Error uploading image:", error);
      addToast("Failed to upload image", { appearance: "error" });
    }
  };

  // Handle form submit (Add or Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditMode
        ? `${import.meta.env.VITE_BASE_API_URL}/game-name/${editId}`
        : `${import.meta.env.VITE_BASE_API_URL}/game-name`;
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          createdAt: isEditMode ? undefined : new Date(),
          updatedAt: isEditMode ? new Date() : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? "update" : "add"} game`);
      }

      const result = await response.json();
      if (isEditMode) {
        setData(data.map((item) => (item._id === editId ? result : item)));
        addToast("Game updated successfully", { appearance: "success" });
      } else {
        setData([result, ...data]);
        addToast("Game added successfully", { appearance: "success" });
      }

      setIsModalOpen(false);
      setFormData({
        title: "",
        category: "",
        subcategory: "",
        image: "/Uploads/images/default.png",
        link: "",
        isActive: true,
      });
      setEditId(null);
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "adding"} game:`, error);
      addToast(`Failed to ${isEditMode ? "update" : "add"} game`, {
        appearance: "error" });
    }
  };

  // Handle delete game
  const handleDeleteGame = async (id) => {
    if (!window.confirm("Are you sure you want to delete this game?")) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/game-name/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete game");
      }

      setData(data.filter((item) => item._id !== id));
      addToast("Game deleted successfully", { appearance: "success" });
    } catch (error) {
      console.error("Error deleting game:", error);
      addToast("Failed to delete game", { appearance: "error" });
    }
  };

  // Get subcategories based on selected category
  const getSubcategories = (selectedCategory) => {
    if (!selectedCategory) return [];
    const subcategories = categories
      .filter((cat) => cat.category === selectedCategory && cat.subcategory)
      .map((cat) => cat.subcategory);
    console.log(`Subcategories for ${selectedCategory}:`, subcategories); // Debug: Check subcategories
    return [...new Set(subcategories)]; // Remove duplicates
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-[#222222] flex flex-col md:flex-row items-start md:items-center justify-between p-4 mb-2">
        <div className="flex flex-row items-start justify-between w-full mb-4 md:mb-0">
          <h1 className="text-2xl text-white font-bold">Game Names</h1>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 transition-all ease-in-out duration-300 text-black py-2 px-4 rounded md:w-2/5 block md:hidden whitespace-nowrap"
            onClick={openAddModal}
          >
            Add Game
          </button>
        </div>

        <div className="flex w-1/2 gap-4">
          <form className="md:w-3/5 hidden md:flex flex-row items-center">
            <input
              type="text"
              placeholder="Search Title, Category, or Subcategory..."
              className="py-2 px-1 w-full outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="bg-white p-3">
              <IoIosSearch />
            </button>
          </form>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 transition-all ease-in-out duration-300 text-black py-2 px-4 rounded md:w-2/5 hidden md:block whitespace-nowrap"
            onClick={openAddModal}
          >
            Add Game
          </button>
        </div>
        <form className="w-full flex flex-row items-center md:hidden">
          <input
            type="text"
            placeholder="Search Title, Category, or Subcategory..."
            className="py-2 px-1 w-full outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="bg-white p-3">
            <IoIosSearch />
          </button>
        </form>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {isEditMode ? "Edit Game" : "Add New Game"}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded"
                  placeholder="Enter game title"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded"
                  required
                >
                  <option value="">Select Category</option>
                  {[...new Set(categories.map((cat) => cat.category))].map(
                    (category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Subcategory
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded"
                  required
                  disabled={!formData.category}
                >
                  <option value="">Select Subcategory</option>
                  {getSubcategories(formData.category).map((subcat, index) => (
                    <option key={index} value={subcat}>
                      {subcat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 p-2 w-full border rounded"
                  required={!isEditMode}
                />
                {formData.image && (
                  <img
                    src={`${import.meta.env.VITE_BASE_API_URL}${formData.image}`}
                    alt="Preview"
                    className="mt-2 w-24 h-24 object-cover"
                  />
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Link
                </label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded"
                  placeholder="Enter game link"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded"
                >
                  {isEditMode ? "Update" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-[#3b3b3b] text-center">
          <thead>
            <tr className="bg-[#3b3b3b] text-white">
              <th className="px-4 py-2 whitespace-nowrap">Image</th>
              <th className="px-4 py-2 whitespace-nowrap">Title</th>
              <th className="px-4 py-2 whitespace-nowrap">Category</th>
              <th className="px-4 py-2 whitespace-nowrap">Subcategory</th>
              <th className="px-4 py-2 whitespace-nowrap">Link</th>
              <th className="px-4 py-2 whitespace-nowrap">Active</th>
              <th className="px-4 py-2 whitespace-nowrap">Created At</th>
              <th className="px-4 py-2 whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-500">
                  No games found.
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr
                  key={item._id}
                  className={`${
                    index % 2 === 0 ? "bg-gray-100" : "bg-[#cacaca]"
                  } text-black`}
                >
                  <td className="px-4 py-2 whitespace-nowrap">
                    <img
                      src={`${import.meta.env.VITE_BASE_API_URL}${item.image}`}
                      alt={item.title || "Game"}
                      className="w-16 h-16 object-cover mx-auto"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {item.title || "N/A"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {item.category || "N/A"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {item.subcategory || "N/A"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Play

                    </a>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {item.isActive ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 transition-all ease-in-out duration-300 text-white py-1 px-3 rounded mr-2"
                      onClick={() => openEditModal(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 transition-all ease-in-out duration-300 text-white py-1 px-3 rounded"
                      onClick={() => handleDeleteGame(item._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GameName;