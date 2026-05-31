import { Navigate, Outlet } from "react-router"

export default function Auth(){
    
  const token  = localStorage.getItem("token")
  
  return token ? 
    (<Outlet/>) 
    : 
    (<Navigate to={'/signin'}/>)
}
