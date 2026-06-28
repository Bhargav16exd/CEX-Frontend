import { useNavigate, useParams } from "react-router";
import NavigationLayout from "../components/NavigationComponent";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import LoaderWhite from "../components/WhiteLoaderCompoenet";
import CandleComponent from "../components/CandleComponent";
import { Orderbook } from "../components/OrderbookComponent";
import { fetchFills, fetchOrders } from "../redux/slices/historySlice";
import { cancelSpotOrder, fetchOpenOrders, getBalance, getOrderbook, placeSpotOrder } from "../redux/slices/spotSlice";
import type { ClientWsResponse } from "@bhargav16exdd/cex";
import { WS_BASE_URL } from "../constants";
import { useErrorLoaderState } from "../hooks/useErrorLoaderState";
import ErrorMessageComponent from "../components/ErrorMsgComponent";
import { OrderTypeToggleSectionComponenet, SideToggleSectionStockPageComponent, StatusBadge, TopBarSectionStockPageComponent } from "../components/StockPageComponents";

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

//@ts-ignore
enum OrderSide {
  ask="ask",
  bid="bid"
}

// Types
type OrderbookLevel = [number, number]; // [price, quantity]

export function SpotStockPage(){

  // ------- UTILITY SECTION -------
  const { stockSymbol } = useParams();
  const { popError, isErrorActive, errorMessage} = useErrorLoaderState();

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate();


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
  const [stockBalance, setStockBalance] = useState();
  const [lockedStockBalance, setLockedStockBalance] = useState();

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
      const res = await dispatch(getBalance(stockSymbol!)).unwrap()!
      setBalance(res?.balance.data.balance)
      setStockBalance(res?.stockBalance.data.total);
      console.log(res?.stockBalance.data)
      setLockedStockBalance(res?.stockBalance.data.locked);
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
    setOrderbook(book);
  }

  function handleOrderbookSync(snapshot: Orderbook){
    snapshotRef.current = snapshot;
    syncFromSnapshot(snapshot, bufferedUpdateRef.current);
    bufferedUpdateRef.current = [];
  }

  async function EstablishWsConnection(){
    const ws = new WebSocket(WS_BASE_URL);

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
      <div className="min-h-screen min-w-screen bg-black-standard flex text-white">
        
        {/* ------- CANDLES & ORDERBOOK SECTION -------*/}
        <div className="w-[80%] rounded-sm flex flex-col my-4 mr-2 ml-4 ">

          <TopBarSectionStockPageComponent
            symbol={stockSymbol!}
            market={"spot"} 
            lastTradedPrice={64034.01}
            highPrice={64034}
            lowPrice={64034}
            volume={64034}
          />

          <div className="flex w-full gap-4">
             <div className="w-[80%] h-fit px-4 py-2 bg-[#0A0A0A] rounded-sm ">
              <CandleComponent/>
            </div>
            <Orderbook Orderbook={orderbook}/>
          </div>
          
          <div className="flex flex-col bg-[#0A0A0A] mt-4 rounded-sm overflow-hidden">

            <span className="flex text-[#A1A1A1] p-2 gap-8 text-xs tracking-tight ">
              <div 
              onClick={OnClickOpenOrder}
              className={`py-2 px-4 cursor-pointer ${isOpenOrderActive && "bg-[#1A1A1A] rounded-sm"}`}>Open Orders</div>
              <div 
              onClick={OnClickFills}
              className={`py-2 px-4 cursor-pointer ${isFillsActive && "bg-[#1A1A1A] rounded-sm"}`}>Fills</div>
              <div 
              onClick={OnClickOrderHistory}
              className={`py-2 px-4 cursor-pointer ${isOrderHistoryActive && "bg-[#1A1A1A] rounded-sm"}`}>Order History</div>
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
        <div className="h-fit w-[20%] rounded-sm bg-[#0A0A0A] my-4 mx-2">

          <SideToggleSectionStockPageComponent
            leftSide="Bid"
            rightSide="Ask"
            isLeftSectionActive={isBidSectionActive}
            isRightSectionActive={isAskSectionActive}
            onClickLeftSection={OnClickBidSection}
            onClickRightSection={OnClickAskSection}
          />

        {/* FORM */}
        <div className="px-4 text-xs tracking-tighter">

            <OrderTypeToggleSectionComponenet/>

            <div className="flex mt-5 my-2 justify-between items-center">
              <p className="text-[#555555] underline underline-offset-1 decoration-dotted">Balance.</p>
              <p className="font-mono">{ balance !== undefined ?  <>{balance} USD </> : <LoaderWhite/>}</p>
            </div>
            <div className="flex my-2 justify-between items-center">
              <p className="text-[#555555] underline underline-offset-1 decoration-dotted">Avail. Stocks</p>
              <p className="font-mono ">{ stockBalance !== undefined && lockedStockBalance !== undefined ?  <> {stockBalance - lockedStockBalance} {stockSymbol?.toUpperCase()} </> : <LoaderWhite/>}</p>
            </div>
            <InputLabelComponent
              labelName="PRICE"
              value={input.price}
              handleChange={handleChange}
              name="price"
              inputType="text"
              placeholder="0"
              unit="$USD"
            />

            <InputLabelComponent
              labelName="QUANTITY"
              value={input.quantity}
              handleChange={handleChange}
              name="quantity"
              inputType="text"
              placeholder="0"
              unit={stockSymbol?.toLocaleUpperCase()}
            />

            <div className="flex mt-4 justify-between items-center">
              <p className="text-[#555555] underline underline-offset-1 decoration-dotted">Order Val.</p>
              <p className="font-mono ">{Number(input?.price) * Number(input?.quantity)} USD</p>
            </div>

            <div className="flex my-2 justify-between items-center">
              <p className="text-[#555555] underline underline-offset-1 decoration-dotted">Plat. Fee</p>
              <p className="font-mono ">0 USD</p>
            </div>

            <ErrorMessageComponent errorActive={isErrorActive} errorMessage={errorMessage}/>
            
            {
              isBidSectionActive &&
              <button 
              onClick={OnClickPlaceOrder}
              className="rounded-sm w-full py-2 px-2 text-white font-bold bg-green-700 my-6 active:scale-95 transition-transform cursor-pointer">Bid</button>
            }

            {
              isAskSectionActive &&
              <button 
              onClick={OnClickPlaceOrder}
              className="rounded-sm w-full py-2 px-2 text-white font-bold bg-red-800  my-6 active:scale-95 transition-transform cursor-pointer">Ask</button>
            }

            {
              isOrderResponsePanelActive &&
              <div className="my-4 text-green-400 bg-[#0D1F14] border border-green-700 rounded-sm">
                <div className="py-3 px-6 font-medium flex items-center gap-4 border-b border-green-700 text-xs">
                  <div className="h-1.5 w-1.5 animate-ping rounded-full bg-green-400 z-10 "></div>
                  <p>ORDER FILLED</p>
                </div>
                <div className="flex py-2 px-6 justify-between text-2xs text-[#3D6B4F]">
                  <div className="w-1/2">TOTAL QTY</div>
                  <div className="w-1/2">FILLED QTY</div>
                </div>
                <span className="flex px-6 text-xs mb-4 text-white">
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

export default function InputLabelComponent({labelName, value, handleChange, name, inputType, placeholder, unit}:any){
  return(
    <div className="w-full flex justify-center items-start flex-col my-1">
      <label className="my-2 text-2xs font-semibold text-[#555555]">
          {labelName}
      </label>
      <div className="flex justify-between items-center
      my-1  border border-b-color-standard rounded-sm w-full py-3 px-2 text-xs bg-[#111111] placeholder:text-[#555555] text-white">
        <input 
        className="outline-none"
        type={inputType} autoComplete={`new-${labelName}`} placeholder={placeholder} onChange={handleChange} name={name} value={value} />
        <p className="text-[#555555]">{unit}</p>
      </div>
      
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

  async function OnClickCancelOrder(orderId:string){
    try {
      setOrders(null);
      const response = await dispatch(cancelSpotOrder({symbol:stockSymbol, orderId})).unwrap()
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
              <span className="w-[15%] font-bold text-white">SPOT-{order.symbol.toUpperCase()}</span>
              <span className={`w-[10%] ${ order.side === OrderSide.ask ? "text-red-400" : "text-green-400"}`}>{order.side}</span>
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
              <span className="w-[15%] font-bold text-white">SPOT-{fill.symbol.toUpperCase()}</span>
              <span className={`w-[10%] ${ fill.side === OrderSide.ask ? "text-red-400" : "text-green-400"}`}>{fill.side}</span>
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
              <span className="w-[15%] text-white font-bold">SPOT-{order.symbol.toUpperCase()}</span>
              <span className={`w-[10%] ${ order.side === OrderSide.ask ? "text-red-400" : "text-green-400"}`}>{order.side}</span>
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


