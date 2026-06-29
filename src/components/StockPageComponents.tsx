import SOLLOGO from "../assets/sol.webp"

interface TopBarSectionComponentInput {
  symbol:string
  market:string
  lastTradedPrice:number
  highPrice:number
  lowPrice:number
  volume:number
}

//@ts-ignore
enum MarketType {
  spot="spot",
  perp="perp"
}

function fetchLogo(symbol:string):any{
  const store:any = {
    "SOL":SOLLOGO,
  }
  return store[symbol]!;
}

function TopBarSectionStockPageComponent({symbol, market, lastTradedPrice, highPrice, lowPrice, volume}:TopBarSectionComponentInput){
  return(

    <div className="flex flex-col md:flex-row bg-[#0A0A0A] text-sm w-full py-4 rounded-sm px-6 font-mono tracking-tighter gap-8 mb-4 ">

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex md:justify-center items-center">
          <p className="flex justify-center items-center gap-2 font-semibold font-sans ">
            <img src={fetchLogo(symbol?.toUpperCase())} alt="logo" className="h-8"/>
            {symbol.toLocaleUpperCase()}-
            { market === MarketType.spot && "SPOT"}
            { market === MarketType.perp && "PERP"}
          </p>
        </div>
        <span className="flex gap-8">
          <div className="flex flex-col justify-center items-start tracking-tight font-sans">
            <p className="text-[#444444] text-2xs ">Last Trd. Price</p>
            <div className="text-[18px] font-medium text-green-400 ">{lastTradedPrice}</div>
          </div>
          <div className="flex flex-col justify-center items-start tracking-tight font-sans">
            <p className="text-[#444444] text-2xs ">Mark Price</p>
            <div className="text-[18px] font-medium ">{lastTradedPrice}</div>
          </div>
        </span>
      </div>
      
      <div className="flex md:justify-center items-center font-mono gap-8">


        <div className="flex flex-col gap-1">
          <p className="text-[#444444] text-2xs underline underline-offset-1 decoration-dotted">Index Price</p>
          <p className="text-xs">${highPrice}</p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-[#444444] text-2xs underline underline-offset-1 decoration-dotted">24H High</p>
          <p className="text-xs">${highPrice}</p>
        </div>
          <div className="flex flex-col gap-1">
          <p className="text-[#444444] text-2xs underline underline-offset-1 decoration-dotted">24H Low</p>
          <p className="text-xs">${lowPrice}</p>
        </div>
          <div className="flex flex-col gap-1">
          <p className="text-[#444444] text-2xs underline underline-offset-1 decoration-dotted">24H Vol.</p>
          <p className="text-xs">${volume}</p>
        </div>
        
      </div>
    </div>
  )
}


interface SideToggleSectionInput {
  leftSide:string
  rightSide:string
  isLeftSectionActive:boolean
  isRightSectionActive:boolean
  onClickLeftSection:any
  onClickRightSection:any
}

function SideToggleSectionStockPageComponent({leftSide, rightSide, isLeftSectionActive, isRightSectionActive, onClickLeftSection, onClickRightSection}:SideToggleSectionInput){
  return(
    <span 
    className="flex text-[#555555] text-sm font-semibold text-center border-b-color-standard border-b">
      <div className={`w-1/2 cursor-pointer py-3 ${isLeftSectionActive && "border-b border-green-400 text-green-400"}`} onClick={onClickLeftSection}>
        {leftSide}
      </div>
      <div className={`w-1/2 cursor-pointer py-3 ${isRightSectionActive && "border-b border-red-400 text-red-400"}`} onClick={onClickRightSection}>
        {rightSide}
      </div>
    </span>
  )
}


function OrderTypeToggleSectionComponenet(){
  return(
    <div 
    className="bg-[#0A0A0A] rounded-sm flex p-1 mb-2 mt-6 border border-b-color-standard">
      <div className={`w-1/2 text-center text-xs py-2 bg-[#1A1A1A] rounded-sm text-white cursor-pointer`}>
          Limit
      </div>
      <div className={`w-1/2 text-center text-xs py-2 text-[#8A8A8A] cursor-not-allowed`}>
          Market
      </div>
    </div>
  )
}

type OrderStatus = 'open' | 'closed' | 'partialfill' | 'cancelled';

interface StatusConfig {
  bgClass: string;
  textClass: string;
  dotColor: string;
  label: string;
}

const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  open: {
    bgClass: 'bg-emerald-950',
    textClass: 'text-emerald-400',
    dotColor: '#5dcaa5',
    label: 'Open'
  },
  closed: {
    bgClass: 'bg-gray-900',
    textClass: 'text-gray-500',
    dotColor: '#666',
    label: 'Closed'
  },
  partialfill: {
    bgClass: 'bg-yellow-950',
    textClass: 'text-yellow-500',
    dotColor: '#ef9f27',
    label: 'Partial Fill'
  },
  cancelled: {
    bgClass: 'bg-purple-950',
    textClass: 'text-purple-400',
    dotColor: '#afa9ec',
    label: 'Cancelled'
  }
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  console.log(status)
  const config = STATUS_CONFIG[status];
  return (
    <span className={`text-2xs inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-mono font-bold  ${config.bgClass} ${config.textClass}`}>
      <span 
        className="w-1.5 h-1.5 rounded-full" 
        style={{ backgroundColor: config.dotColor }}
      />
      {config.label}
    </span>
  );
}

export {
  TopBarSectionStockPageComponent,
  SideToggleSectionStockPageComponent,
  OrderTypeToggleSectionComponenet
}