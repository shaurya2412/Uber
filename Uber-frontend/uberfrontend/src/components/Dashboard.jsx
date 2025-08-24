import React from 'react';
import Cardcomponent from "./Cardcomponent";
import Currentride from "./Currentride";
import RecentRides from "./RecentRides";
import OSMMap from "./map"; // Corrected the import path

const initialCenter = [28.58, 77.33]; // A central point between Gurgaon and Noida
const initialZoom = 11;

const Dashboard = () => {
  // Coordinates for Gurgaon, Haryana
  const userLocation = [28.4595, 77.0266]; 
  // Coordinates for Noida, Uttar Pradesh
  const driverLocation = [28.5355, 77.3910]; 

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-black min-h-screen flex items-center ">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ">
          <Cardcomponent t1="Time Rides" t2="⏱" t3="This month" t4="127" />
          <Cardcomponent t1="Time Saved" t2="⏱️" t3="Estimated" t4="24h" />
          <Cardcomponent t1="Money Spent" t2="⏱️" t3="This year" t4="$1,234" />
          <div className="bg-black p-4 mt-4 ml-4 rounded-2xl flex flex-col w-[32vw] border-1 h-fixed ">
            <div className=" flex justify-between items-center mb-2 "> </div>
            <p className="text-2xl font-bold flex flex-row mr-2"> 
              <p className="font-semibold mr-2 ">🚗</p>
              Pickup location
            </p>
            <div className="flex flex-col">
              <input className="border mt-6 w-90 rounded text-white placeholder-amber-50" type="text" placeholder="📍   Pickup from" />
              <p className=" text flex flex-col mt-4">
                Destination <input className="border mt-3 w-90 placeholder-amber-50 " type="text" placeholder="📍   Final Destination" />
              </p>
              <div className="flex flex-col justify-center m-4 bg-black">
                <p className="flex justify-between">
                  Ride now <button className="bg-transparent text-white border border-white">Schedule</button>
                </p>
              </div>
            </div>
            <div> </div>
            <button className="mt-8">Find rides</button>
          </div>
          <Currentride/>
          <RecentRides />
        </div>
      </div>
      
      <div className="min-h-[500px] rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/10">
        <div className="w-full h-full"> 
          <OSMMap
            center={initialCenter}
            zoom={initialZoom}
            userLocation={userLocation}
            driverLocation={driverLocation}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
