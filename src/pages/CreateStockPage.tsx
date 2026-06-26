import { useState } from "react";
import NavigationLayout from "../components/NavigationComponent";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import { useNavigate } from "react-router";
import { createStock } from "../redux/slices/stockSlice";
import { useErrorLoaderState } from "../hooks/useErrorLoaderState";
import ErrorMessageComponent from "../components/ErrorMsgComponent";


export default function CreateStockPage(){
  /*
    ---------------------------
    UTILS SECTION START
    --------------------------- 
  */

  const { popError, isErrorActive, errorMessage, isLoaderActive, setLoaderActive} = useErrorLoaderState();

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [isSpotMarketSelected, setSpotMarketSelected] = useState(false);
  const [isPerpMarketSelected, setPerpMarketSelected] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);


  function SelectSpotMarket(){

    if(isConfirm) return

    setSpotMarketSelected(true);
    setPerpMarketSelected(false);
    setInputs({
      ...input,
      market:"spot"
    })
  }

  function SelectPerpMarket(){

    if(isConfirm) return

    setSpotMarketSelected(false);
    setPerpMarketSelected(true);
    setInputs({
      ...input,
      market:"perp"
    })
  }

  const [input, setInputs] = useState({
    title:"",
    symbol:"",
    market:"",
  })

  function handleChange(e:React.ChangeEvent<HTMLInputElement>){

    if(isConfirm){
      return
    }

    const {name, value} = e.target
    setInputs({
      ...input,
      [name]:value
    })
  }

  function OnClickConfirmDetails(){
    if(!input.title || !input.market || !input.symbol){
      popError("Incomplete Inputs");
      return;
    }
    setIsConfirm(true);
  }

  function OnClickEditDetails(){
    setIsConfirm(false);
    setLoaderActive(false);
  }

  async function OnClickSubmit(){
    setLoaderActive(true)

    if(!input.title || !input.symbol || !input.market){
      popError("Incomplete Inputs");
      return
    }

    try {
      await dispatch(createStock(input)).unwrap()
      setLoaderActive(false);
      //tbd
      navigate("/dashboard")

    } catch (error:any) {
      if(error.status == 403){
        localStorage.removeItem("token");
        navigate("/signin")
      }
      popError(error.message)
    }
  }

  return(
    <NavigationLayout>

      <div className="min-h-screen min-w-screen bg-black-standard tracking-tight">

        <div className="px-9 border-b-color-standard border-b py-10">

          <h1 className="text-white text-3xl font-semibold ">
            Create Stock
          </h1>
          <p className="text-[#A1A1A1] py-2 text-sm">
            Create Stock you like in SPOT or PERP market
          </p>

        </div>

        <div className="mx-auto px-9 py-8 flex gap-6 max-w-3xl text-white flex-col justify-center items-center ">  

          <div className="md:mt-10 w-full">
            <p className="my-4">
              1. Select Stock Name
            </p>

            <InputComponent
              labelName="STOCK NAME"
              value={input.title}
              handleChange={handleChange}
              name="title"
              inputType="text"
              placeholder="e.g., Apple Inc."
            />

            <p className="text-[#555555] my-2 text-xs">
              Enter the official company name that will be displayed on the trading platform.
            </p>
          </div>

          <div className="w-full">
            <p className=" my-4">
              2. Select Stock Symbol
            </p>

            <InputComponent
              labelName="STOCK SYMBOL"
              value={input.symbol.toLocaleUpperCase()}
              handleChange={handleChange}
              name="symbol"
              inputType="text"
              placeholder="e.g., APPL"
            />

            <p className="text-[#555555] my-2 text-xs">
              Use 1-5 characters. This is the unique ticker symbol for trading.
            </p>
          </div>

          <div className="w-full">

            <p className="my-4">
              3. Select Market
            </p>

            <p className="text-[#555555] my-2 text-xs">
              Which markets do you want <span className="font-bold">{input.title}</span> to be tradeable on?
            </p>

            <div className="w-full flex flex-col md:flex-row gap-4 my-6">

              <div 
              onClick={SelectSpotMarket}
              className={`cursor-pointer md:w-1/2 border rounded-sm p-6 text-sm flex flex-col gap-4 ${isSpotMarketSelected ?  "bg-green-950 border-green-700 text-green-400" : "bg-[#1A1A1A] border-[#333333]"}`}>
                <span className="flex justify-between">
                    <span className="text-3xl">📈</span>
                    {
                      isSpotMarketSelected && <span className="text-2xl">✅</span>
                    }
                </span>
                <span className="font-semibold">Spot Trading</span>
                <span className="text-xs text-gray-400">Buy and hold the actual asset. No leverage, no funding fees.</span>
              </div>

              <div 
              onClick={SelectPerpMarket}
              className={`cursor-pointer md:w-1/2 border rounded-sm p-6 text-sm flex flex-col gap-4 ${isPerpMarketSelected ? "bg-blue-950  border-blue-700 text-blue-400" : "bg-[#1A1A1A] border-[#333333]"}`}>
                <span className="flex justify-between">
                    <span className="text-3xl">⚡</span>
                    {
                      isPerpMarketSelected && <span className="text-2xl">✅</span>
                    }
                </span>
                <span className="font-semibold">Perpetual Futures</span>
                <span className="text-xs text-gray-400">Trade with leverage up to 50x. Funding fees apply.</span>
              </div>
            </div>

            
          </div>

          <ErrorMessageComponent errorActive={isErrorActive} errorMessage={errorMessage}/>

          <div className="max-w-3xl w-full">
            {
              !isConfirm ?
              <button className="text-sm border bg-green-950 border-green-700 text-green-400 py-2 px-10 rounded-sm outline-none cursor-pointer" onClick={OnClickConfirmDetails}>
                Confirm Details
              </button>
              :
              <button className="text-sm border bg-yellow-950 border-yello-700 text-yellow-400 py-2 px-10 rounded-sm outline-none cursor-pointer mx-4" onClick={OnClickEditDetails}>
                Edit Details
               </button>
            }
            
            {
              isConfirm &&
              <div className="my-6 border-t border-[#333333] py-6">
                <h1 className="">
                  4. Review Details
                </h1>

                <ReviewCardComponent label="STOCK NAME" value={input.title}/>
                <ReviewCardComponent label="STOCK SYMBOL" value={input.symbol.toLocaleUpperCase()}/>

                <div className="border bg-[#1A1A1A] border-[#333333] rounded-sm py-2 px-4  my-4">
                    <p className="text-xs font-semibold text-[#555555]">MARKET</p>
                    <p className={`mt-2 w-fit py-1 px-4 border rounded-sm text-xs
                      ${isSpotMarketSelected ? "bg-green-950 border-green-700 text-green-400" : "bg-blue-950  border-blue-700 text-blue-400"}`}>{input.market}</p>
                </div>

                <button className="text-xs border bg-green-950 border-green-700 text-green-400 py-2 px-10 rounded-sm outline-none cursor-pointer my-6 animate-bounce" onClick={OnClickSubmit}>
                  {
                    isLoaderActive ?
                    <LoaderGreen/> : 
                    <>Create Stock in {input.market.toLocaleUpperCase()} market</>
                  }
                  
                </button>
              </div>
            }
          </div>

        </div>

      </div>
    </NavigationLayout>
  )
}

function InputComponent({labelName,value,handleChange,name,inputType,placeholder}:InputComponent){
  return(
    <div className="w-full flex justify-center items-start flex-col my-1">
      <label className="my-2 text-xs font-semibold text-[#555555]">
          {labelName}
      </label>
      <input type={inputType} autoComplete={`new-${labelName}`} placeholder={placeholder} className="my-1 outline-none border border-b-color-standard rounded-sm w-full py-3 px-2 text-xs bg-[#1A1A1A] placeholder:text-[#555555] text-white" onChange={handleChange} name={name} value={value} />
    </div>
  )
}

export type InputComponent = {
  labelName:string
  value:string,
  handleChange:any,
  name:string,
  inputType:string,
  placeholder:string
}

function LoaderGreen(){
    return(
      <div>
        <svg aria-hidden="true" className="w-5 h-5 animate-spin text-green-900 fill-green-200" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
      </div>
    )
}

function ReviewCardComponent({label, value}:{label:string, value:string}){
  return(
    <div className="border bg-[#1A1A1A] border-[#333333] rounded-sm py-2 px-4 my-4">
      <p className="text-2xs font-semibold text-[#555555]">{label}</p>
      <p className="text-sm my-1">{value}</p>
    </div>
  )
}