import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { useToasts } from "react-toast-notifications";
import { ReactSortable } from "react-sortablejs";

const GameCategories = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    image: "/Uploads/images/default-image.png",
    category: "CASINO",
    subcategory: "",
    submenuIcon: "/Uploads/images/default-icon.png",
  });
  const [editId, setEditId] = useState(null);
  const [imageLoading, setImageLoading] = useState({
    image: false,
    submenuIcon: false,
  });
  const { addToast } = useToasts();

  // Valid categories for dropdown
  const validCategories = [
    "SLOTS",
    "SPORTS",
    "CRASH",
    "CASINO",
    "TABLE",
    "LOTTERY",
    "FISHING",
    "ARCADE",
  ];

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/game-main-categories`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch game main categories");
        }

        const result = await response.json();
        console.log("Fetched data:", JSON.stringify(result, null, 2)); // Debug
        setData(result);

        // Extract unique categories with order
        const categoriesMap = new Map();
        result.forEach((item) => {
          const category = item.category.toUpperCase();
          if (!categoriesMap.has(category)) {
            categoriesMap.set(category, {
              id: category,
              category: category,
              order: item.order || 999,
            });
          }
        });
        const uniqueCategories = [...categoriesMap.values()].sort(
          (a, b) => a.order - b.order || a.category.localeCompare(b.category)
        );
        console.log("Unique categories:", JSON.stringify(uniqueCategories, null, 2)); // Debug
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching game categories:", error);
        addToast("Failed to fetch game categories", { appearance: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [addToast]);

  // Handle sortable list update
  const handleSort = async (newList) => {
    if (!newList || newList.length === 0) {
      addToast("No categories to reorder", { appearance: "error" });
      return;
    }

    const updatedCategories = newList.map((cat, index) => ({
      id: cat.id,
      category: cat.category.toUpperCase(),
      order: index + 1,
    }));

    console.log("Prepared categories:", JSON.stringify(updatedCategories, null, 2));
    setCategories(updatedCategories);

    try {
      const payload = {
        categories: updatedCategories.map(({ category, order }) => ({
          category,
          order,
        })),
      };

      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/game-main-categories/reorder`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();
      console.log("Reorder response:", JSON.stringify(responseData, null, 2));

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to reorder categories");
      }

      // Update and sort the local data
      setData((prevData) =>
        prevData
          .map((item) => {
            const updatedCat = updatedCategories.find(
              (cat) => cat.category === item.category.toUpperCase()
            );
            return updatedCat ? { ...item, order: updatedCat.order } : item;
          })
          .sort((a, b) => a.order - b.order || a.category.localeCompare(b.category))
      );

      addToast("Categories reordered successfully", { appearance: "success" });
    } catch (error) {
      console.error("Error reordering categories:", error);
      addToast(error.message || "Failed to reorder categories", { appearance: "error" });
    }
  };

  // Handle search
  const filteredData = data.filter((item) => {
    const category = item.category ? item.category.toLowerCase() : "";
    const subcategory = item.subcategory ? item.subcategory.toLowerCase() : "";
    const query = searchQuery.toLowerCase();
    return category.includes(query) || subcategory.includes(query);
  });

  // Open modal for adding new category
  const openAddModal = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setFormData({
      image: "/Uploads/images/default-image.png",
      category: "CASINO",
      subcategory: "",
      submenuIcon: "/Uploads/images/default-icon.png",
    });
    setEditId(null);
    setImageLoading({ image: false, submenuIcon: false });
  };

  // Open modal for editing category
  const openEditModal = (item) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setEditId(item._id);
    setFormData({
      image: item.image || "/Uploads/images/default-image.png",
      category: item.category || "CASINO",
      subcategory: item.subcategory || "",
      submenuIcon: item.submenuIcon || "/Uploads/images/default-icon.png",
    });
    setImageLoading({ image: false, submenuIcon: false });
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file upload
  const handleFileChange = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageLoading((prev) => ({ ...prev, [field]: true }));

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
        throw new Error(`Failed to upload ${field}`);
      }

      const result = await response.json();
      setFormData((prev) => ({ ...prev, [field]: result.filePath }));
      addToast(`${field === "image" ? "Image" : "Submenu Icon"} uploaded successfully`, {
        appearance: "success",
      });
    } catch (error) {
      console.error(`Error uploading ${field}:`, error);
      addToast(`Failed to upload ${field}`, { appearance: "error" });
    } finally {
      setImageLoading((prev) => ({ ...prev, [field]: false }));
    }
  };

  // Handle form submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditMode
        ? `${import.meta.env.VITE_BASE_API_URL}/game-main-categories/${editId}`
        : `${import.meta.env.VITE_BASE_API_URL}/game-main-categories`;
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          createdAt: isEditMode ? undefined : new Date(),
          updatedAt: isEditMode ? new Date() : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? "update" : "add"} category`);
      }

      const result = await response.json();
      if (isEditMode) {
        setData((prev) => prev.map((item) => (item._id === editId ? result : item)));
        addToast("Category updated successfully", { appearance: "success" });
      } else {
        setData((prev) => [result, ...prev]);
        addToast("Category added successfully", { appearance: "success" });
      }

      // Update categories list if new category added
      if (!isEditMode && !categories.find((cat) => cat.category === result.category)) {
        setCategories((prev) => [
          ...prev,
          { id: result.category, category: result.category, order: result.order || prev.length + 1 },
        ]);
      }

      setIsModalOpen(false);
      setFormData({
        image: "/Uploads/images/default-image.png",
        category: "CASINO",
        subcategory: "",
        submenuIcon: "/Uploads/images/default-icon.png",
      });
      setEditId(null);
      setImageLoading({ image: false, submenuIcon: false });
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "adding"} category:`, error);
      addToast(`Failed to ${isEditMode ? "update" : "add"} category`, { appearance: "error" });
    }
  };

  // Handle delete category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/game-main-categories/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      const deletedItem = data.find((item) => item._id === id);
      setData((prev) => prev.filter((item) => item._id !== id));
      // Remove category from reorder list if no subcategories remain
      if (!data.some((item) => item.category === deletedItem.category && item._id !== id)) {
        setCategories((prev) => prev.filter((cat) => cat.category !== deletedItem.category));
      }
      addToast("Category deleted successfully", { appearance: "success" });
    } catch (error) {
      console.error("Error deleting category:", error);
      addToast("Failed to delete category", { appearance: "error" });
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-[#222222] flex flex-col md:flex-row items-start md:items-center justify-between p-4 mb-4 rounded">
        <div className="flex flex-row items-center justify-between w-full mb-4 md:mb-0">
          <h1 className="text-2xl font-bold">Game Main Categories</h1>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 transition text-black py-2 px-4 rounded md:w-2/5 block md:hidden whitespace-nowrap"
            onClick={openAddModal}
          >
            Add New Category
          </button>
        </div>
        <div className="flex w-full md:w-1/2 gap-4">
          <form className="w-full md:w-3/5 hidden md:flex flex-row items-center">
            <input
              type="text"
              placeholder="Search Category or Subcategory..."
              className="py-2 px-4 w-full rounded-md outline-none bg-gray-800 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="bg-white p-3 rounded-md ml-2">
              <IoIosSearch />
            </button>
          </form>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 transition text-black py-2 px-4 rounded md:w-2/5 hidden md:block whitespace-nowrap"
            onClick={openAddModal}
          >
            Add New Category
          </button>
        </div>
        <form className="w-full flex flex-row items-center md:hidden mt-4">
          <input
            type="text"
            placeholder="Search Category or Subcategory..."
            className="py-2 px-4 w-full rounded-md outline-none bg-gray-800 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="bg-white p-3 rounded-md ml-2">
            <IoIosSearch />
          </button>
        </form>
      </div>

      {/* Reorder Categories Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Reorder Categories</h2>
        <div className="bg-[#222222] p-4 rounded-md min-h-[100px]">
          {categories.length === 0 ? (
            <p className="text-gray-400">No categories available.</p>
          ) : (
            <ReactSortable
              list={categories}
              setList={handleSort}
              animation={200}
              handle=".drag-handle"
              className="flex flex-col gap-2"
            >
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="p-3 rounded bg-[#333333] text-white flex items-center justify-between cursor-move hover:bg-[#444444] transition"
                >
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-gray-400 drag-handle"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8h16M4 16h16"
                      />
                    </svg>
                    <span>{category.category}</span>
                  </div>
                  <span className="text-sm text-gray-400">
                    Order: {category.order}
                  </span>
                </div>
              ))}
            </ReactSortable>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md text-white">
            <h2 className="text-xl font-bold mb-4">
              {isEditMode ? "Edit Category" : "Add New Category"}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "image")}
                  className="mt-1 p-2 w-full border rounded-md bg-gray-700 text-white border-gray-600"
                  required={!isEditMode}
                />
                {formData.image && !imageLoading.image ? (
                  <img
                    src={`${import.meta.env.VITE_BASE_API_URL}${formData.image}`}
                    alt="Preview"
                    className="mt-2 w-24 h-24 object-cover"
                    // onError={(e) => {
                    //   e.target.src = "/Uploads/images/default-image.png";
                    //   e.target.onerror = null;
                    // }}
                  />
                ) : (
                  <p className="mt-2 text-gray-400">
                    {imageLoading.image ? "Loading..." : "No image selected"}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300">
                  Submenu Icon
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "submenuIcon")}
                  className="mt-1 p-2 w-full border rounded-md bg-gray-700 text-white border-gray-600"
                />
                {formData.submenuIcon && !imageLoading.submenuIcon ? (
                  <img
                    src={`${import.meta.env.VITE_BASE_API_URL}${formData.submenuIcon}`}
                    alt="Submenu Icon Preview"
                    className="mt-2 w-24 h-24 object-cover"
                    // onError={(e) => {
                    //   e.target.src = "/Uploads/images/default-icon.png";
                    //   e.target.onerror = null;
                    // }}
                  />
                ) : (
                  <p className="mt-2 text-gray-400">
                    {imageLoading.submenuIcon ? "Loading..." : "No submenu icon selected"}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded-md bg-gray-700 text-white border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                >
                  {validCategories.map((cat) => (
                    <option key={cat} value={cat} className="bg-gray-700 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300">
                  Subcategory
                </label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border rounded-md bg-gray-700 text-white border-gray-600"
                  placeholder="Enter subcategory"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded-md"
                >
                  {isEditMode ? "Update" : "Add"}
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
              <th className="px-4 py-2 whitespace-nowrap">Submenu Icon</th>
              <th className="px-4 py-2 whitespace-nowrap">Category</th>
              <th className="px-4 py-2 whitespace-nowrap">Subcategory</th>
              <th className="px-4 py-2 whitespace-nowrap">Created At</th>
              <th className="px-4 py-2 whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-400">
                  No game main categories found.
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr
                  key={item._id}
                  className={`${index % 2 === 0 ? "bg-gray-100" : "bg-[#cacaca]"} text-black`}
                >
                  <td className="px-4 py-2 whitespace-nowrap">
                    <img
                      src={`${import.meta.env.VITE_BASE_API_URL}${item.image}`}
                      alt="Category"
                      className="w-16 h-16 object-cover mx-auto"
                      onError={(e) => {
                        e.target.src = "/Uploads/images/default-image.png";
                        e.target.onerror = null;
                      }}
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <img
                      src={`${import.meta.env.VITE_BASE_API_URL}${
                        item.submenuIcon || "/Uploads/images/default-icon.png"
                      }`}
                      alt="Submenu Icon"
                      className="w-16 h-16 object-cover mx-auto"
                      onError={(e) => {
                        e.target.src = "/Uploads/images/default-icon.png";
                        e.target.onerror = null;
                      }}
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{item.category || "N/A"}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{item.subcategory || "N/A"}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 transition text-white py-1 px-3 rounded mr-2"
                      onClick={() => openEditModal(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 transition text-white py-1 px-3 rounded"
                      onClick={() => handleDeleteCategory(item._id)}
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

export default GameCategories;