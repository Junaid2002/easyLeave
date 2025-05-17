import React, { useState } from 'react';
import { MdMenuOpen, MdOutlineDashboard, MdCurrencyRupee } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import { FaUserLarge } from "react-icons/fa6";
import { SlCalender } from "react-icons/sl";
import { CgProfile } from "react-icons/cg";

const menuItems = [
    { icons: <MdOutlineDashboard color='white' size={23} />, label: 'Dashboard' },
    { icons: <FaUserLarge color='white' size={21} />, label: 'Employees' },
    { icons: <MdCurrencyRupee color='white' size={23} />, label: 'Salary' },
    { icons: <SlCalender color='white' size={23} />, label: 'Leaves' },
    { icons: <CiSettings color='white' size={23} />, label: 'Settings' }
];

const dummyEmployees = [
    { name: "Akansha", email: "akansha25@gmail.com", position: "Assistant Professor", department: "Computer Science" },
    { name: "Riya Sharma", email: "riya21@gmail.com", position: "Assistant Professor", department: "Mechanical" },
    { name: "Priya Sharma", email: "priya12@gmaile.com", position: "Assistant Professor", department: "Electrical" }
];

const AdminDashboard = () => {
    const [open, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState('Dashboard');
    const [leaveApproved, setLeaveApproved] = useState(false);

    const handleApprove = () => {
        alert("Leave Approved!");
        setLeaveApproved(true);
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <nav className={`shadow-md duration-500 ${open ? "w-60" : "w-18"} md:w-60 p-2 flex flex-col bg-blue-900`}>
                <div className="px-3 py-2 h-20 flex justify-between items-center">
                    <img src="aju.jpg" alt="logo" className={`${open ? "w-10" : "w-0"} md:w-10 rounded-md`} />
                    <MdMenuOpen size={32} color='white' className="cursor-pointer" onClick={() => setOpen(!open)} />
                </div>
                <ul className="flex-1">
                    {menuItems.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => setSelectedItem(item.label)}
                            className="px-3 py-2 my-4 md:my-6 hover:bg-blue-700 rounded-md duration-300 cursor-pointer flex gap-2 items-center relative group"
                        >
                            {item.icons}
                            <p className={`${!open && "w-0 translate-x-24"} md:block duration-500 overflow-hidden text-white`}>
                                {item.label}
                            </p>
                            <p className={`${open && 'hidden'} md:hidden absolute left-32 shadow-md rounded-md w-0 p-0 duration-300 overflow-hidden group-hover:w-fit group-hover:left-18 group-hover:p-2 bg-blue-100`}>
                                {item.label}
                            </p>
                        </li>
                    ))}
                </ul>
                <div className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-700 rounded-md group relative">
                    <CgProfile color='white' size={23} />
                    <p className={`${!open && "w-0 translate-x-24"} md:block duration-500 overflow-hidden text-white`}>Admin</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-700 rounded-md group relative">
                    <IoIosLogOut color='white' size={23} />
                    <p className={`${!open && "w-0 translate-x-24"} md:block duration-500 overflow-hidden text-white`}>Logout</p>
                </div>
            </nav>

            {}
            <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-gray-100 overflow-auto">
                {selectedItem === 'Dashboard' && (
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-4">Welcome, Admin!</h1>
                        <p className="text-gray-700 text-sm sm:text-base">Use the sidebar to manage employees, salaries, and leaves.</p>
                    </div>
                )}

                {selectedItem === 'Employees' && (
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-blue-900">Employee List</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto bg-white shadow-md rounded-xl">
                                <thead className="bg-blue-900 text-white">
                                    <tr>
                                        <th className="p-2 sm:p-3 text-left text-xs sm:text-base">Name</th>
                                        <th className="p-2 sm:p-3 text-left text-xs sm:text-base">Email</th>
                                        <th className="p-2 sm:p-3 text-left text-xs sm:text-base">Position</th>
                                        <th className="p-2 sm:p-3 text-left text-xs sm:text-base">Department</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dummyEmployees.map((emp, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="p-2 sm:p-3 text-xs sm:text-base">{emp.name}</td>
                                            <td className="p-2 sm:p-3 text-xs sm:text-base">{emp.email}</td>
                                            <td className="p-2 sm:p-3 text-xs sm:text-base">{emp.position}</td>
                                            <td className="p-2 sm:p-3 text-xs sm:text-base">{emp.department}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedItem === 'Leaves' && (
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                        <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4">Leave Requests</h2>
                        <div className="p-3 sm:p-4 border rounded-md bg-gray-50 mb-4">
                            <p className="text-sm sm:text-base"><strong>Employee:</strong> Akansha</p>
                            <p className="text-sm sm:text-base"><strong>Email:</strong> akansha25@gmail.com.com</p>
                            <p className="text-sm sm:text-base"><strong>From:</strong> 2025-04-12</p>
                            <p className="text-sm sm:text-base"><strong>To:</strong> 2025-04-15</p>
                            <p className="text-sm sm:text-base"><strong>Reason:</strong> For marriage</p>
                            {!leaveApproved ? (
                                <button
                                    className="mt-3 px-3 sm:px-4 py-1 sm:py-2 bg-blue-900 text-white rounded hover:bg-blue-800 text-sm sm:text-base"
                                    onClick={handleApprove}
                                >
                                    Approve
                                </button>
                            ) : (
                                <p className="text-green-600 mt-3 font-semibold text-sm sm:text-base">Approved</p>
                            )}
                        </div>
                    </div>
                )}

                {selectedItem === 'Salary' && (
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4">Salary Management</h2>
                        <p className="text-sm sm:text-base">Salary page content coming soon...</p>
                    </div>
                )}

                {selectedItem === 'Settings' && (
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4">Settings</h2>
                        <p className="text-sm sm:text-base">Settings page under development...</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;