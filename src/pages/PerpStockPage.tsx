import { useNavigate, useParams } from "react-router";
import NavigationLayout from "../components/NavigationComponent";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import { fetchOpenContract, fetchOpenOrders, getBalance, getOrderbook, placePerpOrder } from "../redux/slices/perpSlice";
import LoaderWhite from "../components/WhiteLoaderCompoenet";
import CandleComponent from "../components/CandleComponent";
import { Orderbook } from "../components/OrderbookComponent";
import { fetchFills, fetchOrders } from "../redux/slices/historySlice";
import { MarketType, type ClientWsResponse } from "@bhargav16exdd/cex"
import { WS_BASE_URL } from "../constants";
import { useErrorLoaderState } from "../hooks/useErrorLoaderState";
import { OrderTypeToggleSectionComponenet, SideToggleSectionStockPageComponent, TopBarSectionStockPageComponent } from "../components/StockPageComponents";
import ErrorMessageComponent from "../components/ErrorMsgComponent";
import ButtonGreenComponent from "../components/ButtonGreenComponent";
import ButtonRedComponent from "../components/ButtonRedComponent";
import PlacedOrderResponseComponent from "../components/PlacedOrderResponseComponent";
import OpenOrdersComponentStockPage from "../components/OpenOrdersComponentStockPage";
import OrderHistoryComponentStockPage from "../components/OrderHistoryComponentStockPage";
import FillComponentStockPage from "../components/FillComponentStockPage";
import OpenContractComponent from "../components/OpenContractComponent";

export type Orderbook = {
  updateId:number
  asks:OrderbookLevel[],
  bids:OrderbookLevel[],
}

interface WsDepthData {
  topic:string,
  asks:OrderbookLevel[],
  bids:OrderbookLevel[],
  updateId:number
}

//@ts-ignore
enum OrderType {
  long = "long",
  short = "short"
}

// Types
type OrderbookLevel = [number, number]; // [price, quantity]

