import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
import OppsModal from "../../shared/modal/OppsModal";
import { useNavigate } from "react-router-dom";

const MenuBar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState(null); // Initially null until data is fetched
  const [menuItems, setMenuItems] = useState([]);
  const { addToast } = useToasts();
  const navigate = useNavigate();

  // Fetch menu data from backend
  useEffect(() => {
    const fetchMenuData = async () => {
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
          throw new Error("Failed to fetch menu data");
        }

        const data = await response.json();
        console.log("Fetched menu data:", JSON.stringify(data, null, 2)); // Debug

        // Group by category and collect order
        const categoryMap = data.reduce((acc, item) => {
          const { category, subcategory, image, submenuIcon, _id, order, createdAt } = item;
          const upperCategory = category.toUpperCase(); // Normalize case
          if (!acc[upperCategory]) {
            acc[upperCategory] = {
              name: upperCategory,
              icon: image || "/Uploads/images/default.png",
              order: order || 999, // Use order from DB
              subItems: [],
            };
          }
          if (subcategory) {
            acc[upperCategory].subItems.push({
              id: acc[upperCategory].subItems.length + 1,
              name: subcategory,
              icon: submenuIcon || "/Uploads/images/default.png",
              demo: null, // Add demo URL if available
              createdAt: createdAt || new Date(), // For sorting subItems
            });
          }
          return acc;
        }, {});

        // Convert to array and sort by order
        const transformedMenuItems = Object.values(categoryMap)
          .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)) // Sort by order, then name
          .map((categoryData, index) => ({
            id: index + 1, // Assign ID based on sorted order
            name: categoryData.name,
            icon: categoryData.icon,
            subItems: categoryData.subItems.sort((a, b) =>
              new Date(a.createdAt) - new Date(b.createdAt)
            ), // Sort subItems by createdAt
          }));

        console.log("Transformed menu items:", JSON.stringify(transformedMenuItems, null, 2)); // Debug
        setMenuItems(transformedMenuItems);
        setActiveTab(transformedMenuItems[0]?.id || null); // Set first tab as active
      } catch (error) {
        console.error("Error fetching menu data:", error);
        addToast("Failed to load menu data", { appearance: "error" });
      }
    };

    fetchMenuData();
  }, [addToast]);

  const handleMenuClick = (subItem) => {
    if (!user && !token) {
      
      

     addToast("Please login to play this game", { appearance: "error" });
      return;
    }
    if (subItem.demo) {
      navigate(subItem.demo);
    } else {
   
        navigate(`/game/category/${subItem}`);

    }
  };

  return (
    <>
      <div>
        {/* Menu Bar */}
        <div className="menu-container flex bg-MenuBarBg overflow-x-auto">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-[90px] text-center py-3 px-3 md:px-5 text-xs font-semibold cursor-pointer ${
                activeTab === item.id ? "bg-gameMenuBgActive" : "text-white"
              }`}
            >
              <div className="tab-content">
                <img
                  className="w-8 m-auto text-black bg-white rounded-full"
                  src={`${import.meta.env.VITE_BASE_API_URL}${item.icon}`}
                  alt={item.name}
                  onError={(e) => (e.target.src = "/Uploads/images/default.png")} // Fallback image
                />
                <p className="mt-0.5 text-white whitespace-nowrap">{item.name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Content Section */}
        {menuItems
          .filter((item) => item.id === activeTab)
          .map((item) => (
            <div key={item.id} className="px-4 md:px-0">
              <div className="py-2 text-center text-footerTextColor">
                <p className="text-sm font-semibold text-start border-l-4 border-footerTextColor pl-2">
                  {item.name}
                </p>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-1">
                {item.subItems.map((subItem) => (
                  <div
                    onClick={() => handleMenuClick(subItem.name)}
                    key={subItem.id}
                    className="text-center py-3 px-1.5 bg-SidebarBg cursor-pointer"
                  >
                    {subItem.icon && (
                      <img
                        className="w-6 lg:w-10 h-6 lg:h-10 mx-auto"
                        src={`${import.meta.env.VITE_BASE_API_URL}${subItem.icon}`}
                        alt={subItem.name}
                        onError={(e) => (e.target.src = "/Uploads/images/default.png")} // Fallback image
                      />
                    )}
                    <p className="mt-1 text-xs lg:text-sm font-semibold text-white whitespace-nowrap truncate">
                      {subItem.name}
                    </p>
                  </div>
                ))}
                {item.subItems.length === 0 && (
                  <p className="col-span-3 md:col-span-4 text-center text-gray-400">
                    No subcategories available.
                  </p>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Modal */}
      <OppsModal
        isOpen={isModalOpen}
        onOpenChange={() => setIsModalOpen(false)}
        title="Opps!"
      >
        <p>Please contact your developer team to connect API!!!</p>
      </OppsModal>
    </>
  );
};

export default MenuBar;