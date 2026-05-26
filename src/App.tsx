import { Route, Routes } from 'react-router'
import './App.css'
import LandingPage from './pages/LandingPage'
import Signin from './pages/SigninPage'
import Signup from './pages/SignupPage'
import { DashboardPage } from './pages/Dashboard'


function App() {
  return (
    <Routes>

      <Route path='/' element={<LandingPage/>}></Route>

      <Route path='/signin' element={<Signin/>}></Route>
      <Route path='/signup' element={<Signup/>}></Route>

      {/* Secured Routes */}
      <Route path='/dashboard' element={<DashboardPage/>}></Route>

    </Routes>
  )
}

export default App
