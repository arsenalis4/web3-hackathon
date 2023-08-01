import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';

const SideBar = () => {
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
        <div className="sidebar">
            <ul>
                <li>
                    <button onClick={goToDashBoard}>Dashboard</button>
                </li>
                <li>
                    <button onClick={goToHistory}>History</button>
                </li>
                <li>
                    <button onClick={goToWallet}>My Wallet</button>
                </li>
                <li>
                    <button onClick={logout}>Logout</button>
                </li>
            </ul>
        </div>
    );
}

export default SideBar;
