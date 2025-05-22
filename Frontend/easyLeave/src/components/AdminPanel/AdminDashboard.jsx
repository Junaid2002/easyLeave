import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MdMenuOpen,
  MdOutlineDashboard,
  MdCurrencyRupee,
  MdRefresh,
} from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import { FaUserLarge } from "react-icons/fa6";
import { SlCalender } from "react-icons/sl";
import { CgProfile } from "react-icons/cg";
import { BsSun, BsMoon } from "react-icons/bs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { icons: <MdOutlineDashboard size={23} />, label: "Dashboard" },
  { icons: <FaUserLarge size={21} />, label: "Employees" },
  { icons: <MdCurrencyRupee size={23} />, label: "Salary" },
  { icons: <SlCalender size={23} />, label: "Leaves" },
  { icons: <CiSettings size={23} />, label: "Settings" },
];

const AdminDashboard = () => {
  const [open, setOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState("Dashboard");
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [approvedLeaves, setApprovedLeaves] = useState([]);
  const [leavePatterns, setLeavePatterns] = useState([]);
  const [employeeStats, setEmployeeStats] = useState([]);
  const [pendingSalaryRequests, setPendingSalaryRequests] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [leaveStats, setLeaveStats] = useState({ approved: 0, declined: 0 });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
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
      setPendingLeaves(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching pending leaves:", err);
      setError("Failed to fetch pending leaves. Please try again.");
    }
  };

  const fetchApprovedLeaves = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves/approved");
      setApprovedLeaves(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching approved leaves:", err);
      setError("Failed to fetch approved leaves. Please try again.");
    }
  };

  const fetchAllLeavePatterns = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves");
      const allLeaves = Array.isArray(res.data) ? res.data : [];
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
        const userPatterns = Array.isArray(response.data) ? response.data : [];
        userPatterns.forEach(pattern => {
          if (pattern.month >= 1 && pattern.month <= 12) {
            aggregatedPatterns[pattern.month - 1].days += pattern.days || 0;
          }
        });
      });
      
      setLeavePatterns(aggregatedPatterns);
      setError(null);
    } catch (err) {
      console.error("Error fetching leave patterns:", err);
      setError("Failed to fetch leave patterns. Please try again.");
    }
  };

  const fetchEmployeeStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves/employee-stats");
      const stats = Array.isArray(res.data) ? res.data : [];
      setEmployeeStats(stats);
      setError(null);
      if (stats.length === 0) {
        setError("No employee stats available.");
      }
    } catch (err) {
      console.error("Error fetching employee stats:", err);
      if (err.response?.status === 404) {
        setError("Employee stats endpoint not found. Contact your administrator.");
      } else {
        setError("Failed to fetch employee stats. Please try again later.");
      }
      setEmployeeStats([]);
    }
  };

  const fetchLeaveStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves");
      const allLeaves = Array.isArray(res.data) ? res.data : [];
      const approved = allLeaves.filter(leave => leave.status === 'Approved').length;
      const declined = allLeaves.filter(leave => leave.status === 'Declined').length;
      setLeaveStats({ approved, declined });
      setError(null);
    } catch (err) {
      console.error("Error fetching leave stats:", err);
      setError("Failed to fetch leave stats. Please try again.");
    }
  };

  const fetchPendingSalaryRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/salary-requests/pending");
      setPendingSalaryRequests(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching pending salary requests:", err);
      setError("Failed to fetch pending salary requests. Please try again.");
      setPendingSalaryRequests([]);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      if (selectedItem === "Dashboard") {
        await Promise.all([fetchAllLeavePatterns(), fetchLeaveStats()]);
      } else if (selectedItem === "Leaves") {
        await Promise.all([fetchPendingLeaves(), fetchApprovedLeaves()]);
      } else if (selectedItem === "Employees") {
        await fetchEmployeeStats();
      } else if (selectedItem === "Salary") {
        await fetchPendingSalaryRequests();
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to refresh data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/leaves/approve/${id}`);
      await fetchPendingLeaves();
      if (res.data) {
        setApprovedLeaves((prev) => [...prev, res.data]);
      } else {
        await fetchApprovedLeaves();
      }
      await Promise.all([
        fetchAllLeavePatterns(),
        fetchLeaveStats(),
        fetchEmployeeStats(),
      ]);
      alert("Leave approved!");
    } catch (err) {
      console.error("Error approving leave:", err);
      alert("Failed to approve leave.");
      setError("Failed to approve leave. Please try again.");
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
      await Promise.all([
        fetchPendingLeaves(),
        fetchAllLeavePatterns(),
        fetchLeaveStats(),
        fetchEmployeeStats(),
      ]);
      alert("Leave declined successfully.");
    } catch (err) {
      console.error("Error declining leave:", err);
      alert("Failed to decline leave.");
      setError("Failed to decline leave. Please try again.");
    }
  };

  const handleSetSalary = async (requestId, employeeEmail) => {
    const basicPay = prompt("Enter Basic Pay (₹):");
    const hra = prompt("Enter HRA (₹):");
    const allowances = prompt("Enter Allowances (₹):");

    if (!basicPay || !hra || !allowances) {
      alert("All salary fields are required.");
      return;
    }

    const basicPayNum = parseFloat(basicPay);
    const hraNum = parseFloat(hra);
    const allowancesNum = parseFloat(allowances);

    if (isNaN(basicPayNum) || isNaN(hraNum) || isNaN(allowancesNum)) {
      alert("Please enter valid numbers for salary fields.");
      return;
    }

    const total = basicPayNum + hraNum + allowancesNum;

    try {
      await axios.put(`http://localhost:5000/api/users/salary/${encodeURIComponent(employeeEmail)}`, {
        salary: {
          basicPay: basicPayNum,
          hra: hraNum,
          allowances: allowancesNum,
          total,
          month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        },
      });
      await axios.put(`http://localhost:5000/api/salary-requests/approve/${requestId}`);
      await fetchPendingSalaryRequests();
      alert("Salary set successfully!");
      setError(null);
    } catch (err) {
      console.error("Error setting salary:", err);
      alert("Failed to set salary.");
      setError("Failed to set salary. Please try again.");
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
    if (selectedItem === "Salary") {
      fetchPendingSalaryRequests();
    }
  }, [selectedItem]);

  const handleLogout = () => {
    navigate("/Signup");
  };

  const pieData = [
    { name: 'Approved', value: leaveStats.approved },
    { name: 'Declined', value: leaveStats.declined },
  ].filter(entry => entry.value > 0);

  const barData = [
    { name: 'Approved', count: leaveStats.approved, fill: '#22c55e' },
    { name: 'Declined', count: leaveStats.declined, fill: '#ef4444' },
  ];

  const COLORS = ['#22c55e', '#ef4444'];

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-gradient-bg">
      <style>
        {`
          :root {
            --accent-color: #1e3a8a;
            --glass-bg: rgba(255, 255, 255, 0.1);
            --glass-border: rgba(255, 255, 255, 0.2);
          }
          .dark {
            --glass-bg: rgba(0, 0, 0, 0.2);
            --glass-border: rgba(255, 255, 255, 0.1);
          }
          .animate-gradient-bg {
            background-size: 200% 200%;
            animation: gradient 15s ease infinite;
          }
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .glassmorphism {
            background: var(--glass-bg);
            backdrop-filter: blur(10px);
            border: 1px solid var(--glass-border);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          .futuristic-button {
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            border: none;
            z-index: 1;
          }
          .futuristic-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.3),
              transparent
            );
            transition: 0.5s;
            z-index: -1;
          }
          .futuristic-button:hover::before {
            left: 100%;
          }
          .futuristic-button:hover {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
          }
          * {
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
          }
          @media (max-width: 640px) {
            nav {
              position: fixed;
              z-index: 50;
            }
            main {
              margin-left: 0;
            }
          }
        `}
      </style>
      <motion.nav
        className={`transition-all duration-500 ${open ? 'w-60' : 'w-16'} bg-[var(--accent-color)] dark:bg-gray-800 flex flex-col z-10`}
        initial={{ width: 60 }}
        animate={{ width: open ? 240 : 60 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between p-4 h-20">
          <motion.img
            src="/aju.jpg"
            alt="logo"
            className={`transition-all duration-300 ${open ? 'w-10' : 'w-0'} rounded-md`}
            initial={{ width: 0 }}
            animate={{ width: open ? 40 : 0 }}
          />
          <MdMenuOpen
            size={28}
            color="white"
            onClick={() => setOpen(!open)}
            className="cursor-pointer"
          />
        </div>
        <ul className="flex-1 space-y-2 mt-4">
          {menuItems.map((item, idx) => (
            <motion.li
              key={idx}
              onClick={() => setSelectedItem(item.label)}
              className="flex items-center gap-3 text-white px-4 py-3 hover:bg-[var(--accent-color)]/80 dark:hover:bg-gray-700 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div>{item.icons}</div>
              <motion.span
                className={`${open ? 'inline' : 'hidden'} transition-opacity duration-300`}
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
            className={`${open ? 'inline' : 'hidden'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: open ? 1 : 0 }}
          >
            Admin
          </motion.span>
        </div>
        <motion.div
          className="px-4 py-3 text-white flex items-center gap-3 cursor-pointer hover:bg-[var(--accent-color)]/80 dark:hover:bg-gray-700"
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <IoIosLogOut size={23} />
          <motion.span
            className={`${open ? 'inline' : 'hidden'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: open ? 1 : 0 }}
          >
            Logout
          </motion.span>
        </motion.div>
      </motion.nav>

      <motion.main
        className="flex-1 overflow-auto p-4 sm:p-6 lg:p-10 transition-colors duration-300 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <motion.button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="futuristic-button text-[var(--accent-color)] dark:text-gray-200 bg-[var(--glass-bg)] p-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {theme === 'light' ? <BsMoon size={20} /> : <BsSun size={20} />}
          </motion.button>
          <motion.button
            onClick={handleRefresh}
            className="futuristic-button text-[var(--accent-color)] dark:text-gray-200 bg-[var(--glass-bg)] p-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={loading}
          >
            <MdRefresh size={20} className={loading ? 'animate-spin' : ''} />
          </motion.button>
        </div>
        <AnimatePresence mode="wait">
          {selectedItem === "Dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent-color)] dark:text-gray-100 mb-4">
                Welcome, Admin!
              </h1>
              <p className="text-gray-700 dark:text-gray-200 text-sm sm:text-base mb-6">
                Use the sidebar to manage employees, salaries, and leaves. Current time: 08:44 PM IST, May 22, 2025.
              </p>
              {error && (
                <div className="glassmorphism text-red-700 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--accent-color)] dark:text-gray-100 mb-4">
                Leave Approval Statistics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <motion.div
                  className="glassmorphism p-4 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="text-lg font-semibold dark:text-gray-200 mb-4">Approval Breakdown (Pie Chart)</h3>
                  {leaveStats.approved + leaveStats.declined === 0 ? (
                    <p className="dark:text-gray-200">No leaves processed yet.</p>
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
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#1f2937' : 'var(--glass-bg)',
                          color: theme === 'dark' ? '#d1d5db' : '#1e3a8a',
                          border: 'none',
                          backdropFilter: 'blur(10px)',
                        }}
                      />
                      <Legend wrapperStyle={{ color: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }} />
                    </PieChart>
                  )}
                </motion.div>
                <motion.div
                  className="glassmorphism p-4 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="text-lg font-semibold dark:text-gray-200 mb-4">Approval Breakdown (Bar Chart)</h3>
                  {leaveStats.approved + leaveStats.declined === 0 ? (
                    <p className="dark:text-gray-200">No leaves processed yet.</p>
                  ) : (
                    <BarChart width={300} height={300} data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                      <XAxis dataKey="name" tick={{ fill: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }} />
                      <YAxis tick={{ fill: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#1f2937' : 'var(--glass-bg)',
                          color: theme === 'dark' ? '#d1d5db' : '#1e3a8a',
                          border: 'none',
                          backdropFilter: 'blur(10px)',
                        }}
                      />
                      <Bar dataKey="count" name="Leaves">
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </motion.div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--accent-color)] dark:text-gray-100 mb-4">
                Leave Patterns (Monthly Trends)
              </h2>
              {leavePatterns.length === 0 ? (
                <p className="dark:text-gray-200">No leave patterns available.</p>
              ) : (
                <motion.div
                  className="glassmorphism p-4 rounded-lg mb-6"
                  whileHover={{ scale: 1.02 }}
                >
                  <BarChart width={600} height={300} data={leavePatterns}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis
                      dataKey="month"
                      label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }}
                      tick={{ fill: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }}
                    />
                    <YAxis
                      label={{ value: 'Days', angle: -90, position: 'insideLeft', fill: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }}
                      tick={{ fill: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : 'var(--glass-bg)',
                        color: theme === 'dark' ? '#d1d5db' : '#1e3a8a',
                        border: 'none',
                        backdropFilter: 'blur(10px)',
                      }}
                    />
                    <Legend wrapperStyle={{ color: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }} />
                    <Bar dataKey="days" fill="#1e3a8a" name="Total Leave Days" />
                  </BarChart>
                </motion.div>
              )}
            </motion.div>
          )}

          {selectedItem === "Employees" && (
            <motion.div
              key="employees"
              className="glassmorphism p-4 sm:p-6 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--accent-color)] dark:text-gray-100 mb-4">
                Employee Leave Statistics
              </h2>
              {error && (
                <div className="glassmorphism text-red-700 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              {employeeStats.length === 0 ? (
                <p className="dark:text-gray-200">{error || "No employee leave data available."}</p>
              ) : (
                employeeStats.map((employee, index) => (
                  <motion.div
                    key={index}
                    className="glassmorphism p-3 sm:p-4 rounded-md mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <p className="dark:text-gray-200"><strong>Employee:</strong> {employee.name || 'N/A'} ({employee.email || 'N/A'})</p>
                    <p className="dark:text-gray-200"><strong>Approved Leaves:</strong> {employee.approved || 0}</p>
                    <p className="dark:text-gray-200"><strong>Declined Leaves:</strong> {employee.declined || 0}</p>
                    <p className="dark:text-gray-200"><strong>Pending Leaves:</strong> {employee.pending || 0}</p>
                    <p className="dark:text-gray-200"><strong>Last Updated:</strong> {employee.updatedAt ? new Date(employee.updatedAt).toLocaleDateString() : 'N/A'}</p>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {selectedItem === "Leaves" && (
            <motion.div
              key="leaves"
              className="glassmorphism p-4 sm:p-6 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--accent-color)] dark:text-gray-100 mb-4">
                Leave Requests
              </h2>
              {error && (
                <div className="glassmorphism text-red-700 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              {pendingLeaves.length === 0 ? (
                <p className="dark:text-gray-200">{error || "No pending leave requests."}</p>
              ) : (
                pendingLeaves.map((leave) => (
                  <motion.div
                    key={leave._id}
                    className="glassmorphism p-3 sm:p-4 rounded-md mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <p className="dark:text-gray-200"><strong>Employee:</strong> {leave.email || 'N/A'}</p>
                    <p className="dark:text-gray-200"><strong>From:</strong> {leave.from ? new Date(leave.from).toLocaleDateString() : 'N/A'}</p>
                    <p className="dark:text-gray-200"><strong>To:</strong> {leave.to ? new Date(leave.to).toLocaleDateString() : 'N/A'}</p>
                    <p className="dark:text-gray-200"><strong>Reason:</strong> {leave.reason || 'N/A'}</p>
                    <div className="flex gap-3 mt-3">
                      <motion.button
                        className="futuristic-button bg-green-600 text-white px-4 py-2 rounded-md text-sm"
                        onClick={() => handleApprove(leave._id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Approve
                      </motion.button>
                      <motion.button
                        className="futuristic-button bg-red-600 text-white px-4 py-2 rounded-md text-sm"
                        onClick={() => handleDecline(leave._id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Decline
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {selectedItem === "Salary" && (
            <motion.div
              key="salary"
              className="glassmorphism p-4 sm:p-6 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--accent-color)] dark:text-gray-100 mb-4">
                Salary Management
              </h2>
              {error && (
                <div className="glassmorphism text-red-700 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              {pendingSalaryRequests.length === 0 ? (
                <p className="dark:text-gray-200">{error || "No pending salary requests."}</p>
              ) : (
                pendingSalaryRequests.map((request) => (
                  <motion.div
                    key={request._id}
                    className="glassmorphism p-3 sm:p-4 rounded-md mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <p className="dark:text-gray-200"><strong>Employee:</strong> {request.employeeEmail || 'N/A'}</p>
                    <p className="dark:text-gray-200"><strong>Requested At:</strong> {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}</p>
                    <div className="flex gap-3 mt-3">
                      <motion.button
                        className="futuristic-button bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                        onClick={() => handleSetSalary(request._id, request.employeeEmail)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Set Salary
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {selectedItem === "Settings" && (
            <motion.div
              key="settings"
              className="glassmorphism p-4 sm:p-6 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--accent-color)] dark:text-gray-100 mb-4">
                Settings
              </h2>
              <p className="dark:text-gray-200">Settings features coming soon.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
};

export default AdminDashboard;