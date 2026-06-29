import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import { useEffect, useState } from "react";
import { SidePerpEnum } from "@bhargav16exdd/cex";

export default function OpenContractComponent({stockSymbol, fetchOpenContract}:{stockSymbol:string, fetchOpenContract:any}){

  const dispatch = useDispatch<AppDispatch>();
  const [order, setOrder] = useState<any>(null);

  async function OnClickCloseContract(){}

  async function fetch(){
    try {
      const response = await dispatch(fetchOpenContract(stockSymbol)).unwrap()
      if(response.data?.success == true){
        setOrder(response?.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    fetch()
  },[])


  return(
    <div className="mb-10">
      
      <div 
        className="flex w-auto px-14 py-1.5 text-2xs bg-[#111111] rounded-sm m-2">
        <span className="w-[15%]">MARKET</span>
        <span className="w-[10%]">SIDE</span>
        <span className="w-[10%]">QTY</span>
        <span className="w-[10%]">ENTRY PRICE</span>
        <span className="w-[10%]">MARGIN</span>
        <span className="w-[15%]">UNREALIZED PROFIT</span>
        <span className="w-[10%]">UNREALIZED LOSS</span>

        
      </div>
      <div className="m-2">
        {
          order != null &&
          <div 
          className="flex justify-start items-center px-14 py-1.5 text-2xs  text-[#A1A1A1] font-mono uppercase hover:bg-[#0A0A0A]">
            <span className="w-[15%] font-bold text-white">PERP-{order.symbol?.toUpperCase()}</span>
            <span className={`w-[10%] 
                ${ order?.side == SidePerpEnum.short ? "text-red-400" : "text-green-400"}`}>
                {order.side}</span>
            <span className="w-[10%]">{Math.abs(order.contract_quantity)} {order.symbol}</span>
            <span className="w-[10%]">{order.avg_price} USD</span>
            <span className="w-[10%]">{order.collateral} USD</span>
            <span className="w-[15%]">{order.realizedProfit} USD</span>
            <span className={`w-[10%]`}>{order.realizedLoss} USD</span>
             <p 
              className="transform-none underline underline-offset-1 cursor-pointer ml-16"
              onClick={OnClickCloseContract}>Close</p>
          </div>    
        }
      </div>

      <div className="flex justify-end items-center gap-10 py-6 px-6">
        <button onClick={fetch} className={`bg-[#CCCCCC] py-1 text-xs font-semibold rounded-sm px-4 text-black cursor-pointer`}>
          Refresh
        </button>
      </div>
    </div>
  )
}