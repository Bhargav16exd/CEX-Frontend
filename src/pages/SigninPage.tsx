import { useState } from "react"
import InputLabelComponent from "../components/InputLabelComponent";
import { Link } from "react-router";

export default function Signin(){

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

  return(
    <div className="h-screen w-screen bg-[#0A0A0A] flex justify-center items-center tracking-tight">

      <div className="border-2 border-[#333333] bg-[#111111] p-12 rounded-xl flex flex-col">

        <span className="flex justify-start items-center gap-4">
          <h1 className="font-bold text-xl text-white">
            UMBRELLA
          </h1>
          <p className="text-[#555555] text-xs">EXCHANGE</p>
        </span>
        
        <div className="bg-[#1A1A1A] rounded-lg flex p-1 mb-2 mt-6">
          <div className="w-1/2 text-center py-2  bg-[#2A2A2A] rounded-lg text-white font-semibold text-sm">
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
          placeholder="umbrella@corp"
        />

        <InputLabelComponent
          labelName="PASSWORD"
          value={inputs.password}
          handleChange={handleChange}
          name="password"
          inputType="password"
          placeholder="******"
        />

        <button className="bg-white rounded-md my-4 py-2.5 text-sm font-semibold tracking-tight cursor-pointer">
          Sign in to UMBRELLA
        </button>

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