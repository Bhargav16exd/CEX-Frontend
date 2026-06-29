import { SidePerpEnum, SideSpotEnum } from "@bhargav16exdd/cex";
import { StatusBadge } from "./StockPageComponents";

export default function OrderCard ({order, market, fetchLogo}:{order:any, market:string, fetchLogo:any}) {
  const isSell =
    order.side === SideSpotEnum.ask || order.side === SidePerpEnum.short;
  const sideColor = isSell ? 'text-red-400' : 'text-green-400';

  const formattedDate = new Date(order.createdAt).toLocaleString('en-us', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <div className="w-full  border-b-color-standard border rounded-sm p-4 md:hidden">
      {/* Header with logo and market */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-b-color-standard uppercase">
        <img
          src={fetchLogo(order.symbol.toUpperCase())}
          alt={order.symbol}
          className="h-8 w-8 rounded"
        />
        <div>
          <p className="font-bold text-white text-sm ">
            {market}-{order.symbol.toUpperCase()}
          </p>
          <p className="text-2xs mt-1 text-[#666]">{formattedDate}</p>
        </div>
      </div>

      {/* Rows with left label, right value */}
      <div className="space-y-3 text-xs uppercase">
        {/* Side */}
        <div className="flex justify-between items-center">
          <span className="text-[#666] uppercase tracking-wide">Side</span>
          <span className={`${sideColor} uppercase font-mono`}>
            {order.side}
          </span>
        </div>

        {/* Type */}
        <div className="flex justify-between items-center">
          <span className="text-[#666] uppercase tracking-wide">Type</span>
          <span className="text-white  font-mono">{order.type}</span>
        </div>

        {/* Price */}
        <div className="flex justify-between items-center">
          <span className="text-[#666] uppercase tracking-wide">Price</span>
          <span className="text-white font-mono">{order.price} USD</span>
        </div>

        {/* Quantity */}
        <div className="flex justify-between items-center">
          <span className="text-[#666] uppercase tracking-wide">
            Quantity
          </span>
          <span className="text-white font-mono">
            {order.quantity} {order.symbol.toUpperCase()}
          </span>
        </div>

         {/* Side */}
        <div className="flex justify-between items-center">
          <span className="text-[#666] uppercase tracking-wide">Status</span>
          <StatusBadge status={order.status}/>
        </div>
      </div>
    </div>
  );
};