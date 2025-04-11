import './App.css'
import TeacherDashboard from './components/TeacherPanel/TeacherDashboard'
import AdminLogin from './components/Loginsignup/AdminLogin'
import EmployeeLogin from './components/Loginsignup/EmployeeLogin'
import EmployeeRegister from './components/Loginsignup/EmployeeRegister'
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
    <Router>
      <Routes>
        <Route path="/" element={<EmployeeLogin/>} />
        <Route path="/Signup" element={<AdminLogin/>} />
        <Route path='/TeacherDashboard'  element = {<TeacherDashboard/>} />
        <Route path='/AdminDashboard' element = {<AdminDashboard/>}/>
        <Route path='/Register' element = {<EmployeeRegister/>}/>
      </Routes>
    </Router>
  )
}

export default App
