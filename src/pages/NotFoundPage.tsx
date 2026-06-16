import { Link } from "react-router";
import NavigationLayout from "../components/NavigationComponent";

const Dot = ({ className = "" }) => (
  <span
    className={`inline-block w-1.5 h-1.5 rounded-full bg-red-500 ${className}`}
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
      className="mx-auto px-6 border-b max-w-4xl flex flex-col justify-center items-start"
      style={{ paddingTop: 160, paddingBottom: 100, borderColor: "#1f1f1f" }}
    >
      <div className="inline-flex items-center gap-1.5 mb-7 text-xs" style={{ color: "#888", fontFamily: "Geist Mono, monospace", letterSpacing: "-.01em" }}>
        <Dot />
        ERROR 404 — PAGE_NOT_FOUND 
      </div>

      <h1 
      className="text-7xl tracking-tighter mb-7"
      style={{ fontWeight: 600, lineHeight: 1.02, color: "#ededed" }}>
        404 <br />
        <span style={{ color: "#444", fontWeight: 300 }}>PAGE NOT FOUND</span>
      </h1>

      <p 
      className="text-sm"
      style={{ color: "#888", fontWeight: 300, maxWidth: 440, lineHeight: 1.65, letterSpacing: "-.01em", marginBottom: 32 }}>
        The page you're looking for was delisted, moved, or never existed. Check the URL, or head back to a market that's actually trading.
      </p>

      <div className="flex gap-2.5 flex-wrap">
        <Link to={'/dashboard'}>
          <ButtonWhite name="Go Dashboard"/>
        </Link>
      </div>
    </div>
  );
}

export default function NotFoundPage() {
  return (
    <NavigationLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap');
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
          fontFamily: "Geist, sans-serif",
          fontSize: 14,
          lineHeight: 1.6,
          WebkitFontSmoothing: "antialiased",
          minHeight: "100vh",
        }}
        className="min-h-screen bg-[#0A0A0A]"
      >
        <Hero />
      </div>
    </NavigationLayout>
  
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