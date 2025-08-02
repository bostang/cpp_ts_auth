import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './FormStyles.css'; // <-- Pastikan Anda memiliki file CSS ini

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

            // Periksa apakah respons adalah JSON
            if (response.headers.get('Content-Type')?.includes('application/json')) {
                const jsonResponse = await response.json();

                if (response.ok) {
                    setMessage(jsonResponse.message || "Login berhasil!");
                    // Simpan token ke localStorage
                    localStorage.setItem('jwt_token', jsonResponse.token);
                    console.log('Login berhasil, token JWT disimpan:', jsonResponse.token);
                    
                    // Redirect ke dashboard
                    navigate('/dashboard'); 
                } else {
                    setMessage(`Gagal: ${jsonResponse.message}`);
                }
            } else {
                const textResponse = await response.text();
                setMessage(`Gagal: ${textResponse}`);
            }
        } catch (error) {
            setMessage('Koneksi ke server gagal. Pastikan backend berjalan.');
            console.error('Error:', error);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
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
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p>Belum punya akun? <span className="link" onClick={() => navigate('/register')}>Daftar di sini.</span></p>
                    <p><span className="link" onClick={() => navigate('/')}>Kembali ke Beranda</span></p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
