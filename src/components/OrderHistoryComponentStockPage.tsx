import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import { useEffect, useState } from "react";
import LoaderWhite from "./WhiteLoaderCompoenet";
import { StatusBadge } from "./StockPageComponents";
import { SidePerpEnum, SideSpotEnum } from "@bhargav16exdd/cex";

export default function OrderHistoryComponentStockPage({stockSymbol, fetchOrders, market}:{stockSymbol:string, fetchOrders:any, market:string}){

  const dispatch = useDispatch<AppDispatch>();
  const [orders, setOrders] = useState<any>(null);
  const [offset, setOffset] = useState(0);

  function NextPage(){
    const value = offset
    setOffset(value + 5)
  }

  function PrevPage(){
    if(offset === 0) return;
    const value = offset
    setOffset(value - 5)
  }

  async function fetch(){
    try {
      
      const requestPayload = {
        count:"5",
        offset:offset.toString(),
        market,
        symbol:stockSymbol!
      }

      const response = await dispatch(fetchOrders(requestPayload)).unwrap()

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
      className="flex w-auto px-14 py-1.5 text-2xs bg-[#111111] rounded-sm m-2"
      >
        <span className="w-[15%]">MARKET</span>
        <span className="w-[10%]">SIDE</span>
        <span className="w-[10%]">TYPE</span>
        <span className="w-[10%]">PRICE</span>
        <span className="w-[15%]">QTY</span>
        <span className="w-[15%]">STATUS</span>
        <span className="w-[15%]">TIME</span>
        
      </div>
      <div className="m-2">
        {
          orders ?
          orders.length > 0 ?
          orders.map((order:any)=>(
            <div 
            className="flex justify-start items-center px-14 py-1.5 text-2xs border-b border-b-color-standard text-[#A1A1A1] font-mono uppercase hover:bg-[#0A0A0A]"
            >
              <span className="w-[15%] text-white font-bold">{market}-{order.symbol.toUpperCase()}</span>
              <span className={`w-[10%] 
                ${ order.side === SideSpotEnum.ask || order.side === SidePerpEnum.short ? "text-red-400" : "text-green-400"}`}
                >{order.side}</span>
              <span className="w-[10%]">{order.type}</span>
              <span className="w-[10%]">{order.price}</span>
              <span className="w-[15%]">{order.quantity} {order.symbol.toUpperCase()}</span>
              <span className={`w-[15%]`}><StatusBadge status={order.status}/></span>
              <span className="w-[15%]">{new Date(order.createdAt).toLocaleString("en-us",{
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second:'2-digit',
                hour12: false,
              })}</span>
            </div>    
          ))
          : <div className="w-full text-center my-8 text-sm text-[#555555]">empty order History</div>
          :
          <div className="flex justify-center items-center py-10">
            <LoaderWhite/>
          </div>
        }
      </div>

      <div className="flex justify-end items-center gap-10 py-6 px-6">
        <button onClick={PrevPage} className={`bg-[#CCCCCC] py-1 text-xs font-semibold rounded-sm px-4 text-black ${Number(offset) == 0 ? "cursor-not-allowed" : "cursor-pointer"}`}>
          Prev
        </button>
        <p className="text-gray-400 text-sm">
          {offset}
        </p>
        <button onClick={NextPage} className="bg-[#CCCCCC] py-1 text-xs font-semibold rounded-sm px-4 text-black cursor-pointer">
          Next
        </button>
      </div>
    </div>
  )
}