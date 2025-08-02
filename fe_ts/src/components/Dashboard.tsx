import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './FormStyles.css';

const Dashboard: React.FC = () => {
    const [message, setMessage] = useState<string>('Memuat dashboard...');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('jwt_token');

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/dashboard`, {
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

    const handleLogout = async () => {
        const token = localStorage.getItem('jwt_token');

        if (token) {
            try {
                // Panggil endpoint logout di backend
                await fetch(`${API_BASE_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                // Kita tidak perlu menunggu respons, cukup panggil dan lanjutkan
                console.log("Logout API call sent to backend.");
            } catch (error) {
                // Catat kesalahan tetapi tetap lanjutkan logout di sisi klien
                console.error("Failed to call logout API:", error);
            }
        }

        // Hapus token dari localStorage dan navigasi
        localStorage.removeItem('jwt_token');
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="form-container">
                <h2>Dashboard</h2>
                <p>Memuat...</p>
            </div>
        );
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
