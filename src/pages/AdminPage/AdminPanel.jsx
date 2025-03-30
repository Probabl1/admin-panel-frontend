import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import axios from '../../shared/api/api';
import LoginForm from '../../features/auth/LoginForm';
import ServicesSection from "../../features/services/ServicesSection";

const AdminPanel = () => {
    const [activeSection, setActiveSection] = useState('services');
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    const checkAuth = async () => {
        try {
            const response = await axios.get('/admin/check-auth');
            setIsAuthenticated(response.data.isAuthenticated);
        } catch (err) {
            console.error('Ошибка проверки аутентификации:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('/admin/logout');
            setIsAuthenticated(false);
        } catch (err) {
            console.error('Ошибка выхода:', err);
        }
    };

    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }

    if (!isAuthenticated) {
        return <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    const renderContent = () => {
        if (activeSection === 'services') {
            return <ServicesSection />;
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="admin-panel">
            <header className="header">
                <div className="header-content">
                    {isMobile && (
                        <button className="menu-toggle" onClick={toggleSidebar}>
                            ☰
                        </button>
                    )}
                    <div className="header-title">
                        <h1>SITE NAME ADMIN PANEL</h1>
                    </div>
                    <div className="header-actions">
                        <button className="logout-button" onClick={handleLogout}>
                            Выйти
                        </button>
                    </div>
                </div>
            </header>
            <div className="content">
                <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <nav>
                        <ul>
                            <li
                                onClick={() => {
                                    setActiveSection('services');
                                    if (isMobile) setSidebarOpen(false);
                                }}
                                className={activeSection === 'services' ? 'active' : ''}
                            >
                                Список услуг
                            </li>
                        </ul>
                    </nav>
                </aside>
                <main className="main-content">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;