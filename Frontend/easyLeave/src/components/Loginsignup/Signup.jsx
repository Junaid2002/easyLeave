import React from 'react'
import { Navigate } from 'react-router-dom'
import {Link} from 'react-router-dom'

const Signup = () => {
  return (
    <div class='flex flex-row h-screen items-center justify-center  w-full  flex-1 px-20 text center bg-white-500' >
        <div class = 'bg-white rounded-2xl shadow-2xl flex w-2/3 max-w-4xl ' >

      <div class = 'w-3/5 p-5 flex flex-col items-center gap-5'>
      <h1 class='text-3xl font-bold text-blue-900 my-10'>Admin Login</h1>
      <div class='relative' >
      <input type="email" id='enroll'  class='w-80 h-2 m-2 bg-transparent py-2.5 border-b-1 focus:outline-none focus:border-blue-500 focus:border-b-2 transition-colors peer duration-500 ' />
      <label for="enroll" class='absolute left-1.5 cursor-text peer-focus:text-xs peer-focus:-top-4 peer-focus:text-blue-500 font-semibold transition-all duration-500 '>E-mail</label>
      </div>
      <div class='relative' >
      <input type="password" id='pass'  class='w-80 h-2 m-2 bg-transparent py-2.5 border-b-1 focus:outline-none focus:border-blue-500 focus:border-b-2 transition-colors peer duration-500 ' />
      <label for="pass" class='absolute left-1.5 cursor-text peer-focus:text-xs peer-focus:-top-4 peer-focus:text-blue-500 font-semibold transition-all duration-500 '>Password</label>
      </div>
      
      <Link to="/AdminDashboard" 
      class = 'border-1 border-blue-900 text-blue-900 rounded-full px-12 py-2 mt-4 inline-block hover:bg-blue-900  hover:text-white duration-300 font-semibold  ' 
      
      >Login</Link>
      
      </div>
      
      
      <div class = 'w-2/5 p-5 bg-blue-900 text-white rounded-tr-2xl rounded-br-2xl py-36 px-12 flex flex-col items-center' >
      
      <h1 class='text-2xl font-bold ' >Employee ? </h1>
      <div class = 'border-1 w-15 border-white inline-block mb-2 mt-2' ></div>
      <p class = 'mb-3' >Login as employee ! </p>
      <Link to="/" 
      class = 'border-1 border-white rounded-full px-12 py-2 mt-4 inline-block hover:bg-white  hover:text-blue-900 duration-300 font-semibold  ' >Login</Link>
      </div>
       
        </div>
    </div>
  )
}

export default Signup
