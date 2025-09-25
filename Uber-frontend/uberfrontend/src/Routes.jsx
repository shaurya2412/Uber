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
import IntegrationTest from "./components/IntegrationTest";
import IndiaMapTest from "./components/IndiaMapTest";
import CoordinateDebug from "./components/CoordinateDebug";
import IndiaPointersTest from "./components/IndiaPointersTest";
import IndianCoordinatesTest from "./components/IndianCoordinatesTest";
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
      <Route path="/captainlogin" element={<CaptainLogin/>}/>
      <Route path="/captainRegister" element={<CaptainRegister/>}/>
      <Route path="/test" element={<IntegrationTest/>}/>
      <Route path="/india-test" element={<IndiaMapTest/>}/>
      <Route path="/coord-debug" element={<CoordinateDebug/>}/>
      <Route path="/india-pointers" element={<IndiaPointersTest/>}/>
      <Route path="/indian-coords" element={<IndianCoordinatesTest/>}/>
      <Route path="*" element={<div>404 - Page Not Found</div>}

      />
    </Routes>
  );  
};

export default AllRoutes;
