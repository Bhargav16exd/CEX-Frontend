import type { Orderbook } from "../pages/PerpStockPage";

export function Orderbook({Orderbook}:{Orderbook:Orderbook}){

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
    <div className="w-[25%] rounded-sm overflow-hidden">

        <div className="w-full px-4 py-4 flex justify-between items-center bg-[#0A0A0A]">
          <p className="text-xs font-semibold">Orderbook</p>
          <p className="text-2xs text-[#383838]">Depth</p>
        </div>

        <div className="flex px-4 py-1 text-2xs text-[#383838] ">
          <p className="w-[40%]">PRICE</p>
          <p className="w-[30%] flex justify-end">SIZE</p>
          <p className="w-[30%] flex justify-end">TOTAL</p>
        </div>

        <div className="h-120 overflow-y-auto no-scrollbar ">

          {/* Render Asks */}
          <div className="flex flex-col-reverse h-auto bg-[#0A0A0A]">
            {
              enrichAsks.map(({price, quantity, total})=>(
                <div key={price} className="relative flex px-4 py-1 text-xs text-white my-0.5">
                  <div 
                  style={{width:`${((total/maxTotal)*100)}%`}}
                  className="absolute inset-y-0 right-0 bg-red-400/10"></div>
                  <div 
                  style={{width:`${((quantity/maxTotal)*100)}%`}}
                  className="absolute inset-y-0 right-0 bg-red-500/70"></div>
                  <p className="w-[40%] text-red-400 z-10">{price}</p>
                  <p className="w-[30%] flex justify-end z-10">{quantity}</p>
                  <p className="w-[30%] flex justify-end z-10">{total}</p>
                </div>
              ))
            }
          </div>
          
          <div className="px-4 py-1 text-2xs text-[#383838]  shrink-0">
            <p>Spread : $ {enrichAsks[0]?.price - enrichBids[0]?.price}</p>
          </div>

          {/* Render Bids */}
          <div className="flex flex-col h-auto bg-[#0A0A0A]">
            {
              enrichBids.map(({price, quantity, total})=>(
                <div  key={price} className="relative flex px-4 py-1 text-xs text-white my-0.5">
                  <div 
                  style={{width:`${((total/maxTotal)*100)}%`}}
                  className="absolute inset-y-0 right-0 bg-green-400/10"></div>
                  <div 
                  style={{width:`${((quantity/maxTotal)*100)}%`}}
                  className="absolute inset-y-0 right-0 bg-green-500/70"></div>
                  <p className="w-[40%] text-green-400 z-10">{price}</p>
                  <p className="w-[30%] flex justify-end z-10">{quantity}</p>
                  <p className="w-[30%] flex justify-end z-10">{total}</p>
                </div>
              ))
            }
          </div>
        </div>

    </div>
  )
}