import { useDispatch } from "react-redux";
import LoaderWhite from "./WhiteLoaderCompoenet";
import { useEffect, useState } from "react";
import type { AppDispatch } from "../redux/store";
import { SidePerpEnum, SideSpotEnum } from "@bhargav16exdd/cex";

export default function FillComponentStockPage({stockSymbol, fetchFills, market}:{stockSymbol:string, fetchFills:any, market:string }){

  const dispatch = useDispatch<AppDispatch>();
  const [fills, setFills] = useState<any>(null);
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

  async function fetchFill(){
    try {
      
      const requestPayload = {
        count:"5",
        offset:offset.toString(),
        market,
        symbol:stockSymbol!
      }

      const response = await dispatch(fetchFills(requestPayload)).unwrap()
      setFills(response?.data)

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    fetchFill()
    setFills(null)
  },[offset])


  return(
    <div className="mb-10 uppercase">
      
      <div className="flex w-auto px-14 py-1.5 text-2xs bg-[#111111] rounded-sm m-2">
        <span className="w-[15%]">Market</span>
        <span className="w-[10%]">Side</span>
        <span className="w-[10%]">Price</span>
        <span className="w-[15%]">Quantity</span>
        <span className="w-[10%]">Fee</span>
        <span className="w-[10%]">Role</span>
        <span className="w-[15%]">Time</span>
        
      </div>
      <div className="m-2">
        {
          fills ?
          fills.length > 0 ?
          fills.map((fill:any)=>(
            <div 
            className="flex justify-start items-center px-14 py-3 text-2xs border-b border-b-color-standard text-[#A1A1A1] font-mono uppercase hover:bg-[#0A0A0A]"
            >
              <span className="w-[15%] font-bold text-white">{market}-{fill.symbol.toUpperCase()}</span>
              <span className={`w-[10%] 
                ${ fill.side === SideSpotEnum.ask || fill.side === SidePerpEnum.short ? "text-red-400" : "text-green-400"}`}>{
                  fill.side}</span>
              <span className="w-[10%]">{fill.price}</span>
              <span className="w-[15%]">{fill.quantity} {fill.symbol.toUpperCase()}</span>
              <span className="w-[10%]">0</span>
              <span className="w-[10%]">{fill.role}</span>
              <span className="w-[15%]">{new Date(fill.createdAt).toLocaleString("en-us",{
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second:'2-digit',
                hour12: false,
              })}</span>
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