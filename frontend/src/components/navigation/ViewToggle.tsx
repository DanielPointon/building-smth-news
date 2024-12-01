import { useNavigate, useLocation } from "react-router-dom";

export const ViewToggle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isArticlesView = location.pathname === "/articles";

  return (
    <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
      <button
        onClick={() => navigate("/")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          !isArticlesView
            ? "bg-[rgb(242,223,206)] text-[rgb(38,42,51)]"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Browse
      </button>
      <button
        onClick={() => navigate("/articles")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isArticlesView
            ? "bg-[rgb(242,223,206)] text-[rgb(38,42,51)]"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Articles
      </button>
    </div>
  );
};
