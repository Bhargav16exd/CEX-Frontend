export default function ErrorMessageComponent({errorActive, errorMessage}:{errorActive:boolean, errorMessage:string}){
  return(
    <>
    {
      errorActive &&
      <p className="text-center text-red-400 text-xs my-2 max-w-xs text-wrap overflow-hidden">
        {errorMessage}
      </p>
    }
    </>
  )
}