import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const CampaignHistory = () => {
  const { token } = useContext(AuthContext);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCampaigns = async () => {
    if (!token) {
      console.error("No token found. Please log in.");
      return;
    }
    setLoading(true);
    try {
      const response = (
        await axios.get(
          `${import.meta.env.VITE_BASE_URL_BACKEND}/campaigns/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        )
      ).data;
      setCampaigns(response.data.campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [token]);

  const handleCreateCampaign = () => {
    navigate("/campaigns/new");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaign History</h1>
        <div className="space-x-4 flex">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
            onClick={fetchCampaigns}
          >
            Refresh
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 cursor-pointer"
            onClick={handleCreateCampaign}
          >
            <span>+</span>
            Create New Campaign
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.length === 0 ? (
            <p className="text-gray-500 text-center col-span-full py-8">
              No campaigns found. Create your first campaign!
            </p>
          ) : (
            campaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold mb-2">{campaign.name}</h2>
                <p className="text-gray-600 mb-2">
                  Status: <span className="font-medium">{campaign.status}</span>
                </p>
                <p className="text-gray-500 text-sm">
                  Created: {new Date(campaign.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignHistory;
