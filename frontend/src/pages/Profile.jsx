import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

function Profile() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isCurrentUser, setIsCurrentUser] = useState(false)
    const navigate = useNavigate()

    // получение username из URL
    const { username } = useParams()

    // загрузка данные пользователя
    useEffect(() => {
        fetchUserData()
    }, [username])

    const fetchUserData = async () => {
        try {
            setLoading(true)
            setError('')

            // получение текущего пользователя
            const token = localStorage.getItem('token')
            if (!token) {
                navigate('/')
                return
            }

            const currentUserResponse = await authAPI.getMe()
            const currentUser = currentUserResponse.data

            // проверка, это страница текущего пользователя или другого
            if (currentUser.username === username) {
                setIsCurrentUser(true)
                setUser(currentUser)
            } else {
                // показываем, что это другой пользователь
                setUser({
                    username: username,
                    email: 'hidden@example.com',
                    isCurrentUser: false
                })
            }

        } catch (error) {
            console.error('Ошибка загрузки профиля:', error)
            setError('Не удалось загрузить профиль')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/')
        window.location.reload() // обновление страницы для обновления Layout
    }

    if (loading) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Загрузка профиля...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="error-message">
                        <h2>Ошибка</h2>
                        <p>{error}</p>
                        <Link to="/" className="btn">На главную</Link>
                    </div>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="not-found">
                        <h2>Пользователь не найден</h2>
                        <p>Пользователь @{username} не существует</p>
                        <Link to="/" className="btn">На главную</Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <div className="avatar-placeholder">
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>

                    <div className="profile-info">
                        <h1 className="profile-username">
                            @{user.username}
                            {isCurrentUser && <span className="badge-you">Вы</span>}
                        </h1>

                        <p className="profile-email">
                            📧 {isCurrentUser ? user.email : 'Email скрыт'}
                        </p>

                        {user.createdAt && (
                            <p className="profile-joined">
                                📅 На сайте с {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                            </p>
                        )}
                    </div>

                    {isCurrentUser && (
                        <div className="profile-actions">
                            <button
                                onClick={handleLogout}
                                className="btn-logout"
                            >
                                Выйти
                            </button>
                        </div>
                    )}
                </div>

                <div className="profile-content">
                    {isCurrentUser ? (
                        // контент для текущего пользователя
                        <div className="profile-sections">
                            <div className="section">
                                <h2>📊 Ваша активность</h2>
                                <div className="stats">
                                    <div className="stat-item">
                                        <div className="stat-number">0</div>
                                        <div className="stat-label">Просмотрено фильмов</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-number">0</div>
                                        <div className="stat-label">Оставлено рецензий</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-number">0</div>
                                        <div className="stat-label">В избранном</div>
                                    </div>
                                </div>
                            </div>

                            <div className="section">
                                <h2>⚙️ Настройки аккаунта</h2>
                                <div className="settings">
                                    <button className="setting-btn" disabled>
                                        Изменить пароль
                                    </button>
                                    <button className="setting-btn" disabled>
                                        Изменить email
                                    </button>
                                    <button className="setting-btn" disabled>
                                        Уведомления
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // контент для просмотра чужого профиля
                        <div className="profile-sections">
                            <div className="section">
                                <h2>👤 Профиль пользователя</h2>
                                <p>Это страница пользователя @{username}</p>
                                <p>Здесь будет отображаться публичная информация о пользователе.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile