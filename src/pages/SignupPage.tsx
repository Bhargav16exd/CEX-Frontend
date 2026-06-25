import { useEffect, useState } from "react";
import InputLabelComponent from "../components/InputLabelComponent";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../redux/slices/authenticationSlice";
import type { AppDispatch } from "../redux/store";
import { useErrorLoaderState } from "../hooks/useErrorLoaderState";
import TitleComponent from "../components/TitleComponent";
import SigninSignupSwitcherComponent from "../components/SigninSignupSwitcherComponent";
import ButtonWhite from "../components/ButtonWhiteComponent";
import ErrorMessageComponent from "../components/ErrorMsgComponent";

export default function Signup(){

  // ------- DISPATCH AND ERROR HANLDERS --------

  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state:any)=>state.auth);
  const navigate = useNavigate();
  const { popError, isErrorActive, errorMessage, isLoaderActive, setLoaderActive} = useErrorLoaderState();

  const [inputs, setInputs] = useState({
    username:"",
    password:"",
    confirmPassword:""
  });


  // ------- DISPATCH AND ERROR HANLDERS --------

  function handleChange(e: React.ChangeEvent<HTMLInputElement>){
    const {name ,value} = e.target

    setInputs({
      ...inputs,
      [name]:value
    })
  }


  async function OnClickSignup(){
    setLoaderActive(true);

    if(!inputs.username || !inputs.password || !inputs.confirmPassword){
      popError("Incomplete Inputs");
      return
    }
    
    if(inputs.password !== inputs.confirmPassword){
      popError("Passwords dont match");
      return
    }

    try {
      const res = await dispatch(signup(inputs)).unwrap()
      setLoaderActive(false);
      if(res?.success === true){
        navigate("/signin");
      } 
    } catch (error:any) {
      popError(error?.message!);
    }

  }

  useEffect(()=>{
      if(token){
        navigate("/dashboard");
        return
      }
    },[])

  return(
    <div className="h-screen w-screen bg-black-standard flex justify-center items-center tracking-tight">

      <div className="border border-b-color-standard bg-[#0A0A0A] py-12 px-10 rounded-md flex flex-col">

        <TitleComponent/>
        
        <SigninSignupSwitcherComponent isSignInActive={false} isSignUpActive={true}/>
        
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
          placeholder="Create a strong password"
        />

        <InputLabelComponent
          labelName="CONFIRM PASSWORD"
          value={inputs.confirmPassword}
          handleChange={handleChange}
          name="confirmPassword"
          inputType="password"
          placeholder="******"
        />

        <ButtonWhite OnClickFunctionHanlder={OnClickSignup} buttonName="Create Account" isLoaderActive={isLoaderActive}/>

        <ErrorMessageComponent errorActive={isErrorActive} errorMessage={errorMessage}/>

        <span className="text-xs text-center text-[#555555] my-2">
          <p>Already have an account? 
             <Link to={'/signin'}>
                <button className="text-[#A1A1A1] underline hover:text-white cursor-pointer mx-1">Sign in</button>
              </Link>
          </p>
        </span>

      </div>
    </div>
  )
}