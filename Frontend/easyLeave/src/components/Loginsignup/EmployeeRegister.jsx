import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const EmployeeRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    const employeeData = { name, email, password, phone, position, department };

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData),
      });

      if (response.ok) {
        setSuccess('Registration Completed!');
        setError('');
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setPosition('');
        setDepartment('');
        setTimeout(() => navigate('/'), 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'Registration failed.');
        setSuccess('');
      }
    } catch {
      setError('Server error. Please try again later.');
      setSuccess('');
    }
  };

  return (
    <div
      className="flex flex-row h-screen items-center justify-center w-full flex-1 px-4 sm:px-10 lg:px-20 text-center"
      style={{
        backgroundImage: 'url(/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="bg-white/10 rounded-2xl shadow-lg flex flex-col sm:flex-row w-full sm:w-2/3 max-w-md sm:max-w-4xl backdrop-blur-lg border border-white/20">
        <div className="w-full sm:w-3/5 p-4 sm:p-5 flex flex-col items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 my-6 sm:my-10">Employee Register</h1>

          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                id="name"
                className="w-full sm:w-80 h-12 m-2 bg-transparent py-3.5 border-b-2 border-white/50 text-gray-800 focus:outline-none focus:border-white transition-colors peer duration-500 placeholder-gray-600"
                placeholder="Name"
              />
            </div>

            <div className="relative w-full">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                className="w-full sm:w-80 h-12 m-2 bg-transparent py-3.5 border-b-2 border-white/50 text-gray-800 focus:outline-none focus:border-white transition-colors peer duration-500 placeholder-gray-600"
                placeholder="Email"
              />
            </div>

            <div className="relative w-full">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                className="w-full sm:w-80 h-12 m-2 bg-transparent py-3.5 border-b-2 border-white/50 text-gray-800 focus:outline-none focus:border-white transition-colors peer duration-500 placeholder-gray-600"
                placeholder="Password"
              />
            </div>

            <div className="relative w-full">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                id="phone"
                className="w-full sm:w-80 h-12 m-2 bg-transparent py-3.5 border-b-2 border-white/50 text-gray-800 focus:outline-none focus:border-white transition-colors peer duration-500 placeholder-gray-600"
                placeholder="Phone Number"
              />
            </div>

            <div className="relative w-full">
              <input
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                id="position"
                className="w-full sm:w-80 h-12 m-2 bg-transparent py-3.5 border-b-2 border-white/50 text-gray-800 focus:outline-none focus:border-white transition-colors peer duration-500 placeholder-gray-600"
                placeholder="Position"
              />
            </div>

            <div className="relative w-full">
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                id="department"
                className="w-full sm:w-80 h-12 m-2 bg-transparent py-3.5 border-b-2 border-white/50 text-gray-800 focus:outline-none focus:border-white transition-colors peer duration-500 placeholder-gray-600"
                placeholder="Department"
              />
            </div>

            {error && <p className="text-red-400 text-xs sm:text-sm">{error}</p>}
            {success && <p className="text-green-600 font-semibold text-sm sm:text-base">{success}</p>}

            <button
              type="button"
              onClick={handleRegister}
              className="bg-white/20 text-gray-800 rounded-full px-8 sm:px-12 py-2 mt-4 inline-block hover:bg-white/30 duration-300 font-semibold border border-white/50"
            >
              Register
            </button>
          </div>
        </div>

        <div className="w-full sm:w-2/5 p-4 sm:p-5 bg-gradient-to-b from-purple-900/50 to-blue-900/50 text-white rounded-b-2xl sm:rounded-tr-2xl sm:rounded-br-2xl py-12 sm:py-36 px-6 sm:px-12 flex flex-col items-center backdrop-blur-lg border-t sm:border-l border-white/20">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-200">Already Registered?</h2>
          <div className="border-1 w-15 border-white inline-block mb-2 mt-2"></div>
          <p className="mb-3 text-gray-300 text-sm sm:text-base">Login to your account!</p>
          <Link
            to="/"
            className="border-1 border-white rounded-full px-8 sm:px-12 py-2 mt-4 inline-block text-gray-200 hover:bg-white/20 hover:text-gray-300 duration-300 font-semibold"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRegister;