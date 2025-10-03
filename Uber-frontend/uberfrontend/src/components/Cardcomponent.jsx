import React from 'react'

const Cardcomponent = (props) => {
  return (
  <div className="bg-white/95 backdrop-blur p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 w-full">
    <div className="flex justify-between items-start mb-1">
      <div className="text-gray-500 text-sm font-medium">{props.t1}</div>
      <div className="text-2xl">{props.t2}</div>   
    </div>
    <div className="flex items-end justify-between mt-1">
      <div className="font-extrabold text-3xl text-gray-900">{props.t4}</div>
      <div className="text-gray-400 text-xs">{props.t3}</div>
    </div>
  </div>
  )
}

export default Cardcomponent