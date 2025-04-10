import './App.css'
import TeacherDashboard from './components/TeacherPanel/TeacherDashboard'
import AdminLogin from './components/Loginsignup/AdminLogin'
import EmployeeLogin from './components/Loginsignup/EmployeeLogin'
import AdminDashboard from './components/AdminPanel/AdminDashboard'
import {BrowserRouter as Router,Routes,Route} from "react-router-dom"
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import DashboardPage from './components/AdminPages/DashboardPage'
function App() {

  const router = createBrowserRouter([
    {path : "/",
      element : <EmployeeLogin/>
    },
    {
      path : "/Signup",
      element : <AdminLogin/>
    },
    {
      path : "/TeacherDashboard",
      element : <TeacherDashboard/>
    },
    {
      path : "/AdminDashboard",
      element : 
      <div>
        <AdminDashboard/>
        <DashboardPage/>
      </div>
    }
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  )
}

export default App
