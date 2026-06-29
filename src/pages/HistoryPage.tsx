import { useEffect, useState } from "react"
import NavigationLayout from "../components/NavigationComponent"
import LoaderWhite from "../components/WhiteLoaderCompoenet";
import { fetchGlobalFills, fetchGlobalOrders } from "../redux/slices/historySlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import ETHLOGO from "../assets/eth.webp"
import SOLLOGO from "../assets/sol.webp"
import BTCLOGO from "../assets/btc.webp"
import { SidePerpEnum, SideSpotEnum } from "@bhargav16exdd/cex";
import { StatusBadge } from "../components/StockPageComponents";
import FillCard from "../components/FillCardComponentHistoryPage";
import OrderCard from "../components/OrderCardComponentHistoryPage";

//@ts-ignore
enum OrderStatus {
  OPEN = "open",
  CANCELLED = "cancelled",
  PARTIAL_FILL = "partialfill",
  CLOSED = "closed",
}
//@ts-ignore
enum OrderSide {
  LONG = "long",
  SHORT = "short"
}

export default function HistoryPage(){

  const [isSpotHistoryActive, setSpotHistoryActive] = useState(true);
  const [isPerpsHistoryActive, setPerpsHistoryActive] = useState(false);

  function OnClickSpotHistory(){
    setSpotHistoryActive(true);
    setPerpsHistoryActive(false);
  }

  function OnClickPerpsHistory(){
    setSpotHistoryActive(false);
    setPerpsHistoryActive(true);
  }

  return(
    <NavigationLayout>
      <div className="min-h-screen min-w-screen bg-black-standard tracking-tight">

        <div className="px-9 border-b-color-standard border-b ">

          <h1 className="text-white text-3xl font-semibold pt-10">
            History
          </h1>
          <p className="text-[#A1A1A1] py-2 text-sm">
            All markets · All time
          </p>

           <span className="flex items-center gap-2 py-4">
            <span className="h-1 w-1 animate-ping rounded-full bg-red-600 "></span>
            <p className="text-[#555555] text-2xs">
              History is eventually updated, it may take time to reflect your latest orders
            </p>
          </span> 
        </div>

        {/* Bottom Div */}
        <div className="px-9 py-4 text-white flex flex-col gap-8">

          <div className="flex w-auto bg-[#0A0A0A] rounded-sm p-1 mb-2 mt-6 border border-b-color-standard md:max-w-2xs">
            <div 
            onClick={OnClickSpotHistory} 
            className={`w-1/2 text-center text-xs py-2 cursor-pointer ${isSpotHistoryActive ? "bg-[#1A1A1A] rounded-sm text-white" : "text-[#8A8A8A]"}`}>
              SPOT
            </div>
            <div 
            onClick={OnClickPerpsHistory}
            className={`w-1/2 text-center text-xs py-2 cursor-pointer ${isPerpsHistoryActive ? "bg-[#1A1A1A] rounded-sm text-white" : "text-[#8A8A8A]"} `}>
              PERP
            </div>
          </div>

          {
            isSpotHistoryActive && <SpotHistory/>
          }
          {
            isPerpsHistoryActive && <PerpsHistory/>
          }
  
        </div>

      </div>
    </NavigationLayout>
  )
}


function fetchLogo(symbol:string):any{
  const store:any = {
    "ETH":ETHLOGO,
    "SOL":SOLLOGO,
    "SOLANA":SOLLOGO,
    "BTC":BTCLOGO,
  }
  return store[symbol]!;
}

function SpotHistory(){

  const [isFillsHistoryActive, setFillsHistoryActive] = useState(true);
  const [isOrderHistoryActive, setOrdersHistoryActive] = useState(false);

  function OnClickFillsHistory(){
    setFillsHistoryActive(true);
    setOrdersHistoryActive(false);
  }

  function OnClickOrdersHistory(){
    setFillsHistoryActive(false);
    setOrdersHistoryActive(true);
  }

  return(
  <div className="border-b-color-standard border rounded-sm w-full text-white bg-[#0A0A0A]">

    <span className="flex px-10 py-4 border-b-color-standard border-b gap-6 justify-between md:justify-normal">
      <span className="flex w-auto gap-4 items-center">
        <h1 className="text-md font-bold tracking-tighter">History</h1>
      </span>

      <div className=" text-white flex flex-col gap-8">

        <div className="p-1 border-b-color-standard border rounded-sm w-fit flex gap-2 text-xs font-semibold">
          <p
          onClick={OnClickFillsHistory} 
          className={` py-1 px-4 rounded-sm flex justify-center items-center cursor-pointer ${isFillsHistoryActive && "bg-[#222222]"}`}>Fills</p>
          <p 
          onClick={OnClickOrdersHistory}
          className={` py-1 px-4 rounded-sm flex justify-center items-center cursor-pointer ${isOrderHistoryActive && "bg-[#222222]"}`}>Orders</p>
        </div>

      </div>
    </span>

    <div>
      {
        isFillsHistoryActive && <FillHistoryComponent market="spot"/>
      }
      {
        isOrderHistoryActive && <OrderHistoryComponent market="spot"/>
      }
    </div>
      
    </div>
  )
}

