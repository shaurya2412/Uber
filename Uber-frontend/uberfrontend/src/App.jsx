// App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AllRoutes from "./Routes";
import Dashboard from "./components/dashboard";
import Captaindashboard from "./components/Captaindashboard";
import CaptainRegister from "./captainroutes/captainregister";
import CaptainLogin from "./captainroutes/CaptainLogin";

const App = () => {
  return (
    <BrowserRouter>
      <AllRoutes />
    </BrowserRouter>
  );
};

export default App;
