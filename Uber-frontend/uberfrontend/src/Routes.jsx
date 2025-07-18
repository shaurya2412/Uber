import { Routes, Route } from "react-router-dom";
import Welcome from "./components/Welcome";
import Login from "./components/Login"
import Dashboard from "./components/dashboard";
import CaptainLogin from "./captainroutes/CaptainLogin";
import Captaindashboard from "./components/Captaindashboard";
import CaptainRegister from "./captainroutes/captainregister";
const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Welcome />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/capdashboard" element={<Captaindashboard/>}/>
      <Route path="/captainlogin" element={<CaptainLogin/>}/>
      <Route path="/captainRegister" element={<CaptainRegister/>}/>
      <Route path="*" element={<div>404 - Page Not Found</div>}

      />
    </Routes>
  );  
};

export default AllRoutes;
