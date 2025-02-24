import { useState } from "react";
import Sidebar from "../components/Sidebar";
import CreateInterview from "../components/CreateInterview";
import InterviewList from "../components/InterviewList";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("create-interview"); // Default Tab

  return (
    <div className="flex">
      {/* Sidebar (Static) */}
      <Sidebar setActiveTab={setActiveTab} activeTab={activeTab} />

      {/* Main Content */}
      <div className="w-full">
        <div className="p-6">
          {/* Dynamically Render Components Based on Active Tab */}
          {activeTab === "create-interview" && <CreateInterview />}
          {activeTab === "interview-list" && <InterviewList />}
        </div>
      </div>
    </div>
  );
}
