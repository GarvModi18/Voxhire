import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircleUser } from "lucide-react";

interface SidebarProps {
  setActiveTab: (tab: string) => void;
  activeTab: string;
}

const UserIcon = () => {
  return (
    <CircleUser
      color="#023047"
      className="w-14 h-14 text-primary"
      strokeWidth={1.5}
    />
  );
};
export default function Sidebar({ setActiveTab, activeTab }: SidebarProps) {
  const navigate = useNavigate();
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setAdmin(JSON.parse(storedUser));
    }
  }, []);
  const [admin, setAdmin] = useState<{
    name: string;
    profilePic: string;
  } | null>(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setAdmin({
          name: userData.name || userData.username || "Admin",
          profilePic: userData.profile_picture || userData.profilePic || "",
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  return (
    <aside className="w-72 text-lg border-primary text-primary min-h-screen p-6 shadow-lg flex flex-col justify-between ">
      {/* ✅ Admin Profile Section */}
      <div>
        <h2 className="text-3xl font-bold mb-4 text-white-400">
          Admin Dashboard
        </h2>

        <div
          className="flex items-center space-x-4 mb-6 p-4 bg-white shadow-md rounded-lg cursor-pointer border-2 border-primary"
          onClick={handleProfile}
        >
          {admin?.profilePic ? (
            <img
              src={admin.profilePic}
              alt="Admin Profile"
              className="w-14 h-14 rounded-full border-2 border-primary"
            />
          ) : (
            <div className="w-14 h-14 rounded-full border-2 border-primary flex items-center justify-center bg-gray-100">
              <UserIcon />
            </div>
          )}
          <p className="font-semibold text-primary">{admin?.name || "Admin"}</p>
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
                  className={`block w-full text-left hover:text-white hover:bg-primary p-3 rounded-lg transition ${
                    activeTab === tab ? "bg-primary text-white font-bold" : ""
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
