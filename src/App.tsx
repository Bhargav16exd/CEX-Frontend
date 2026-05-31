import { Route, Routes } from 'react-router'
import './App.css'
import LandingPage from './pages/LandingPage'
import Signin from './pages/SigninPage'
import Signup from './pages/SignupPage'
import { DashboardPage } from './pages/Dashboard'
import Auth from './utils/Auth'
import CreateStockPage from './pages/CreateStockPage'
import { PerpStockPage } from './pages/PerpStockPage'
import HistoryPage from './pages/HistoryPage'


function App() {
  return (
    <Routes>

      <Route path='/' element={<LandingPage/>}></Route>

      <Route path='/signin' element={<Signin/>}></Route>
      <Route path='/signup' element={<Signup/>}></Route>

      {/* Secured Routes */}
      <Route element={<Auth/>}>
        <Route path='/dashboard'    element={<DashboardPage/>}></Route>
        <Route path='/create-stock' element={<CreateStockPage/>}></Route>
        <Route path='/history'      element={<HistoryPage/>}></Route>

        <Route path='/perp/:stockSymbol' element={<PerpStockPage/>}></Route>
      </Route>
    </Routes>
  )
}

export default App
