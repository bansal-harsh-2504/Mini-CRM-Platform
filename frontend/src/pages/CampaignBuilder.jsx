import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const CampaignBuilder = () => {
  const { token } = useContext(AuthContext);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiError, setAiError] = useState("");
  const [objective, setObjective] = useState("");
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(null);
  const [campaignName, setCampaignName] = useState("");
  const [audienceCount, setAudienceCount] = useState(0);
  const [error, setError] = useState("");
  const [logic, setLogic] = useState("AND");
  const [rules, setRules] = useState([
    { metric: "totalSpend", operator: ">", value: "" },
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const handleRuleChange = (index, field, value) => {
    const updatedRules = [...rules];
    updatedRules[index][field] = value;
    setRules(updatedRules);
  };

  const addRule = () => {
    setRules([...rules, { metric: "totalSpend", operator: ">", value: "" }]);
  };

  const handlePreview = async () => {
    setError("");
    setAudienceCount(null);
    if (rules.some((rule) => rule.value === "")) {
      setError("Please fill in all rule values before previewing.");
      return;
    }
    if (error) return;
    if (previewLoading) return;
    try {
      setPreviewLoading(true);
      const payloadRules = rules
        .filter((rule) => rule.value !== "")
        .map(({ metric, operator, value }) => ({
          metric,
          operator,
          value,
        }));

      const response = (
        await axios.post(
          `${import.meta.env.VITE_BASE_URL_BACKEND}/campaigns/preview`,
          {
            rules: payloadRules,
            logic,
          },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      ).data;
      if (response.success) {
        setAudienceCount(response.data.count);
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Unknown error";
      setError("Failed to preview audience size: " + message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCreate = async () => {
    setError("");
    if (!campaignName.trim()) {
      setError("Campaign name is required.");
      return;
    }
    if (rules.some((rule) => rule.value === "")) {
      setError("Please fill in all rule values before creating the campaign.");
      return;
    }
    if (!objective.trim()) {
      setError("Campaign objective is required.");
      return;
    }
    if (createLoading) return;
    try {
      setCreateLoading(true);
      await axios.post(
        `${import.meta.env.VITE_BASE_URL_BACKEND}/campaigns`,
        {
          name: campaignName,
          rules,
          objective,
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error creating campaign:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSuggest = async () => {
    setAiError("");
    setAiSuggestions([]);
    if (!objective.trim()) {
      setAiError("Please enter a campaign objective to get suggestions.");
      return;
    }
    if (aiLoading) return;
    try {
      setAiLoading(true);
      const res = (
        await axios.post(
          `${import.meta.env.VITE_BASE_URL_BACKEND}/ai/suggest`,
          { objective },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      ).data;
      setAiSuggestions(res.data.suggestions);
    } catch (e) {
      setAiError(
        "AI failed to suggest: " + (e.response?.data?.error || e.message)
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-30 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-6">Create Campaign</h2>
      <label className="block mb-2 font-medium">Campaign Name</label>
      <input
        type="text"
        className="w-full px-4 py-2 mb-6 border rounded-md"
        value={campaignName}
        onChange={(e) => setCampaignName(e.target.value)}
        placeholder="Enter campaign name"
      />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        Segment Logic
      </h3>
      <select
        className="border px-3 py-2 mb-4 rounded-md"
        value={logic}
        onChange={(e) => setLogic(e.target.value)}
      >
        <option value="AND">AND</option>
        <option value="OR">OR</option>
      </select>{" "}
      <span className="text-sm font-normal text-gray-500">
        (Combine rules with <span className="font-bold">{logic}</span>)
      </span>
      {rules.map((rule, index) => (
        <div key={index} className="flex flex-wrap items-center gap-4 mb-4">
          <select
            className="border px-3 py-2 rounded-md"
            value={rule.metric}
            onChange={(e) => handleRuleChange(index, "metric", e.target.value)}
          >
            <option value="totalSpend">Total Spend (₹)</option>
            <option value="visits">Visits</option>
            <option value="lastPurchased">Last Purchased</option>
          </select>

          <select
            className="border px-3 py-2 rounded-md"
            value={rule.operator}
            onChange={(e) =>
              handleRuleChange(index, "operator", e.target.value)
            }
          >
            <option value=">">&gt;</option>
            <option value="<">&lt;</option>
            <option value="==">=</option>
            <option value="<=">&lt;=</option>
            <option value=">=">&gt;=</option>
            <option value="!=">!=</option>
          </select>

          <input
            type={rule.metric === "lastPurchased" ? "date" : "number"}
            className="border px-3 py-2 rounded-md w-28"
            value={rule.value}
            onChange={(e) => handleRuleChange(index, "value", e.target.value)}
            placeholder="Value"
          />

          {rules.length > 1 && (
            <button
              onClick={() => {
                const updated = [...rules];
                updated.splice(index, 1);
                setRules(updated);
              }}
              className="text-red-500 text-sm hover:text-red-700 cursor-pointer"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addRule}
        className="text-blue-500 font-medium mb-6 cursor-pointer"
      >
        + Add Rule
      </button>
      <div className="mb-4">
        <strong className="text-gray-700">Audience Size: </strong>
        <span className="text-gray-900">{audienceCount}</span>
      </div>
      <div className="flex gap-4 mb-8">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
          onClick={handlePreview}
        >
          {previewLoading ? "Previewing..." : "Preview Audience Size"}
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 cursor-pointer"
          onClick={handleCreate}
        >
          {createLoading ? "Creating..." : "Create Campaign"}
        </button>
      </div>
      {error && (
        <div className="text-red-500 -mt-6 mb-2">
          <strong>Error:</strong> {error}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        Campaign Objective{" "}
        <span className="text-sm text-gray-500">(for AI suggestions)</span>
      </h3>
      <input
        type="text"
        className="w-full px-4 py-2 mb-4 border rounded-md"
        value={objective}
        onChange={(e) => setObjective(e.target.value)}
        placeholder="e.g. Increase product sales"
      />
      {objective == "" ? (
        <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 cursor-no-drop">
          Suggest Messages
        </button>
      ) : (
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 cursor-pointer"
          onClick={handleSuggest}
        >
          {aiLoading ? "Generating..." : "Suggest Messages"}
        </button>
      )}
      {aiError && (
        <div className="text-red-500 mt-4">
          <strong>Error:</strong> {aiError}
        </div>
      )}
      {aiSuggestions.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-2">AI Suggestions</h4>
          <ul className="space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => {
                  setObjective(suggestion);
                  setSelectedSuggestionIndex(index);
                }}
                className={`cursor-pointer px-4 py-2 border rounded-md transition ${
                  selectedSuggestionIndex === index
                    ? "bg-purple-100 border-purple-500"
                    : "hover:bg-gray-100"
                }`}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CampaignBuilder;
