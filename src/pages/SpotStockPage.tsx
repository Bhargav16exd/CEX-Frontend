import { useNavigate, useParams } from "react-router";
import NavigationLayout from "../components/NavigationComponent";
import { useEffect, useRef, useState } from "react";
import type { InputLabelComponent } from "../components/InputLabelComponent";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import LoaderWhite from "../components/WhiteLoaderCompoenet";
import CandleComponent from "../components/CandleComponent";
import { Orderbook } from "../components/OrderbookComponent";
import { fetchFills, fetchOrders } from "../redux/slices/historySlice";
import { fetchOpenOrders, getBalance, getOrderbook, placeSpotOrder } from "../redux/slices/spotSlice";
import type { ClientWsResponse } from "@cex/shared";

export type Orderbook = {
  updateId:number
  asks:OrderbookLevel[],
  bids:OrderbookLevel[],
}


interface WsDepthData {
  asks:OrderbookLevel[],
  bids:OrderbookLevel[],
  updateId:number
}

// Types
type OrderbookLevel = [number, number]; // [price, quantity]

export function SpotStockPage(){
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

  // ------- HISTORY SECTION ---------
  const [isOpenOrderActive, setIsOpenOrderActive] = useState(true);
  const [isFillsActive, setIsFillsActive] = useState(false);
  const [isOrderHistoryActive, setIsOrderHistoryActive] = useState(false);

  function OnClickOpenOrder(){
    setIsOpenOrderActive(true);
    setIsFillsActive(false);
    setIsOrderHistoryActive(false);
  }
  
  function OnClickFills(){
    setIsOpenOrderActive(false);
    setIsFillsActive(true);
    setIsOrderHistoryActive(false);
  }
  
  function OnClickOrderHistory(){
    setIsOpenOrderActive(false);
    setIsFillsActive(false);
    setIsOrderHistoryActive(true);
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
  const [isBidSectionActive, setIsBidSectionActive] = useState(true);
  const [isAskSectionActive, setIsAskSectionActive] = useState(false);
  const [isOrderResponsePanelActive, setOrderResponsePanelActive] = useState(false);
  const [orderResponse, setOrderResponse] = useState({
    totalQuantity:0,
    filledQuantity:0
  })

  function OnClickBidSection(){
    setIsBidSectionActive(true);
    setIsAskSectionActive(false);
    setInput({
        ...input,
      side:"bid"
    })
  }

  function OnClickAskSection(){
    setIsBidSectionActive(false);
    setIsAskSectionActive(true);
    setInput({
        ...input,
      side:"ask"
    })
  }

  const [balance, setBalance] = useState();

  const [input, setInput] = useState({
    type: "limit",
    side:"bid",
    stockSymbol,
    price:"",
    quantity:""
  })

  async function OnClickPlaceOrder(){
    
    if(isBidSectionActive){
      setInput({
        ...input,
      side:"bid"
      })
    }
    if(isAskSectionActive){
      setInput({
        ...input,
      side:"ask"
    })
    
    }

    if(!input.price || !input.quantity || !input.stockSymbol || !input.side || !input.type){
      popError("Incomplete Inputs");
      return
    }

    try {
      const res = await dispatch(placeSpotOrder(input)).unwrap()
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
      setBalance(response?.data.balance)
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

        setTimeout(async ()=>{
          const update = await GetOrderbook()
          setOrderbook(update);
        },500)
      };

      ws.onmessage = async (event) => {

        const parsedEvent = JSON.parse(event.data) as ClientWsResponse

        if(parsedEvent.type == "PONG"){
          ws.send(JSON.stringify({
            type:"SUBSCRIBE",
            payload:{
              topic:`spot-${stockSymbol}`
            }
          }))
        }

        if(parsedEvent.type == "DEPTH"){

          const update = parsedEvent.payload as WsDepthData

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
          const next = applyUpdate(prev, update);
          updatedIdRef.current = next.updateId;
          return next;
        });
        }
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
          
          <div className="flex flex-col">
            <span className="flex border border-[#252525] text-[#A1A1A1] px-10 gap-8 text-sm tracking-tight">
              <div 
              onClick={OnClickOpenOrder}
              className={`py-2 px-4 cursor-pointer ${isOpenOrderActive && "border-b-2 border-white text-white"}`}>Open Orders</div>
              <div 
              onClick={OnClickFills}
              className={`py-2 px-4 cursor-pointer ${isFillsActive && "border-b-2 border-white text-white"}`}>Fills</div>
              <div 
              onClick={OnClickOrderHistory}
              className={`py-2 px-4 cursor-pointer ${isOrderHistoryActive && "border-b-2 border-white text-white"}`}>Order History</div>
            </span>
            {
              isOpenOrderActive && <OpenOrdersComponent/>
            }
            {
              isFillsActive && <FillHistoryComponent/>
            }
            {
              isOrderHistoryActive && <OrderHistoryComponent/>
            }

          </div>

        </div>

        {/* ------- LONG OR SHORT SECTION -------*/}
        <div className="w-[20%]">
          <span className="flex text-[#555555] text-sm font-semibold text-center border-[#252525] border-b-2 ">
            <div className={`w-1/2 cursor-pointer py-4 ${isBidSectionActive && "border-b-2 border-green-400 text-green-400"}`} onClick={OnClickBidSection}>
              Bid
            </div>
            <div className={`w-1/2 cursor-pointer py-4 ${isAskSectionActive && "border-b-2 border-red-400 text-red-400"}`} onClick={OnClickAskSection}>
              Ask
            </div>
          </span>

        {/* FORM */}
        <div className="px-4">

            <span className="flex text-center justify-center text-sm my-4 border py-2 rounded-md border-[#252525]">
              <div className="w-1/2 flex justify-center items-center">
                <p className="rounded-md text-blue-400 bg-blue-950 border border-blue-700 w-fit px-4 py-1">Limit</p>
              </div>
              <div className="w-1/2 cursor-not-allowed flex justify-center items-center">Market</div>
            </span>

            <div className="flex text-sm my-4 justify-between items-center">
              <p className="text-[#555555]">Available Balance</p>
              <div>{ balance !== undefined ?  <>${balance}</> : <LoaderWhite/>}</div>
            </div>

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
              isBidSectionActive &&
              <button 
              onClick={OnClickPlaceOrder}
              className="rounded-md w-full py-2 px-2 text-green-400 bg-green-950 border border-green-700 my-6 active:scale-95 transition-transform">Bid</button>
            }

            {
              isAskSectionActive &&
              <button 
              onClick={OnClickPlaceOrder}
              className="rounded-md w-full py-2 px-2 text-red-400 bg-red-950 border border-red-700 my-6 active:scale-95 transition-transform">Ask</button>
            }

            {
              isOrderResponsePanelActive &&
              <div className="my-4 text-green-400 bg-[#0D1F14] border border-green-700 rounded-md">
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

function OpenOrdersComponent(){

  const {stockSymbol} = useParams()

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

  useEffect(()=>{
    setOrders(null);
    fetch()
  },[offset])


  return(
    <div className="mb-10 uppercase">
      
      <div className="flex w-full border-[rgb(37,37,37)] border-b text-[#414141] px-14 py-1 text-xs">
        <span className="w-[15%]">MARKET</span>
        <span className="w-[10%]">SIDE</span>
        <span className="w-[10%]">TYPE</span>
        <span className="w-[10%]">PRICE</span>
        <span className="w-[15%]">QTY</span>
        <span className="w-[15%]">FILLED</span>
        <span className="w-[15%]">STATUS</span>
      
      </div>
      <div >
        {
          orders ?
          orders.length > 0
          ?
          orders.map((order:any)=>(
            <div className="flex px-14 py-2 text-xs border-b border-[#252525] text-[#A1A1A1] font-mono uppercase">
              <span className="w-[15%]">SPOT-{order.symbol.toUpperCase()}</span>
              <span className="w-[10%]">{order.side}</span>
              <span className="w-[10%]">{order.type}</span>
              <span className="w-[10%]">{order.price}</span>
              <span className="w-[15%]">{order.quantity} {order.symbol.toUpperCase()}</span>
              <span className="w-[15%]">{order.filledQuantity} {order.symbol.toUpperCase()}</span>
              <span className={`w-[15%]`}>{order.status.toUpperCase()}</span>
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

function FillHistoryComponent(){

  const {stockSymbol} = useParams()

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
        market:"spot",
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
      
      <div className="flex w-full border-[#252525] border-b text-[#414141] px-14 py-1 text-xs">
        <span className="w-[15%]">Market</span>
        <span className="w-[10%]">Side</span>
        <span className="w-[10%]">Price</span>
        <span className="w-[15%]">Quantity</span>
        <span className="w-[10%]">Fee</span>
        <span className="w-[10%]">Role</span>
        <span className="w-[15%]">Time</span>
        
      </div>
      <div>
        {
          fills ?
          fills.length > 0 ?
          fills.map((fill:any)=>(
            <div className="flex px-14 py-2 text-xs border-b border-[#252525] text-[#A1A1A1] font-mono">
              <span className="w-[15%]">SPOT-{fill.symbol.toUpperCase()}</span>
              <span className="w-[10%]">{fill.side}</span>
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

function OrderHistoryComponent(){

  const {stockSymbol} = useParams()

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
        market:"spot",
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
    <div className="mb-10 uppercase">
      
      <div className="flex w-full border-[rgb(37,37,37)] border-b text-[#414141] px-14 py-1 text-xs">
        <span className="w-[15%]">MARKET</span>
        <span className="w-[10%]">SIDE</span>
        <span className="w-[10%]">TYPE</span>
        <span className="w-[10%]">PRICE</span>
        <span className="w-[15%]">QTY</span>
        <span className="w-[15%]">STATUS</span>
        <span className="w-[15%]">TIME</span>
        
      </div>
      <div >
        {
          orders ?
          orders.length > 0 ?
          orders.map((order:any)=>(
            <div className="flex px-14 py-2 text-xs border-b border-[#252525] text-[#A1A1A1] font-mono">
              <span className="w-[15%]">SPOT-{order.symbol.toUpperCase()}</span>
              <span className="w-[10%]">{order.side}</span>
              <span className="w-[10%]">{order.type}</span>
              <span className="w-[10%]">{order.price}</span>
              <span className="w-[15%]">{order.quantity} {order.symbol.toUpperCase()}</span>
              <span className={`w-[15%] 
                ${order.status === "closed" && "text-green-400" }
                ${order.status === "open" && "text-yellow-400"}
                `}
                
                >{order.status}</span>
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


