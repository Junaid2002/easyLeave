import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdMenuOpen, MdOutlineDashboard, MdCurrencyRupee } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { CiSettings, CiUser } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { FaRegCalendarCheck } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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
    <motion.span
      style={{
        display: 'inline-block',
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: color,
        marginRight: 8,
      }}
      title={status}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
};

const localizer = momentLocalizer(moment);

const TeacherDashboard = () => {
  const [open, setOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState('Dashboard');
  const [leaveFromDate, setLeaveFromDate] = useState('');
  const [leaveToDate, setLeaveToDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaves, setLeaves] = useState([]);
  const [oneDay, setOneDay] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [calendarEvents, setCalendarEvents] = useState([]);

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

  const handleStatusUpdate = async (leaveId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/leaves/${leaveId}`, { status: newStatus });
      alert("Leave status updated.");
      fetchLeaves();
    } catch (error) {
      console.error("Failed to update leave status:", error);
    }
  };

  const fetchLeaves = async () => {
    try {
      const endpoint = isAdmin ? 'http://localhost:5000/api/leaves' : `http://localhost:5000/api/leaves?email=${encodeURIComponent(userEmail)}`;
      const res = await axios.get(endpoint);
      const leaveData = res.data || [];
      setLeaves(leaveData);

      const pending = leaveData.filter(l => l.status === 'Pending').length;
      const approved = leaveData.filter(l => l.status === 'Approved').length;
      const rejected = leaveData.filter(l => l.status === 'Rejected').length;
      setStats({ pending, approved, rejected });

      const events = leaveData.map(leave => ({
        title: `${leave.email} - ${leave.reason}`,
        start: new Date(leave.from),
        end: leave.oneDay ? new Date(leave.from) : new Date(leave.to),
        allDay: true,
        resource: leave
      }));
      setCalendarEvents(events);
    } catch (error) {
      console.error("Failed to fetch leaves:", error);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users?email=${encodeURIComponent(userEmail)}`);
      const user = res.data || {};
      setUserDetails(user);
      setIsAdmin(user.role === 'admin');
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchUserDetails();
  }, []);

  const pieData = [
    { name: 'Pending', value: stats.pending },
    { name: 'Approved', value: stats.approved },
    { name: 'Rejected', value: stats.rejected }
  ];

  const COLORS = ['#f97316', '#22c55e', '#ef4444'];

  return (
    <div className="flex h-screen overflow-hidden">
      <motion.nav
        className={`transition-all duration-500 ${open ? "w-60" : "w-16"} bg-blue-900 flex flex-col`}
        initial={{ width: 60 }}
        animate={{ width: open ? 240 : 60 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between p-4 h-20">
          <motion.img
            src="aju.jpg"
            alt="logo"
            className={`transition-all duration-300 ${open ? "w-10" : "w-0"} rounded-md`}
            initial={{ width: 0 }}
            animate={{ width: open ? 40 : 0 }}
          />
          <MdMenuOpen
            size={28}
            color="white"
            onClick={() => setOpen(!open)}
            className="cursor-pointer ml-auto"
          />
        </div>
        <ul className="flex-1 space-y-2 mt-4">
          {menuItems.map((item, idx) => (
            <motion.li
              key={idx}
              onClick={() => handleItemClick(item.label)}
              className="flex items-center gap-3 text-white px-4 py-3 hover:bg-blue-700 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div>{item.icons}</div>
              <motion.span
                className={`${open ? "inline" : "hidden"} transition-opacity duration-300`}
                initial={{ opacity: 0 }}
                animate={{ opacity: open ? 1 : 0 }}
              >
                {item.label}
              </motion.span>
            </motion.li>
          ))}
        </ul>
        <div className="px-4 py-3 text-white flex items-center gap-3">
          <CgProfile size={23} />
          <motion.span
            className={`${open ? "inline" : "hidden"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: open ? 1 : 0 }}
          >
            {userDetails ? userDetails.name : 'User'}
          </motion.span>
        </div>
        <motion.div
          className="px-4 py-3 text-white flex items-center gap-3 cursor-pointer hover:bg-blue-700"
          onClick={() => {
            localStorage.removeItem("userEmail");
            window.location.href = "/";
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <IoIosLogOut size={23} />
          <motion.span
            className={`${open ? "inline" : "hidden"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: open ? 1 : 0 }}
          >
            Logout
          </motion.span>
        </motion.div>
      </motion.nav>

      <motion.main
        className="flex-1 overflow-auto bg-gray-100 p-4 sm:p-6 lg:p-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {selectedItem === "Dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-blue-900 mb-4">{isAdmin ? 'Admin Dashboard' : 'Leave Summary'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <motion.div
                  className="bg-white p-4 rounded-lg shadow-md text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <h3 className="text-lg font-semibold">Pending</h3>
                  <p className="text-2xl text-orange-500">{stats.pending}</p>
                </motion.div>
                <motion.div
                  className="bg-white p-4 rounded-lg shadow-md text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <h3 className="text-lg font-semibold">Approved</h3>
                  <p className="text-2xl text-green-500">{stats.approved}</p>
                </motion.div>
                <motion.div
                  className="bg-white p-4 rounded-lg shadow-md text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <h3 className="text-lg font-semibold">Rejected</h3>
                  <p className="text-2xl text-red-500">{stats.rejected}</p>
                </motion.div>
              </div>
              <motion.div
                className="bg-white p-6 rounded-lg shadow-md mb-6"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold mb-4">Leave Trends</h3>
                <PieChart width={400} height={300}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </motion.div>
              <motion.div
                className="bg-white p-6 rounded-lg shadow-md"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold mb-4">Upcoming Leaves</h3>
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 500 }}
                  onSelectEvent={(event) => alert(`Leave: ${event.title}`)}
                />
              </motion.div>
              {isAdmin && (
                <motion.div
                  className="bg-white p-6 rounded-lg shadow-md mt-6"
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="text-lg font-semibold mb-4">All Leave Requests</h3>
                  {leaves.length === 0 ? (
                    <p>No leave applications submitted yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {leaves.map((leave, idx) => (
                        <motion.li
                          key={idx}
                          className="bg-gray-100 p-4 rounded-lg flex justify-between items-center"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <div>
                            <div><strong>Email:</strong> {leave.email}</div>
                            <div><strong>Dates:</strong> {leave.oneDay ? leave.from : `${leave.from} to ${leave.to}`}</div>
                            <div><strong>Reason:</strong> {leave.reason}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusDot status={leave.status} />
                            <span className="capitalize font-medium">{leave.status}</span>
                            <select
                              value={leave.status}
                              onChange={(e) => handleStatusUpdate(leave._id, e.target.value)}
                              className="ml-2 p-1 border rounded"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approve</option>
                              <option value="Rejected">Reject</option>
                            </select>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {selectedItem === "Leave Application" && (
            <motion.div
              key="leave"
              className="bg-white p-6 rounded-xl shadow-md w-full max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
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
                <motion.button
                  onClick={handleSubmit}
                  className="bg-blue-900 text-white px-6 py-3 rounded-md hover:bg-blue-800"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Submit
                </motion.button>
              </div>
            </motion.div>
          )}

          {selectedItem === "Salary" && (
            <motion.div
              key="salary"
              className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-blue-900">Salary Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between"><span>Basic Pay:</span><span>₹30,000</span></div>
                <div className="flex justify-between"><span>HRA:</span><span>₹10,000</span></div>
                <div className="flex justify-between"><span>Allowances:</span><span>₹5,000</span></div>
                <div className="flex justify-between font-semibold"><span>Total:</span><span>₹45,000</span></div>
                <div className="flex justify-between"><span>Month:</span><span>April 2025</span></div>
              </div>
            </motion.div>
          )}

          {selectedItem === "Profile" && (
            <motion.div
              key="profile"
              className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
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
            </motion.div>
          )}

          {selectedItem === "Settings" && (
            <motion.div
              key="settings"
              className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-blue-900">Settings</h2>
              <div>
                <p>Settings content goes here...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
};

export default TeacherDashboard;