function PerpsHistory(){

  const [isFillsHistoryActive, setFillsHistoryActive] = useState(true);
  const [isOrderHistoryActive, setOrdersHistoryActive] = useState(false);

  function OnClickFillsHistory(){
    setFillsHistoryActive(true);
    setOrdersHistoryActive(false);
  }

  function OnClickOrdersHistory(){
    setFillsHistoryActive(false);
    setOrdersHistoryActive(true);
  }

  return(
  <div className="border-b-color-standard border rounded-sm w-full bg-[#0A0A0A] text-white">
    <span className="flex px-10 py-4 border-b-color-standard border-b gap-6 justify-between md:justify-normal">
      <span className="flex w-auto gap-4 items-center">
        <h1 className="text-md font-bold tracking-tighter">History</h1>
  
      </span>

      <div className=" text-white flex flex-col gap-8">

        <div className="p-1 border-b-color-standard border rounded-md w-fit  flex gap-2 text-xs font-semibold">
          <p
          onClick={OnClickFillsHistory} 
          className={` py-1 px-4 rounded-sm flex justify-center items-center cursor-pointer ${isFillsHistoryActive && "bg-[#222222]"}`}>Fills</p>
          <p 
          onClick={OnClickOrdersHistory}
          className={` py-1 px-4 rounded-sm flex justify-center items-center cursor-pointer ${isOrderHistoryActive && "bg-[#222222]"}`}>Orders</p>
        </div>

      </div>
    </span>

    <div>
      {
        isFillsHistoryActive && <FillHistoryComponent market="perp"/>
      }
      {
        isOrderHistoryActive && <OrderHistoryComponent market="perp"/>
      }
    </div>
      
  </div>
  )
}

function FillHistoryComponent({market}:{market:string}){

  const dispatch = useDispatch<AppDispatch>();
  const [fills, setFills] = useState<any>(null);
  const [offset, setOffset] = useState(0);

  function NextPage(){
    const value = offset
    setOffset(value + 20)
  }

  function PrevPage(){
    if(offset === 0) return;
    const value = offset
    setOffset(value - 20)
  }

  async function fetchFill(){
    try {
      
      const requestPayload = {
        count:"20",
        offset:offset.toString(),
        market
      }

      const response = await dispatch(fetchGlobalFills(requestPayload)).unwrap()
      setFills(response?.data)

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    setFills(null)
    fetchFill()
  },[offset])


  return(
    <div className="mb-10">
      
      <div 
      className="hidden md:flex w-full border-b-color-standard border-b text-[#414141] px-14 py-2 text-xs uppercase font-bold overflow-x-scroll">
        <span className="w-[20%]">Market</span>
        <span className="w-[15%]">Side</span>
        <span className="w-[15%]">Price</span>
        <span className="w-[15%]">Quantity</span>
        <span className="w-[15%]">Fee</span>
        <span className="w-[15%]">Role</span>
        <span className="w-[20%]">Time</span>
        
      </div>
      <div>
        {
          fills ? 

          fills.length > 0 ?
          fills.map((fill:any,idx:number)=>(
            <div className="w-full flex p-4 md:p-0">
              <div 
              key={idx} 
              className="hidden md:flex w-full  flex-col md:flex-row px-14 py-2.5 text-xs border-b border-b-color-standard text-[#A1A1A1] font-mono justify-center items-center uppercase">
                <span className="w-[20%] flex justify-start items-center gap-2">
                  <img src={fetchLogo(fill.symbol.toUpperCase())} alt="logo" className="h-8"/>
                  <p
                  className="font-bold text-white"
                  >{market}-{fill.symbol.toUpperCase()}</p>
                </span>
                <span className={`w-[15%] 
                    ${ fill.side === SideSpotEnum.ask || fill.side === SidePerpEnum.short ? "text-red-400" : "text-green-400"}`}>{
                      fill.side}
                </span>
                <span className="w-[15%]">{fill.price} USD</span>
                <span className="w-[15%]">{fill.quantity} {fill.symbol.toUpperCase()}</span>
                <span className="w-[15%]">0 USD</span>
                <span className={`w-[15%]`}>{fill.role}</span>
                <span className="w-[20%]">{new Date(fill.createdAt).toLocaleString("en-us",{
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second:'2-digit',
                  hour12: false,
                })}</span>
              </div>

              <FillCard fill={fill} market={market} fetchLogo={fetchLogo}/>
            </div>    
          ))
          : <div className="w-full text-center my-8 text-sm text-[#555555]">Empty Fill History</div>
          :
          <div className="flex justify-center items-center py-10">
            <LoaderWhite/>
          </div>
        }
      </div>

      <div className="flex justify-end items-center gap-10 py-6 px-6">
        <button onClick={PrevPage} className={`bg-[#CCCCCC] py-1 text-xs font-semibold rounded-md px-4 text-black ${Number(offset) == 0 ? "cursor-not-allowed" : "cursor-pointer"}`}>
          Prev
        </button>
        <p className="text-gray-400 text-sm">
          {offset}
        </p>
        <button onClick={NextPage} className="bg-[#CCCCCC] py-1 text-xs font-semibold rounded-md px-4 text-black cursor-pointer">
          Next
        </button>
      </div>
    </div>
  )
}

