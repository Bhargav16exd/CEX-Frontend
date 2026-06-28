export default function ButtonGreenComponent({OnClickHandler, btnName}:{OnClickHandler:any, btnName:string}){
  return(
     <button 
      onClick={OnClickHandler}
      className="rounded-sm w-full py-2 px-2 text-white font-bold bg-green-700 my-6 active:scale-95 transition-transform cursor-pointer">{btnName}</button>
  )
}