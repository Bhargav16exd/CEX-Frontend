export default function ButtonGreyComponent({onClickHanlder, name}:any){
  return(
    <button className="font-medium text-2xs  py-1 px-4 border-b-color-standard border rounded-sm cursor-pointer" onClick={onClickHanlder}>{name}</button>
  )
}