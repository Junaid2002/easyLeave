import React from 'react';
import { Link,Navigate } from 'react-router-dom';
import { useState } from 'react';

const EmployeeLogin = () => {
  const [email,setemail] = useState('')
  const [password,setpassword] = useState('')
  const [error,setError] = useState('')
  const [isLoggedIn,setIsLoggedIn] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault();

    if(email === 'akansha@gmail.com' && password === '121212'){
      setIsLoggedIn(true);
      setError('');

    }
    else
    {
      setError('Invalid email or password. Please try again.');
    }
  }

  if(isLoggedIn){
    return <Navigate to='/TeacherDashboard'/>;
  }


  return (
    <div className="flex flex-row h-screen items-center justify-center w-full flex-1 px-20 text-center bg-white-500">
      <div className="bg-white rounded-2xl shadow-2xl flex w-2/3 max-w-4xl">
        {/* Left Side - Employee Login Form */}
        <div className="w-3/5 p-5 flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold text-blue-900 my-10">Employee Login</h1>

          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              required
              id="mail"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              className="w-80 h-2 m-2 bg-transparent py-3.5 border-b-1 focus:outline-none focus:border-blue-500 focus:border-b-2 transition-colors peer duration-500"
              placeholder=" "
            />
            <label
              htmlFor="mail"
              className="absolute left-1.5 cursor-text peer-focus:text-xs peer-focus:-top-4 peer-focus:text-blue-900 peer-valid:text-xs peer-valid:-top-4 peer-valid:text-blue-900 peer-placeholder-shown:text-base peer-placeholder-shown:top-2.5 font-semibold transition-all duration-500"
            >
              E-mail
            </label>
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              id="pass"
              className="w-80 h-2 m-2 bg-transparent py-3.5 border-b-1 focus:outline-none focus:border-blue-500 focus:border-b-2 transition-colors peer duration-500"
              placeholder=" "
            />
            <label
              htmlFor="pass"
              className="absolute left-1.5 cursor-text peer-focus:text-xs peer-focus:-top-4 peer-focus:text-blue-900 peer-valid:text-xs peer-valid:-top-4 peer-valid:text-blue-900 peer-placeholder-shown:text-base peer-placeholder-shown:top-2.5 font-semibold transition-all duration-500"
            >
              Password
            </label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="border-1 border-blue-900 text-blue-900 rounded-full px-12 py-2 mt-4 inline-block hover:bg-blue-900 hover:text-white duration-300 font-semibold"
          >
            Login
          </button>
        </div>

        {/* Right Side - Admin Login Section */}
        <div className="w-2/5 p-5 bg-blue-900 text-white rounded-tr-2xl rounded-br-2xl py-36 px-12 flex flex-col items-center">
          <h2 className="text-3xl font-bold">Admin ?</h2>
          <div className="border-1 w-15 border-white inline-block mb-2 mt-2"></div>
          <p className="mb-3">Login as Admin !</p>
          <Link
            to="/Signup"
            className="border-1 border-white rounded-full px-12 py-2 mt-4 inline-block hover:bg-white hover:text-blue-900 duration-300 font-semibold"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;