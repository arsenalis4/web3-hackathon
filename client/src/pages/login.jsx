import GoogleLoginButton from "../components/googleLoginButton";

const LoginPage = () => {
    return(
        <div className="loginPage">
            <div className="logo"><img src="img/Logo Image.svg" alt="logo" /></div>
            <GoogleLoginButton />
        </div>
    )
};

export default LoginPage;