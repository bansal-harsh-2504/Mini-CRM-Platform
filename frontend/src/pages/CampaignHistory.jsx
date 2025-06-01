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
            {loading ? "Refreshing..." : "Refresh"}
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
      ) : campaigns.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No campaigns found. Create your first campaign!
        </p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto text-sm text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-600">Name</th>
                <th className="px-6 py-3 font-medium text-gray-600">Status</th>
                <th className="px-6 py-3 font-medium text-gray-600">
                  Audience
                </th>
                <th className="px-6 py-3 font-medium text-gray-600">Sent</th>
                <th className="px-6 py-3 font-medium text-gray-600">Failed</th>
                <th className="px-6 py-3 font-medium text-gray-600">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {campaigns.map((campaign) => (
                <tr key={campaign._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {campaign.name}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        campaign.status === "running"
                          ? "bg-yellow-100 text-yellow-800"
                          : campaign.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {campaign.status.charAt(0).toUpperCase() +
                        campaign.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">{campaign.audienceSize}</td>
                  <td className="px-6 py-4 text-green-600">
                    {campaign.deliveryStats.sent}
                  </td>
                  <td className="px-6 py-4 text-red-500">
                    {campaign.deliveryStats.failed}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(campaign.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CampaignHistory;
