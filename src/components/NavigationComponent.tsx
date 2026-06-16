import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import type { AppDispatch } from "../redux/store";
import { signout } from "../redux/slices/authenticationSlice";

export default function NavigationLayout({children}:any){

  const dispatch = useDispatch<AppDispatch>()
  const { token : isLoggedIn } = useSelector((state:any)=> state?.auth)

  function OnClickLogout(){
    dispatch(signout()).unwrap()
  }

  return(
    <div
    style={{
      WebkitFontSmoothing: "antialiased",
    }}
    >
      <div className="bg-[#0A0A0A] border-[#252525] border-b">
        <div className="flex py-3 px-10 gap-12 justify-between items-center w-full relative text-sm">
            <Link to={'/'}>
              <h1 className="font-semibold text-white">
                OnlyFunds
              </h1>
            </Link>

            {
              isLoggedIn &&
               <div className="flex gap-6 ">
                  <Link to={'/dashboard'}>
                  <p className="text-white text-xs">
                    Markets
                  </p>
                  </Link>
                  <Link to={'/history'}>
                    <p className="text-white text-xs">
                      History
                    </p>
                  </Link>  
              </div>
            }

           {
            isLoggedIn ?
            <ButtonWhite name="Logout" onClickFn={OnClickLogout}/> 
            :
            <Link to={'/signin'}><ButtonBlack name="Sign in"/></Link>
           }



        </div>
  
      </div>
      {children}
    </div>
  )
}

function ButtonWhite({name, onClickFn}:{name:string, onClickFn:any}){
  return(
    <button
      onClick={onClickFn}
      className="text-xs px-3.5 py-1.5 rounded-[5px] cursor-pointer transition-all duration-150"
      style={{ background: "#ededed", border: "1px solid #ededed", color: "#000", fontFamily: "Geist, sans-serif" }}
      onMouseEnter={e => e.currentTarget.style.opacity = ".88"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >{name}</button>
  )
}

function ButtonBlack({name}:{name:string, }){
  return(
    <button
      className="text-xs px-3.5 py-1.5 rounded-[5px] cursor-pointer transition-all duration-150 border border-[#2a2a2a] text-[#ededed]"
      style={{ color: "#ededed", fontFamily: "Geist, sans-serif" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#444"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a2a"}
    >{name}</button>
  )
}