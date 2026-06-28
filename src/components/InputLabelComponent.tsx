export default function InputLabelComponent({labelName,value,handleChange,name,inputType,placeholder}:InputLabelComponent){
  return(
    <div className="w-full flex justify-center items-start flex-col my-1">
      <label className="my-2 text-2xs font-semibold text-[#555555]">
          {labelName}
      </label>
      <input type={inputType} autoComplete={`new-${labelName}`} placeholder={placeholder} className="my-1 outline-none border border-b-color-standard rounded-sm w-2xs py-3 px-2 text-xs bg-[#111111] placeholder:text-[#555555] text-white" onChange={handleChange} name={name} value={value} />
    </div>
  )
}

export type InputLabelComponent = {
  labelName:string
  value:string,
  handleChange:any,
  name:string,
  inputType:string,
  placeholder:string
}