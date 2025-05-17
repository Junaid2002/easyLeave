import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

const EmployeeLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Login failed.');
        return;
      }

      const data = await response.json();
      localStorage.setItem('userEmail', email);
      localStorage.setItem('token', data.jwtToken);
      setIsLoggedIn(true);
      setError('');

    } catch (error) {
      console.error('Login error:', error);
      setError('Server error. Please try again later.');
    }
  };

  if (isLoggedIn) {
    return <Navigate to="/TeacherDashboard" />;
  }

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
        <div className="w-full sm:w-3/5 p-4 sm:p-5 flex flex-col items-center gap-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 my-6 sm:my-10">Employee Login</h1>

          <div className="flex flex-col items-center gap-6">
            <div className="relative w-full">
              <input
                type="email"
                required
                id="mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full sm:w-80 h-12 m-2 bg-transparent py-3.5 border-b-2 border-white/50 text-gray-800 focus:outline-none focus:border-white transition-colors peer duration-500 placeholder-gray-600"
                placeholder="E-mail"
              />
            </div>

            <div className="relative w-full">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="pass"
                className="w-full sm:w-80 h-12 m-2 bg-transparent py-3.5 border-b-2 border-white/50 text-gray-800 focus:outline-none focus:border-white transition-colors peer duration-500 placeholder-gray-600"
                placeholder="Password"
              />
            </div>

            {error && <p className="text-red-400 text-xs sm:text-sm">{error}</p>}

            <button
              type="button"
              onClick={handleLogin}
              className="bg-white/20 text-gray-800 rounded-full px-8 sm:px-12 py-2 mt-4 inline-block hover:bg-white/30 duration-300 font-semibold border border-white/50"
            >
              Login
            </button>

            <Link
              to="/Register"
              className="text-gray-700 hover:text-gray-900 duration-300 font-semibold text-sm sm:text-base"
            >
              Don't have an account? Register
            </Link>
          </div>
        </div>

        <div className="w-full sm:w-2/5 p-4 sm:p-5 bg-gradient-to-b from-purple-900/50 to-blue-900/50 text-white rounded-b-2xl sm:rounded-tr-2xl sm:rounded-br-2xl py-12 sm:py-36 px-6 sm:px-12 flex flex-col items-center backdrop-blur-lg border-t sm:border-l border-white/20">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-200">Admin ?</h2>
          <div className="border-1 w-15 border-white inline-block mb-2 mt-2"></div>
          <p className="mb-3 text-gray-300 text-sm sm:text-base">Login as Admin !</p>
          <Link
            to="/Signup"
            className="border-1 border-white rounded-full px-8 sm:px-12 py-2 mt-4 inline-block text-gray-200 hover:bg-white/20 hover:text-gray-300 duration-300 font-semibold"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;