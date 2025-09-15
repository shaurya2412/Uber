import { StrictMode } from 'react'
import { GoogleOAuthProvider } from "@react-oauth/google";
const clientId ="1032264499994-dbalpc6ivfq34mcg14gkg6taks95vm4p.apps.googleusercontent.com"

import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <GoogleOAuthProvider clientId={clientId}>
    <App />
  </GoogleOAuthProvider>
  </StrictMode>,
)
