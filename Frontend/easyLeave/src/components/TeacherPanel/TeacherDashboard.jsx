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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userEmail) return alert('Please log in to submit a leave.');
    const newLeave = {
      from: leaveFromDate,
      to: oneDay ? leaveFromDate : leaveToDate,
      reason: leaveReason,
      oneDay,
      email: userEmail
    };
    try {
      const res = await axios.post('http://localhost:5000/api/leaves', newLeave);
      setLeaves([res.data.leave, ...leaves]);
      alert('Leave submitted successfully!');
    } catch (error) {
      console.error('Error submitting leave:', error);
      alert('Failed to submit leave.');
    }
    setLeaveFromDate('');
    setLeaveToDate('');
    setLeaveReason('');
    setOneDay(false);
  };

  useEffect(() => {
    const fetchLeaves = async () => {
      if (!userEmail) return setLeaves([]);
      try {
        const res = await axios.get(`http://localhost:5000/api/leaves?email=${encodeURIComponent(userEmail)}`);
        setLeaves(res.data || []);
      } catch (error) {
        console.error('Error fetching leaves:', error);
        setLeaves([]);
      }
    };
    fetchLeaves();
  }, [userEmail]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userEmail) return setUserDetails(null);
      try {
        const res = await axios.get(`http://localhost:5000/api/users?email=${encodeURIComponent(userEmail)}`);
        setUserDetails(res.data || null);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setUserDetails(null);
      }
    };
    fetchUserDetails();
  }, [userEmail]);

  return (
    <div className="flex h-screen overflow-hidden">
      <nav className={`transition-all duration-500 ${open ? "w-60" : "w-16"} bg-blue-900 flex flex-col`}>
        <div className="flex items-center justify-between p-4 h-20">
          <img src="aju.jpg" alt="logo" className={`transition-all duration-300 ${open ? "w-10" : "w-0"} overflow-hidden rounded-md`} />
          <MdMenuOpen size={28} color="white" onClick={() => setOpen(!open)} className="cursor-pointer ml-auto" />
        </div>
        <ul className="flex-1 space-y-2 mt-4">
          {menuItems.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleItemClick(item.label)}
              className="flex items-center gap-3 text-white px-4 py-3 hover:bg-blue-700 transition-all relative"
            >
              <div>{item.icons}</div>
              <span className={`whitespace-nowrap transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 hidden md:inline-block"}`}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
        <div className="px-4 py-3 text-white flex items-center gap-3">
          <CgProfile size={23} />
          <span className={`transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 hidden md:inline-block"}`}>
            {userDetails ? userDetails.name : 'User'}
          </span>
        </div>
        <div
          className="px-4 py-3 text-white flex items-center gap-3 cursor-pointer hover:bg-blue-700"
          onClick={() => {
            localStorage.removeItem("userEmail");
            window.location.href = "/login";
          }}
        >
          <IoIosLogOut size={23} />
          <span className={`transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 hidden md:inline-block"}`}>Logout</span>
        </div>
      </nav>

      <main className="flex-1 overflow-auto bg-gray-100 p-4 sm:p-6 lg:p-10">
        {selectedItem === "Dashboard" && (
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Dashboard Overview</h2>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">Leave Applications Summary</h3>
              {leaves.length === 0 ? (
                <p className="text-gray-500">No leave applications submitted yet.</p>
              ) : (
                <ul className="space-y-3">
                  {leaves.map((leave, idx) => (
                    <li key={idx} className="bg-gray-100 p-4 rounded-lg">
                      <strong>Leave Dates:</strong> {leave.oneDay ? leave.from : `${leave.from} to ${leave.to}`}<br />
                      <strong>Reason:</strong> {leave.reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {selectedItem === "Leave Application" && (
          <div className="bg-white shadow-2xl p-6 rounded-xl w-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-blue-900">Leave Application</h2>
            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-semibold">Leave From</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  value={leaveFromDate}
                  onChange={(e) => {
                    setLeaveFromDate(e.target.value);
                    if (oneDay) setLeaveToDate(e.target.value);
                  }}
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Leave To</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  value={leaveToDate}
                  onChange={(e) => setLeaveToDate(e.target.value)}
                  disabled={oneDay}
                  required={!oneDay}
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="oneDay"
                  checked={oneDay}
                  onChange={(e) => {
                    setOneDay(e.target.checked);
                    if (e.target.checked) setLeaveToDate(leaveFromDate);
                  }}
                />
                <label htmlFor="oneDay" className="text-gray-700">One Day Leave</label>
              </div>
              <div>
                <label className="block mb-2 font-semibold">Reason for Leave</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-4 h-32 resize-none"
                  placeholder="Type your reason for leave here..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  required
                ></textarea>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800"
              >
                Submit Leave
              </button>
            </div>
          </div>
        )}

        {selectedItem === "Salary" && (
          <div className="bg-white shadow-2xl p-6 rounded-xl w-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-blue-900">Salary Details</h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex justify-between border-b pb-2"><span>Basic Pay:</span><span>₹30,000</span></div>
              <div className="flex justify-between border-b pb-2"><span>HRA:</span><span>₹10,000</span></div>
              <div className="flex justify-between border-b pb-2"><span>Allowances:</span><span>₹5,000</span></div>
              <div className="flex justify-between border-b pb-2 font-semibold"><span>Total:</span><span>₹45,000</span></div>
              <div className="flex justify-between"><span>Month:</span><span>April 2025</span></div>
            </div>
          </div>
        )}

        {selectedItem === "Profile" && (
          <div className="bg-white shadow-2xl p-6 rounded-xl w-full max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-blue-900">Profile</h2>
            {userDetails ? (
              <div className="space-y-4 text-gray-700">
                <div><strong>Name:</strong> {userDetails.name}</div>
                <div><strong>Email:</strong> {userDetails.email}</div>
                <div><strong>Position:</strong> {userDetails.position || 'N/A'}</div>
                <div><strong>Department:</strong> {userDetails.department || 'N/A'}</div>
                <div><strong>Phone:</strong> {userDetails.phone || 'N/A'}</div>
              </div>
            ) : (
              <p className="text-gray-500">Loading profile details...</p>
            )}
          </div>
        )}

        {selectedItem === "Settings" && (
          <div className="bg-white shadow-2xl p-6 rounded-xl w-full max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-blue-900">Settings</h2>
            <div className="space-y-6 text-gray-700">
              <div>
                <label className="block font-semibold mb-2">Change Password</label>
                <input type="password" placeholder="New Password" className="w-full border p-3 rounded-md" />
              </div>
              <div>
                <label className="block font-semibold mb-2">Notification Settings</label>
                <label className="flex items-center gap-3"><input type="checkbox" /> Email Notifications</label>
                <label className="flex items-center gap-3"><input type="checkbox" /> SMS Notifications</label>
              </div>
              <button className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800">Save Settings</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
