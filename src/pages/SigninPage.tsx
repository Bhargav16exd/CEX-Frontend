import { useEffect, useState } from "react"
import InputLabelComponent from "../components/InputLabelComponent";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { signin } from "../redux/slices/authenticationSlice";
import type { AppDispatch } from "../redux/store";
import ButtonWhite from "../components/ButtonWhiteComponent";
import { useErrorLoaderState } from "../hooks/useErrorLoaderState";

export default function Signin(){

  // ------- DISPATCH AND ERROR HANLDERS --------

  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state:any)=>state.auth);
  const navigate = useNavigate();

  const { popError, isErrorActive, errorMessage, isLoaderActive, setLoaderActive} = useErrorLoaderState()


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
    <div className="h-screen w-screen bg-black-standard flex justify-center items-center tracking-tight broder">

      <div className="border border-border-standard bg-[#0A0A0A] py-12 px-10 rounded-md flex flex-col">

        <span className="flex justify-start items-center gap-4">
          <h1 className="font-bold text-lg text-white">
            OnlyFunds
          </h1>
          <p className="text-[#555555] text-2xs">EXCHANGE</p>
        </span>
        
        <div className="bg-[#111111] rounded-md flex p-1 mb-2 mt-6">
          <div className="w-1/2 text-center py-2  bg-[#222222] rounded-md text-white  text-xs">
            <Link to={"/signin"}>
              Sign in
            </Link>            
          </div>
          <div className="w-1/2 text-center py-2 text-[#8A8A8A] text-xs ">
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

        <ButtonWhite OnClickFunctionHanlder={OnClickSignin} isLoaderActive={isLoaderActive} buttonName={"Sign in to OnlyFunds"}/>

        {
          isErrorActive &&
          <p className="text-center text-red-400 text-xs my-2 max-w-xs text-wrap overflow-hidden">
            {errorMessage}
          </p>
        }

        <span className="text-xs text-center text-[#555555] my-2">
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