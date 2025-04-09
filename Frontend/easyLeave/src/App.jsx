import './App.css'
import TeacherDashboard from './components/TeacherPanel/TeacherDashboard'
import AdminLogin from './components/Loginsignup/AdminLogin'
import EmployeeLogin from './components/Loginsignup/EmployeeLogin'
import EmployeeRegister from './components/Loginsignup/EmployeeRegister'
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
        <Route path='/Register' element = {<EmployeeRegister/>}/>
      </Routes>
    </Router>
  )
}

export default App
