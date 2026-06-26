import { useState, useEffect } from "react";
import { Link } from "react-router";
import { environment, EnvironmentEnum } from "../constants";

/* ─── Data ─────────────────────────────────────────── */
const TICKER_DATA = [
  { sym: "BTC-PERP", price: "$67,388", chg: "+2.41%", up: true },
  { sym: "ETH-PERP", price: "$3,538",  chg: "+1.87%", up: true },
  { sym: "SOL-PERP", price: "$182.10", chg: "−0.93%", up: false },
  { sym: "BNB/USDT", price: "$624.88", chg: "+0.62%", up: true },
  { sym: "DOGE-PERP",price: "$0.1844", chg: "−1.20%", up: false },
  { sym: "SUI-PERP", price: "$2.882",  chg: "+3.14%", up: true },
  { sym: "AVAX/USDT",price: "$38.22",  chg: "+3.14%", up: true },
  { sym: "ARB/USDT", price: "$1.024",  chg: "−1.20%", up: false },
];

const MARKETS = [
  { pair: "BTC-PERP", type: "PERPETUAL", price: "$67,388", chg: "+2.41%", up: true,  vol: "$412M" },
  { pair: "ETH-PERP", type: "PERPETUAL", price: "$3,538",  chg: "+1.87%", up: true,  vol: "$188M" },
  { pair: "SOL-PERP", type: "PERPETUAL", price: "$182.10", chg: "−0.93%", up: false, vol: "$96M"  },
  { pair: "BTC/USDT", type: "SPOT",      price: "$67,412", chg: "+2.41%", up: true,  vol: "$892M" },
  { pair: "ETH/USDT", type: "SPOT",      price: "$3,541",  chg: "+1.87%", up: true,  vol: "$421M" },
  { pair: "SOL/USDT", type: "SPOT",      price: "$182.44", chg: "−0.93%", up: false, vol: "$214M" },
];

