import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './FormStyles.css'; // <-- Impor file CSS

const RegisterForm: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const navigate = useNavigate();

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        setMessage('Sedang mendaftar...');

        try {
            const response = await fetch('http://localhost:18080/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const textResponse = await response.text();
            
            if (response.ok) {
                setMessage(textResponse);
                // Redirect ke halaman login setelah registrasi berhasil
                navigate('/login');
            } else {
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
                <h2>Registrasi Pengguna</h2>
                <form onSubmit={handleRegister}>
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
                    <button type="submit">Daftar</button>
                </form>
                {message && <p>{message}</p>}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p>Sudah punya akun? <span className="link" onClick={() => navigate('/login')}>Masuk di sini.</span></p>
                    <p><span className="link" onClick={() => navigate('/')}>Kembali ke Beranda</span></p>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
