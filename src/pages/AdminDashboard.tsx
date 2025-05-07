import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CreateInterview from "../components/CreateInterview";
import InterviewList from "../components/InterviewList";

// Define filter types for type safety
interface InterviewFilters {
  status?: string;
  interviewType?: string;
  page: number;
  limit: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("create-interview"); // Default Tab
  const [filters, setFilters] = useState<InterviewFilters>({
    page: 1,
    limit: 10,
  });

  // Handle filter changes
  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  return (
    <div className="flex">
      {/* Sidebar (Static) */}
      <Sidebar setActiveTab={setActiveTab} activeTab={activeTab} />

      {/* Main Content */}
      <div className="w-full">
        <div className="p-6">
          {/* Dynamically Render Components Based on Active Tab */}
          {activeTab === "create-interview" && <CreateInterview />}

          {activeTab === "interview-list" && (
            <>
              {/* Filter Controls */}
              <div className="mb-6 flex flex-wrap gap-4 bg-background2 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    className="p-2 border rounded-md w-full"
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    value={filters.status || ""}
                  >
                    <option value="">All Statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Interview Type
                  </label>
                  <select
                    className="p-2 border rounded-md w-full"
                    onChange={(e) =>
                      handleFilterChange("interviewType", e.target.value)
                    }
                    value={filters.interviewType || ""}
                  >
                    <option value="">All Types</option>
                    <option value="qa">Q&A</option>
                    <option value="technical">Technical</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Results Per Page
                  </label>
                  <select
                    className="p-2 border rounded-md w-full"
                    onChange={(e) =>
                      handleFilterChange("limit", e.target.value)
                    }
                    value={filters.limit}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>

              {/* Interview List with Pagination */}
              <InterviewList
                filters={filters}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
