import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    if (email === 'saqulain0027@gmail.com' && password === '@27khaN$') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  if (isLoggedIn) {
    return <Navigate to="/AdminDashboard" />;
  }

  return (
    <div
      className="flex flex-row h-screen items-center justify-center w-full flex-1 px-4 sm:px-10 lg:px-20 text-center"
      style={{
        backgroundImage: 'url(/adminbg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="bg-white/10 rounded-2xl shadow-lg flex flex-col sm:flex-row w-full sm:w-2/3 max-w-md sm:max-w-4xl backdrop-blur-lg border border-white/20">
        {}
        <div className="w-full sm:w-3/5 p-4 sm:p-5 flex flex-col items-center gap-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-white my-6 sm:my-10">Admin Login</h1>

          {}
          <div className="relative w-full">
            <input
              type="email"
              required
              id="mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full sm:w-80 h-12 m-2 bg-transparent py-3.5 border-b-2 border-white/50 text-white focus:outline-none focus:border-white transition-colors peer duration-500 placeholder-gray-400"
              placeholder="E-mail"
            />
          </div>

          {}
          <div className="relative w-full">
            <input
              type="password"
              required
              id="pass"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full sm:w-80 h-12 m-2 bg-transparent py-3.5 border-b-2 border-white/50 text-white focus:outline-none focus:border-white transition-colors peer duration-500 placeholder-gray-400"
              placeholder="Password"
            />
          </div>

          {}
          {error && <p className="text-red-400 text-xs sm:text-sm">{error}</p>}

          {}
          <button
            onClick={handleLogin}
            className="bg-white/20 text-gray-200 rounded-full px-8 sm:px-12 py-2 mt-4 inline-block hover:bg-white/30 duration-300 font-semibold border border-white/50"
          >
            Login
          </button>
        </div>

        {}
        <div className="w-full sm:w-2/5 p-4 sm:p-5 bg-gradient-to-b from-purple-900/50 to-blue-900/50 text-white rounded-b-2xl sm:rounded-tr-2xl sm:rounded-br-2xl py-12 sm:py-36 px-6 sm:px-12 flex flex-col items-center backdrop-blur-lg border-t sm:border-l border-white/20">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Employee ?</h1>
          <div className="border-1 w-15 border-white inline-block mb-2 mt-2"></div>
          <p className="mb-3 text-gray-200 text-sm sm:text-base">Login as employee !</p>
          <Link
            to="/"
            className="border-1 border-white rounded-full px-8 sm:px-12 py-2 mt-4 inline-block text-white hover:bg-white/20 hover:text-gray-200 duration-300 font-semibold"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;