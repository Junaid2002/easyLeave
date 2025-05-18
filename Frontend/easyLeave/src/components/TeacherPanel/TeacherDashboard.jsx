import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdMenuOpen, MdOutlineDashboard, MdCurrencyRupee } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { CiSettings, CiUser } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { FaRegCalendarCheck } from "react-icons/fa";

const menuItems = [
  { icons: <MdOutlineDashboard size={23} />, label: 'Dashboard' },
  { icons: <CiUser size={23} />, label: 'Profile' },
  { icons: <MdCurrencyRupee size={23} />, label: 'Salary' },
  { icons: <FaRegCalendarCheck size={23} />, label: 'Leave Application' },
  { icons: <CiSettings size={23} />, label: 'Settings' }
];

const StatusDot = ({ status }) => {
  const color = status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'orange';
  return (
    <span
      style={{
        display: 'inline-block',
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: color,
        marginRight: 8,
      }}
      title={status}
    />
  );
};

const TeacherDashboard = () => {
  const [open, setOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState('Dashboard');
  const [leaveFromDate, setLeaveFromDate] = useState('');
  const [leaveToDate, setLeaveToDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaves, setLeaves] = useState([]);
  const [oneDay, setOneDay] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  const userEmail = localStorage.getItem("userEmail") || "akanchha@example.com";

  const handleItemClick = (label) => setSelectedItem(label);

  const handleSubmit = async () => {
    if (!leaveFromDate || (!oneDay && !leaveToDate) || !leaveReason) {
      alert("Please fill in all fields");
      return;
    }

    const newLeave = {
      from: leaveFromDate,
      to: oneDay ? leaveFromDate : leaveToDate,
      reason: leaveReason,
      oneDay,
      email: userEmail,
      status: 'Pending'
    };

    try {
      await axios.post('http://localhost:5000/api/leaves', newLeave);
      alert("Leave submitted successfully.");
      setLeaveFromDate('');
      setLeaveToDate('');
      setLeaveReason('');
      setOneDay(false);
      fetchLeaves();
    } catch (error) {
      console.error("Leave submission failed:", error);
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/leaves?email=${encodeURIComponent(userEmail)}`);
      setLeaves(res.data || []);
    } catch (error) {
      console.error("Failed to fetch leaves:", error);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users?email=${encodeURIComponent(userEmail)}`);
      setUserDetails(res.data || {});
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchUserDetails();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <nav className={`transition-all duration-500 ${open ? "w-60" : "w-16"} bg-blue-900 flex flex-col`}>
        <div className="flex items-center justify-between p-4 h-20">
          <img src="aju.jpg" alt="logo" className={`transition-all duration-300 ${open ? "w-10" : "w-0"} rounded-md`} />
          <MdMenuOpen size={28} color="white" onClick={() => setOpen(!open)} className="cursor-pointer ml-auto" />
        </div>
        <ul className="flex-1 space-y-2 mt-4">
          {menuItems.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleItemClick(item.label)}
              className="flex items-center gap-3 text-white px-4 py-3 hover:bg-blue-700 cursor-pointer"
            >
              <div>{item.icons}</div>
              <span className={`${open ? "inline" : "hidden"} transition-opacity duration-300`}>{item.label}</span>
            </li>
          ))}
        </ul>
        <div className="px-4 py-3 text-white flex items-center gap-3">
          <CgProfile size={23} />
          <span className={`${open ? "inline" : "hidden"}`}>
            {userDetails ? userDetails.name : 'User'}
          </span>
        </div>
        <div
          className="px-4 py-3 text-white flex items-center gap-3 cursor-pointer hover:bg-blue-700"
          onClick={() => {
            localStorage.removeItem("userEmail");
            window.location.href = "/";
          }}
        >
          <IoIosLogOut size={23} />
          <span className={`${open ? "inline" : "hidden"}`}>Logout</span>
        </div>
      </nav>

      <main className="flex-1 overflow-auto bg-gray-100 p-4 sm:p-6 lg:p-10">
        {selectedItem === "Dashboard" && (
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Leave Summary</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              {leaves.length === 0 ? (
                <p>No leave applications submitted yet.</p>
              ) : (
                <ul className="space-y-3">
                  {leaves.map((leave, idx) => (
                    <li key={idx} className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <div><strong>Dates:</strong> {leave.oneDay ? leave.from : `${leave.from} to ${leave.to}`}</div>
                        <div><strong>Reason:</strong> {leave.reason}</div>
                      </div>
                      <div className="flex items-center">
                        <StatusDot status={leave.status} />
                        <span className="capitalize font-medium">{leave.status}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {selectedItem === "Leave Application" && (
          <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-blue-900">Apply for Leave</h2>
            <div className="space-y-6">
              <div>
                <label className="block mb-1 font-semibold">Leave From:</label>
                <input
                  type="date"
                  value={leaveFromDate}
                  onChange={(e) => {
                    setLeaveFromDate(e.target.value);
                    if (oneDay) setLeaveToDate(e.target.value);
                  }}
                  className="w-full p-3 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Leave To:</label>
                <input
                  type="date"
                  value={leaveToDate}
                  onChange={(e) => setLeaveToDate(e.target.value)}
                  disabled={oneDay}
                  className="w-full p-3 border rounded-md"
                  required={!oneDay}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="oneDay"
                  checked={oneDay}
                  onChange={(e) => {
                    setOneDay(e.target.checked);
                    if (e.target.checked) setLeaveToDate(leaveFromDate);
                  }}
                />
                <label htmlFor="oneDay">One Day Leave</label>
              </div>
              <div>
                <label className="block mb-1 font-semibold">Reason:</label>
                <textarea
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full p-3 border rounded-md"
                  rows="4"
                  required
                />
              </div>
              <button
                onClick={handleSubmit}
                className="bg-blue-900 text-white px-6 py-3 rounded-md hover:bg-blue-800"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {selectedItem === "Salary" && (
          <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">Salary Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between"><span>Basic Pay:</span><span>₹30,000</span></div>
              <div className="flex justify-between"><span>HRA:</span><span>₹10,000</span></div>
              <div className="flex justify-between"><span>Allowances:</span><span>₹5,000</span></div>
              <div className="flex justify-between font-semibold"><span>Total:</span><span>₹45,000</span></div>
              <div className="flex justify-between"><span>Month:</span><span>April 2025</span></div>
            </div>
          </div>
        )}

        {selectedItem === "Profile" && (
          <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">Profile</h2>
            {userDetails ? (
              <div className="space-y-3">
                <div><strong>Name:</strong> {userDetails.name}</div>
                <div><strong>Email:</strong> {userDetails.email}</div>
                <div><strong>Position:</strong> {userDetails.position || "N/A"}</div>
                <div><strong>Department:</strong> {userDetails.department || "N/A"}</div>
                <div><strong>Phone:</strong> {userDetails.phone || "N/A"}</div>
              </div>
            ) : (
              <p>Loading profile...</p>
            )}
          </div>
        )}

        {selectedItem === "Settings" && (
          <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">Settings</h2>
            <div>
              <p>Settings content goes here...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
