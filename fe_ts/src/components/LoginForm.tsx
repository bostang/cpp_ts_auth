import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './FormStyles.css'; // <-- Impor file CSS

const LoginForm: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const navigate = useNavigate();

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setMessage('Sedang login...');

        try {
            const response = await fetch('http://localhost:18080/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const textResponse = await response.text();

            if (response.ok) {
                setMessage("Login berhasil!");
                // Di sini Anda bisa menyimpan token dari respons backend
                // dan mengarahkan pengguna ke dashboard
                navigate('/dashboard'); 
            } else {
                setMessage(`Gagal: ${textResponse}`);
            }
        } catch (error) {
            setMessage('Koneksi ke server gagal. Pastikan backend berjalan.');
            console.error('Error:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default LoginForm;
