import { Routes, Route } from "react-router-dom";
import Welcome from "./components/Welcome";
import Login from "./components/Login"
import Dashboard from "./components/Dashboard";
import CaptainLogin from "./captainroutes/CaptainLogin";
import Captaindashboard from "./components/Captaindashboard";
import CaptainRegister from "./captainroutes/captainregister";
import LaunchPage from "./components/Launchpage";
import ProtectedRoute from "./components/ProtectedRoute";
import CaptainProtectedRoute from "./components/CaptainProtectedRoute";
const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/Welcome" element={<Welcome />} />
      <Route path="/" element={<LaunchPage/>}/>
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/capdashboard" element={
          <Captaindashboard />
      }/>
      <Route path="/userdashboardHeader" element={<userdashboardHeader/>}/>
      <Route path="/captainlogin" element={<CaptainLogin/>}/>
      <Route path="/captainRegister" element={<CaptainRegister/>}/>
      <Route path="*" element={<div>404 - Page Not Found</div>}

      />
    </Routes>
  );  
};

export default AllRoutes;