const FEATURES = [
  {
    title: "Advanced Charts",
    desc: "Candlesticks with 50+ indicators and drawing tools, updated tick by tick.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 11L5.5 7l2.5 3L11 5l3 4" stroke="#4ade80" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Live Order Book",
    desc: "Full depth up to 400 levels with aggregated and raw feed modes.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="4" height="10" rx="1" stroke="#888" strokeWidth="1.3"/>
        <rect x="8" y="6" width="4" height="7" rx="1" stroke="#888" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    title: "Perpetual Futures",
    desc: "Up to 50× leverage on 33 perpetual markets with hourly funding.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="5.5" stroke="#888" strokeWidth="1.3"/>
        <path d="M8 5.5V8l1.5 1.5" stroke="#888" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Cross-Chain Deposits",
    desc: "Deposit from 10 chains including Ethereum, Solana, and Arbitrum.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h10M8 3l5 5-5 5" stroke="#888" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Risk Engine",
    desc: "Portfolio margining and real-time liquidation risk scores.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 13L5.5 7 8 11l2-3.5 2.5 4" stroke="#888" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Full Trade History",
    desc: "Every fill and PnL event stored. Export CSV or connect via API.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#888" strokeWidth="1.3"/>
        <path d="M5 7h6M5 10h4" stroke="#888" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const PERKS = [
  { n: "01", t: "Non-Custodial",   d: "Your keys, your funds. We never hold your assets." },
  { n: "02", t: "0% Maker Fee", d: "Transparent fee schedule with maker rebates and no hidden costs." },
  { n: "03", t: "API + SDK",       d: "REST and WebSocket with official Python and TypeScript SDKs." },
  { n: "04", t: "24/7 Support",    d: "Under 2-minute first response, every day, every hour." },
];

/* ─── Helpers ───────────────────────────────────────── */
function generateOB() {
  const base = 67388;
  const asks = [], bids = [];
  for (let i = 0; i < 7; i++) {
    asks.push({ p: base + (i + 1) * 14 + (Math.random() * 5 | 0), s: (0.05 + Math.random() * 2.5).toFixed(3) });
    bids.push({ p: base - (i + 1) * 12 - (Math.random() * 5 | 0), s: (0.05 + Math.random() * 2.5).toFixed(3) });
  }
  return { asks, bids, base };
}

const GreenDot = ({ className = "" }) => (
  <span
    className={`inline-block w-1.5 h-1.5 rounded-full bg-green-500 ${className}`}
    style={{ boxShadow: "0 0 6px #22c55e", animation: "blink 2.4s ease infinite" }}
  />
);

const BlueDot = ({ className = "" }) => (
  <span
    className={`inline-block w-1.5 h-1.5 rounded-full bg-blue-500 ${className}`}
    style={{ boxShadow: "0 0 6px #22c55e", animation: "blink 2.4s ease infinite" }}
  />
);

function Nav() {
  return (
    <nav
      className="w-full fixed top-0 left-0 z-50 flex items-center  border-b"
      style={{
        height: 54,
        borderColor: "#1f1f1f",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
       <div className="flex justify-between items-center w-full gap-10 px-10">

            <h1 className="font-semibold text-white">
              OnlyFunds
            </h1>

          <Link to={'/signin'}>
            <ButtonBlack name="Sign in"/>
          </Link>

        </div>
    </nav>
  );
}

function Hero() {
  return (
    <div
      className="mx-auto px-10 border-b max-w-5xl"
      style={{ paddingTop: 160, paddingBottom: 100, borderColor: "#1f1f1f" }}
    >
      <div className="inline-flex items-center gap-1.5 mb-7 text-xs" style={{ color: "#888", fontFamily: "Geist Mono, monospace", letterSpacing: "-.01em" }}>
        <GreenDot />
        V 0.5 Beta live 
      </div>

      <h1 
      className="text-7xl tracking-tighter mb-7"
      style={{ fontWeight: 600, lineHeight: 1.02, color: "#ededed" }}>
        Trade anything.<br />
        <span style={{ color: "#444", fontWeight: 300 }}>At any size.</span>
      </h1>

      <p 
      className="text-sm"
      style={{ color: "#888", fontWeight: 300, maxWidth: 440, lineHeight: 1.65, letterSpacing: "-.01em", marginBottom: 32 }}>
        Perpetuals, and spot on one exchange. Built for speed, designed for depth.
      </p>

      <div className="flex gap-2.5 flex-wrap">
        <Link to={'/signup'}>
          <ButtonWhite name="Start Trading"/>
        </Link>
      </div>
    </div>
  );
}

function Ticker() {
  const doubled = [...TICKER_DATA, ...TICKER_DATA];
  return (
    <div className="border-b overflow-hidden" style={{ borderColor: "#1f1f1f", background: "#0a0a0a" }}>
      <div className="flex" style={{ animation: "slide 20s linear infinite", width: "max-content" }}>
        {doubled.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 border-r shrink-0 py-4 px-10 text-2xs"
            style={{ borderColor: "#1f1f1f", fontFamily: "Geist Mono, monospace", whiteSpace: "nowrap" }}
          >
            <span style={{ color: "#ededed", fontWeight: 900 }}>{t.sym}</span>
            <span style={{ color: t.up ? "#4ade80" : "#f87171" }}>{t.price}</span>
            <span style={{ color: t.up ? "#4ade80" : "#f87171", fontSize: 11 }}>{t.chg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stats() {
  const stats = [
    { n: "$1.4B",  l: "24h trading volume" },
    { n: "6",     l: "Markets available" },
    { n: "0%",  l: "Maker fee" },
    { n: "<10ms",  l: "Median latency" },
  ];
  return (
    <div className="flex flex-col md:flex-row w-full " style={{ gridTemplateColumns: "repeat(4,1fr)", borderColor: "#1f1f1f" }}>
      {stats.map((s, i) => (
        <div key={i} className="flex flex-col items-center md:items-start w-full border-b border-r last:border-r-0 py-6 px-10 md:py-10" style={{ borderColor: "#1f1f1f" }}>
          <span className="block text-lg md:text-2xl" style={{ fontFamily: "Geist Mono, monospace", fontWeight: 600, letterSpacing: "-.04em", marginBottom: 4 }}>{s.n}</span>
          <span style={{ fontSize: 12, color: "#888" }}>{s.l}</span>
        </div>
      ))}
    </div>
  );
}

function MarketsSection() {
  return (
    <div className="mx-auto px-6 border-b max-w-5xl" style={{ padding: "80px 24px", borderColor: "#1f1f1f" }}>
      <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 500, marginBottom: 12, fontFamily: "Geist Mono, monospace" }}>Markets</div>
      <h2 
      className="text-4xl"
      style={{ fontWeight: 600, letterSpacing: "-.04em", lineHeight: 1.1, marginBottom: 12 }}>
        Deep liquidity.<br />Every pair.
      </h2>

      <div className="border mt-10" style={{ borderColor: "#1f1f1f" }}>
        <div className="grid border-b" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "10px 16px", fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: ".06em", borderColor: "#1f1f1f", background: "#0a0a0a" }}>
          <span>Pair</span>
          <span className="text-right">Price</span>
          <span className="text-right">24h Change</span>
          <span className="text-right">Volume</span>
        </div>

        {MARKETS.map((m, i) => (
          <div
            key={i}
            className="grid border-b last:border-b-0 items-center transition-colors duration-100"
            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 16px", borderColor: "#1f1f1f" }}
            onMouseEnter={e => e.currentTarget.style.background = "#0a0a0a"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-.01em" }}>{m.pair}</div>
              <div style={{ fontSize: 10, color: "#444", marginTop: 1, fontFamily: "Geist Mono, monospace" }}>{m.type}</div>
            </div>
            <div className="text-right" style={{ fontFamily: "Geist Mono, monospace", fontSize: 13 }}>{m.price}</div>
            <div className="text-right" style={{ fontFamily: "Geist Mono, monospace", fontSize: 12, fontWeight: 500, color: m.up ? "#4ade80" : "#f87171" }}>{m.chg}</div>
            <div className="text-right" style={{ fontFamily: "Geist Mono, monospace", fontSize: 12, color: "#888" }}>{m.vol}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <div className="mx-auto px-6 border-b max-w-5xl" style={{ padding: "80px 24px", borderColor: "#1f1f1f" }}>
      <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 500, marginBottom: 12, fontFamily: "Geist Mono, monospace" }}>Platform</div>
      <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 600, letterSpacing: "-.04em", lineHeight: 1.1, marginBottom: 12 }}>
        Everything a serious<br />trader needs.
      </h2>

      <div className="flex flex-col md:grid md:grid-cols-3 border mt-12 border-[#1f1f1f]">

        {FEATURES.map((f, i) => (
          <div
            key={i}
            className={`border-b border-[#1f1f1f] transition-colors duration-150 p-8 md:py-10 ${ i  % 3 == 1 && "md:border-l md:border-r"}`}  
            onMouseEnter={e => e.currentTarget.style.background = "#0a0a0a"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div className="grid place-items-center rounded-md mb-4" style={{ width: 32, height: 32, border: "1px solid #2a2a2a", background: "#111" }}>
              {f.icon}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-.02em", marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6, fontWeight: 300 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderBookCard() {
  const [ob, setOb] = useState(() => generateOB());

  useEffect(() => {
    const id = setInterval(() => setOb(generateOB()), 1400);
    return () => clearInterval(id);
  }, []);

  const { asks, bids, base } = ob;
  const maxS = Math.max(...asks.map(a => +a.s), ...bids.map(b => +b.s));
  const fmt = (n:any) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  const spread = asks[0].p - bids[0].p;

  return (

    <div className="w-full border" style={{ borderColor: "#1f1f1f", background: "#0a0a0a" }}>

      <div className="flex justify-between items-center border-b" style={{ padding: "10px 14px", borderColor: "#1f1f1f", fontSize: 12, fontWeight: 500, color: "#888" }}>
        Order Book <span style={{ color: "#ededed" }}>BTC-PERP</span>
      </div>
      <div className="grid border-b" style={{ gridTemplateColumns: "1fr 1fr 1fr", padding: "5px 14px", fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: ".05em", borderColor: "#1f1f1f", background: "#000" }}>
        <span>Price</span><span className="text-right">Size</span><span className="text-right">Total</span>
      </div>

      {[...asks].reverse().map((a, i) => {
        const pct = (+a.s / maxS * 95).toFixed(0);
        return (
          <div key={i} className="grid relative my-1" style={{ gridTemplateColumns: "1fr 1fr 1fr", padding: "3px 14px", fontFamily: "Geist Mono, monospace", fontSize: 11, lineHeight: 1.8 }}>
            <div className="absolute right-0 top-0 bottom-0" style={{ width: `${pct}%`, background: "#ef4444", opacity: .08 }} />
            <span style={{ color: "#f87171" }}>{a.p.toLocaleString()}</span>
            <span className="text-right" style={{ color: "#888" }}>{a.s}</span>
            <span className="text-right" style={{ color: "#888" }}>{fmt(a.p * +a.s)}</span>
          </div>
        );
      })}

      <div className="text-center border-t border-b" style={{ padding: 4, fontSize: 10, color: "#444", fontFamily: "Geist Mono, monospace", background: "#000", borderColor: "#1f1f1f" }}>
        Spread  ${spread.toFixed(0)}  ·  {(spread / base * 100).toFixed(3)}%
      </div>

      {bids.map((b, i) => {
        const pct = (+b.s / maxS * 95).toFixed(0);
        return (
          <div key={i} className="grid relative my-1" style={{ gridTemplateColumns: "1fr 1fr 1fr", padding: "3px 14px", fontFamily: "Geist Mono, monospace", fontSize: 11, lineHeight: 1.8 }}>
            <div className="absolute right-0 top-0 bottom-0" style={{ width: `${pct}%`, background: "#22c55e", opacity: .08 }} />
            <span style={{ color: "#4ade80" }}>{b.p.toLocaleString()}</span>
            <span className="text-right" style={{ color: "#888" }}>{b.s}</span>
            <span className="text-right" style={{ color: "#888" }}>{fmt(b.p * +b.s)}</span>
          </div>
        );
      })}
    </div>
  );
}

function OrderBookSection() {

  return (
    <div className="w-full mx-auto px-6 border-b max-w-5xl" style={{ padding: "80px 24px", borderColor: "#1f1f1f" }}>

      <div className="w-full flex flex-col md:flex-row gap-20 items-center">

        <div className="w-full md:w:1/2">
          <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 500, marginBottom: 12, fontFamily: "Geist Mono, monospace" }}>Order Book</div>
          <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 600, letterSpacing: "-.04em", lineHeight: 1.1 }}>
            Depth that<br />never blinks.
          </h2>
          <p style={{ marginTop: 12, fontSize: 15, color: "#888", fontWeight: 300, lineHeight: 1.65, letterSpacing: "-.01em", maxWidth: 480 }}>
            Our matching engine processes 100,000+ orders per second. Every level updates in real time, no lag, no stale data.
          </p>
          <div className="flex flex-col gap-2.5 mt-7">
            {["Full depth, 400 levels", "WebSocket & REST API", "Aggregated or raw feed"].map(l => (
              <div key={l} className="flex items-center gap-2" style={{ fontSize: 13, color: "#888" }}>
                <span style={{ color: "#4ade80" }}>→</span> {l}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w:1/2 ">
          <OrderBookCard />
        </div>
      </div>
    </div>
  );
}

function WhySection() {

  return (
    <div className="mx-auto px-6 border-b max-w-5xl" style={{ padding: "80px 24px", borderColor: "#1f1f1f" }}>
      <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 500, marginBottom: 12, fontFamily: "Geist Mono, monospace" }}>Why OnlyFunds</div>
      <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 600, letterSpacing: "-.04em", lineHeight: 1.1 }}>The edge you need.</h2>

      <div className="flex flex-col md:flex-row border-t mt-12" style={{ gridTemplateColumns: "repeat(4,1fr)", borderColor: "#1f1f1f" }}>
        {PERKS.map((p, i) => (
          <div key={i} className=" border-b" style={{ padding: 28, borderColor: "#1f1f1f" }}>
            <div style={{ fontSize: 11, color: "#444", fontFamily: "Geist Mono, monospace", marginBottom: 10 }}>{p.n}</div>
            <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-.02em", marginBottom: 6 }}>{p.t}</div>
            <div style={{ fontSize: 13, color: "#888", fontWeight: 300, lineHeight: 1.6 }}>{p.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CTA() {
  return (
    <div className="mx-auto px-6 text-center border-t" style={{ maxWidth: 760, padding: "100px 24px", borderColor: "#1f1f1f" }}>
      <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 600, letterSpacing: "-.04em", marginBottom: 12 }}>Ready to trade?</h2>
      <p style={{ fontSize: 15, color: "#888", fontWeight: 300, marginBottom: 28 }}>Join 14,000+ traders on the fastest on-chain exchange.</p>
      <div className="flex gap-2.5 justify-center">
        <Link to={'/signin'}>
        <button
          className="rounded-[5px] cursor-pointer transition-all duration-150"
          style={{ padding: "9px 20px", fontSize: 13, fontWeight: 500, background: "#ededed", border: "1px solid #ededed", color: "#000", fontFamily: "Geist, sans-serif", letterSpacing: "-.01em" }}
          onMouseEnter={e => e.currentTarget.style.opacity = ".88"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >Start trading</button>
        </Link>
      </div>
    </div>
  );
}

function Footer() {

  return (
    <footer className="border-t px-6" style={{ borderColor: "#1f1f1f", padding: "48px 24px", background: "#0a0a0a" }}>
      <div className="mx-auto flex justify-between gap-12 max-w-5xl" style={{ gridTemplateColumns: "1.4fr repeat(3,1fr)" }}>

        <div className="flex flex-col ">
          <div className="flex items-center gap-2 mb-2.5" style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-.02em" }}>
            <span>
              OnlyFunds
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#444", lineHeight: 1.7 }}>
            The next-generation centralized exchange for professional traders.
          </p>
        </div>
      </div>

      <div
        className="mx-auto flex justify-between items-center border-t"
        style={{ maxWidth: 1080, marginTop: 28, paddingTop: 20, borderColor: "#1f1f1f", fontSize: 11, color: "#444" }}
      >
        <span>© 2026 OnlyFunds Exchange</span>
        <div className="flex items-center gap-1.5">
          { environment === EnvironmentEnum.PROD && <GreenDot />}
          { environment === EnvironmentEnum.DEV && <BlueDot/>}
           ENV { environment }
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <>
      <style>{`
        html { scroll-behavior: smooth; }
        body { background: #000; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; }
        @keyframes blink { 0%,100%{opacity:1} 60%{opacity:.3} }
        @keyframes slide { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .ticker-row:hover .ticker-inner { animation-play-state: paused; }
      `}</style>

      <div
        style={{
          color: "#ededed",
          lineHeight: 1.6,
          minHeight: "100vh",
        }}
        className="min-h-screen bg-black-standard text-sm"
      >
        <Nav />

        <div style={{ paddingTop: 0 }}>
          <Hero />
          <div className="ticker-row">
            <div className="ticker-inner"><Ticker /></div>
          </div>
          <Stats />
          <MarketsSection />
          <FeaturesSection />
          <OrderBookSection />
          <WhySection />
          <CTA />
          <Footer />
        </div>
      </div>
    </>
  );
}

function ButtonBlack({name}:{name:string}){
  return(
    <button
      className="text-xs px-3.5 py-1.5 rounded-[5px] cursor-pointer transition-all duration-150 border border-[#2a2a2a] text-[#ededed]"
      style={{ color: "#ededed", fontFamily: "Geist, sans-serif" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#444"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a2a"}
    >{name}</button>
  )
}

function ButtonWhite({name}:{name:string}){
  return(
    <button
      className="text-xs px-3.5 py-1.5 rounded-[5px] cursor-pointer transition-all duration-150"
      style={{ background: "#ededed", border: "1px solid #ededed", color: "#000", fontFamily: "Geist, sans-serif" }}
      onMouseEnter={e => e.currentTarget.style.opacity = ".88"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >{name}</button>
  )
}

 
        