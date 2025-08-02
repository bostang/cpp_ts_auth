import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FormStyles.css'; // Asumsikan Anda menggunakan file CSS yang sama

const Dashboard: React.FC = () => {
    const [message, setMessage] = useState<string>('Memuat dashboard...');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('jwt_token');

            if (!token) {
                // Jika tidak ada token, arahkan kembali ke login
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://localhost:18080/dashboard', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const jsonResponse = await response.json();
                    setMessage(jsonResponse.message);
                } else {
                    const textResponse = await response.text();
                    setMessage(`Gagal memuat dashboard: ${textResponse}`);
                    // Token mungkin tidak valid, hapus dan arahkan ke login
                    localStorage.removeItem('jwt_token');
                    navigate('/login');
                }
            } catch (error) {
                setMessage('Koneksi ke server gagal.');
                console.error('Error:', error);
                localStorage.removeItem('jwt_token');
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const handleLogout = () => {
        // Hapus token dari localStorage
        localStorage.removeItem('jwt_token');
        // Arahkan pengguna kembali ke halaman login
        navigate('/login');
    };

    if (isLoading) {
        return <div className="form-container">
            <h2>Dashboard</h2>
            <p>Memuat...</p>
        </div>;
    }

    return (
        <div className="form-container">
            <h2>Dashboard</h2>
            <p>{message}</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Dashboard;
