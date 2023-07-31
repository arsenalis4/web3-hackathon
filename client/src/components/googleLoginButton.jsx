import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import jwt_decode from "jwt-decode";
import authAPI from '../api/authAPI';

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const goToDashBoard = (email) => {
    navigate('/dashboard', { state: { email: email } });
  };

  const clientId = '969782634150-ckrvfp6p7qqkd5s6q12ma1horm3a5hhq.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          const credential = credentialResponse.credential;
          const decoded = jwt_decode(credential);
          const email = decoded.email;
          const user = {
            "email": email
          }
          const response = await authAPI.post("/google", user);
          goToDashBoard(email);
        }}
        onError={() => {
          console.log('Login Failed');
        }}
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;