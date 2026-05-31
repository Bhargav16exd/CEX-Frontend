import { Link, useNavigate } from "react-router";

export default function NavigationLayout({children}:any){

  const navigate = useNavigate();

  function OnClickLogout(){
    localStorage.removeItem("token");
    localStorage.removeItem("role"); 
    navigate("/signin")
    return
  }

  return(
    <div>
      <div className="bg-[#111111] border-[#252525] border-b-2">
        <div className="flex py-3 px-6 gap-12 justify-start items-center w-full relative">

            <h1 className="font-semibold text-lg text-white">
              UMBRELLA
            </h1>

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