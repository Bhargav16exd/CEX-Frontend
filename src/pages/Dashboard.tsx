import NavigationLayout from "../components/NavigationComponent";

export function DashboardPage(){
  return(
    <NavigationLayout>
      <div className="min-h-screen min-w-screen bg-[#0A0A0A] tracking-tight">

        <div className="px-9 border-[#252525] border-b-2">

          <h1 className="text-white text-3xl font-semibold pt-10">
            Markets
          </h1>
          <p className="text-[#A1A1A1] py-1">
            Trade spot and perpetual futures with deep liquidity and low fees
          </p>

          <div className="text-[#555555] my-4 flex gap-8 text-xs">
            <div>
              <p>24H VOLUME</p>
              <h1 className="text-white font-mono text-lg font-medium py-1">
                $2.41B
              </h1>
            </div>
            <div>
              <p>TOTAL MARKETS</p>
              <h1 className="text-white font-mono text-lg font-medium py-1">
                2
              </h1>
            </div>
            <div>
              <p>ACTIVE TRADERS</p>
              <h1 className="text-white font-mono text-lg font-medium py-1">
                14,821
              </h1>
            </div>
            <div>
              <p>MY PNL</p>
              <h1 className="text-green-400 font-mono text-lg font-medium py-1">
                +$1,248.32
              </h1>
            </div>
          </div>

        </div>

      </div>
    </NavigationLayout>
  )
}