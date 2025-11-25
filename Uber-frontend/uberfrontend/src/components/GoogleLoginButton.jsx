import { GoogleLogin } from '@react-oauth/google';
import { useUserStore } from '../Zustand/useUserstore';
import { API_BASE_URL } from '../config';

const API_BASE = API_BASE_URL;

export default function GoogleLoginButton() {
  const { setUser, setToken } = useUserStore();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log("Google Credential:", credentialResponse);
      
      const response = await fetch(`${API_BASE}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log("Login successful:", data);
        setUser(data.user);
        setToken(data.token);
        // You can add navigation logic here if needed
        // navigate('/dashboard');
      } else {
        console.error("Login failed:", data.message);
        alert(`Login failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleGoogleError = () => {
    console.log("Google Login Failed");
    alert("Google login failed hihihi3. Please try again.");
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
      useOneTap={false}
      auto_select={false}
    />
  );
}
