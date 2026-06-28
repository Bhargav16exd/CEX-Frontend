export default function ButtonRedComponent({OnClickHandler, btnName}:{OnClickHandler:any, btnName:string}){
  return(
    <button 
      onClick={OnClickHandler}
      className="rounded-sm w-full py-2 px-2 text-white font-bold bg-red-800  my-6 active:scale-95 transition-transform cursor-pointer">{btnName}</button>
  )
}