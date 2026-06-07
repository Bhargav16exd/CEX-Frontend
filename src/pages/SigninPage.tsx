import { useEffect, useState } from "react"
import InputLabelComponent from "../components/InputLabelComponent";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { signin } from "../redux/slices/authenticationSlice";
import type { AppDispatch } from "../redux/store";
import LoaderWhite from "../components/WhiteLoaderCompoenet";

export default function Signin(){

  // ------- DISPATCH AND ERROR HANLDERS --------

  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state:any)=>state.auth);
  const [isLoaderActive, setLoaderActive] = useState(false);
  const [isErrorActive, setErrorActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  function popError(errorMessage:string){
    setLoaderActive(false);
    setErrorActive(true);
    setErrorMessage(errorMessage);

    setTimeout(()=>{
      setErrorActive(false);
      setErrorMessage("");
    }, 5000)
  }

  // ------- DISPATCH AND ERROR HANLDERS --------

  const [inputs, setInputs] = useState({
    username:"",
    password:""
  })


  function handleChange(e: React.ChangeEvent<HTMLInputElement>){
    const {name ,value} = e.target
    setInputs({
      ...inputs,
      [name]:value
    })
  }

  async function OnClickSignin() {
    setLoaderActive(true);

    if(!inputs.username || !inputs.password){
      popError("Incomplete Inputs");
      return
    }

    try {
      const res = await dispatch(signin(inputs)).unwrap();
      setLoaderActive(false);
      if(res?.success === true){
        navigate("/dashboard");
      }
    } catch (error:any) {
      popError(error?.message)
    }
  }

  useEffect(()=>{
    if(token){
      navigate("/dashboard");
      return
    }
  },[])

  return(
    <div className="h-screen w-screen bg-[#0A0A0A] flex justify-center items-center tracking-tight broder">

      <div className="border-2 border-[#333333] bg-[#111111] p-12 rounded-md flex flex-col">

        <span className="flex justify-start items-center gap-4">
          <h1 className="font-bold text-xl text-white">
            OnlyFunds
          </h1>
          <p className="text-[#555555] text-xs">EXCHANGE</p>
        </span>
        
        <div className="bg-[#1A1A1A] rounded-md flex p-1 mb-2 mt-6">
          <div className="w-1/2 text-center py-2  bg-[#2A2A2A] rounded-md text-white font-semibold text-sm">
            <Link to={"/signin"}>
              Sign in
            </Link>            
          </div>
          <div className="w-1/2 text-center py-2 text-[#8A8A8A] text-sm font-semibold">
            <Link to={"/signup"}>
             Create Account
            </Link>
          </div>
        </div>
        
        <InputLabelComponent
          labelName="USER NAME"
          value={inputs.username}
          handleChange={handleChange}
          name="username"
          inputType="text"
          placeholder="onlyfunds@corp"
        />

        <InputLabelComponent
          labelName="PASSWORD"
          value={inputs.password}
          handleChange={handleChange}
          name="password"
          inputType="password"
          placeholder="******"
        />

        <button 
        onClick={OnClickSignin}
        className="bg-white rounded-md mt-4 my-2 py-2.5 text-sm font-semibold tracking-tight cursor-pointer flex justify-center items-center">
          {
            isLoaderActive ? <LoaderWhite/> : <>Sign in to OnlyFunds</>
          }
        </button>

        {
          isErrorActive &&
          <p className="text-center text-red-400 text-sm my-2 max-w-xs text-wrap overflow-hidden">
            {errorMessage}
          </p>
        }

        <span className="text-sm text-center text-[#555555]">
          <p>Dont have an account? 
             <Link to={'/signup'}>
                <button className="text-[#A1A1A1] underline hover:text-white cursor-pointer mx-1">Create one</button>
            </Link>
          </p>
        </span>
      </div>
    </div>
  )
}