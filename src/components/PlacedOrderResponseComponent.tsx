export default function PlacedOrderResponseComponent({totalQty, fillQty}:{totalQty:number, fillQty:number}){
  return(
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
        <div className="w-1/2 font-bold">{totalQty}</div>
        <div className="w-1/2 font-bold">{fillQty}</div>
      </span>
    </div>
  )
}