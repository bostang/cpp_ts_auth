import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import './App.css'; // Pastikan file CSS diimpor

const Dashboard: React.FC = () => <h2>Selamat datang di Dashboard!</h2>;

const App: React.FC = () => {
    return (
        <Router>
            <nav>
                <Link to="/register">Daftar</Link>
                <Link to="/login">Login</Link>
            </nav>
            <Routes>
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/" element={<h2>Silakan daftar atau login</h2>} />
            </Routes>
        </Router>
    );
};

export default App;
