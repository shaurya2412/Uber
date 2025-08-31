import React from 'react'

const Cardcomponent = (props) => {
  return (
  <div className="bg-black p-6 ml-2 rounded-2xl flex flex-col w-[32vw] border-1 h-fixed ">
    <div className="flex justify-between items-center mb-2">
      <div className="font-semibold">{props.t1}</div>
      <div>{props.t2}</div>   
    </div>
    <div className="flex flex-col">
      <div className="font-bold text-3xl">{props.t4}</div>
      <div className="text-gray-400 text-sm">{props.t3}</div>
    </div>
  </div>
  )
}

export default Cardcomponent