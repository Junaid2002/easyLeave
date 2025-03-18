import './App.css'
import LeavePage from './components/TeacherPanel/LeavePage'
import TeacherDashboard from './components/TeacherPanel/TeacherDashboard'
import Login from './components/Loginsignup/Login'
import Signup from './components/Loginsignup/Signup'
import AdminDashboard from './components/AdminPanel/AdminDashboard'
import {BrowserRouter as Router,Routes,Route} from "react-router-dom"
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/Signup" element={<Signup/>} />
        <Route path='/TeacherDashboard'  element = {<TeacherDashboard/>} />
        <Route path='/AdminDashboard' element = {<AdminDashboard/>}/>
      </Routes>
    </Router>
  )
}

export default App
