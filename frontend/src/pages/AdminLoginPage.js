import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const AdminLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === 'admin' && password === 'qwerty@987') {
            localStorage.setItem('isAdminAuthenticated', 'true');
            navigate('/count/a=a/adps/dashboard');
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <h1>Admin Portal</h1>
                <p>Enter your credentials to manage orders</p>

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="login-button">Login</button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;
