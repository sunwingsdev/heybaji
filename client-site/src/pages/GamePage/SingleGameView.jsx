import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToasts } from "react-toast-notifications";

export default function SingleGameView() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToasts();

  // Fetch game data
  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/game-name/game/category/${gameId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch game");
        }

        const data = await response.json();
        console.log("Fetched game:", JSON.stringify(data, null, 2)); // Debug
        setGame(data);
      } catch (err) {
        setError(err.message);
        addToast(err.message, { appearance: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId, addToast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-red-500 text-xl">Game not found or failed to load.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          {game.name}
        </h1>
        <div className="mb-6">
          {game.link ? (
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={game.link}
                title={game.name}
                className="absolute top-0 left-0 w-full h-full border-0 rounded-lg"
                allowFullScreen
                allow="autoplay; encrypted-media"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              ></iframe>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-lg">No game URL available.</p>
            </div>
          )}
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row gap-4">
            {game.image ? (
              <img
                src={`${import.meta.env.VITE_BASE_API_URL}${game.image}`}
                alt={game.title}
                className="w-full md:w-40 h-40 object-cover rounded-md"
              //  onError={(e) => (e.target.src = "/Uploads/images/default.png")}
              />
            ) : (
              <div className="w-full md:w-40 h-40 bg-gray-700 rounded-md flex items-center justify-center">
                <p className="text-gray-400 text-xs">No Thumbnail</p>
              </div>
            )}
            <div className="text-white">
              <p className="text-lg font-semibold">
                <strong>Category:</strong> {game.category || "Unknown"}
              </p>
              <p className="text-lg">
                <strong>Subcategory:</strong> {game.subcategory || "Unknown"}
              </p>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}