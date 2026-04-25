import React, { useContext, useState } from 'react';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import './LoginPopup.css';

const LoginPopup = ({ setShowLogin }) => {
    const [currState, setCurrState] = useState("Sign Up");
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const { url, setToken, loadCartData, syncGuestCartToServer } = useContext(StoreContext);

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData((prev) => ({ ...prev, [name]: value }));
    }

    const onLogin = async (event) => {
        event.preventDefault();
        const endpoint = currState === "Login" ? "/api/user/login" : "/api/user/register";
        try {
            const response = await fetch(`${url}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();

            if (result.success) {
                setToken(result.token);
                localStorage.setItem("token", result.token);
                await syncGuestCartToServer(result.token);
                await loadCartData(result.token);
                setShowLogin(false);
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert("Could not connect to the server. Please make sure the backend is running.");
        }
    }

    return (
        <div className="login-popup">
            <form onSubmit={onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
                </div>
                <div className="login-popup-inputs">
                    {currState === "Login" ? <></> : <input name="name" onChange={onChangeHandler} value={data.name} type="text" placeholder='Your name' required />}

                    <input name="email" onChange={onChangeHandler} value={data.email} type="email" placeholder='Your email' required />
                    <input name="password" onChange={onChangeHandler} value={data.password} type="password" placeholder='Password' required />
                </div>
                <button><p>{currState === "Sign Up" ? "Create account" : "Login"}</p></button>
                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>By continuing, i agree to the terms of use & privacy policy</p>
                </div>
                {currState === "Login" ? <p>Create a new account ?<span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
                    : <p>Already have an account?<span onClick={() => setCurrState("Login")} >Login here</span></p>}



            </form>
        </div>
    )
}

export default LoginPopup
