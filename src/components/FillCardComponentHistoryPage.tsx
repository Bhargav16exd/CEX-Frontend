import { SidePerpEnum, SideSpotEnum } from "@bhargav16exdd/cex";

export default function FillCard ({fill, market, fetchLogo}:{fill:any, market:string, fetchLogo:any}) {
  const isSell =
    fill.side === SideSpotEnum.ask || fill.side === SidePerpEnum.short;
  const sideColor = isSell ? 'text-red-400' : 'text-green-400';

  const formattedDate = new Date(fill.createdAt).toLocaleString('en-us', {
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
          src={fetchLogo(fill.symbol.toUpperCase())}
          alt={fill.symbol}
          className="h-8 w-8 rounded"
        />
        <div>
          <p className="font-bold text-white text-sm ">
            {market}-{fill.symbol.toUpperCase()}
          </p>
          <p className="text-2xs mt-1 text-[#666]">{formattedDate}</p>
        </div>
      </div>

      {/* Rows with left label, right value */}
      <div className="space-y-3 text-xs ">
        {/* Side */}
        <div className="flex justify-between items-center">
          <span className="text-[#666] uppercase tracking-wide">Side</span>
          <span className={`${sideColor} uppercase font-mono`}>
            {fill.side}
          </span>
        </div>

        {/* Price */}
        <div className="flex justify-between items-center">
          <span className="text-[#666] uppercase tracking-wide">Price</span>
          <span className="text-white font-mono">{fill.price} USD</span>
        </div>

        {/* Quantity */}
        <div className="flex justify-between items-center">
          <span className="text-[#666] uppercase tracking-wide">
            Quantity
          </span>
          <span className="text-white font-mono">
            {fill.quantity} {fill.symbol.toUpperCase()}
          </span>
        </div>

        {/* Fee */}
        <div className="flex justify-between items-center">
          <span className="text-[#666] uppercase tracking-wide">Fee</span>
          <span className="text-white  font-mono">{fill.fee ?? 0} USD</span>
        </div>

        {/* Role */}
        <div className="flex justify-between items-center uppercase">
          <span className="text-[#666] uppercase tracking-wide">Role</span>
          <span className="text-[#A1A1A1] font-mono">{fill.role}</span>
        </div>
      </div>
    </div>
  );
};