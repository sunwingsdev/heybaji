import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

const GameCard = ({ imageUrl, title, link }) => {
    const { addToast } = useToasts();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const handleCardClick = (e) => {
    e.preventDefault(); // Prevent default Link behavior
    if (!user && !token) {
      addToast("Please login to access this page", {
        appearance: "error",
        autoDismiss: true,
      });
    } else {
      navigate(link);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative max-w-xs rounded overflow-hidden shadow-lg bg-gray-800 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative w-full h-full overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      {/* Text Content */}
      <h2 className="py-1 px-3 text-base text-white bg-SidebarBg">{title}</h2>
    </div>
  );
};

export default GameCard;