import { Link } from "react-router";

export default function LandingPage(){
  return(
    <div className="bg-black text-white">
      Landing Page

      <Link to={'/signin'}>
        <button>
          Signin
        </button>
      </Link>

      <Link to={'/signup'}>
        <button>
          Signup
        </button>
      </Link>
      
    </div>
  )
}