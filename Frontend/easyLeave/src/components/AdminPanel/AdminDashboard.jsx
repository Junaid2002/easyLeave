import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MdMenuOpen,
  MdOutlineDashboard,
  MdCurrencyRupee,
} from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import { FaUserLarge } from "react-icons/fa6";
import { SlCalender } from "react-icons/sl";
import { CgProfile } from "react-icons/cg";

const menuItems = [
  { icons: <MdOutlineDashboard color="white" size={23} />, label: "Dashboard" },
  { icons: <FaUserLarge color="white" size={21} />, label: "Employees" },
  { icons: <MdCurrencyRupee color="white" size={23} />, label: "Salary" },
  { icons: <SlCalender color="white" size={23} />, label: "Leaves" },
  { icons: <CiSettings color="white" size={23} />, label: "Settings" },
];

const AdminDashboard = () => {
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Dashboard");
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [approvedLeaves, setApprovedLeaves] = useState([]);

  const fetchPendingLeaves = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves/pending");
      setPendingLeaves(res.data);
    } catch (err) {
      console.error("Error fetching leaves:", err);
    }
  };

  const fetchApprovedLeaves = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves/approved");
      setApprovedLeaves(res.data);
    } catch (err) {
      console.error("Error fetching approved leaves:", err);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/leaves/approve/${id}`);
      fetchPendingLeaves();
      if (res.data) {
        setApprovedLeaves((prev) => [...prev, res.data]);
      } else {
        fetchApprovedLeaves();
      }
      alert("Leave approved!");
    } catch (err) {
      console.error("Error approving leave:", err);
      alert("Failed to approve leave.");
    }
  };

  const handleDecline = async (id) => {
    const reason = prompt("Enter reason for declining:");
    if (!reason || reason.trim() === "") {
      alert("Decline reason is required.");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/leaves/decline/${id}`, {
        reason,
      });
      fetchPendingLeaves();
      alert("Leave declined successfully.");
    } catch (err) {
      console.error("Error declining leave:", err);
      alert("Failed to decline leave.");
    }
  };

  useEffect(() => {
    if (selectedItem === "Leaves") {
      fetchPendingLeaves();
      fetchApprovedLeaves();
    }
    if (selectedItem === "Dashboard") {
      fetchApprovedLeaves();
    }
  }, [selectedItem]);

  const handleLogout = () => {
    alert("Logout clicked!");
  };

  return (
    <div className="flex h-screen">
      <nav className={`shadow-md duration-300 ${open ? "w-60" : "w-16"} p-4 flex flex-col bg-blue-900`}>
        <div className="flex justify-between items-center mb-6">
          <img
            src="aju.jpg"
            alt="logo"
            className={`transition-all duration-300 ${open ? "w-10" : "w-0"} h-10 rounded-md`}
          />
          <MdMenuOpen
            size={26}
            color="white"
            className="cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>

        <ul className="flex-1">
          {menuItems.map((item, index) => (
            <li
              key={index}
              onClick={() => setSelectedItem(item.label)}
              className="flex items-center gap-4 text-white p-3 my-2 rounded-lg hover:bg-blue-700 cursor-pointer relative group"
            >
              {item.icons}
              <span className={`transition-all duration-300 ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                {item.label}
              </span>
              {!open && (
                <span className="absolute left-16 bg-blue-100 text-blue-900 text-sm px-2 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4 text-white p-3 mt-auto rounded-lg hover:bg-blue-700 cursor-pointer">
          <CgProfile size={23} />
          {open && <span>Admin</span>}
        </div>

        <div
          onClick={handleLogout}
          className="flex items-center gap-4 text-white p-3 mt-2 rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          <IoIosLogOut size={23} />
          {open && <span>Logout</span>}
        </div>
      </nav>

      <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-gray-100 overflow-auto">
        {selectedItem === "Dashboard" && (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-4">
              Welcome, Admin!
            </h1>
            <p className="text-gray-700 text-sm sm:text-base mb-6">
              Use the sidebar to manage employees, salaries, and leaves.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4">
              Recently Approved Leaves
            </h2>
            {approvedLeaves.length === 0 ? (
              <p className="text-gray-500">No leaves approved yet.</p>
            ) : (
              approvedLeaves.map((leave) => (
                <div key={leave._id} className="p-3 sm:p-4 border rounded-md bg-green-50 mb-4">
                  <p><strong>Employee:</strong> {leave.email}</p>
                  <p><strong>From:</strong> {leave.from}</p>
                  <p><strong>To:</strong> {leave.to}</p>
                  <p><strong>Reason:</strong> {leave.reason}</p>
                </div>
              ))
            )}
          </div>
        )}

        {selectedItem === "Leaves" && (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4">
              Leave Requests
            </h2>
            {pendingLeaves.length === 0 ? (
              <p className="text-gray-500">No pending leave requests.</p>
            ) : (
              pendingLeaves.map((leave) => (
                <div key={leave._id} className="p-3 sm:p-4 border rounded-md bg-gray-50 mb-4">
                  <p><strong>Employee:</strong> {leave.email}</p>
                  <p><strong>From:</strong> {leave.from}</p>
                  <p><strong>To:</strong> {leave.to}</p>
                  <p><strong>Reason:</strong> {leave.reason}</p>
                  <div className="flex gap-3 mt-3">
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      onClick={() => handleApprove(leave._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      onClick={() => handleDecline(leave._id)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
