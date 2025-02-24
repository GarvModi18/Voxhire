import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DefaultProfile from "../icons/default-profile.png"; // ✅ Fallback profile image

interface SidebarProps {
  setActiveTab: (tab: string) => void;
  activeTab: string;
}

export default function Sidebar({ setActiveTab, activeTab }: SidebarProps) {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<{
    name: string;
    profilePic: string;
  } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setAdmin(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="w-72 bg-gray-800 text-white min-h-screen p-6 shadow-lg flex flex-col justify-between border-r border-gray-700">
      {/* ✅ Admin Profile Section */}
      <div>
        <h2 className="text-3xl font-bold mb-4 text-yellow-400">
          Admin Dashboard
        </h2>

        <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-700 shadow-md rounded-lg">
          <img
            src={admin?.profilePic || DefaultProfile}
            alt="Admin Profile"
            className="w-14 h-14 rounded-full border-4 border-yellow-400"
          />
          <p className="font-semibold text-white">{admin?.name || "Admin"}</p>
        </div>

        {/* ✅ Navigation Menu */}
        <nav>
          <ul className="space-y-3">
            {[
              "create-interview",
              "interview-list",
              "candidate-reports",
              "admin-statistics",
              "manage-admins",
            ].map((tab) => (
              <li key={tab}>
                <button
                  className={`block w-full text-left hover:bg-gray-600 p-3 rounded-lg transition ${
                    activeTab === tab
                      ? "bg-gray-600 text-yellow-400 font-bold"
                      : ""
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* ✅ Logout Button at Bottom */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-600 text-white py-3 rounded-lg mt-6 shadow-md hover:bg-red-500 transition"
      >
        Logout
      </button>
    </aside>
  );
}
