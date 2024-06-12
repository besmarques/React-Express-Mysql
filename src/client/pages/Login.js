import React, { useState, useContext } from 'react';
import { Context } from "../store/appContext";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const Login = () => {

    const { store, actions } = useContext(Context); 

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await actions.loginUser(email, password);
    
            navigate('/');
        } catch (err) {
            setError(err.response.data);
        }
    };

    const handleForgotPassword = async () => {
        try {
            await axios.post('/api/forgot-password', { email });
            alert('If an account with this email exists, a password reset link has been sent.');
        } catch (err) {
            console.error(err);
        }
    };


    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Email:
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>
                    Password:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                {error && <p>{error}</p>}
                <button type="submit">Login</button>
            </form>
            <button onClick={handleForgotPassword}>Forgot Password?</button>
        </div>
    );
}

export default Login;