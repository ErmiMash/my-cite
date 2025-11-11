import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Базовый URL для API
const API_URL = 'http://localhost:5000/api';

function App() {
    const [user, setUser] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [authForm, setAuthForm] = useState({
        email: '',
        password: '',
        name: ''
    });

    // Проверяем авторизацию при загрузке
    useEffect(() => {
        checkAuth();
    }, []);

    // Проверка авторизации
    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await axios.get(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Ошибка проверки авторизации:', error);
            localStorage.removeItem('token');
        }
    };

    // Обработчик входа
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email: authForm.email,
                password: authForm.password
            });

            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
            setShowLoginModal(false);
            setAuthForm({ email: '', password: '', name: '' });
        } catch (error) {
            alert(error.response?.data?.message || 'Ошибка входа');
        }
    };

    // Обработчик регистрации
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                name: authForm.name,
                email: authForm.email,
                password: authForm.password
            });

            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
            setShowRegisterModal(false);
            setAuthForm({ email: '', password: '', name: '' });
        } catch (error) {
            alert(error.response?.data?.message || 'Ошибка регистрации');
        }
    };

    // Выход
    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const handleAuthChange = (e) => {
        setAuthForm({
            ...authForm,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="app">
            {/* Остальной код сайта... */}

            {/* Кнопки входа/регистрации в хедере */}
            <div className="header-actions">
                {user ? (
                    <div className="user-menu">
                        <span className="user-greeting">👋 Привет, {user.name}!</span>
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
                                    setShowLoginModal(false);
                                    setShowRegisterModal(true);
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
                                    setShowRegisterModal(false);
                                    setShowLoginModal(true);
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
    );
}

export default App;

function App() {
    const [activeTab, setActiveTab] = useState('movies')

    const navigationItems = [
        'Фильмы',
        'Сериалы',
        'Подписки',
        'Билеты'
    ]

    const featuredMovies = [
        {
            id: 1,
            title: 'Иллюзия обмана 3',
            year: 2025,
            genre: 'фантастика',
            rating: 8.1,
            actors: ['Марк Руффало', 'Джесси Айзенберг', 'Вуди Харрельсон', 'Дэйв Франко', 'Айла Фишер'],
            image: '/nysm3.jpg'
        },
        {
            id: 2,
            title: 'СКВОРЦОВЫ',
            year: '2020-2025',
            genre: 'повседневность',
            rating: '9.0',
            actors: ['Анна Бавтрук'],
            image: '/scvortsovy.jpg'
        },
        {
            id: 3,
            title: 'ЖИЗНЬ НА ВЕСАХ',
            year: '2025-2025',
            genre: 'драма',
            rating: '8.1',
            actors: ['Екатерина Ермакова'],
            image: '/ermakovaa.jpg'
        },
        {
            id: 4,
            title: 'НЕМЕЖУССТВЕННЫЙ ИНТЕЛЛЕКТ',
            year: 2025,
            genre: 'фантастика',
            rating: 7.5,
            actors: ['Фёдор Бондарчук', 'Милош Бикович'],
            image: '/ai.jpg'
        }
    ]

    const popularMovies = [
        { id: 1, title: 'Ведьмак', rating: 7.9, type: 'сериал' },
        { id: 2, title: 'Т-34', rating: 6.7, type: 'фильм' },
        { id: 3, title: 'Майор Гром', rating: 6.9, type: 'фильм' },
        { id: 4, title: 'Слово пацана', rating: 8.2, type: 'сериал' },
        { id: 5, title: 'Игра престолов', rating: 9.1, type: 'сериал' }
    ]

    return (
        <div className="app">
            {/* верхняя навигация */}
            <header className="header">
                <div className="header-top">
                    <div className="container">
                        <div className="header-top-content">
                            <div className="logo">
                                <span className="logo-icon">🎬</span>
                                <span className="logo-text">ЧТО ГЛЯНУТЬ?</span>
                            </div>

                            <div className="header-actions">
                                <button className="search-btn">
                                    🔍 Поиск
                                </button>
                                <button className="auth-btn">
                                    Войти
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="header-bottom">
                    <div className="container">
                        <nav className="main-nav">
                            {navigationItems.map((item, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className={`nav-item ${activeTab === item.toLowerCase() ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setActiveTab(item.toLowerCase())
                                    }}
                                >
                                    {item}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>
            </header>

            {/* главный баннер */}
            <section className="hero-banner">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">Что глянуть в октябре</h1>
                        <p className="hero-subtitle">Новые сериалы, фильмы и эксклюзивы</p>
                        <button className="hero-button">Смотреть сейчас</button>
                    </div>
                </div>
            </section>

            {/* в курсе */}
            <section className="focus-section">
                <div className="container">
                    <h2 className="section-title">В курсе</h2>
                    <div className="focus-grid">
                        <div className="focus-card large">
                            <div className="focus-content">
                                <h3>💔 Ивангай и Марьяна Ро расстались</h3>
                                <p>Самые важные новости 2016 года</p>
                            </div>
                        </div>
                        <div className="focus-card">
                            <div className="focus-content">
                                <h3>🎂 Ей уже 20</h3>
                                <p>Создатель сайта отмечает свой день рождения</p>
                            </div>
                        </div>
                        <div className="focus-card">
                            <div className="focus-content">
                                <h3>🤔 На что сходить в кино</h3>
                                <p>Лучшие премьеры месяца</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* главные премьеры */}
            <section className="premieres-section">
                <div className="container">
                    <h2 className="section-title">Главные премьеры</h2>
                    <div className="movies-grid">
                        {featuredMovies.map(movie => (
                            <div key={movie.id} className="movie-card">
                                <div className="movie-card">
                                    <div className="movie-poster">
                                        <div
                                            className="poster-image"
                                            style={{ backgroundImage: `url(${movie.image})` }}
                                        >
                                            <div className="movie-rating">
                                                {movie.rating}
                                            </div>
                                        </div>

                                        <div className="movie-info">
                                            <h3 className="movie-title">{movie.title}</h3>
                                            <p className="movie-year-genre">{movie.year}, {movie.genre}</p>
                                            <div className="movie-actors">
                                                {movie.actors.slice(0, 2).join(', ')}
                                            </div>

                                            {movie.id === 1 && (
                                                <div className="ticket-section">
                                                    <button className="ticket-btn">Билеты</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Популярное */}
            <section className="popular-section">
                <div className="container">
                    <h2 className="section-title">Популярное сейчас</h2>
                    <div className="popular-list">
                        {popularMovies.map(movie => (
                            <div key={movie.id} className="popular-item">
                                <div className="popular-rank">{movie.id}</div>
                                <div className="popular-info">
                                    <h4>{movie.title}</h4>
                                    <span className="popular-type">{movie.type}</span>
                                </div>
                                <div className="popular-rating">{movie.rating}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* спец. раздел */}
            <section className="special-section">
                <div className="container">
                    <div className="special-content">
                        <h2>Полный гид по вселенной ведьмака</h2>
                        <p>Все сезоны, персонажи и скрытые детали</p>
                        <button className="special-button">Изучить вселенную</button>
                    </div>
                </div>
            </section>

            {/* футер */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-logo">
                            <span className="logo-icon">🎬</span>
                            <span className="logo-text">ЧТО ГЛЯНУТЬ?</span>
                        </div>
                        <div className="footer-links">
                            <a href="#">О компании</a>
                            <a href="#">Вакансии</a>
                            <a href="#">Помощь</a>
                            <a href="#">Реклама</a>
                            <a href="#">Правила</a>
                        </div>
                        <div className="footer-copyright">
                            © 2025 Что глянуть? Все права защищены.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default App