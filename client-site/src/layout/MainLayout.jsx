import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import Footer from "../components/shared/footer/Footer";
import Navbar from './../components/shared/navbar/Navbar';
import SidebarMenu from "../components/shared/sidebarMenu/SidebarMenu";
import { IoIosCloseCircle } from "react-icons/io";
import sticker from "../assets/sticker.gif";

const MainLayout = () => {
  const [open, setOpen] = useState(false);
  const [isStickerOpen, setIsStickerOpen] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToasts();

  // Static menu items (non-dynamic)
  const staticMenuItems = [
    {
      name: "হোম",
      icon: "https://img.d4040p.com/dp/h5/assets/images/icon-set/theme-icon/icon-home.png?v=1737700451320",
      path: "/",
      submenu: [],
    },
    {
      name: "প্রোমোশন",
      icon: "https://img.d4040p.com/dp/h5/assets/images/icon-set/theme-icon/icon-promotion.png?v=1737700451320",
      path: "/promotion",
      submenu: [],
    },
    {
      name: "রেফার বোনাস",
      icon: "https://img.d4040p.com/dp/h5/assets/images/icon-set/theme-icon/icon-referral.png?v=1737700451320",
      submenu: [],
    },
    {
      name: "ডাউনলোড",
      icon: "https://img.d4040p.com/dp/h5/assets/images/icon-set/theme-icon/icon-download.png?v=1737700451320",
      submenu: [],
    },
    {
      name: "যোগাযোগ",
      icon: "https://img.d4040p.com/dp/h5/assets/images/icon-set/theme-icon/icon-talk.png?v=1737700451320",
      submenu: [
        {
          name: "Telegram Support",
          icon: "https://img.d4040p.com/dp/h5/assets/images/icon-set/theme-icon/icon-telegram.png?v=1735560346274",
        },
        {
          name: "Live Chat",
          icon: "https://img.d4040p.com/dp/h5/assets/images/icon-set/theme-icon/icon-customer.png?v=1735560346274",
        },
        {
          name: "Messenger",
          icon: "https://img.d4040p.com/dp/h5/assets/images/icon-set/theme-icon/icon-facebook-messenger.png?v=1735560346274",
        },
        {
          name: "Email",
          icon: "https://img.d4040p.com/dp/h5/assets/images/icon-set/theme-icon/icon-email.png?v=1737700451320",
        },
      ],
    },
  ];

  // Fetch dynamic menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
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
          throw new Error("Failed to fetch menu items");
        }

        const data = await response.json();
        // console.log("Fetched menu data:", JSON.stringify(data, null, 2)); // Debug

        // Transform data to menuItems structure
        const dynamicMenu = Object.values(
          data.reduce((acc, item) => {
            const category = item.category || "Unknown";
            const subcategory = item.subcategory || null;
            if (!acc[category]) {
              acc[category] = {
                name: category,
                icon:
                  item.image ||
                  "https://img.d4040p.com/dp/h5/assets/images/icon-set/theme-icon/icon-default.png",
                submenu: [],
              };
            }
            if (subcategory) {
              acc[category].submenu.push({
                name: subcategory,
                icon:
                  item.submenuIcon ||
                  "https://img.d4040p.com/dp/h5/assets/images/icon-set/theme-icon/icon-subdefault.png",
                path: `/game/category/${encodeURIComponent(subcategory)}`,
              });
            }
            return acc;
          }, {})
        );

        // Sort categories and subcategories by order
        dynamicMenu.forEach((category) => {
          category.submenu.sort((a, b) => {
            const orderA = data.find(
              (item) => item.category === category.name && item.subcategory === a.name
            )?.order || 0;
            const orderB = data.find(
              (item) => item.category === category.name && item.subcategory === b.name
            )?.order || 0;
            return orderA - orderB || a.name.localeCompare(b.name);
          });
        });
        dynamicMenu.sort((a, b) => {
          const orderA = data.find((item) => item.category === a.name)?.order || 0;
          const orderB = data.find((item) => item.category === b.name)?.order || 0;
          return orderA - orderB || a.name.localeCompare(b.name);
        });

        // Combine static and dynamic menu items
        setMenuItems([...staticMenuItems, ...dynamicMenu]);
      } catch (err) {
        console.error("Error fetching menu items:", err);
        addToast("Failed to load menu items", { appearance: "error" });
        // Fallback to static items
        setMenuItems(staticMenuItems);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-SiteBg">
        <p className="text-white text-xl">Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="flex relative">
      {/* Sidebar */}
      <SidebarMenu open={open} setOpen={setOpen} menuItems={menuItems} />

      {/* Content Area */}
      <div
        className={`flex-1 h-screen overflow-y-auto duration-300 ${
          !open ? "md:pl-16" : "md:pl-64"
        }`}
      >
        <Navbar open={open} setOpen={setOpen} menuItems={menuItems} />
        <div className="mt-[62px] md:mt-16 md:px-4 bg-SiteBg">
          <Outlet />
          <Footer />
        </div>
      </div>

      {/* Sticker */}
      {isStickerOpen && (
        <div className="absolute bottom-11 md:bottom-3 left-2 md:left-8 z-50">
          <div className="flex justify-end">
            <button
              onClick={() => setIsStickerOpen(false)}
              className="text-white text-xl md:text-2xl"
            >
              <IoIosCloseCircle />
            </button>
          </div>
          <img className="w-24 md:w-40" src={sticker} alt="Sticker" />
        </div>
      )}
    </div>
  );
};

export default MainLayout;