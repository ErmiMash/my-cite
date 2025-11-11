const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kinopoisk', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Модель пользователя
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    avatar: {
        type: String,
        default: ''
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    watchedMovies: [{
        movieId: Number,
        rating: Number,
        review: String,
        watchedDate: Date
    }],
    favorites: [Number]
});

const User = mongoose.model('User', UserSchema);

// Middleware для проверки JWT
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Токен отсутствует' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Пользователь не найден' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Неверный токен' });
    }
};

// Роуты аутентификации

// Регистрация
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Проверяем, существует ли пользователь
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        // Хешируем пароль
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Создаем пользователя
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        // Создаем JWT токен
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '30d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                joinDate: user.joinDate
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Находим пользователя
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Неверный email или пароль' });
        }

        // Проверяем пароль
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Неверный email или пароль' });
        }

        // Создаем JWT токен
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                joinDate: user.joinDate,
                watchedMovies: user.watchedMovies,
                favorites: user.favorites
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Получение данных пользователя
app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                joinDate: req.user.joinDate,
                watchedMovies: req.user.watchedMovies,
                favorites: req.user.favorites
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Добавление фильма в просмотренные
app.post('/api/user/watched', authMiddleware, async (req, res) => {
    try {
        const { movieId, rating, review } = req.body;

        const user = await User.findById(req.user._id);

        // Проверяем, есть ли уже такой фильм
        const existingMovieIndex = user.watchedMovies.findIndex(
            movie => movie.movieId === movieId
        );

        if (existingMovieIndex >= 0) {
            // Обновляем существующий
            user.watchedMovies[existingMovieIndex] = {
                movieId,
                rating,
                review,
                watchedDate: new Date()
            };
        } else {
            // Добавляем новый
            user.watchedMovies.push({
                movieId,
                rating,
                review,
                watchedDate: new Date()
            });
        }

        await user.save();
        res.json({ message: 'Фильм добавлен в просмотренные', watchedMovies: user.watchedMovies });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});