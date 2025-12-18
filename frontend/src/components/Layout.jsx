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
        username: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
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
            console.log('Пользователь не авторизован')
            localStorage.removeItem('token')
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const response = await authAPI.login({
                email: authForm.email,
                password: authForm.password
            })

            console.log('Ответ при входе:', response.data)

            localStorage.setItem('token', response.data.access_token)
            // Обратите внимание на структуру ответа
            setUser(response.data.user || {
                id: response.data.user?.id,
                email: response.data.user?.email,
                username: response.data.user?.username,
                name: response.data.user?.username
            })

            setShowLoginModal(false)
            setAuthForm({ email: '', password: '', username: '' })
            alert('Вход выполнен успешно!')

        } catch (error) {
            console.error('Ошибка входа:', error)
            const errorMessage = error.response?.data?.detail
                || error.response?.data?.message
                || 'Ошибка входа. Проверьте данные.'
            setError(errorMessage)
            alert(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        console.log('Начинаем регистрацию...', authForm)

        // Валидация
        if (!authForm.email || !authForm.password || !authForm.username) {
            setError('Все поля обязательны для заполнения')
            setIsLoading(false)
            return
        }

        if (authForm.password.length < 6) {
            setError('Пароль должен быть не менее 6 символов')
            setIsLoading(false)
            return
        }

        try {
            console.log('Отправляем запрос регистрации...')
            const response = await authAPI.register({
                email: authForm.email,
                password: authForm.password,
                username: authForm.username
            })

            console.log('Ответ сервера:', response.data)

            localStorage.setItem('token', response.data.access_token)

            // Устанавливаем пользователя в зависимости от структуры ответа
            const userData = response.data.user || response.data
            setUser({
                id: userData.id,
                email: userData.email,
                username: userData.username,
                name: userData.username || userData.name
            })

            setShowRegisterModal(false)
            setAuthForm({ email: '', password: '', username: '' })
            setError('')
            alert('Регистрация успешна!')

        } catch (error) {
            console.error('Полная ошибка регистрации:', error)
            console.error('Статус ошибки:', error.response?.status)
            console.error('Данные ошибки:', error.response?.data)

            const errorMessage = error.response?.data?.detail
                || error.response?.data?.message
                || error.message
                || 'Ошибка регистрации. Попробуйте еще раз.'

            setError(errorMessage)
            alert(`Ошибка: ${errorMessage}`)
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        setUser(null)
        alert('Вы вышли из системы')
    }

    const handleAuthChange = (e) => {
        setAuthForm({
            ...authForm,
            [e.target.name]: e.target.value
        })
        setError('') // Очищаем ошибку при изменении поля
    }

    const closeModals = () => {
        setShowLoginModal(false)
        setShowRegisterModal(false)
        setAuthForm({ email: '', password: '', username: '' })
        setError('')
    }

    return (
        <div className="app">
            {/* ШАПКА С НАВИГАЦИЕЙ */}
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
                                    <div className="user-menu-simple">
                                        <Link to={`/user/${user.username || user.name}`} className="user-link">
                                            <span className="user-avatar">👤</span>
                                            <span className="user-name">{user.username || user.name}</span>
                                        </Link>
                                        <button onClick={handleLogout} className="logout-btn">
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

            {/* ОСНОВНОЙ КОНТЕНТ */}
            <main>
                {children}
            </main>

            {/* ФУТЕР */}
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
                <div className="modal-overlay" onClick={closeModals}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Вход в аккаунт</h2>
                            <button
                                onClick={closeModals}
                                className="close-btn"
                                disabled={isLoading}
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
                                disabled={isLoading}
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Пароль"
                                value={authForm.password}
                                onChange={handleAuthChange}
                                required
                                className="form-input"
                                disabled={isLoading}
                            />
                            {error && <div className="error-message">{error}</div>}
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Загрузка...' : 'Войти'}
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
                                disabled={isLoading}
                            >
                                Зарегистрироваться
                            </button>
                        </p>
                    </div>
                </div>
            )}

            {/* Модальное окно регистрации */}
            {showRegisterModal && (
                <div className="modal-overlay" onClick={closeModals}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Регистрация</h2>
                            <button
                                onClick={closeModals}
                                className="close-btn"
                                disabled={isLoading}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleRegister} className="auth-form">
                            <input
                                type="text"
                                name="username"
                                placeholder="Имя пользователя"
                                value={authForm.username}
                                onChange={handleAuthChange}
                                required
                                minLength="3"
                                className="form-input"
                                disabled={isLoading}
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={authForm.email}
                                onChange={handleAuthChange}
                                required
                                className="form-input"
                                disabled={isLoading}
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Пароль (мин. 6 символов)"
                                value={authForm.password}
                                onChange={handleAuthChange}
                                required
                                minLength="6"
                                className="form-input"
                                disabled={isLoading}
                            />
                            {error && <div className="error-message">{error}</div>}
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
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
                                disabled={isLoading}
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