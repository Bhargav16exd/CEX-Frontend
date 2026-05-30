import { useNavigate, useParams } from "react-router";
import NavigationLayout from "../components/NavigationComponent";
import { useEffect, useRef, useState } from "react";
import type { InputLabelComponent } from "../components/InputLabelComponent";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import { getBalance, getOrderbook, placePerpOrder } from "../redux/slices/perpSlice";
import LoaderWhite from "../components/WhiteLoaderCompoenet";
import { CandlestickSeries, ColorType, createChart, type UTCTimestamp } from "lightweight-charts";
import { candleData } from "./Data";

type Orderbook = {
  updateId:number
  asks:OrderbookLevel[],
  bids:OrderbookLevel[],
}

interface WsResponse {
  type:string,
  data:WsDepthData
}

interface WsDepthData {
  asks:OrderbookLevel[],
  bids:OrderbookLevel[],
  updateId:number
}

// Types
type OrderbookLevel = [number, number]; // [price, quantity]



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
  const [orderbook, setOrderbook] = useState<Orderbook>({
    updateId:0,
    bids:[],
    asks:[]
  })
  const [isSync, setIsSync] = useState(false);

  const isSyncRef = useRef(false);
  const snapshotRef = useRef<Orderbook | null>(null);
  const bufferedUpdateRef = useRef<WsDepthData[]>([]);
  const updatedIdRef = useRef<number>(0);

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
      return response.data
    } catch (error:any) {
      if(error.status == 403){
        localStorage.removeItem("token");
        navigate("/signin")
      }
    }
  }

  function applyUpdate(
    current: Orderbook,
    update: WsDepthData,
  ){
    const mergeLevels = (
      existing: OrderbookLevel[],
      incoming: OrderbookLevel[]
    ) => {

      const existingmap = new Map(existing.map(([p,q])=> [p,q]));
      
      for(const [price, qty] of incoming){
        if (Number(qty) === 0) {
          existingmap.delete(Number(price));
        } else {
          existingmap.set(Number(price), Number(qty));
        }
      }

      return Array.from(existingmap.entries()).map(([p, q]) => [p, q] as OrderbookLevel);
    }

    return {
      updateId:update.updateId,
      bids: mergeLevels(current.bids, update.bids),
      asks: mergeLevels(current.asks, update.asks)
    }
  }

  function syncFromSnapshot(snapshot: Orderbook, buffered:WsDepthData[]){
    const relevant = buffered.filter((u)=> u.updateId > snapshot.updateId);

    let book = snapshot;

    for(const update of relevant){
      book = applyUpdate(book, update);
    }

    updatedIdRef.current = book.updateId;
    snapshotRef.current = book;
    isSyncRef.current = true;
    setIsSync(true);
    setOrderbook(book);
  }

  function handleOrderbookSync(snapshot: Orderbook){
    snapshotRef.current = snapshot;
    syncFromSnapshot(snapshot, bufferedUpdateRef.current);
    bufferedUpdateRef.current = [];
  }

  async function EstablishWsConnection(){
    const ws = new WebSocket("ws://localhost:8082");

      ws.onopen = () => {
        console.log("Connected to websocket server");
        ws.send(
          JSON.stringify({
            type: "PING",
          })
        );
      };

      ws.onmessage = async (event) => {
        const parsedEvent = JSON.parse(event.data) as WsResponse
        const update = parsedEvent.data;

        if(!isSyncRef.current){
          bufferedUpdateRef.current.push(update);

          if(bufferedUpdateRef.current.length === 1){
            const snapshot = await GetOrderbook();
            if(snapshot) handleOrderbookSync(snapshot); 
          }
        }

        // Stale update — already applied
        if (update.updateId <= updatedIdRef.current) return;

        if(update.updateId != updatedIdRef.current + 1){
          console.warn("Gap detected, re-syncing...");
          isSyncRef.current = false;
          setIsSync(false);
          bufferedUpdateRef.current = [update]; 
          const snapshot = await GetOrderbook();
          if (snapshot) handleOrderbookSync(snapshot);
          return;
        }

        setOrderbook((prev) => {
          console.log("prev",prev)
          console.log("update",update)
          const next = applyUpdate(prev, update);
          console.log("next",next)
          updatedIdRef.current = next.updateId;
          return next;
        });

      };

      ws.onclose = () => {
        console.log("Disconnected");
      };

      ws.onerror = (err) => {
        console.log("WS ERROR", err);
      };
  }

  useEffect(()=>{
    EstablishWsConnection();
    GetBalance();
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
              <CandleComponent/>
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

  const sortedAsks = [...Orderbook.asks].sort((a, b) => a[0] - b[0]);
  const sortedBids = [...Orderbook.bids].sort((a, b) => b[0] - a[0]);

  const enrichAsks = enrichLevels(sortedAsks);
  const enrichBids = enrichLevels(sortedBids);

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

function CandleComponent(){

  const chartContainerRef = useRef(null);
  
  useEffect(()=>{
    if(!chartContainerRef.current) return

    const chartOptions = { 
      height:500,
      grid : { 
        vertLines: { color: '#0A0A0A' },
        horzLines: { color: '#555555' }
      },
      rightPriceScale: {
        borderColor: '#0A0A0A',
      },
      timeScale: {
        borderColor: '#0A0A0A',
      },
      layout: { textColor: '#555555', background: { type: ColorType.Solid, color: '#0A0A0A' }, } }
    
    const chart = createChart(chartContainerRef.current, chartOptions)

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#21C55E', downColor: '#E34242', borderVisible: false,
      wickUpColor: '#21C55E', wickDownColor: '#E34242',
    });

   candlestickSeries.setData(candleData);

   chart.timeScale().fitContent();

   return () => chart.remove()

  },[])

  return(
    <div ref={chartContainerRef} className="w-full "></div>
  )
}