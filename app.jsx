// import React, { useState } from 'react';
// import './App.css';
//
// function App() {
//     const [activeSection, setActiveSection] = useState('home');
//
//     return (
//         <div className="App">
//             {/* Навигация */}
//             <nav className="navbar">
//                 <div className="nav-container">
//                     <div className="logo">
//                         <h2>Мой Сайт</h2>
//                     </div>
//                     <ul className="nav-menu">
//                         <li className="nav-item">
//                             <a
//                                 href="#home"
//                                 className={activeSection === 'home' ? 'nav-link active' : 'nav-link'}
//                                 onClick={() => setActiveSection('home')}
//                             >
//                                 Главная
//                             </a>
//                         </li>
//                         <li className="nav-item">
//                             <a
//                                 href="#about"
//                                 className={activeSection === 'about' ? 'nav-link active' : 'nav-link'}
//                                 onClick={() => setActiveSection('about')}
//                             >
//                                 Обо мне
//                             </a>
//                         </li>
//                         <li className="nav-item">
//                             <a
//                                 href="#portfolio"
//                                 className={activeSection === 'portfolio' ? 'nav-link active' : 'nav-link'}
//                                 onClick={() => setActiveSection('portfolio')}
//                             >
//                                 Портфолио
//                             </a>
//                         </li>
//                         <li className="nav-item">
//                             <a
//                                 href="#contact"
//                                 className={activeSection === 'contact' ? 'nav-link active' : 'nav-link'}
//                                 onClick={() => setActiveSection('contact')}
//                             >
//                                 Контакты
//                             </a>
//                         </li>
//                     </ul>
//                 </div>
//             </nav>
//
//             {/* Главная секция */}
//             <section id="home" className="hero-section">
//                 <div className="hero-content">
//                     <h1>Привет, я Иван Иванов</h1>
//                     <p>Frontend разработчик и дизайнер</p>
//                     <button className="cta-button">Узнать больше</button>
//                 </div>
//                 <div className="hero-image">
//                     <div className="avatar-placeholder">
//                         <span>Фото</span>
//                     </div>
//                 </div>
//             </section>
//
//             {/* Обо мне */}
//             <section id="about" className="about-section">
//                 <div className="container">
//                     <h2>Обо мне</h2>
//                     <div className="about-content">
//                         <div className="about-text">
//                             <p>
//                                 Я веб-разработчик с 3-летним опытом создания современных
//                                 и отзывчивых веб-приложений. Специализируюсь на React,
//                                 JavaScript и современных фронтенд технологиях.
//                             </p>
//                             <div className="skills">
//                                 <h3>Навыки</h3>
//                                 <div className="skill-tags">
//                                     <span className="skill-tag">React</span>
//                                     <span className="skill-tag">JavaScript</span>
//                                     <span className="skill-tag">HTML/CSS</span>
//                                     <span className="skill-tag">Node.js</span>
//                                     <span className="skill-tag">Git</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>
//
//             {/* Портфолио */}
//             <section id="portfolio" className="portfolio-section">
//                 <div className="container">
//                     <h2>Мои работы</h2>
//                     <div className="portfolio-grid">
//                         <div className="portfolio-item">
//                             <div className="portfolio-image">
//                                 <div className="image-placeholder">Проект 1</div>
//                             </div>
//                             <h3>Интернет-магазин</h3>
//                             <p>React приложение для онлайн-продаж</p>
//                         </div>
//                         <div className="portfolio-item">
//                             <div className="portfolio-image">
//                                 <div className="image-placeholder">Проект 2</div>
//                             </div>
//                             <h3>Корпоративный сайт</h3>
//                             <p>Сайт для бизнеса с адаптивным дизайном</p>
//                         </div>
//                         <div className="portfolio-item">
//                             <div className="portfolio-image">
//                                 <div className="image-placeholder">Проект 3</div>
//                             </div>
//                             <h3>Веб-приложение</h3>
//                             <p>SPA с использованием современных технологий</p>
//                         </div>
//                     </div>
//                 </div>
//             </section>
//
//             {/* Контакты */}
//             <section id="contact" className="contact-section">
//                 <div className="container">
//                     <h2>Свяжитесь со мной</h2>
//                     <div className="contact-content">
//                         <div className="contact-info">
//                             <div className="contact-item">
//                                 <strong>Email:</strong> example@email.com
//                             </div>
//                             <div className="contact-item">
//                                 <strong>Телефон:</strong> +7 (999) 999-99-99
//                             </div>
//                             <div className="contact-item">
//                                 <strong>Город:</strong> Москва
//                             </div>
//                         </div>
//                         <form className="contact-form">
//                             <input
//                                 type="text"
//                                 placeholder="Ваше имя"
//                                 className="form-input"
//                             />
//                             <input
//                                 type="email"
//                                 placeholder="Ваш email"
//                                 className="form-input"
//                             />
//                             <textarea
//                                 placeholder="Ваше сообщение"
//                                 rows="5"
//                                 className="form-textarea"
//                             ></textarea>
//                             <button type="submit" className="submit-button">
//                                 Отправить сообщение
//                             </button>
//                         </form>
//                     </div>
//                 </div>
//             </section>
//
//             {/* Футер */}
//             <footer className="footer">
//                 <div className="container">
//                     <p>&copy; 2024 Мой Сайт. Все права защищены.</p>
//                     <div className="social-links">
//                         <a href="#" className="social-link">GitHub</a>
//                         <a href="#" className="social-link">LinkedIn</a>
//                         <a href="#" className="social-link">Telegram</a>
//                     </div>
//                 </div>
//             </footer>
//         </div>
//     );
// }
//
// export default App;