import { CandlestickSeries, ColorType, createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";

export default function CandleComponent(){

  const chartContainerRef = useRef(null);

  useEffect(()=>{
    if(!chartContainerRef.current) return

    const chartOptions = { 
      height:534,
      grid : { 
        vertLines: { color: '#0A0A0A' },
        horzLines: { color: '#1E1E1E' }
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

   candlestickSeries.setData(mockData);

   chart.timeScale().fitContent();

   return () => chart.remove()

  },[])

  return(
    <div ref={chartContainerRef} className="w-full"></div>
  )
}

const mockData = [
      { time: '2024-01-01', open: 100, high: 105, low: 98, close: 103 },
      { time: '2024-01-02', open: 103, high: 108, low: 102, close: 107 },
      { time: '2024-01-03', open: 107, high: 109, low: 104, close: 105 },
      { time: '2024-01-04', open: 105, high: 106, low: 101, close: 102 },
      { time: '2024-01-05', open: 102, high: 110, low: 101, close: 108 },
      { time: '2024-01-06', open: 108, high: 112, low: 106, close: 110 },
      { time: '2024-01-07', open: 110, high: 111, low: 107, close: 109 },
      { time: '2024-01-08', open: 109, high: 108, low: 103, close: 104 },
      { time: '2024-01-09', open: 104, high: 107, low: 102, close: 106 },
      { time: '2024-01-10', open: 106, high: 115, low: 105, close: 113 },
      { time: '2024-01-11', open: 113, high: 117, low: 112, close: 116 },
      { time: '2024-01-12', open: 116, high: 120, low: 114, close: 118 },
      { time: '2024-01-13', open: 118, high: 119, low: 113, close: 115 },
      { time: '2024-01-14', open: 115, high: 114, low: 108, close: 110 },
      { time: '2024-01-15', open: 110, high: 112, low: 108, close: 111 },
      { time: '2024-01-16', open: 111, high: 121, low: 110, close: 120 },
      { time: '2024-01-17', open: 120, high: 123, low: 118, close: 122 },
      { time: '2024-01-18', open: 122, high: 124, low: 119, close: 121 },
      { time: '2024-01-19', open: 121, high: 120, low: 115, close: 117 },
      { time: '2024-01-20', open: 117, high: 119, low: 114, close: 118 },
    ];