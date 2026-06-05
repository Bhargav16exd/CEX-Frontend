import { Link, useNavigate } from "react-router";
import NavigationLayout from "../components/NavigationComponent";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPerpStocks, getSpotStocks } from "../redux/slices/stockSlice";
import type { AppDispatch } from "../redux/store";
import LoaderWhite from "../components/WhiteLoaderCompoenet";

//@ts-ignore
enum Role {
 ADMIN = "admin",
 CLIENT = "client"
}

export function DashboardPage(){

  const dispatch = useDispatch<AppDispatch>();

  const [spotStocks, setSpotStocks] = useState(null);
  const [perpStocks, setPerpStocks] = useState(null);


  async function fetchOrders(){
    const spotStocksResponse = await dispatch(getSpotStocks({}))
    const perpStocksResponse = await dispatch(getPerpStocks({}))

    setPerpStocks(perpStocksResponse.payload?.data);
    setSpotStocks(spotStocksResponse.payload?.data)

  }

  useEffect(() =>{
    fetchOrders();
  },[])


  return(
    <NavigationLayout>
      <div className="min-h-screen min-w-screen bg-[#0A0A0A] tracking-tight">

        <div className="px-9 border-[#252525] border-b-2">

          <h1 className="text-white text-3xl font-semibold pt-10">
            Markets
          </h1>
          <p className="text-[#A1A1A1] py-1">
            Trade spot and perpetual futures with deep liquidity and low fees
          </p>

          <div className="text-[#555555] my-4 flex gap-8 text-xs">
            <div>
              <p>24H VOLUME</p>
              <h1 className="text-white font-mono text-lg font-medium py-1">
                $2.41B
              </h1>
            </div>
            <div>
              <p>TOTAL MARKETS</p>
              <h1 className="text-white font-mono text-lg font-medium py-1">
                2
              </h1>
            </div>
            <div>
              <p>ACTIVE TRADERS</p>
              <h1 className="text-white font-mono text-lg font-medium py-1">
                14,821
              </h1>
            </div>
            <div>
              <p>MY PNL</p>
              <h1 className="text-green-400 font-mono text-lg font-medium py-1">
                +$1,248.32
              </h1>
            </div>
          </div>

        </div>

        <div className="px-9 py-8 flex gap-6 w-full text-white">
          <SpotComponent stocks={spotStocks}/>
          <PerpComponent stocks={perpStocks}/>
       </div>

      </div>
    </NavigationLayout>
  )
}

function SpotComponent({stocks}:any){

  const navigate = useNavigate();
  const role = useSelector((state:any)=>state.auth.role);

  function OnCreateStockButtonClick(){
    navigate("/create-stock")
  }

  return(
    <div className="border-[#252525] border-2 rounded-md w-1/2 bg-[#111111]">

          <span className="flex px-4 py-4 border-[#252525] border-b-2">
            <span className="flex w-1/2 gap-4 items-center">
              <h1 className="text-md font-semibold">Spot</h1>
              <p className="text-xs text-green-400 bg-green-950 border border-green-700 py-1 px-3 rounded-full font-semibold"> SPOT</p>    
            </span>
            <span className="flex w-1/2 justify-end items-center gap-4">
              <p className="text-[#555555] gap-8 text-xs">14 Stocks</p>
              {
                role && role == Role.ADMIN &&
                <button className="font-semibold text-white text-xs bg-[#222222] py-1 px-4 rounded-md border-[#333333] border-2 cursor-pointer" onClick={OnCreateStockButtonClick}>+ Add</button>
              }
              
            </span>
          </span>
          <div className="flex px-4 py-2 bg-[#0A0A0A] text-[#555555] text-xs border-[#252525] border-b-2 w-full">
            <p className="w-[40%]">PAIR</p>
            <p className="w-[20%] flex justify-end ">SYMBOL</p>
            <p className="w-[20%] flex justify-end">24H CHANGE</p>
            <p className="w-[20%] flex justify-end">VOLUME</p>
          </div>

          {
            stocks === null ?
            <div className="flex justify-center items-center my-4"><LoaderWhite/></div>
            :
              stocks?.length > 0 ? 
              stocks?.map((stock:any)=>{
                return <StockItem title={stock.title} market={"SPOT"} symbol={stock.symbol}/>
              })
              : <div className="w-full text-center my-8 text-sm text-[#555555]">No Markets Added</div>
          }

          <span className="flex items-center gap-2 p-4">
            <span className="h-1 w-1 animate-ping rounded-full bg-red-600 "></span>
            <p className="text-[#555555] text-xs">
              Market Rates are eventually updated, for latest price check market page
            </p>
          </span>
        </div>
  )
}

function PerpComponent({stocks}:any){

  const role = useSelector((state:any)=>state.auth.role)

  const navigate = useNavigate()
  function OnCreateStockButtonClick(){
    navigate("/create-stock")
  }
  return(
    <div className="border-[#252525] border-2 rounded-md w-1/2 bg-[#111111]">

      <span className="flex px-4 py-4 border-[#252525] border-b-2">
        <span className="flex w-1/2 gap-4 items-center">
          <h1 className="text-md font-semibold">Perpetuals</h1>
          <p className="text-xs text-blue-400 bg-blue-950 border border-blue-700 py-1 px-4 rounded-full font-semibold"> PERPETUAL</p>    
        </span>
          <span className="flex w-1/2 justify-end items-center gap-4">
          <p className="text-[#555555] gap-8 text-xs">14 Stocks</p>
          {
            role && role == Role.ADMIN &&
            <button className="font-semibold text-white text-xs bg-[#222222] py-1 px-4 rounded-md border-[#333333] border-2 cursor-pointer" onClick={OnCreateStockButtonClick}>+ Add</button>
          }
        </span>
      </span>
      <div className="flex px-4 py-2 bg-[#0A0A0A] text-[#555555] text-xs border-[#252525] border-b-2 w-full">
        <p className="w-[40%]">PAIR</p>
        <p className="w-[20%] flex justify-end ">SYMBOL</p>
        <p className="w-[20%] flex justify-end">FUNDING RATE</p>
        <p className="w-[20%] flex justify-end">VOLUME</p>
      </div>

      {
            stocks === null ?
            <div className="flex justify-center items-center my-4"><LoaderWhite/></div>
            :
              stocks?.length > 0 ? 
              stocks?.map((stock:any)=>{
                return <StockItem key={stock.symbol} title={stock.title} market={"PERP"} symbol={stock.symbol}/>
              })
              : <div className="w-full text-center my-8 text-sm text-[#555555]">No Markets Added</div>
          }

      
      <span className="flex items-center gap-2 p-4">
        <span className="h-1 w-1 animate-ping rounded-full bg-red-600 "></span>
        <p className="text-[#555555] text-xs">
          Market Rates are eventually updated, for latest price check market page
        </p>
      </span>
    </div>

  )
}

function StockItem({title, market, symbol}:{title:string, market:string, symbol:string}){
  return(
    <Link to={`/${market.toLocaleLowerCase()}/${symbol}`}>
    <div className="flex px-4 py-4 border-[#252525] border-b-2 w-full hover:bg-[#222222] cursor-pointer">
      <p className="w-[40%] text-sm font-semibold">{title}-{market}</p>
      <p className="w-[20%] text-sm font-mono flex justify-end ">{symbol}</p>
      <p className="w-[20%] text-sm font-mono text-green-400 flex justify-end">+2.41%</p>
      <p className="w-[20%] text-sm font-mono flex justify-end">$892M</p>
    </div>
    </Link>
  )
}