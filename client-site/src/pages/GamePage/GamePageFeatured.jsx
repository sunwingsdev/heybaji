import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToasts } from "react-toast-notifications";

export default function GamePageFeatured() {
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
          `${import.meta.env.VITE_BASE_API_URL}/game-name/game/featured/${gameId}`,
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
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">{game.name}</h1>
        <div className="relative w-full" style={{ paddingBottom: "56.25%" /* 16:9 aspect ratio */ }}>
          <iframe
            src={game.link}
            title={game.name}
            className="absolute top-0 left-0 w-full h-full border-0"
            allowFullScreen
            allow="autoplay; encrypted-media"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          ></iframe>
        </div>
   
      </div>
    </div>
  );
}