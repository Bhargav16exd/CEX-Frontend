import { useDispatch } from "react-redux";
import { Link } from "react-router";
import type { AppDispatch } from "../redux/store";
import { signout } from "../redux/slices/authenticationSlice";

export default function NavigationLayout({children}:any){

  const dispatch = useDispatch<AppDispatch>()

  function OnClickLogout(){
    dispatch(signout()).unwrap()
  }

  return(
    <div>
      <div className="bg-[#111111] border-[#252525] border-b-2">
        <div className="flex py-3 px-6 gap-12 justify-start items-center w-full relative">

            <Link to={'/'}>
            <h1 className="font-semibold text-lg text-white">
              OnlyFunds
            </h1>
            </Link>

            <div className="flex gap-6">
              <Link to={'/dashboard'}>
              <p className="text-white text-sm">
                Markets
              </p>
              </Link>
              <Link to={'/history'}>
                <p className="text-white text-sm">
                  History
                </p>
              </Link>  
            </div>
          <button className="right-0 absolute font-semibold text-white text-xs bg-[#222222] py-1 px-4 rounded-md border-[#333333] border-2 cursor-pointer mx-10" onClick={OnClickLogout}>Logout</button>
        </div>
  
      </div>
      {children}
    </div>
  )
}