export function PerpStockPage(){

  // ------- UTILITY SECTION -------

  const { stockSymbol } = useParams();
  const { popError, isErrorActive, errorMessage} = useErrorLoaderState();

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate();

  // ------- HISTORY SECTION ---------
  const [isOpenOrderActive, setIsOpenOrderActive] = useState(true);
  const [isContractActive, setisContractActive] = useState(false);
  const [isFillsActive, setIsFillsActive] = useState(false);
  const [isOrderHistoryActive, setIsOrderHistoryActive] = useState(false);

  function OnClickOpenOrder(){
    setIsOpenOrderActive(true);
    setisContractActive(false);
    setIsFillsActive(false);
    setIsOrderHistoryActive(false);
  }
  
  function OnClickPosition(){
    setIsOpenOrderActive(false);
    setisContractActive(true);
    setIsFillsActive(false);
    setIsOrderHistoryActive(false);
  }
  
  function OnClickFills(){
    setIsOpenOrderActive(false);
    setisContractActive(false);
    setIsFillsActive(true);
    setIsOrderHistoryActive(false);
  }
  
  function OnClickOrderHistory(){
    setIsOpenOrderActive(false);
    setisContractActive(false);
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
      side:OrderType.long
    })
  }

  function OnClickShortSection(){
    setIsLongSectionActive(false);
    setIsShortSectionActive(true);
    setInput({
        ...input,
      side:OrderType.short
    })
  }

  const [balance, setBalance] = useState();

  const [input, setInput] = useState({
    type:"limit",
    side:"long",
    stockSymbol,
    price:"",
    quantity:""
  })

  async function OnClickPlaceOrder(){
    
    if(isLongSectionActive){
      setInput({
        ...input,
      side:OrderType.long
    })
    }
    if(isShortSectionActive){
      setInput({
          ...input,
        side:OrderType.short
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
              topic:`perp-${stockSymbol}`
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
      <div className="min-h-screen w-screen bg-black-standard flex flex-col md:flex-row text-white">
        
        {/* ------- CANDLES & ORDERBOOK SECTION -------*/}
        <div className="md:w-[80%] flex flex-col my-4 mx-4 md:mr-2 md:ml-4">

          <TopBarSectionStockPageComponent
            symbol={stockSymbol!}
            market={"perp"} 
            lastTradedPrice={64034}
            highPrice={64034}
            lowPrice={64034}
            volume={64034}
          />

          <div className="flex flex-col md:flex-row gap-4">
             <div className="w-full md:w-[75%] h-fit px-4 py-2 bg-[#0A0A0A] rounded-sm">
              <CandleComponent/>
            </div>
            <Orderbook Orderbook={orderbook}/>
          </div>
          
          <div className="hidden md:flex flex-col bg-[#0A0A0A] mt-4 rounded-sm overflow-hidden">
            <span className="flex text-[#A1A1A1] p-2 gap-8 text-xs tracking-tight ">
              <div 
              onClick={OnClickOpenOrder}
              className={`py-2 px-4 cursor-pointer ${isOpenOrderActive && "bg-[#1A1A1A] rounded-sm"}`}>Open Orders</div>
              <div 
              onClick={OnClickPosition}
              className={`py-2 px-4 cursor-pointer ${isContractActive && "bg-[#1A1A1A] rounded-sm"}`}>Contract</div>
              <div 
              onClick={OnClickFills}
              className={`py-2 px-4 cursor-pointer ${isFillsActive && "bg-[#1A1A1A] rounded-sm"}`}>Fills</div>
              <div 
              onClick={OnClickOrderHistory}
              className={`py-2 px-4 cursor-pointer ${isOrderHistoryActive && "bg-[#1A1A1A] rounded-sm"}`}>Order History</div>
            </span>
            {
              isOpenOrderActive && <OpenOrdersComponentStockPage stockSymbol={stockSymbol!} fetchOpenOrders={fetchOpenOrders} market={MarketType.perp} cancelOrder={()=>{}}/>
            }
            {
              isContractActive && <OpenContractComponent stockSymbol={stockSymbol!} fetchOpenContract={fetchOpenContract}/>
            }
            {
              isFillsActive && <FillComponentStockPage stockSymbol={stockSymbol!} market={MarketType.perp} fetchFills={fetchFills}/>
            }
            {
              isOrderHistoryActive && <OrderHistoryComponentStockPage stockSymbol={stockSymbol!} fetchOrders={fetchOrders} market={MarketType.perp}/>
            }

          </div>

        </div>

        {/* ------- LONG OR SHORT SECTION -------*/}
        <div className="h-fit md:w-[20%] rounded-sm bg-[#0A0A0A] my-4 mx-4 md:ml-2 md:mr-4 mb-24">

         <SideToggleSectionStockPageComponent
            leftSide="Buy / Long"
            rightSide="Sell / Short"
            isLeftSectionActive={isLongSectionActive}
            isRightSectionActive={isShortSectionActive}
            onClickLeftSection={OnClickLongSection}
            onClickRightSection={OnClickShortSection}
          />

        {/* FORM */}
        <div className="px-4 text-xs tracking-tighter">

            <OrderTypeToggleSectionComponenet/>

            <div className="flex mt-5 my-2 justify-between items-center">
              <p className="text-[#555555] underline underline-offset-1 decoration-dotted">Balance.</p>
              <p className="font-mono">{ balance !== undefined ?  <>{balance} USD </> : <LoaderWhite/>}</p>
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

            <div className="flex mt-4 justify-between items-center">
              <p className="text-[#555555] underline underline-offset-1 decoration-dotted">Order Val.</p>
              <p className="font-mono ">{Number(input?.price) * Number(input?.quantity)} USD</p>
            </div>

            <div className="flex my-2 justify-between items-center">
              <p className="text-[#555555] underline underline-offset-1 decoration-dotted">Plat. Fee</p>
              <p className="font-mono ">0 USD</p>
            </div>

            <div className="flex my-2 justify-between items-center">
              <p className="text-[#555555] underline underline-offset-1 decoration-dotted">Liquidation. Price</p>
              <p className="font-mono ">0 USD</p>
            </div>

            <ErrorMessageComponent
              errorActive={isErrorActive} errorMessage={errorMessage}
            />
            
            {
              isLongSectionActive &&
              <ButtonGreenComponent 
                OnClickHandler={OnClickPlaceOrder}
                btnName="Buy / Long"
              />
            }

            {
              isShortSectionActive &&
              <ButtonRedComponent
                OnClickHandler={OnClickPlaceOrder}
                btnName="Sell / Short"
              />
            }

            {
              isOrderResponsePanelActive &&
              <PlacedOrderResponseComponent
                totalQty={orderResponse.totalQuantity}
                fillQty={orderResponse.filledQuantity}
              />
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


