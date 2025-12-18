import React, { useState, useEffect } from 'react'
import { moviesAPI } from '../services/api'

function Movies() {
    const [movies, setMovies] = useState([])
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedGenre, setSelectedGenre] = useState('')

    // получение всех жанров для фильтра
    const allGenres = [...new Set(movies.flatMap(movie =>
        movie.genre?.split(',').map(g => g.trim()) || []
    ))]

    // загрузка фильмов
    useEffect(() => {
        loadMovies()
        loadFavorites()
    }, [])

    const loadMovies = async () => {
        try {
            setLoading(true)
            const response = await moviesAPI.getMovies()
            setMovies(response.data || [])
        } catch (error) {
            console.error('Ошибка загрузки фильмов:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadFavorites = async () => {
        try {
            const token = localStorage.getItem('access_token')
            if (token) {
                const response = await moviesAPI.getFavorites()
                setFavorites(response.data || [])
            }
        } catch (error) {
            console.error('Ошибка загрузки избранного:', error)
        }
    }

    // добавление в избранное
    const handleAddFavorite = async (movieId) => {
        try {
            await moviesAPI.addToFavorites(movieId)
            setFavorites([...favorites, { id: movieId }])
            alert('Фильм добавлен в избранное!')
        } catch (error) {
            alert(error.response?.data?.detail || 'Ошибка добавления в избранное')
        }
    }

    // удаление из избранного
    const handleRemoveFavorite = async (movieId) => {
        try {
            await moviesAPI.removeFromFavorites(movieId)
            setFavorites(favorites.filter(fav => fav.id !== movieId))
            alert('Фильм удален из избранного')
        } catch (error) {
            console.error('Ошибка удаления:', error)
        }
    }

    // проверка в избранном
    const isFavorite = (movieId) => {
        return favorites.some(fav => fav.id === movieId)
    }

    // фильтрация фильмов
    const filteredMovies = movies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            movie.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesGenre = !selectedGenre ||
            (movie.genre && movie.genre.toLowerCase().includes(selectedGenre.toLowerCase()))
        return matchesSearch && matchesGenre
    })

    if (loading) {
        return (
            <div className="movies-page">
                <div className="container">
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <h2>Загрузка фильмов...</h2>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="movies-page">
            <div className="container">
                <header className="movies-header">
                    <h1>🎬 Библиотека фильмов</h1>
                    <p>Найдите свой следующий любимый фильм</p>
                </header>

                {/* Фильтры и поиск */}
                <div className="movies-filters">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Поиск фильмов по названию, описанию..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button className="search-button">🔍</button>
                    </div>

                    <div className="filter-options">
                        <select
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="genre-select"
                        >
                            <option value="">Все жанры</option>
                            {allGenres.map(genre => (
                                <option key={genre} value={genre}>{genre}</option>
                            ))}
                        </select>

                        <button
                            onClick={() => {
                                setSearchTerm('')
                                setSelectedGenre('')
                            }}
                            className="clear-filters"
                        >
                            Сбросить фильтры
                        </button>
                    </div>
                </div>

                {/* статистика */}
                <div className="movies-stats">
                    <div className="stat-card">
                        <h3>Всего фильмов</h3>
                        <p className="stat-number">{movies.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>В избранном</h3>
                        <p className="stat-number">{favorites.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Показано</h3>
                        <p className="stat-number">{filteredMovies.length}</p>
                    </div>
                </div>

                {/* сетка фильмов */}
                <div className="movies-grid">
                    {filteredMovies.length === 0 ? (
                        <div className="no-results">
                            <h3>Фильмы не найдены</h3>
                            <p>Попробуйте изменить критерии поиска</p>
                        </div>
                    ) : (
                        filteredMovies.map(movie => (
                            <div key={movie.id} className="movie-card-large">
                                <div className="movie-image">
                                    <img
                                        src={movie.poster_url || '/placeholder.jpg'}
                                        alt={movie.title}
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1489599804159-036feb73fb1c?w=400&h=500&fit=crop'
                                        }}
                                    />
                                    <div className="movie-actions">
                                        {isFavorite(movie.id) ? (
                                            <button
                                                onClick={() => handleRemoveFavorite(movie.id)}
                                                className="favorite-btn active"
                                                title="Удалить из избранного"
                                            >
                                                ❤️
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleAddFavorite(movie.id)}
                                                className="favorite-btn"
                                                title="Добавить в избранное"
                                            >
                                                🤍
                                            </button>
                                        )}
                                    </div>
                                    <div className="movie-rating-badge">
                                        ⭐ {movie.rating || 'N/A'}
                                    </div>
                                </div>

                                <div className="movie-details">
                                    <h3 className="movie-title">{movie.title}</h3>
                                    <div className="movie-meta">
                                        <span className="movie-year">{movie.year}</span>
                                        <span className="movie-genre">{movie.genre}</span>
                                    </div>
                                    <p className="movie-description">
                                        {movie.description || 'Описание отсутствует'}
                                    </p>

                                    <div className="movie-info">
                                        <div className="info-item">
                                            <strong>Режиссер:</strong> {movie.director || 'Не указан'}
                                        </div>
                                        {movie.duration && (
                                            <div className="info-item">
                                                <strong>Длительность:</strong> {movie.duration} мин.
                                            </div>
                                        )}
                                        {movie.country && (
                                            <div className="info-item">
                                                <strong>Страна:</strong> {movie.country}
                                            </div>
                                        )}
                                    </div>

                                    <div className="movie-actions-bottom">
                                        <button className="watch-btn">
                                            👁️ Смотреть
                                        </button>
                                        <button className="details-btn">
                                            📖 Подробнее
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default Movies