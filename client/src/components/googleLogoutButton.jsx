import { googleLogout } from '@react-oauth/google';

const GoogleLogoutButton = () => {
  return (
    <button onClick={()=>{
      googleLogout();
      console.log("Logged out");
    }}>로그아웃</button>
  );
};

export default GoogleLogoutButton;