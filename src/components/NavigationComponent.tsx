export default function NavigationLayout({children}:any){
  return(
    <div>
      <div className="bg-[#111111] border-[#252525] border-b-2">
        <div className="flex py-3 px-6 gap-12 justify-start items-center w-1/2">
            <h1 className="font-semibold text-lg text-white">
              UMBRELLA
            </h1>
            <div>
              <p className="text-white text-sm">
                Markets
              </p>

            </div>
        </div>
        <div>

        </div>
      </div>
      {children}
    </div>
  )
}