import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdMenuOpen, MdOutlineDashboard, MdCurrencyRupee } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { CiSettings, CiUser } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { FaRegCalendarCheck } from "react-icons/fa";

const menuItems = [
  { icons: <MdOutlineDashboard color='white' size={23} />, label: 'Dashboard' },
  { icons: <CiUser color='white' size={23} />, label: 'Profile' },
  { icons: <MdCurrencyRupee color='white' size={23} />, label: 'Salary' },
  { icons: <FaRegCalendarCheck color='white' size={23} />, label: 'Leave Application' },
  { icons: <CiSettings color='white' size={23} />, label: 'Settings' }
];

const TeacherDashboard = () => {
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('Dashboard');
  const [leaveFromDate, setLeaveFromDate] = useState('');
  const [leaveToDate, setLeaveToDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaves, setLeaves] = useState([]);
  const [oneDay, setOneDay] = useState(false);

  const userEmail = localStorage.getItem("userEmail") || "akanchha@example.com";

  const handleItemClick = (label) => setSelectedItem(label);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userEmail) {
      alert('Please log in to submit a leave.');
      return;
    }
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
      if (!userEmail) {
        setLeaves([]);
        return;
      }
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

  return (
    <div className="flex h-screen">
      <nav className={`shadow-md duration-500 ${open ? "w-60" : "w-18"} p-2 flex flex-col bg-blue-900`}>
        <div className="px-3 py-2 h-20 flex justify-between items-center">
          <img src="aju.jpg" alt="logo" className={`${open ? "w-10" : "w-0"} rounded-md`} />
          <MdMenuOpen size={32} color='white' className="cursor-pointer" onClick={() => setOpen(!open)} />
        </div>
        <ul className="flex-1">
          {menuItems.map((item, index) => (
            <li key={index}
              onClick={() => handleItemClick(item.label)}
              className="px-3 py-2 my-6 hover:bg-blue-700 rounded-md duration-300 cursor-pointer flex gap-2 items-center relative group">
              <div>{item.icons}</div>
              <p className={`${!open && "w-0 translate-x-24"} duration-500 overflow-hidden text-white`}>
                {item.label}
              </p>
              <p className={`${open && 'hidden'} absolute left-32 shadow-md rounded-md w-0 p-0 duration-300 overflow-hidden group-hover:w-fit group-hover:left-18 group-hover:p-2 bg-blue-100`}>
                {item.label}
              </p>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-700 rounded-md group relative">
          <CgProfile color='white' size={23} />
          <p className={`${!open && "w-0 translate-x-24"} duration-500 overflow-hidden text-white`}>Akansha</p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-700 rounded-md group relative"
          onClick={() => {
            localStorage.removeItem("userEmail");
            window.location.href = "/login";
          }}
        >
          <IoIosLogOut color='white' size={23} />
          <p className={`${!open && "w-0 translate-x-24"} duration-500 overflow-hidden text-white`}>Logout</p>
        </div>
      </nav>

      <main className="flex-1 p-10 bg-gray-100 overflow-auto">
        {selectedItem === "Dashboard" && (
          <div>
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Dashboard Overview</h2>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-blue-800">Leave Applications Summary</h3>
              {leaves.length === 0 ? (
                <p className="text-gray-500">No leave applications submitted yet.</p>
              ) : (
                <ul className="space-y-3">
                  {leaves.map((leave, index) => (
                    <li key={index} className="bg-gray-100 p-4 rounded-lg">
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
          <div className="bg-white shadow-2xl p-10 rounded-xl w-full max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-blue-900">Leave Application</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 font-semibold text-lg text-gray-700">Leave From</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg p-3 text-lg"
                  value={leaveFromDate}
                  onChange={(e) => {
                    setLeaveFromDate(e.target.value);
                    if (oneDay) setLeaveToDate(e.target.value);
                  }}
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-lg text-gray-700">Leave To</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg p-3 text-lg"
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
                <label htmlFor="oneDay" className="text-gray-700 text-md">One Day Leave</label>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-lg text-gray-700">Reason for Leave</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-4 h-40 resize-none text-lg"
                  placeholder="Type your reason for leave here..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-blue-900 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-800 transition-all"
              >
                Submit Leave
              </button>
            </form>
          </div>
        )}

        {selectedItem === "Salary" && (
          <div className="bg-white shadow-2xl p-10 rounded-xl w-full max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-blue-900">Salary Details</h2>
            <div className="space-y-4 text-lg text-gray-700">
              <div className="flex justify-between border-b pb-2">
                <span>Basic Pay:</span>
                <span>₹30,000</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>HRA:</span>
                <span>₹10,000</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Allowances:</span>
                <span>₹5,000</span>
              </div>
              <div className="flex justify-between border-b pb-2 font-semibold">
                <span>Total:</span>
                <span>₹45,000</span>
              </div>
              <div className="flex justify-between">
                <span>Month:</span>
                <span>April 2025</span>
              </div>
            </div>
          </div>
        )}

        {selectedItem === "Profile" && (
          <div className="bg-white shadow-2xl p-10 rounded-xl w-full max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-blue-900">Profile</h2>
            <div className="space-y-4 text-lg text-gray-700">
              <div><strong>Name:</strong> Akansha Kumari</div>
              <div><strong>Email:</strong> {userEmail}</div>
              <div><strong>Position:</strong> Assistant Professor</div>
              <div><strong>Department:</strong> Computer Science</div>
              <div><strong>Phone:</strong> +91 9334558897</div>
            </div>
          </div>
        )}

        {selectedItem === "Settings" && (
          <div className="bg-white shadow-2xl p-10 rounded-xl w-full max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-blue-900">Settings</h2>
            <div className="space-y-6 text-gray-700 text-lg">
              <div>
                <label className="block font-semibold mb-2">Change Password</label>
                <input type="password" placeholder="New Password" className="w-full border p-3 rounded-md" />
              </div>
              <div>
                <label className="block font-semibold mb-2">Notification Settings</label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" /> Email Notifications
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" /> SMS Notifications
                </label>
              </div>
              <button className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
