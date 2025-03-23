import './App.css'
import LeavePage from './components/TeacherPanel/LeavePage'
import TeacherDashboard from './components/TeacherPanel/TeacherDashboard'
import AdminLogin from './components/Loginsignup/AdminLogin'
import EmployeeLogin from './components/Loginsignup/EmployeeLogin'
import AdminDashboard from './components/AdminPanel/AdminDashboard'
import {BrowserRouter as Router,Routes,Route} from "react-router-dom"
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<EmployeeLogin/>} />
        <Route path="/Signup" element={<AdminLogin/>} />
        <Route path='/TeacherDashboard'  element = {<TeacherDashboard/>} />
        <Route path='/AdminDashboard' element = {<AdminDashboard/>}/>
      </Routes>
    </Router>
  )
}

export default App
