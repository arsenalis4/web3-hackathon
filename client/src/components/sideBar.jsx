import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';

const SideBar = (props) => {
    const { height } = props;
    const navigate = useNavigate();
    const loc = useLocation();
    const state = loc.state;
    const email = state.email;

    const goToLogin = () => {
        navigate('/');
    };

    const goToDashBoard = () => {
        navigate('/dashboard', {
            state: {
                email: email
            }
        });
    };

    const goToPool = () => {
        navigate('/pool', {
            state: {
                email: email
            }
        });
    };

    const goToHistory = () => {
        navigate('/history', {
            state: {
                email: email
            }
        });
    };

    const goToWallet = () => {
        navigate('/wallet', {
            state: {
                email: email
            }
        });
    };

    const logout = () => {
        googleLogout();
        goToLogin();
    };

    return (
        <div className="sideBar" style={{"height": height}}>
            <div className='image'><img src={"img/Logo Image.svg"} /></div>
            <div className='sideBarMenu'>
                <div className="menuItem" onClick={goToDashBoard}>DASHBOARD</div>
                <div className="menuItem" onClick={goToPool}>POOL</div>
                <div className="menuItem" onClick={goToHistory}>HISTORY</div>
                <div className="menuItem" onClick={goToWallet}>MY WALLET</div>
                <div className="menuItem" onClick={logout}>LOG OUT</div>
            </div>
        </div>
    );
}

export default SideBar;