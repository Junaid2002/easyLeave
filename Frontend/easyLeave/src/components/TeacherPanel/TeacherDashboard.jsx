import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdMenuOpen, MdOutlineDashboard, MdCurrencyRupee, MdRefresh } from 'react-icons/md';
import { IoIosLogOut } from 'react-icons/io';
import { CiSettings, CiUser } from 'react-icons/ci';
import { CgProfile } from 'react-icons/cg';
import { FaRegCalendarCheck } from 'react-icons/fa';
import { BsSun, BsMoon } from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment-timezone'; // Updated to use moment-timezone for IST
import 'react-big-calendar/lib/css/react-big-calendar.css';

const menuItems = [
  { icons: <MdOutlineDashboard size={23} />, label: 'Dashboard' },
  { icons: <CiUser size={23} />, label: 'Profile' },
  { icons: <MdCurrencyRupee size={23} />, label: 'Salary' },
  { icons: <FaRegCalendarCheck size={23} />, label: 'Leave Application' },
  { icons: <CiSettings size={23} />, label: 'Settings' },
];

const StatusDot = ({ status }) => {
  const color = status === 'Approved' ? 'green' : status === 'Declined' ? 'red' : 'orange';
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
      aria-label={`Status: ${status}`}
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
  const [formErrors, setFormErrors] = useState({}); // Added for form validation feedback
  const [leaves, setLeaves] = useState([]);
  const [oneDay, setOneDay] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, declined: 0 });
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [accentColor, setAccentColor] = useState(localStorage.getItem('accentColor') || 'blue');
  const [leavePatterns, setLeavePatterns] = useState([]);
  const [recommendedDays, setRecommendedDays] = useState([]);
  const [salaryDetails, setSalaryDetails] = useState(null); // Added for dynamic salary data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userEmail = localStorage.getItem('userEmail') || 'akanchha@example.com';

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (accentColor === 'blue') {
      root.style.setProperty('--accent-color', '#1e3a8a');
    } else if (accentColor === 'green') {
      root.style.setProperty('--accent-color', '#15803d');
    } else if (accentColor === 'purple') {
      root.style.setProperty('--accent-color', '#6b21a8');
    }
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  const fetchLeaves = async () => {
    try {
      const endpoint = isAdmin
        ? 'http://localhost:5000/api/leaves'
        : `http://localhost:5000/api/leaves/by-email?email=${encodeURIComponent(userEmail)}`;
      const res = await axios.get(endpoint);
      const leaveData = Array.isArray(res.data) ? res.data : [];
      setLeaves(leaveData);

      const pending = leaveData.filter((l) => l.status === 'Pending').length;
      const approved = leaveData.filter((l) => l.status === 'Approved').length;
      const declined = leaveData.filter((l) => l.status === 'Declined').length;
      setStats({ pending, approved, declined });

      const events = leaveData.map((leave) => ({
        title: `${userDetails?.name || leave.email} - ${leave.reason}`, // Improved event title
        start: moment(leave.from).tz('Asia/Kolkata').toDate(), // Adjusted for IST
        end: leave.oneDay ? moment(leave.from).tz('Asia/Kolkata').toDate() : moment(leave.to).tz('Asia/Kolkata').toDate(),
        allDay: true,
        resource: leave,
      }));
      setCalendarEvents(events);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      setError(error.response?.data?.message || 'Failed to load leaves. Please try again.');
    }
  };

  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users?email=${encodeURIComponent(userEmail)}`);
      const user = res.data || {};
      setUserDetails(user);
      setIsAdmin(user.role === 'admin');
    } catch (error) {
      console.error('Error fetching user details:', error);
      setIsAdmin(false);
      setError(error.response?.data?.message || 'Failed to load user details. Please try again.');
    }
  };

  const fetchLeavePatterns = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/leaves/patterns?email=${encodeURIComponent(userEmail)}`);
      setLeavePatterns(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching leave patterns:', error);
      setError(error.response?.data?.message || 'Failed to load leave patterns. Please try again.');
    }
  };

  const fetchRecommendedDays = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/leaves/recommendations?email=${encodeURIComponent(userEmail)}`);
      setRecommendedDays(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching recommended days:', error);
      setError(error.response?.data?.message || 'Failed to load recommended days. Please try again.');
    }
  };

  const fetchSalaryDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/salary?email=${encodeURIComponent(userEmail)}`);
      setSalaryDetails(res.data || {});
    } catch (error) {
      console.error('Error fetching salary details:', error);
      setError(error.response?.data?.message || 'Failed to load salary details. Please try again.');
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchLeaves(),
          fetchUserDetails(),
          fetchLeavePatterns(),
          fetchRecommendedDays(),
          fetchSalaryDetails(),
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to load initial data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [isAdmin, userEmail]);

  const validateForm = () => {
    const errors = {};
    if (!leaveFromDate) {
      errors.fromDate = 'From date is required';
    }
    if (!leaveReason) {
      errors.reason = 'Reason is required';
    }
    if (!oneDay && !leaveToDate) {
      errors.toDate = 'To date is required for multi-day leaves';
    }

    const fromDate = leaveFromDate ? moment(leaveFromDate).tz('Asia/Kolkata').toDate() : null;
    const toDate = oneDay ? fromDate : leaveToDate ? moment(leaveToDate).tz('Asia/Kolkata').toDate() : null;
    const today = moment().tz('Asia/Kolkata').startOf('day').toDate();

    if (fromDate && isNaN(fromDate.getTime())) {
      errors.fromDate = 'Invalid from date format';
    }
    if (!oneDay && toDate && isNaN(toDate.getTime())) {
      errors.toDate = 'Invalid to date format';
    }
    if (fromDate && fromDate < today) {
      errors.fromDate = 'From date cannot be in the past';
    }
    if (!oneDay && fromDate && toDate && toDate < fromDate) {
      errors.toDate = 'To date must be after From date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const fromDate = moment(leaveFromDate).tz('Asia/Kolkata').toDate();
    const toDate = oneDay ? fromDate : moment(leaveToDate).tz('Asia/Kolkata').toDate();

    const newLeave = {
      from: moment(fromDate).format('YYYY-MM-DD'),
      to: moment(toDate).format('YYYY-MM-DD'),
      reason: leaveReason,
      oneDay,
      email: userEmail,
    };

    setLoading(true);
    setError(null);
    try {
      await axios.post('http://localhost:5000/api/leaves', newLeave);
      alert('Leave submitted successfully.');
      setLeaveFromDate('');
      setLeaveToDate('');
      setLeaveReason('');
      setOneDay(false);
      setFormErrors({});
      await fetchLeaves();
      await fetchRecommendedDays();
    } catch (error) {
      console.error('Error submitting leave:', error);
      setError(error.response?.data?.message || 'Failed to submit leave. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Pending', value: stats.pending },
    { name: 'Approved', value: stats.approved },
    { name: 'Declined', value: stats.declined },
  ].filter((entry) => entry.value > 0);

  const COLORS = ['#f97316', '#22c55e', '#ef4444'];

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
          .error-text {
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.25rem;
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
            alt="Logo"
            className={`transition-all duration-300 ${open ? 'w-10' : 'w-0'} rounded-md`}
            initial={{ width: 0 }}
            animate={{ width: open ? 40 : 0 }}
          />
          <MdMenuOpen
            size={28}
            color="white"
            onClick={() => setOpen(!open)}
            className="cursor-pointer"
            aria-label="Toggle navigation menu"
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
              role="menuitem"
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
          <CgProfile size={23} aria-hidden="true" />
          <motion.span
            className={`${open ? 'inline' : 'hidden'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: open ? 1 : 0 }}
          >
            {userDetails ? userDetails.name : 'User'}
          </motion.span>
        </div>
        <motion.div
          className="px-4 py-3 text-white flex items-center gap-3 cursor-pointer hover:bg-[var(--accent-color)]/80 dark:hover:bg-gray-700"
          onClick={() => {
            localStorage.removeItem('userEmail');
            window.location.href = '/';
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          role="button"
          aria-label="Logout"
        >
          <IoIosLogOut size={23} aria-hidden="true" />
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
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <BsMoon size={20} /> : <BsSun size={20} />}
          </motion.button>
          <motion.button
            onClick={fetchLeaves}
            className="futuristic-button text-[var(--accent-color)] dark:text-gray-200 bg-[var(--glass-bg)] p-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={loading}
            aria-label="Refresh leave data"
          >
            <MdRefresh size={20} className={loading ? 'animate-spin' : ''} />
          </motion.button>
        </div>
        <AnimatePresence mode="wait">
          {selectedItem === 'Dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-[var(--accent-color)] dark:text-gray-100 mb-4">
                {isAdmin ? 'Admin Dashboard' : 'Leave Summary'}
              </h2>
              {error && (
                <div className="glassmorphism text-red-700 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <motion.div
                  className="glassmorphism p-4 rounded-lg text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <h3 className="text-lg font-semibold dark:text-gray-200">Pending</h3>
                  <p className="text-2xl text-orange-500">{loading ? '...' : stats.pending}</p>
                </motion.div>
                <motion.div
                  className="glassmorphism p-4 rounded-lg text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <h3 className="text-lg font-semibold dark:text-gray-200">Approved</h3>
                  <p className="text-2xl text-green-500">{loading ? '...' : stats.approved}</p>
                </motion.div>
                <motion.div
                  className="glassmorphism p-4 rounded-lg text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <h3 className="text-lg font-semibold dark:text-gray-200">Declined</h3>
                  <p className="text-2xl text-red-500">{loading ? '...' : stats.declined}</p>
                </motion.div>
              </div>
              <motion.div
                className="glassmorphism p-6 rounded-lg mb-6"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Leave Trends (Pie Chart)</h3>
                {loading ? (
                  <p className="dark:text-gray-200">Loading chart...</p>
                ) : pieData.length > 0 ? (
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
                ) : (
                  <p className="dark:text-gray-200">No leave data available.</p>
                )}
              </motion.div>
              <motion.div
                className="glassmorphism p-6 rounded-lg mb-6"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Leave Patterns (Monthly Trends)</h3>
                {loading ? (
                  <p className="dark:text-gray-200">Loading patterns...</p>
                ) : leavePatterns.length > 0 ? (
                  <BarChart width={600} height={300} data={leavePatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
                      tick={{ fill: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }}
                    />
                    <YAxis
                      label={{ value: 'Days', angle: -90, position: 'insideLeft' }}
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
                    <Bar dataKey="days" fill="#1e3a8a" />
                  </BarChart>
                ) : (
                  <p className="dark:text-gray-200">No leave patterns available.</p>
                )}
              </motion.div>
              <motion.div
                className="glassmorphism p-6 rounded-lg mb-6"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Upcoming Leaves</h3>
                {loading ? (
                  <p className="dark:text-gray-200">Loading calendar...</p>
                ) : (
                  <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    onSelectEvent={(event) => alert(`Leave: ${event.title}`)}
                    className="dark:bg-gray-800 dark:text-gray-200"
                  />
                )}
              </motion.div>
              <motion.div
                className="glassmorphism p-6 rounded-lg mt-6"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">My Leave Requests</h3>
                {loading ? (
                  <p className="dark:text-gray-200">Loading leave requests...</p>
                ) : leaves.length === 0 ? (
                  <p className="dark:text-gray-200">No leave applications submitted yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {leaves.map((leave, idx) => (
                      <motion.li
                        key={leave._id || idx}
                        className="glassmorphism p-4 rounded-lg flex justify-between items-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div>
                          <div className="dark:text-gray-200">
                            <strong>Dates:</strong>{' '}
                            {leave.oneDay
                              ? moment(leave.from).tz('Asia/Kolkata').format('LL')
                              : `${moment(leave.from).tz('Asia/Kolkata').format('LL')} to ${moment(leave.to).tz('Asia/Kolkata').format('LL')}`}
                          </div>
                          <div className="dark:text-gray-200">
                            <strong>Reason:</strong> {leave.reason}
                          </div>
                          {leave.status === 'Declined' && leave.declineReason && (
                            <div className="dark:text-gray-200">
                              <strong>Decline Reason:</strong> {leave.declineReason}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusDot status={leave.status} />
                          <span className="capitalize font-medium dark:text-gray-200">{leave.status}</span>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </motion.div>
          )}

          {selectedItem === 'Leave Application' && (
            <motion.div
              key="leave"
              className="glassmorphism p-6 rounded-xl w-full max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-2xl font-bold mb-6 text-[var(--accent-color)] dark:text-gray-100">Apply for Leave</h2>
              {error && (
                <div className="glassmorphism text-red-700 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <label className="block mb-1 font-semibold dark:text-gray-200">Recommended Days to Take Leave:</label>
                  {recommendedDays.length > 0 ? (
                    <ul className="list-disc pl-5 dark:text-gray-200">
                      {recommendedDays.map((day, idx) => (
                        <li key={idx}>{moment(day).tz('Asia/Kolkata').format('LL')}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="dark:text-gray-200">No recommended days available.</p>
                  )}
                </div>
                <div>
                  <label htmlFor="leaveFromDate" className="block mb-1 font-semibold dark:text-gray-200">
                    Leave From:
                  </label>
                  <input
                    type="date"
                    id="leaveFromDate"
                    value={leaveFromDate}
                    onChange={(e) => {
                      setLeaveFromDate(e.target.value);
                      if (oneDay) setLeaveToDate(e.target.value);
                    }}
                    className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    required
                    aria-describedby={formErrors.fromDate ? 'fromDate-error' : undefined}
                  />
                  {formErrors.fromDate && (
                    <p id="fromDate-error" className="error-text">
                      {formErrors.fromDate}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="leaveToDate" className="block mb-1 font-semibold dark:text-gray-200">
                    Leave To:
                  </label>
                  <input
                    type="date"
                    id="leaveToDate"
                    value={leaveToDate}
                    onChange={(e) => setLeaveToDate(e.target.value)}
                    disabled={oneDay}
                    className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    required={!oneDay}
                    aria-describedby={formErrors.toDate ? 'toDate-error' : undefined}
                  />
                  {formErrors.toDate && (
                    <p id="toDate-error" className="error-text">
                      {formErrors.toDate}
                    </p>
                  )}
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
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="oneDay" className="dark:text-gray-200">One Day Leave</label>
                </div>
                <div>
                  <label htmlFor="leaveReason" className="block mb-1 font-semibold dark:text-gray-200">
                    Reason:
                  </label>
                  <textarea
                    id="leaveReason"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    rows="4"
                    required
                    aria-describedby={formErrors.reason ? 'reason-error' : undefined}
                  />
                  {formErrors.reason && (
                    <p id="reason-error" className="error-text">
                      {formErrors.reason}
                    </p>
                  )}
                </div>
                <motion.button
                  onClick={handleSubmit}
                  className="futuristic-button bg-[var(--accent-color)] text-white px-6 py-3 rounded-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {selectedItem === 'Salary' && (
            <motion.div
              key="salary"
              className="glassmorphism p-6 rounded-xl max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-[var(--accent-color)] dark:text-gray-100">Salary Details</h2>
              {salaryDetails ? (
                <div className="space-y-3 dark:text-gray-200">
                  <div className="flex justify-between">
                    <span>Basic Pay:</span>
                    <span>₹{salaryDetails.basicPay?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HRA:</span>
                    <span>₹{salaryDetails.hra?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Allowances:</span>
                    <span>₹{salaryDetails.allowances?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>₹{salaryDetails.total?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Month:</span>
                    <span>{salaryDetails.month || 'N/A'}</span>
                  </div>
                </div>
              ) : loading ? (
                <p className="dark:text-gray-200">Loading salary details...</p>
              ) : (
                <p className="dark:text-gray-200">No salary details available.</p>
              )}
            </motion.div>
          )}

          {selectedItem === 'Profile' && (
            <motion.div
              key="profile"
              className="glassmorphism p-6 rounded-xl max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-[var(--accent-color)] dark:text-gray-100">Profile</h2>
              {userDetails ? (
                <div className="space-y-3 dark:text-gray-200">
                  <div>
                    <strong>Name:</strong> {userDetails.name || 'N/A'}
                  </div>
                  <div>
                    <strong>Email:</strong> {userDetails.email || userEmail}
                  </div>
                  <div>
                    <strong>Position:</strong> {userDetails.position || 'N/A'}
                  </div>
                  <div>
                    <strong>Department:</strong> {userDetails.department || 'N/A'}
                  </div>
                  <div>
                    <strong>Phone:</strong> {userDetails.phone || 'N/A'}
                  </div>
                </div>
              ) : (
                <p className="dark:text-gray-200">Loading profile...</p>
              )}
            </motion.div>
          )}

          {selectedItem === 'Settings' && (
            <motion.div
              key="settings"
              className="glassmorphism p-6 rounded-xl max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-[var(--accent-color)] dark:text-gray-100">Settings</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="themeColor" className="block mb-1 font-semibold dark:text-gray-200">
                    Theme Color:
                  </label>
                  <select
                    id="themeColor"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  >
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="purple">Purple</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
};

export default TeacherDashboard;