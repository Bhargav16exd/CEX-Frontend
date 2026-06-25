import NavigationLayout from "../components/NavigationComponent";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getPerpStocks, getSpotStocks } from "../redux/slices/stockSlice";
import type { AppDispatch } from "../redux/store";
import MarketDashboardComponent from "../components/MarketDashboardComponent";


export function DashboardPage(){

  const dispatch = useDispatch<AppDispatch>();

  const [spotStocks, setSpotStocks] = useState<any>(null);
  const [perpStocks, setPerpStocks] = useState<any>(null);


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
      <div className="min-h-screen min-w-screen bg-black-standard tracking-tight">

        <div className="px-9 border-b-color-standard border-b">

          <h1 className="text-white text-3xl font-semibold pt-10">
            Markets
          </h1>
          <p className="text-[#A1A1A1] py-2 text-sm">
            Trade spot and perpetual futures with deep liquidity and low fees
          </p>

          <div className="text-[#555555] my-4 flex gap-8 text-2xs flex-wrap">
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

        <div className="px-9 py-8 flex gap-6 w-full text-white flex-col md:flex-row">
          <MarketDashboardComponent market="spot" stockAmount={spotStocks?.length ?? 0} stocks={spotStocks} colFirstName={"SYMBOL"} colSecondName={"24H CHANGE"} colThirdName={"VOLUME"}/>
          <MarketDashboardComponent market="perp" stockAmount={perpStocks?.length ?? 0 } stocks={perpStocks} colFirstName={"SYMBOL"} colSecondName={"FUNDING RATE"} colThirdName={"VOLUME"}/>
       </div>

      </div>
    </NavigationLayout>
  )
}


