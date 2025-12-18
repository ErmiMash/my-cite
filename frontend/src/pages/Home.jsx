import React, { useState } from 'react'

function Home() {
    const [activeTab, setActiveTab] = useState('movies')

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
        <div className="home-page">
            {/* Главный баннер */}
            <section className="hero-banner">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">Что глянуть в октябре</h1>
                        <p className="hero-subtitle">Новые сериалы, фильмы и эксклюзивы</p>
                        <button className="hero-button">Смотреть сейчас</button>
                    </div>
                </div>
            </section>

            {/* В курсе */}
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

            {/* Главные премьеры */}
            <section className="premieres-section">
                <div className="container">
                    <h2 className="section-title">Главные премьеры</h2>
                    <div className="movies-grid">
                        {featuredMovies.map(movie => (
                            <div key={movie.id} className="movie-card">
                                <div className="movie-poster">
                                    <div
                                        className="poster-image"
                                        style={{
                                            backgroundImage: `url(${movie.image})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}
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

            {/* Спец. раздел */}
            <section className="special-section">
                <div className="container">
                    <div className="special-content">
                        <h2>Полный гид по вселенной ведьмака</h2>
                        <p>Все сезоны, персонажи и скрытые детали</p>
                        <button className="special-button">Изучить вселенную</button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home