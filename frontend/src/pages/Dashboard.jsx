import React from "react";
import { NavLink } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="flex pt-60 min-h-screen bg-[#fff9f6] text-gray-800 p-6 font-sans">
      {/* Header */}
      <div className="mb-8 px-[4vw]">
        <h2
          className="text-[60px]  tracking-tighter font-bold leading-tight text-[#373D36]"
          style={{ transform: "scaleY(1.05)" }}
        >
          Manage Smarter. <br />
          <span className="text-[#f39231]">
            Track. Connect.
            <br /> Accelerate
          </span>
        </h2>
        <p className="mt-2 text-gray-500 text-lg tracking-normal">
          Keep your customer and order data in check, and focus on building
          <br />
          strong relationships.
        </p>
        <div className="flex mt-8 space-x-4">
          <NavLink to={"/campaigns"}>
            <button className="flex bg-orange-400 items-center text-white px-4 py-2 rounded-lg shadow cursor-pointer transition-colors duration-300 group">
              Campaigns{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-right relative z-10 ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </button>
          </NavLink>
          <NavLink to="/ingest">
            <button className="bg-white border border-orange-200 px-4 py-2 rounded-lg shadow flex items-center gap-2 cursor-pointer hover:bg-orange-50 transition-colors duration-300 group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-code mr-2 h-4 w-4"
              >
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              Import existing customers
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-zap ml-2 h-4 w-4 text-primary transition-all duration-300 group-hover:scale-125 group-hover:text-yellow-400 group-hover:rotate-12 text-orange-400"
              >
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
              </svg>
            </button>
          </NavLink>
        </div>
      </div>

      {/* Stats Section */}
      <div>
        <img
          src="/hero1.jpeg"
          width={"550px"}
          className="rounded-lg ml-15 -mt-2"
        />
      </div>
    </div>
  );
};

export default Dashboard;
