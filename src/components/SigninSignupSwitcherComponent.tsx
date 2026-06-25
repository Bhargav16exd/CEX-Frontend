import { Link } from "react-router"

export default function SigninSignupSwitcherComponent({isSignInActive, isSignUpActive}:{isSignInActive:boolean, isSignUpActive:boolean}){

  const activeStyle = "bg-[#222222] rounded-md text-white"
  const notActiveStyle = "text-[#8A8A8A]"

  return (
    <div className="bg-[#111111] rounded-md flex p-1 mb-2 mt-6">

      <div className={`w-1/2 text-center text-xs py-2 ${isSignInActive ? activeStyle : notActiveStyle}`}>
        <Link to={"/signin"}>
          Sign in
        </Link>            
      </div>
      <div className={`w-1/2 text-center text-xs py-2 ${isSignUpActive ? activeStyle : notActiveStyle}`}>
        <Link to={"/signup"}>
          Create Account
        </Link>
      </div>
    </div>
  )
}
