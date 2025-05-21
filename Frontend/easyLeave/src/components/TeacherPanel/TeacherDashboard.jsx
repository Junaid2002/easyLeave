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
import moment from 'moment';
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
  const [stats, setStats] = useState({ pending: 0, approved: 0, declined: 0 });
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [accentColor, setAccentColor] = useState(localStorage.getItem('accentColor') || 'blue');
  const [leavePatterns, setLeavePatterns] = useState([]);
  const [recommendedDays, setRecommendedDays] = useState([]);
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
    setLoading(true);
    setError(null);
    try {
      const endpoint = isAdmin
        ? 'http://localhost:5000/api/leaves'
        : `http://localhost:5000/api/leaves/email?email=${encodeURIComponent(userEmail)}`;
      const res = await axios.get(endpoint);
      const leaveData = Array.isArray(res.data) ? res.data : [];
      setLeaves(leaveData);

      const pending = leaveData.filter((l) => l.status === 'Pending').length;
      const approved = leaveData.filter((l) => l.status === 'Approved').length;
      const declined = leaveData.filter((l) => l.status === 'Declined').length;
      setStats({ pending, approved, declined });

      const events = leaveData.map((leave) => ({
        title: `${leave.email} - ${leave.reason}`,
        start: new Date(leave.from),
        end: leave.oneDay ? new Date(leave.from) : new Date(leave.to),
        allDay: true,
        resource: leave,
      }));
      setCalendarEvents(events);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
      setError('Failed to load leaves. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users?email=${encodeURIComponent(userEmail)}`);
      const user = res.data || {};
      setUserDetails(user);
      setIsAdmin(user.role === 'admin');
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      setIsAdmin(false); 
    }
  };

  const fetchLeavePatterns = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/leaves/patterns?email=${encodeURIComponent(userEmail)}`);
      setLeavePatterns(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch leave patterns:', error);
    }
  };

  const fetchRecommendedDays = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/leaves/recommendations?email=${encodeURIComponent(userEmail)}`);
      setRecommendedDays(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch recommended days:', error);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchUserDetails();
    fetchLeavePatterns();
    fetchRecommendedDays();

    const interval = setInterval(fetchLeaves, 10000);
    return () => clearInterval(interval);
  }, [isAdmin, userEmail]); 

  const handleSubmit = async () => {
    if (!leaveFromDate || !leaveReason) {
      alert('Please fill in the From date and Reason fields');
      return;
    }
    if (!oneDay && !leaveToDate) {
      alert('Please fill in the To date for multi-day leaves');
      return;
    }

    const fromDate = new Date(leaveFromDate);
    const toDate = oneDay ? fromDate : new Date(leaveToDate);
    const today = new Date().setHours(0, 0, 0, 0);
    if (isNaN(fromDate.getTime()) || (!oneDay && isNaN(toDate.getTime()))) {
      alert('Invalid date format');
      return;
    }
    if (fromDate < today) {
      alert('From date cannot be in the past');
      return;
    }
    if (!oneDay && toDate < fromDate) {
      alert('To date must be after From date');
      return;
    }

    const newLeave = {
      from: fromDate.toISOString().split('T')[0],
      to: oneDay ? fromDate.toISOString().split('T')[0] : toDate.toISOString().split('T')[0],
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
      await fetchLeaves();
      await fetchRecommendedDays();
    } catch (error) {
      console.error('Leave submission failed:', error);
      alert(`Failed to submit leave: ${error.response?.data?.message || 'Unknown error'}`);
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
    <div className="flex h-screen overflow-hidden">
      <motion.nav
        className={`transition-all duration-500 ${open ? 'w-60' : 'w-16'} bg-[var(--accent-color)] dark:bg-gray-800 flex flex-col`}
        initial={{ width: 60 }}
        animate={{ width: open ? 240 : 60 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between p-4 h-20">
          <motion.img
            src="aju.jpg"
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
        className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-10 transition-colors duration-300 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <motion.button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="text-[var(--accent-color)] dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {theme === 'light' ? <BsMoon size={20} /> : <BsSun size={20} />}
          </motion.button>
          <motion.button
            onClick={fetchLeaves}
            className="text-[var(--accent-color)] dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={loading}
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
                <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <motion.div
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <h3 className="text-lg font-semibold dark:text-gray-200">Pending</h3>
                  <p className="text-2xl text-orange-500">{loading ? '...' : stats.pending}</p>
                </motion.div>
                <motion.div
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <h3 className="text-lg font-semibold dark:text-gray-200">Approved</h3>
                  <p className="text-2xl text-green-500">{loading ? '...' : stats.approved}</p>
                </motion.div>
                <motion.div
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <h3 className="text-lg font-semibold dark:text-gray-200">Declined</h3>
                  <p className="text-2xl text-red-500">{loading ? '...' : stats.declined}</p>
                </motion.div>
              </div>
              <motion.div
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6"
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
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                        color: theme === 'dark' ? '#d1d5db' : '#1e3a8a',
                      }}
                    />
                    <Legend wrapperStyle={{ color: theme === 'dark' ? '#d1d5db' : '#1e3a8a' }} />
                  </PieChart>
                ) : (
                  <p className="dark:text-gray-200">No leave data available.</p>
                )}
              </motion.div>
              <motion.div
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6"
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
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                        color: theme === 'dark' ? '#d1d5db' : '#1e3a8a',
                      }}
                    />
                    <Bar dataKey="days" fill="#1e3a8a" />
                  </BarChart>
                ) : (
                  <p className="dark:text-gray-200">No leave patterns available.</p>
                )}
              </motion.div>
              <motion.div
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6"
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
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6"
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
                        className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg flex justify-between items-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div>
                          <div className="dark:text-gray-200">
                            <strong>Dates:</strong>{' '}
                            {leave.oneDay
                              ? new Date(leave.from).toLocaleDateString()
                              : `${new Date(leave.from).toLocaleDateString()} to ${new Date(leave.to).toLocaleDateString()}`}
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
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md w-full max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-2xl font-bold mb-6 text-[var(--accent-color)] dark:text-gray-100">Apply for Leave</h2>
              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <label className="block mb-1 font-semibold dark:text-gray-200">Recommended Days to Take Leave:</label>
                  {recommendedDays.length > 0 ? (
                    <ul className="list-disc pl-5 dark:text-gray-200">
                      {recommendedDays.map((day, idx) => (
                        <li key={idx}>{new Date(day).toLocaleDateString()}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="dark:text-gray-200">No recommended days available.</p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-semibold dark:text-gray-200">Leave From:</label>
                  <input
                    type="date"
                    value={leaveFromDate}
                    onChange={(e) => {
                      setLeaveFromDate(e.target.value);
                      if (oneDay) setLeaveToDate(e.target.value);
                    }}
                    className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold dark:text-gray-200">Leave To:</label>
                  <input
                    type="date"
                    value={leaveToDate}
                    onChange={(e) => setLeaveToDate(e.target.value)}
                    disabled={oneDay}
                    className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
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
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="oneDay" className="dark:text-gray-200">One Day Leave</label>
                </div>
                <div>
                  <label className="block mb-1 font-semibold dark:text-gray-200">Reason:</label>
                  <textarea
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    rows="4"
                    required
                  />
                </div>
                <motion.button
                  onClick={handleSubmit}
                  className="bg-[var(--accent-color)] text-white px-6 py-3 rounded-md hover:bg-[var(--accent-color)]/80 dark:bg-gray-700 dark:hover:bg-gray-600"
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
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-[var(--accent-color)] dark:text-gray-100">Salary Details</h2>
              <div className="space-y-3 dark:text-gray-200">
                <div className="flex justify-between">
                  <span>Basic Pay:</span>
                  <span>₹30,000</span>
                </div>
                <div className="flex justify-between">
                  <span>HRA:</span>
                  <span>₹10,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Allowances:</span>
                  <span>₹5,000</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>₹45,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Month:</span>
                  <span>April 2025</span>
                </div>
              </div>
            </motion.div>
          )}

          {selectedItem === 'Profile' && (
            <motion.div
              key="profile"
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md max-w-3xl mx-auto"
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
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-[var(--accent-color)] dark:text-gray-100">Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-semibold dark:text-gray-200">Theme Color:</label>
                  <select
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