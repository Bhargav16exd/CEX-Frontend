import { useNavigate, useParams } from "react-router";
import NavigationLayout from "../components/NavigationComponent";
import { useEffect, useState } from "react";
import type { InputLabelComponent } from "../components/InputLabelComponent";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import { getBalance, getOrderbook, placePerpOrder } from "../redux/slices/perpSlice";
import LoaderWhite from "../components/WhiteLoaderCompoenet";

type Orderbook = {
  asks:Array<any>,
  bids:Array<any>
}

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

  // ------- ORDERBOOK SECTION ---------
  const [orderbook, setOrderbook] = useState({
    bids:[],
    asks:[]
  })

  // ------- PAGE SEPECIFIC SECTION -------
  const [isLongSectionActive, setIsLongSectionActive] = useState(true);
  const [isShortSectionActive, setIsShortSectionActive] = useState(false);
  const [isOrderResponsePanelActive, setOrderResponsePanelActive] = useState(false);
  const [orderResponse, setOrderResponse] = useState({
    totalQuantity:0,
    filledQuantity:0
  })

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

    if(!input.price || !input.quantity || !input.stockSymbol || !input.side || !input.type){
      popError("Incomplete Inputs");
      return
    }

    try {
      const res = await dispatch(placePerpOrder(input)).unwrap()
      GetBalance();
      setOrderResponse({
        ...orderResponse,
        totalQuantity:res.data.totalQuantity,
        filledQuantity:res.data.fillQuantity
      })
      setOrderResponsePanelActive(true);
      setTimeout(()=>{
        setOrderResponsePanelActive(false);
      },10000)

      GetOrderbook();
    } catch (error:any) {
      popError(error.message)
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

  async function GetOrderbook(){
    try {
      const response = await dispatch(getOrderbook(stockSymbol)).unwrap()
      setOrderbook({
        bids:response.data.bids,
        asks:response.data.asks
      })
    } catch (error:any) {
      if(error.status == 403){
        localStorage.removeItem("token");
        navigate("/signin")
      }
    }
  }

  useEffect(()=>{
    GetBalance();
    GetOrderbook();
    //create socket connection
    //then get orderbook
  },[])


  return(
    <NavigationLayout>

      {/* Trade and Ticker Page */}
      <div className="min-h-screen min-w-screen bg-[#111111] flex text-white">
        
        {/* ------- CANDLES & ORDERBOOK SECTION -------*/}
        <div className="w-[80%] border-[#252525] border-r-2 flex flex-col">

          <div className="w-full py-10 border-[#252525] border-b-2"></div>

          <div className="flex w-full">
             <div className="w-[75%] border-[#252525] border-r-2">
              hi
            </div>
            <Orderbook Orderbook={orderbook}/>
          </div>
        </div>

        {/* ------- LONG OR SHORT SECTION -------*/}
        <div className="w-[20%]">
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
              className="rounded-md w-full py-2 px-2 text-green-400 bg-green-950 border border-green-700 my-6 active:scale-95 transition-transform">Buy/Long</button>
            }

            {
              isShortSectionActive &&
              <button 
              onClick={OnClickPlaceOrder}
              className="rounded-md w-full py-2 px-2 text-red-400 bg-red-950 border border-red-700 my-6 active:scale-95 transition-transform">Sell/Short</button>
            }

            {
              isOrderResponsePanelActive &&
              <div className="my-4 text-green-400 bg-[#0D1F14] border border-green-700 rounded-lg">
                <div className="py-3 px-6 font-medium flex items-center gap-4 border-b-2 border-green-700 text-sm">
                  <div className="h-1.5 w-1.5 animate-ping rounded-full bg-green-400 z-10 "></div>
                  <p>ORDER FILLED</p>
                </div>
                <div className="flex py-2 px-6 justify-between text-xs text-[#3D6B4F]">
                  <div className="w-1/2">TOTAL QTY</div>
                  <div className="w-1/2">FILLED QTY</div>
                </div>
                <span className="flex px-6 text-sm mb-4 text-white">
                  <div className="w-1/2 font-bold">{orderResponse.totalQuantity}</div>
                  <div className="w-1/2 font-bold">{orderResponse.filledQuantity}</div>
                </span>
              </div>
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


function Orderbook({Orderbook}:{Orderbook:Orderbook}){

  function enrichLevels(levels:[number, number][]){
    let total = 0;
    return levels.map(([price, quantity])=>{
      total = total + quantity;
      return {price , quantity, total};
    })
  }

  const enrichAsks = enrichLevels(Orderbook.asks);
  const enrichBids = enrichLevels(Orderbook.bids);

  const maxTotal = Math.max(enrichAsks.at(-1)?.total ?? 0, enrichBids.at(-1)?.total ?? 0)

  return(
    <div className="w-[25%] border-[#252525]  border-b-2 ">

        <div className="w-full p-4 flex justify-between items-center border-[#252525] border-b-2">
          <p className="font-sm font-semibold">Orderbook</p>
          <p className="text-xs text-[#383838]">Depth</p>
        </div>

        <div className="flex px-4 py-2 text-sm text-[#383838] border-[#252525] border-b-2">
          <p className="w-[40%]">Price</p>
          <p className="w-[30%] flex justify-end">Size</p>
          <p className="w-[30%] flex justify-end">Total</p>
        </div>
      
        {/* Render Asks */}
        <div className="flex flex-col-reverse font-mono">
          {
            enrichAsks.map(({price, quantity, total})=>(
              <div key={price} className="relative flex px-4 py-1 text-xs text-[#A1A1A1] my-0.5">
                <div 
                style={{width:`${((total/maxTotal)*100)}%`}}
                className="absolute inset-y-0 right-0 bg-red-400/10"></div>
                <div 
                style={{width:`${((quantity/maxTotal)*100)}%`}}
                className="absolute inset-y-0 right-0 bg-red-500/70"></div>
                <p className="w-[40%] text-red-400">{price}</p>
                <p className="w-[30%] flex justify-end">{quantity}</p>
                <p className="w-[30%] flex justify-end">{total}</p>
              </div>
            ))
          }
        </div>
        
        <div className="px-4 py-2 text-xs text-[#383838] border-t border-b">
          <p>Spread : $ {enrichAsks[0]?.price - enrichBids[0]?.price}</p>
        </div>

        {/* Render Bids */}
        <div className="flex flex-col font-mono">
          {
            enrichBids.map(({price, quantity, total})=>(
              <div  key={price} className="relative flex px-4 py-1 text-xs text-white my-0.5">
                <div 
                style={{width:`${((total/maxTotal)*100)}%`}}
                className="absolute inset-y-0 right-0 bg-green-400/10"></div>
                <div 
                style={{width:`${((quantity/maxTotal)*100)}%`}}
                className="absolute inset-y-0 right-0 bg-green-500/70"></div>
                <p className="w-[40%] text-green-400">{price}</p>
                <p className="w-[30%] flex justify-end">{quantity}</p>
                <p className="w-[30%] flex justify-end">{total}</p>
              </div>
            ))
          }
        </div>

    </div>
  )
}