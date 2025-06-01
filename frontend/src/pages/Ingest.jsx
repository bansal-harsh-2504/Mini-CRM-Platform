import React, { useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Ingest = () => {
  const [type, setType] = useState("customers");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jsonInput, setJsonInput] = useState("[]");
  const { token } = useContext(AuthContext);

  const handleToggle = (newType) => {
    setError("");
    setType(newType);
    setJsonInput("[]");
  };

  const handleSubmit = async () => {
    try {
      if (!jsonInput.trim()) {
        setError("Please enter valid JSON data.");
        return;
      }
      setLoading(true);
      const parsed = JSON.parse(jsonInput.trim());
      if (!Array.isArray(parsed)) {
        setError("Please enter a valid JSON array.");
        return;
      }
      await axios.post(
        `${import.meta.env.VITE_BASE_URL_BACKEND}/${type}`,
        {
          type: parsed,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      alert(
        `${type[0].toUpperCase() + type.slice(1)} data ingested successfully`
      );
    } catch (err) {
      console.error(err);
      setError("Invalid JSON or ingestion failed.");
    } finally {
      setLoading(false);
      setJsonInput("[]");
    }
  };

  const schema = {
    customers: [
      {
        name: "John Doe",
        email: "john@example.com",
      },
    ],
    orders: [
      {
        email: "john@example.com",
        items: ["item1", "item2"],
        amount: 29.99,
        date: "2025-06-01",
      },
    ],
  };

  return (
    <div className="mt-20 p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2 relative group">
          <h2 className="text-2xl font-semibold text-gray-700">
            {type === "customers" ? "Customer Ingestion" : "Order Ingestion"}
          </h2>
          <div className="w-5 h-5 flex items-center justify-center bg-gray-300 text-sm font-bold rounded-full cursor-pointer relative">
            ?
            <div className="absolute top-7 left-0 z-10 w-96 p-3 bg-white border border-gray-300 rounded shadow-lg text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-pre-wrap">
              {JSON.stringify(schema[type], null, 2)}
              {type === "orders" && "\n\nNote: 'items' is optional."}
            </div>
          </div>
        </div>

        <div className="space-x-2">
          <button
            className={`cursor-pointer px-4 py-2 rounded ${
              type === "customers" ? "bg-orange-400 text-white" : "bg-gray-200"
            }`}
            onClick={() => handleToggle("customers")}
          >
            Customers
          </button>
          <button
            className={`cursor-pointer px-4 py-2 rounded ${
              type === "orders" ? "bg-orange-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => handleToggle("orders")}
          >
            Orders
          </button>
        </div>
      </div>

      <textarea
        rows={12}
        className="w-full border border-gray-400 p-3 rounded font-mono text-sm"
        placeholder={`Paste JSON array of ${type}s here`}
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      />

      <button
        className="cursor-pointer mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        onClick={handleSubmit}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
      {error && <div className="mt-4 text-red-600">{error}</div>}
    </div>
  );
};

export default Ingest;