function OrderHistoryComponent({market}:{market:string}){

  const dispatch = useDispatch<AppDispatch>();
  const [orders, setOrders] = useState<any>(null);
  const [offset, setOffset] = useState(0);

  function NextPage(){
    const value = offset
    setOffset(value + 20)
  }

  function PrevPage(){
    if(offset === 0) return;
    const value = offset
    setOffset(value - 20)
  }

  async function fetch(){
    try {
      
      const requestPayload = {
        count:"20",
        offset:offset.toString(),
        market
      }

      const response = await dispatch(fetchGlobalOrders(requestPayload)).unwrap()

      setOrders(response?.data)

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    setOrders(null);
    fetch()
  },[offset])


  return(
    <div className="mb-10">
      
      <div 
      className="hidden md:flex w-full border-b-color-standard border-b text-[#414141] px-14 py-2 text-xs uppercase font-bold overflow-x-scroll">
        <span className="w-[20%]">MARKET</span>
        <span className="w-[15%]">SIDE</span>
        <span className="w-[15%]">TYPE</span>
        <span className="w-[15%]">PRICE</span>
        <span className="w-[15%]">QTY</span>
        <span className="w-[15%]">STATUS</span>
        <span className="w-[20%]">TIME</span>
        
      </div>
      <div >
        {
          orders ?
          orders.length > 0 ?
          orders.map((order:any, idx:number)=>(
            <div className="w-full flex p-4 md:p-0">
            <div 
            key={idx} 
            className="hidden md:flex w-full px-14 py-2.5 text-xs border-b border-b-color-standard text-[#A1A1A1] font-mono justify-center items-center uppercase">
              <span className="w-[20%] flex justify-start items-center gap-2">
                <img src={fetchLogo(order.symbol.toUpperCase())} alt="logo" className="h-8"/>
                <p 
                className="font-bold text-white"
                >{market}-{order.symbol.toUpperCase()}</p>
              </span>
              <span className={`w-[15%] 
                  ${ order.side === SideSpotEnum.ask || order.side === SidePerpEnum.short ? "text-red-400" : "text-green-400"}`}>{
                    order.side}
              </span>
              <span className="w-[15%]">{order.type}</span>
              <span className="w-[15%]">{order.price}</span>
              <span className="w-[15%]">{order.quantity} {order.symbol.toUpperCase()}</span>
              <span className={`w-[15%]`}><StatusBadge status={order.status}/></span>
              <span className="w-[20%]">{new Date(order.createdAt).toLocaleString("en-us",{
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second:'2-digit',
                hour12: false,
              })}</span>
            </div>
            <OrderCard order={order} market={market} fetchLogo={fetchLogo}/>
            </div>    
          ))
          : <div className="w-full text-center my-8 text-sm text-[#555555]">Empty orders History</div>
          :
          <div className="flex justify-center items-center py-10">
            <LoaderWhite/>
          </div>
        }
      </div>

      <div className="flex justify-end items-center gap-10 py-6 px-6">
        <button onClick={PrevPage} className={`bg-[#CCCCCC] py-1 text-xs font-semibold rounded-md px-4 text-black ${Number(offset) == 0 ? "cursor-not-allowed" : "cursor-pointer"}`}>
          Prev
        </button>
        <p className="text-gray-400 text-sm">
          {offset}
        </p>
        <button onClick={NextPage} className="bg-[#CCCCCC] py-1 text-xs font-semibold rounded-md px-4 text-black cursor-pointer">
          Next
        </button>
      </div>
    </div>
  )
}

