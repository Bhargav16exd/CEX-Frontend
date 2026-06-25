import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import LoaderWhite from "./WhiteLoaderCompoenet";

interface Input {
  market:string
  stockAmount:number
  stocks:any
  colFirstName:string
  colSecondName:string
  colThirdName:string
}


//@ts-ignore
enum Role {
 ADMIN = "admin",
 CLIENT = "client"
}

export default function MarketDashboardComponent({market, stockAmount, stocks, colFirstName, colSecondName, colThirdName}:Input){

  const navigate = useNavigate();
  const role = useSelector((state:any)=>state.auth.role);

  function OnCreateStockButtonClick(){
    navigate("/create-stock")
  }

  return(
    <div className="border-b-color-standard border w-full md:w-1/2 rounded-sm z-10">

          <span className="flex px-4 py-2.5 border-b-color-standard border-b rounded-t-sm bg-[#0A0A0A] z-0">

            <span className="flex w-1/2 gap-4 items-center">
              <h1 className="text-xs font-medium">{market.toLocaleUpperCase()} Market</h1>
              <p className="text-2xs text-green-400 bg-green-950 border border-green-700 py-0.5 px-3 rounded-md font-semibold">{market}</p>    
            </span>
            <span className="flex w-1/2 justify-end items-center gap-4">
              <p className="text-[#555555] gap-8 text-xs">{stockAmount} stocks</p>

              {
                role && role == Role.ADMIN &&
                <button className="font-medium text-white text-xs bg-[#222222] py-1 px-4  border-[#333333] border rounded-sm cursor-pointer" onClick={OnCreateStockButtonClick}>+ Add</button>
              }
              
            </span>

          </span>

          <div className="flex px-4 py-1.5 text-[#555555] text-2xs md:text-xs bg-black border-b-color-standard border-b w-full">
            <p className="w-[25%] md:w-[40%] ">PAIR</p>
            <p className="w-[25%] md:w-[20%] flex md:justify-end ">{colFirstName}</p>
            <p className="w-[25%] md:w-[20%] flex md:justify-end ">{colSecondName}</p>
            <p className="w-[25%] md:w-[20%] flex md:justify-end ">{colThirdName}</p>
          </div>

          {
            stocks === null ?
            <div className="flex justify-center items-center my-4"><LoaderWhite/></div>
            :
              stocks?.length > 0 ? 
              stocks?.map((stock:any)=>{
                return <StockItem title={stock.title} market={market.toLocaleUpperCase()} symbol={stock.symbol}/>
              })
              : <div className="w-full text-center my-8 text-sm text-[#555555]">No Markets Added</div>
          }

          <span className="flex items-center gap-2 p-4">
            <span className="h-1 w-1 animate-ping rounded-full bg-red-600 "></span>
            <p className="text-[#555555] text-2xs">
              Market Rates are eventually updated, for latest price check market page
            </p>
          </span>
        </div>
  )
}

function StockItem({title, market, symbol}:{title:string, market:string, symbol:string}){
  return(
    <Link to={`/${market.toLocaleLowerCase()}/${symbol}`}>
    <div className="flex px-4 py-2.5 text-xs border-b-color-standard border-b w-full hover:bg-[#0A0A0A] cursor-pointer">
      <p className="w-[40%] font-mono font-medium uppercase">
        <p>{title}</p>
        <p className="text-2xs my-0.5 text-[#555555]">/{market}</p>
      </p>
      <p className="w-[25%] md:w-[20%]  font-mono flex items-center md:justify-end uppercase ">{symbol}</p>
      <p className="w-[25%] md:w-[20%]  font-mono flex items-center md:justify-end text-green-400">+2.41%</p>
      <p className="w-[25%] md:w-[20%]  font-mono flex items-center md:justify-end text-[#555555]">$892M</p>
    </div>
    </Link>
  )
}