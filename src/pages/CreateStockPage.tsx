import { useState } from "react";
import NavigationLayout from "../components/NavigationComponent";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import { useNavigate } from "react-router";
import { createStock } from "../redux/slices/stockSlice";


export default function CreateStockPage(){
  /*
    ---------------------------
    UTILS SECTION START
    --------------------------- 
  */

  const [isErrorActive, setErrorActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoaderActive, setLoaderActive] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [isSpotMarketSelected, setSpotMarketSelected] = useState(false);
  const [isPerpMarketSelected, setPerpMarketSelected] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);

  function popError(errorMessage:string){
    setLoaderActive(false);
    setErrorActive(true);
    setErrorMessage(errorMessage);

    setTimeout(()=>{
      setErrorActive(false);
      setErrorMessage("");
    }, 5000)
  }

  function SelectSpotMarket(){

    if(isConfirm) return

    setSpotMarketSelected(true);
    setPerpMarketSelected(false);
    setInputs({
      ...input,
      market:"SPOT"
    })
  }

  function SelectPerpMarket(){

    if(isConfirm) return

    setSpotMarketSelected(false);
    setPerpMarketSelected(true);
    setInputs({
      ...input,
      market:"PERPETUAL"
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
      const res = await dispatch(createStock(input)).unwrap()
      setLoaderActive(false);
      console.log(res)

      navigate("/dashboard")

    } catch (error:any) {
      if(error?.response?.data?.statusCode == 403){
        localStorage.removeItem("token");
        return
      }
      popError(error.message)
    }
  }

  return(
    <NavigationLayout>
      <div className="min-h-screen min-w-screen bg-[#0A0A0A] tracking-tight">

        <div className="px-9 border-[#252525] border-b-2 py-10">

          <h1 className="text-white text-3xl font-semibold ">
            Create Stock
          </h1>
          <p className="text-[#A1A1A1] py-1">
            Create Stock you like in SPOT or PERP market
          </p>

        </div>

        <div className="px-9 py-8 flex gap-6 w-full text-white flex-col justify-center items-center">  

          <div className="mt-10">
            <p className="font-mono text-xl my-4">
              Step 1 :  SELECT STOCK NAME
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

          <div>
            <p className="font-mono text-xl my-4">
              Step 2 :  SELECT STOCK SYMBOL
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

          <div className="max-w-3xl w-full">
            <p className="font-mono text-xl my-4">
              Step 3 :  SELECT MARKET
            </p>

            <p className="text-[#555555] my-2 text-xs">
              Which markets do you want <span className="font-bold">{input.title}</span> to be tradeable on?
            </p>

            <div className="w-full flex gap-4 my-6">

              <div 
              onClick={SelectSpotMarket}
              className={`cursor-pointer w-1/2 border-2 rounded-md p-6 text-sm flex flex-col gap-4 ${isSpotMarketSelected ?  "bg-green-950 border-green-700 text-green-400" : "bg-[#1A1A1A] border-[#333333]"}`}>
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
              className={`cursor-pointer w-1/2 border-2 rounded-md p-6 text-sm flex flex-col gap-4 ${isPerpMarketSelected ? "bg-blue-950  border-blue-700 text-blue-400" : "bg-[#1A1A1A] border-[#333333]"}`}>
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

          {
            isErrorActive &&
              <p className="text-center text-red-400 text-sm my-2 max-w-xs text-wrap overflow-hidden">
                {errorMessage}
              </p>
          }

          <div className="max-w-3xl w-full">
            {
              !isConfirm ?
              <button className="text-sm border bg-green-950 border-green-700 text-green-400 py-2 px-10 rounded-lg outline-none cursor-pointer" onClick={OnClickConfirmDetails}>
                Confirm Details
              </button>
              :
              <button className="text-sm border bg-yellow-950 border-yello-700 text-yellow-400 py-2 px-10 rounded-lg outline-none cursor-pointer mx-4" onClick={OnClickEditDetails}>
                Edit Details
               </button>
            }
            
            {
              isConfirm &&
              <div className="my-6 border-t-2 border-[#333333] py-6">
                <h1 className="text-xl">
                  Review Details
                </h1>
                <div className="border-2 bg-[#1A1A1A] border-[#333333] rounded-lg py-3 px-2 my-4">
                  <p className="text-xs font-semibold text-[#555555]">STOCK NAME</p>
                  <p className="my-2">{input.title}</p>
                </div>
                <div className="border-2 bg-[#1A1A1A] border-[#333333] rounded-lg py-3 px-2 my-4">
                    <p className="text-xs font-semibold text-[#555555]">STOCK SYMBOL</p>
                    <p className="my-2">{input.symbol.toLocaleUpperCase()}</p>
                </div>
                <div className="border-2 bg-[#1A1A1A] border-[#333333] rounded-lg py-3 px-2 my-4">
                    <p className="text-xs font-semibold text-[#555555]">MARKET TYPE</p>
                    <p className={`mt-2 w-fit py-1 px-4 border rounded-lg
                      ${isSpotMarketSelected ? "bg-green-950 border-green-700 text-green-400" : "bg-blue-950  border-blue-700 text-blue-400"}`}>{input.market}</p>
                </div>

                <button className="text-sm border bg-green-950 border-green-700 text-green-400 py-2 px-10 rounded-lg outline-none cursor-pointer my-6 animate-bounce" onClick={OnClickSubmit}>
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
      <label className="my-2 text-sm font-semibold text-[#555555]">
          {labelName}
      </label>
      <input type={inputType} autoComplete={`new-${labelName}`} placeholder={placeholder} className="my-1 outline-none border-2 border-[#333333] rounded-md w-3xl py-3 px-2 text-sm bg-[#1A1A1A] placeholder:text-[#555555] text-white" onChange={handleChange} name={name} value={value} />
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