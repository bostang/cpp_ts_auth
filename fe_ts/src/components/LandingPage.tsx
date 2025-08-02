import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FormStyles.css'; // Menggunakan CSS yang sama untuk konsistensi

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div className="form-container landing-page">
                <h2>Selamat Datang</h2>
                <p>Silakan masuk atau daftar untuk melanjutkan.</p>
                <div className="button-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                    <button 
                        onClick={() => navigate('/login')}
                        className="primary-button"
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => navigate('/register')}
                        className="secondary-button"
                    >
                        Daftar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
