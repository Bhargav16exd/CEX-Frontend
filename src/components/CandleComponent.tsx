import { CandlestickSeries, ColorType, createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";

export default function CandleComponent(){

  const chartContainerRef = useRef(null);

  useEffect(()=>{
    if(!chartContainerRef.current) return

    const chartOptions = { 
      height:600,
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

   candlestickSeries.setData([]);

   chart.timeScale().fitContent();

   return () => chart.remove()

  },[])

  return(
    <div ref={chartContainerRef} className="w-full "></div>
  )
}