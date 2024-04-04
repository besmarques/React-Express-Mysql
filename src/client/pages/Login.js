import React, { useEffect, useState, useContext } from 'react';
import { Context } from "../store/appContext";

const Login = () => {

    const { store, actions } = useContext(Context); 

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            actions.loginUser(email, password);
        } catch (err) {
            setError(err.response.data);
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
        </div>
    );
}

export default Login;