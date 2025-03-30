import React, { useState } from 'react';
import axios from '../../shared/api/api';
import './LoginForm.css';

const LoginForm = ({ onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/admin/login', { password });
            if (response.data.success) {
                onLoginSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка входа');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container-lf">
            <h2>Вход в админ-панель</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group-lf">
                    <label>Пароль:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button
                    type="submit"
                    className="button-lf"
                    disabled={loading}
                >
                    {loading ? 'Вход...' : 'Войти'}
                </button>
            </form>
        </div>
    );
};

export default LoginForm;