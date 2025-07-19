import React from 'react'

const Cardcomponent = (props) => {
  return (
  <div className="bg-black p-6 ml-2 rounded-2xl flex flex-col w-[32vw] border-1 h-fixed ">
    <div className=" flex justify-between items-center mb-2 ">   <p className="font-semibold ">{props.t1}</p>
    <p>{props.t2}</p>   
    </div>
<div className="flex flex-col"><p className="font-bold text-3xl">{props.t4}</p><p className="text-gray-400 text-sm">{props.t3}</p></div>
  </div>
  )
}

export default Cardcomponent