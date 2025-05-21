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
import { BsSun, BsMoon } from "react-icons/bs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

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
  const [leavePatterns, setLeavePatterns] = useState([]);
  const [employeeStats, setEmployeeStats] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [leaveStats, setLeaveStats] = useState({ approved: 0, rejected: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

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

  const fetchAllLeavePatterns = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves");
      const allLeaves = res.data || [];
      const uniqueEmails = [...new Set(allLeaves.map(leave => leave.email))];
      
      const patternsPromises = uniqueEmails.map(email =>
        axios.get(`http://localhost:5000/api/leaves/patterns?email=${encodeURIComponent(email)}`)
      );
      const patternsResponses = await Promise.all(patternsPromises);
      
      const aggregatedPatterns = Array(12).fill(0).map((_, i) => ({
        month: i + 1,
        days: 0
      }));
      
      patternsResponses.forEach(response => {
        const userPatterns = response.data || [];
        userPatterns.forEach(pattern => {
          aggregatedPatterns[pattern.month - 1].days += pattern.days;
        });
      });
      
      setLeavePatterns(aggregatedPatterns);
    } catch (err) {
      console.error("Error fetching leave patterns:", err);
    }
  };

  const fetchEmployeeStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves");
      const allLeaves = res.data || [];
      const stats = {};

      allLeaves.forEach(leave => {
        const email = leave.email;
        if (!stats[email]) {
          stats[email] = { email, approved: 0, rejected: 0 };
        }
        if (leave.status === 'Approved') {
          stats[email].approved += 1;
        } else if (leave.status === 'Declined') {
          stats[email].rejected += 1;
        }
      });

      const employeeStatsArray = Object.values(stats).filter(employee => employee.approved > 0 || employee.rejected > 0);
      setEmployeeStats(employeeStatsArray);
    } catch (err) {
      console.error("Error fetching employee stats:", err);
      setEmployeeStats([]);
    }
  };

  const fetchLeaveStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves");
      const allLeaves = res.data || [];
      const approved = allLeaves.filter(leave => leave.status === 'Approved').length;
      const rejected = allLeaves.filter(leave => leave.status === 'Declined').length;
      setLeaveStats({ approved, rejected });
    } catch (err) {
      console.error("Error fetching leave stats:", err);
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
      fetchAllLeavePatterns();
      fetchEmployeeStats();
      fetchLeaveStats();
      alert("Leave approved!");
    } catch (err) {
      console.error("Error approving leave:", err);
      alert("Failed to approve leave.");
    }
  };

  const handleDecline = async (id) => {
    const declineReason = prompt("Enter reason for declining:");
    if (!declineReason || declineReason.trim() === "") {
      alert("Decline reason is required.");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/leaves/decline/${id}`, {
        declineReason,
      });
      fetchPendingLeaves();
      fetchAllLeavePatterns();
      fetchEmployeeStats();
      fetchLeaveStats();
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
      fetchAllLeavePatterns();
      fetchLeaveStats();
    }
    if (selectedItem === "Employees") {
      fetchEmployeeStats();
    }
  }, [selectedItem]);

  const handleLogout = () => {
    navigate("/Signup");
  };

  const pieData = [
    { name: 'Approved', value: leaveStats.approved },
    { name: 'Rejected', value: leaveStats.rejected },
  ];

  const barData = [
    { name: 'Approved', count: leaveStats.approved, fill: '#22c55e' },
    { name: 'Rejected', count: leaveStats.rejected, fill: '#ef4444' },
  ];

  const COLORS = ['#22c55e', '#ef4444'];

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
              <div className="flex-shrink-0">{item.icons}</div>
              <span className={`${open ? "block" : "hidden"} transition-all duration-300`}>
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

      <main className="relative flex-1 p-4 sm:p-6 lg:p-10 bg-gray-100 dark:bg-gray-900 overflow-auto">
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="absolute top-4 right-4 p-2 bg-blue-900 dark:bg-gray-700 text-white rounded-full hover:bg-blue-700 dark:hover:bg-gray-600 transition-all"
        >
          {theme === 'light' ? <BsMoon size={20} /> : <BsSun size={20} />}
        </button>

        {selectedItem === "Dashboard" && (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-300 mb-4">
              Welcome, Admin!
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-6">
              Use the sidebar to manage employees, salaries, and leaves.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-300 mb-4">
              Leave Approval Statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">Approval Breakdown (Pie Chart)</h3>
                {leaveStats.approved + leaveStats.rejected === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No leaves processed yet.</p>
                ) : (
                  <PieChart width={300} height={300}>
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
                    <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', color: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }} />
                    <Legend wrapperStyle={{ color: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }} />
                  </PieChart>
                )}
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">Approval Breakdown (Bar Chart)</h3>
                {leaveStats.approved + leaveStats.rejected === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No leaves processed yet.</p>
                ) : (
                  <BarChart width={300} height={300} data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="name" tick={{ fill: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }} />
                    <YAxis tick={{ fill: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }} />
                    <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', color: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }} />
                    <Bar dataKey="count" name="Leaves">
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-300 mb-4">
              Leave Patterns (Monthly Trends)
            </h2>
            {leavePatterns.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No leave patterns available.</p>
            ) : (
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6">
                <BarChart width={600} height={300} data={leavePatterns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }} tick={{ fill: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }} />
                  <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft', fill: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }} tick={{ fill: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }} />
                  <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', color: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }} />
                  <Legend wrapperStyle={{ color: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }} />
                  <Bar dataKey="days" fill="#1e3a8a" name="Total Leave Days" />
                </BarChart>
              </div>
            )}
          </div>
        )}

        {selectedItem === "Employees" && (
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-300 mb-4">
              Employee Leave Statistics
            </h2>
            {employeeStats.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No employee leave data available.</p>
            ) : (
              employeeStats.map((employee, index) => (
                <div key={index} className="p-3 sm:p-4 border rounded-md bg-gray-50 dark:bg-gray-700 mb-4">
                  <p className="dark:text-gray-200"><strong>Employee:</strong> {employee.email}</p>
                  <p className="dark:text-gray-200"><strong>Approved Leaves:</strong> {employee.approved}</p>
                  <p className="dark:text-gray-200"><strong>Rejected Leaves:</strong> {employee.rejected}</p>
                </div>
              ))
            )}
          </div>
        )}

        {selectedItem === "Leaves" && (
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-300 mb-4">
              Leave Requests
            </h2>
            {pendingLeaves.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No pending leave requests.</p>
            ) : (
              pendingLeaves.map((leave) => (
                <div key={leave._id} className="p-3 sm:p-4 border rounded-md bg-gray-50 dark:bg-gray-700 mb-4">
                  <p className="dark:text-gray-200"><strong>Employee:</strong> {leave.email}</p>
                  <p className="dark:text-gray-200"><strong>From:</strong> {leave.from}</p>
                  <p className="dark:text-gray-200"><strong>To:</strong> {leave.to}</p>
                  <p className="dark:text-gray-200"><strong>Reason:</strong> {leave.reason}</p>
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