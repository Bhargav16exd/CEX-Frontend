import { useNavigate, useParams } from "react-router";
import NavigationLayout from "../components/NavigationComponent";
import { useEffect, useState } from "react";
import type { InputLabelComponent } from "../components/InputLabelComponent";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import { getBalance, placePerpOrder } from "../redux/slices/perpSlice";
import LoaderWhite from "../components/WhiteLoaderCompoenet";

export function PerpStockPage(){
  // ------- UTILITY SECTION -------

  const { stockSymbol } = useParams();
  const [isErrorActive, setErrorActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate();

  function popError(errorMessage:string){
    setErrorActive(true);
    setErrorMessage(errorMessage);

    setTimeout(()=>{
      setErrorActive(false);
      setErrorMessage("");
    }, 5000)
  }

  // ------- PAGE SEPECIFIC SECTION -------
  const [isLongSectionActive, setIsLongSectionActive] = useState(true);
  const [isShortSectionActive, setIsShortSectionActive] = useState(false);

  function OnClickLongSection(){
    setIsLongSectionActive(true);
    setIsShortSectionActive(false);
    setInput({
        ...input,
      side:"LONG"
    })
  }

  function OnClickShortSection(){
    setIsLongSectionActive(false);
    setIsShortSectionActive(true);
    setInput({
        ...input,
      side:"SHORT"
    })
  }

  const [balance, setBalance] = useState();

  const [input, setInput] = useState({
    type:"LIMIT",
    side:"",
    stockSymbol,
    price:"",
    quantity:""
  })

  async function OnClickPlaceOrder(){
    
    if(isLongSectionActive){
      setInput({
        ...input,
      side:"LONG"
    })
    }
    if(isShortSectionActive){
      setInput({
        ...input,
      side:"SHORT"
    })
    
    }

    console.log(input)

    if(!input.price || !input.quantity || !input.stockSymbol || !input.side || !input.type){
      popError("Incomplete Inputs");
      return
    }

    try {
      const res = await dispatch(placePerpOrder(input)).unwrap()
      console.log(res)
    } catch (error) {
      console.log(error)
    }
  }

  function handleChange(e:React.ChangeEvent<HTMLInputElement>){
    const {name , value} = e.target
    if(Number(value) || value == ""){
      setInput({
        ...input,
        [name]:Number(value)
      })
    }
  }

  async function GetBalance(){
    try {
      const response = await dispatch(getBalance({})).unwrap()
      setBalance(response?.data.data.balance)
    } catch (error:any) {
      if(error.status == 403){
        localStorage.removeItem("token");
        navigate("/signin")
      }
    }
  }

  function GetOrderbook(){

  }

  useEffect(()=>{
    GetBalance();
    
    //create socket connection
    //then get orderbook
  },[])


  return(
    <NavigationLayout>

      {/* Trade and Ticker Page */}
      <div className="min-h-screen min-w-screen bg-[#111111] flex text-white">
        
        {/* ------- CANDLES & ORDERBOOK SECTION -------*/}
        <div className="w-[78%] border-[#252525] border-r-2">

        </div>

        {/* ------- LONG OR SHORT SECTION -------*/}
        <div className="w-[22%]">
          <span className="flex text-[#555555] text-sm font-semibold text-center border-[#252525] border-b-2 ">
            <div className={`w-1/2 cursor-pointer py-4 ${isLongSectionActive && "border-b-2 border-green-400 text-green-400"}`} onClick={OnClickLongSection}>
              Buy / Long
            </div>
            <div className={`w-1/2 cursor-pointer py-4 ${isShortSectionActive && "border-b-2 border-red-400 text-red-400"}`} onClick={OnClickShortSection}>
              Sell / Short
            </div>
          </span>

        {/* FORM */}
        <div className="px-4">

            <span className="flex text-center justify-center text-sm my-4 border py-2 rounded-lg border-[#252525]">
              <div className="w-1/2 flex justify-center items-center">
                <p className="rounded-lg text-blue-400 bg-blue-950 border border-blue-700 w-fit px-4 py-1">Limit</p>
              </div>
              <div className="w-1/2 cursor-not-allowed flex justify-center items-center">Market</div>
            </span>

            <p className="flex text-sm my-4 justify-between items-center">
              <p className="text-[#555555]">Available Balance</p>
              <p>${balance ? balance : <LoaderWhite/>}</p>
            </p>

            <InputLabelComponent
              labelName="PRICE"
              value={input.price}
              handleChange={handleChange}
              name="price"
              inputType="text"
              placeholder="0"
            />

            <InputLabelComponent
              labelName="QUANTITY"
              value={input.quantity}
              handleChange={handleChange}
              name="quantity"
              inputType="text"
              placeholder="0"
            />

            {
              isErrorActive &&
              <p className="text-center text-red-400 text-sm my-2 max-w-xs text-wrap overflow-hidden">
                {errorMessage}
              </p>
            }
            
            {
              isLongSectionActive &&
              <button 
              onClick={OnClickPlaceOrder}
              className="rounded-md w-full py-2 px-2 text-green-400 bg-green-950 border border-green-700 my-6">Buy/Long</button>
            }

            {
              isShortSectionActive &&
              <button 
              onClick={OnClickPlaceOrder}
              className="rounded-md w-full py-2 px-2 text-red-400 bg-red-950 border border-red-700 my-6">Sell/Short</button>
            }
            
        </div>

        </div>

       
      </div>
    </NavigationLayout>
  )
}

export default function InputLabelComponent({labelName,value,handleChange,name,inputType,placeholder}:InputLabelComponent){
  return(
    <div className="w-full flex justify-center items-start flex-col my-1">
      <label className="my-2 text-xs font-semibold text-[#555555]">
          {labelName}
      </label>
      <input type={inputType} autoComplete={`new-${labelName}`} placeholder={placeholder} className="my-1 outline-none border-2 border-[#333333] rounded-md w-full py-3 px-2 text-sm bg-[#1A1A1A] placeholder:text-[#555555] text-white" onChange={handleChange} name={name} value={value} />
    </div>
  )
}