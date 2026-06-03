import { useSelector } from "react-redux"
import { Navigate, Outlet } from "react-router"

export default function Auth(){
    
  const { token } = useSelector((state:any)=> state?.auth)
  
  return token ? 
    (<Outlet/>) 
    : 
    (<Navigate to={'/signin'}/>)
}
