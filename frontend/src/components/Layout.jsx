import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { authAPI } from '../services/api'

function Layout({ children }) {
    const [user, setUser] = useState(null)
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [showRegisterModal, setShowRegisterModal] = useState(false)
    const [authForm, setAuthForm] = useState({
        email: '',
        password: '',
        name: ''
    })
    const location = useLocation()

    const navigationItems = [
        { name: 'Главная', path: '/' },
        { name: 'Фильмы', path: '/movies' },
        { name: 'Сериалы', path: '/series' }
    ]

    // Проверяем авторизацию при загрузке
    useEffect(() => {
        checkAuth()
    }, [])


    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token')
            if (token) {
                const response = await authAPI.getMe()
                setUser(response.data)
            }
        } catch (error) {
            localStorage.removeItem('token')
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        try {
            const response = await authAPI.login({
                email: authForm.email,
                password: authForm.password
            })

            localStorage.setItem('token', response.data.access_token)
            setUser(response.data)
            setShowLoginModal(false)
            setAuthForm({ email: '', password: '', name: '' })
        } catch (error) {
            alert(error.response?.data?.detail || 'Ошибка входа')
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        try {
            const response = await authAPI.register({
                email: authForm.email,
                password: authForm.password,
                name: authForm.name
            })

            localStorage.setItem('token', response.data.access_token)
            setUser(response.data)
            setShowRegisterModal(false)
            setAuthForm({ email: '', password: '', name: '' })
        } catch (error) {
            alert(error.response?.data?.detail || 'Ошибка регистрации')
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        setUser(null)
    }

    const handleAuthChange = (e) => {
        setAuthForm({
            ...authForm,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className="app">
            {/* ВАША ШАПКА С НАВИГАЦИЕЙ */}
            <header className="header">
                <div className="header-top">
                    <div className="container">
                        <div className="header-top-content">
                            <Link to="/" className="logo">
                                <span className="logo-icon">🎬</span>
                                <span className="logo-text">ЧТО ГЛЯНУТЬ?</span>
                            </Link>
                            <div className="header-actions">
                                <button className="search-btn">
                                    🔍 Поиск
                                </button>
                                {user ? (
                                    <div className="user-menu">
                                        <span className="user-greeting">👋 {user.name}</span>
                                        <button onClick={handleLogout} className="auth-btn">
                                            Выйти
                                        </button>
                                    </div>
                                ) : (
                                    <div className="auth-buttons">
                                        <button
                                            onClick={() => setShowLoginModal(true)}
                                            className="login-btn"
                                        >
                                            Войти
                                        </button>
                                        <button
                                            onClick={() => setShowRegisterModal(true)}
                                            className="register-btn"
                                        >
                                            Регистрация
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="header-bottom">
                    <div className="container">
                        <nav className="main-nav">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </header>

            {/* ОСНОВНОЙ КОНТЕНТ СТРАНИЦ */}
            <main>
                {children}
            </main>

            {/* ВАШ ФУТЕР */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-logo">
                            <span className="logo-icon">🎬</span>
                            <span className="logo-text">ЧТО ГЛЯНУТЬ?</span>
                        </div>
                        <div className="footer-links">
                            <a href="#">О компании</a>
                            <a href="#">Помощь</a>
                            <a href="#">Правила</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Модальное окно входа */}
            {showLoginModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Вход в аккаунт</h2>
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="close-btn"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleLogin} className="auth-form">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={authForm.email}
                                onChange={handleAuthChange}
                                required
                                className="form-input"
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Пароль"
                                value={authForm.password}
                                onChange={handleAuthChange}
                                required
                                className="form-input"
                            />
                            <button type="submit" className="submit-btn">
                                Войти
                            </button>
                        </form>
                        <p className="auth-switch">
                            Нет аккаунта?{' '}
                            <button
                                onClick={() => {
                                    setShowLoginModal(false)
                                    setShowRegisterModal(true)
                                }}
                                className="switch-btn"
                            >
                                Зарегистрироваться
                            </button>
                        </p>
                    </div>
                </div>
            )}

            {/* Модальное окно регистрации */}
            {showRegisterModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Регистрация</h2>
                            <button
                                onClick={() => setShowRegisterModal(false)}
                                className="close-btn"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleRegister} className="auth-form">
                            <input
                                type="text"
                                name="name"
                                placeholder="Имя"
                                value={authForm.name}
                                onChange={handleAuthChange}
                                required
                                className="form-input"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={authForm.email}
                                onChange={handleAuthChange}
                                required
                                className="form-input"
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Пароль"
                                value={authForm.password}
                                onChange={handleAuthChange}
                                required
                                className="form-input"
                            />
                            <button type="submit" className="submit-btn">
                                Зарегистрироваться
                            </button>
                        </form>
                        <p className="auth-switch">
                            Уже есть аккаунт?{' '}
                            <button
                                onClick={() => {
                                    setShowRegisterModal(false)
                                    setShowLoginModal(true)
                                }}
                                className="switch-btn"
                            >
                                Войти
                            </button>
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Layout