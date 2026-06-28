import LoaderWhite from "./WhiteLoaderCompoenet";

function ButtonWhite({OnClickFunctionHanlder, isLoaderActive, buttonName}:{OnClickFunctionHanlder:any ,isLoaderActive:boolean,buttonName:string}){
  return(
    <button 
    onClick={OnClickFunctionHanlder}
    className="bg-white rounded-sm mt-4 my-2 py-2.5 text-xs font-medium tracking-tight cursor-pointer flex justify-center items-center">
      {
        isLoaderActive ? <LoaderWhite/> : <>{buttonName}</>
      }
    </button>
  )
}

export default ButtonWhite