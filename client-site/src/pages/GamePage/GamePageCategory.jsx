import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useToasts } from "react-toast-notifications";

export default function GamePageCategory() {
  const { subCategoryName } = useParams();
  const [mainCategory, setMainCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [games, setGames] = useState([]);
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToasts();
  const navigate = useNavigate();


    // Access user data from redux store
   const {user , token} = useSelector((state) => state?.auth);


  // Decode subcategory
  const decodedSubcategory = decodeURIComponent(subCategoryName);

  // Fetch main category, subcategories, and category details
  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch main category and subcategories
        const categoryResponse = await fetch(
          `${
            import.meta.env.VITE_BASE_API_URL
          }/game-main-categories/subcategory/${encodeURIComponent(decodedSubcategory)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!categoryResponse.ok) {
          throw new Error("Failed to fetch category data");
        }

        const categoryData = await categoryResponse.json();
      //  console.log("Fetched category data:", JSON.stringify(categoryData, null, 2)); // Debug
        setMainCategory(categoryData.mainCategory || null);
        setSubcategories(
          Array.isArray(categoryData.subcategories)
            ? categoryData.subcategories.map((subcat) => subcat.name)
            : []
        );
        // Set active subcategory to URL subcategory
        const initialSubcat = categoryData.subcategories.find(
          (subcat) => subcat.name.toLowerCase() === decodedSubcategory.toLowerCase()
        );
        setActiveSubcategory(initialSubcat ? initialSubcat.name : categoryData.subcategories[0]?.name);

        // Fetch category details
        if (categoryData.mainCategory) {
          const detailsResponse = await fetch(
            `${import.meta.env.VITE_BASE_API_URL}/game-main-categories/category-details`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!detailsResponse.ok) {
            throw new Error("Failed to fetch category details");
          }

          const detailsData = await detailsResponse.json();
          //console.log("Fetched category details:", JSON.stringify(detailsData, null, 2)); // Debug
          const matchedDetail = detailsData.find(
            (detail) => detail.category.toUpperCase() === categoryData?.mainCategory?.toUpperCase()
          );
          setCategoryDetails(matchedDetail || null);

      //    console.log( " matchedDetail",matchedDetail , "categoryData ",categoryData , "detailsData ",detailsData);
          

        }
      } catch (err) {
        setError(err.message);
        addToast("Error fetching data", { appearance: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [decodedSubcategory, addToast]);

  // Fetch games for active subcategory
  useEffect(() => {
    if (!activeSubcategory) return;

    const fetchGames = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_BASE_API_URL
          }/game-name/games/subcategory/${encodeURIComponent(activeSubcategory)}`,
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

        const data = await response.json();
     //   console.log("Fetched games:", JSON.stringify(data, null, 2)); // Debug
        setGames(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        addToast("Error fetching games", { appearance: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [activeSubcategory, addToast]);

  // Handle subcategory click
  const handleSubcategoryClick = (subcatName) => {
    setActiveSubcategory(subcatName);
    navigate(`/game/category/${encodeURIComponent(subcatName)}`);
  };

  // Handle game click
  const handleGameClick = (game) => {
      if (!user && !token) {
      addToast("Please login to play this game", {
        appearance: "error",
        autoDismiss: true,
      });
    } else  {
     navigate(`/game/GameView/${game._id}`);
    }

   // navigate(`/game/GameView/${game._id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  if (error || !mainCategory || subcategories.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-red-500 text-xl">
          {error || "No games or subcategories found for this category."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Banner Section */}
        <div
          className="relative w-full h-48 rounded-lg mb-6 overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: categoryDetails?.gamePageBanner
              ? `url(${import.meta.env.VITE_BASE_API_URL}${categoryDetails.gamePageBanner})`
              : "url()",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center">
            <div className="pl-6">
              {categoryDetails?.gamePageBannerTitle && (
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {categoryDetails.gamePageBannerTitle}
                </h2>
              )}
              {categoryDetails?.gamePageAmount && (
                <p className="text-lg md:text-xl text-gray-200 mt-2">
                  {categoryDetails.gamePageAmount}
                </p>
              )}
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          {mainCategory} Games
        </h1>
        {/* Subcategory Tabs */}
        <div className="flex bg-gray-800 rounded-lg overflow-x-auto mb-6 shadow-md">
          {subcategories.map((subcatName) => (
            <button
              key={subcatName}
              onClick={() => handleSubcategoryClick(subcatName)}
              className={`min-w-[120px] text-center py-3 px-4 text-sm font-semibold cursor-pointer transition-all duration-200 ${
                activeSubcategory === subcatName
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <p className="whitespace-nowrap">{subcatName}</p>
            </button>
          ))}
        </div>
        {/* Games Grid */}
        <div>
          <div className="py-2 mb-4">
            <p className="text-base font-semibold text-start text-white border-l-4 border-blue-600 pl-2">
              {activeSubcategory}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {games.map((game) => (
              <div
                key={game._id}
                onClick={() =>{
                  
                  handleGameClick(game)}
                
                }
                className="bg-gray-800 p-3 rounded-lg text-center cursor-pointer hover:bg-gray-700 transition-all duration-200"
              >
                {game.image ? (
                  <img
                    src={`${import.meta.env.VITE_BASE_API_URL}${game.image}`}
                    alt={game.name}
                    className="w-full h-24 object-cover rounded-md mb-2"
                    onError={(e) => (e.target.src = "")}
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-700 rounded-md mb-2 flex items-center justify-center">
                    <p className="text-gray-400 text-xs">No Thumbnail</p>
                  </div>
                )}
                <p className="text-white text-sm font-semibold truncate">
                  {game.title}
                </p>
                <p className="text-gray-400 text-xs">{game.category || "Unknown"}</p>
              </div>
            ))}
            {games.length === 0 && (
              <p className="col-span-2 sm:col-span-3 text-center text-gray-400">
                No games available for {activeSubcategory}.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}