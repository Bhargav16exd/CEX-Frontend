import { useEffect, useState } from "react";
import { StatusBadge } from "./StockPageComponents";
import LoaderWhite from "./WhiteLoaderCompoenet";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import { SideSpotEnum, SidePerpEnum } from "@bhargav16exdd/cex";

export default function OpenOrdersComponentStockPage({stockSymbol, fetchOpenOrders, market, cancelOrder}:{stockSymbol:string, fetchOpenOrders:any, market:string, cancelOrder:any}){

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
      const response = await dispatch(fetchOpenOrders({symbol:stockSymbol!, count:5, offset})).unwrap()
      setOrders(response?.data)
    } catch (error) {
      console.log(error)
    }
  }

  async function OnClickCancelOrder(orderId:string){
    try {
      setOrders(null);
      const response = await dispatch(cancelOrder({symbol:stockSymbol, orderId})).unwrap()
      console.log(response)
      if(response.success == true){
        fetch();
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    setOrders(null);
    fetch()
  },[offset])

  console.log(SideSpotEnum)


  return(
    <div className="mb-10">
      
      <div 
      className="flex w-auto px-14 py-1.5 text-2xs bg-[#111111] rounded-sm m-2">
        <span className="w-[15%]">MARKET</span>
        <span className="w-[10%]">SIDE</span>
        <span className="w-[10%]">TYPE</span>
        <span className="w-[10%]">PRICE</span>
        <span className="w-[15%]">QTY</span>
        <span className="w-[15%]">FILLED</span>
        <span className="w-[15%]">STATUS</span>
      </div>

      <div className="m-2">
        {
          orders ?
          orders.length > 0
          ?
          orders.map((order:any, idx:number)=>(
            <div 
            key={idx}
            className="flex justify-start items-center px-14 py-1.5 text-2xs border-b border-b-color-standard text-[#A1A1A1] font-mono uppercase hover:bg-[#0A0A0A]">
              <span className="w-[15%] font-bold text-white">{market}-{order.symbol.toUpperCase()}</span>
              <span className={`w-[10%] 
                ${ order?.side == SideSpotEnum.ask || order?.side == SidePerpEnum.long ? "text-red-400" : "text-green-400"}`}>
                {order.side}</span>
              <span className="w-[10%]">{order.type}</span>
              <span className="w-[10%]">{order.price}</span>
              <span className="w-[15%]">{order.quantity} {order.symbol.toUpperCase()}</span>
              <span className="w-[15%]">{order.filledQuantity} {order.symbol.toUpperCase()}</span>
              <span className={`w-[15%]`}><StatusBadge status={order.status}/></span>
              <p 
              className="transform-none underline underline-offset-1 cursor-pointer"
              onClick={()=> OnClickCancelOrder(order.orderId)}>Close</p>
            </div>    
          ))
          :
          <div className="w-full text-center my-8 text-sm text-[#555555]">No Open Orders</div>
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