from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta
from sqlalchemy.future import select

from typing import List, Optional
from sqlalchemy import or_
from pydantic import BaseModel

from database import get_db, create_tables
from models import User, Movie, Favorite
from schemas import UserCreate, UserLogin
from auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

app = FastAPI(title="Кинопоиск API")

# Определяем Pydantic модели для ответов
class MovieResponse(BaseModel):
    id: int
    title: str
    year: int
    director: Optional[str] = None
    description: Optional[str] = None
    rating: Optional[float] = None
    genre: Optional[str] = None
    duration: Optional[int] = None
    poster_url: Optional[str] = None

    class Config:
        from_attributes = True  # Для работы с SQLAlchemy моделями

# Для создания фильма (если понадобится)
class MovieCreate(BaseModel):
    title: str
    year: int
    director: Optional[str] = None
    description: Optional[str] = None
    rating: Optional[float] = None
    genre: Optional[str] = None
    duration: Optional[int] = None
    poster_url: Optional[str] = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # ваш фронтенд
    allow_credentials=True,
    allow_methods=["*"],  # разрешить все методы
    allow_headers=["*"],  # разрешить все заголовки
    expose_headers=["*"],  # это важно для CORS!
)

# Создание таблиц при запуске
@app.on_event("startup")
async def startup_event():
    try:
        await create_tables()
        print("✅ Таблицы базы данных созданы успешно")
        # Добавим тестовые фильмы, если таблица пуста
        await add_test_movies()
    except Exception as e:
        print(f"⚠️  Ошибка при создании таблиц: {e}")

async def add_test_movies():
    """Добавление тестовых фильмов при запуске"""
    try:
        db = await anext(get_db())  # Получаем сессию

        # Проверяем, есть ли уже фильмы
        result = await db.execute(select(Movie))
        movies = result.scalars().all()

        if not movies:
            test_movies = [
                Movie(
                    title="Интерстеллар",
                    year=2014,
                    director="Кристофер Нолан",
                    description="Фантастический эпос о путешествии через червоточину",
                    rating=8.6,
                    genre="Фантастика, Драма, Приключения",
                    duration=169,
                    poster_url="https://example.com/interstellar.jpg"
                ),
                Movie(
                    title="Начало",
                    year=2010,
                    director="Кристофер Нолан",
                    description="Воровство через сны",
                    rating=8.8,
                    genre="Боевик, Фантастика, Триллер",
                    duration=148,
                    poster_url="https://example.com/inception.jpg"
                ),
                Movie(
                    title="Побег из Шоушенка",
                    year=1994,
                    director="Фрэнк Дарабонт",
                    description="История невиновного банкира в тюрьме",
                    rating=9.3,
                    genre="Драма",
                    duration=142,
                    poster_url="https://example.com/shawshank.jpg"
                ),
                Movie(
                    title="Крестный отец",
                    year=1972,
                    director="Фрэнсис Форд Коппола",
                    description="Эпическая история мафиозной семьи",
                    rating=9.2,
                    genre="Криминал, Драма",
                    duration=175,
                    poster_url="https://example.com/godfather.jpg"
                ),
                Movie(
                    title="Темный рыцарь",
                    year=2008,
                    director="Кристофер Нолан",
                    description="Бэтмен против Джокера",
                    rating=9.0,
                    genre="Боевик, Криминал, Драма",
                    duration=152,
                    poster_url="https://example.com/darkknight.jpg"
                )
            ]

            for movie in test_movies:
                db.add(movie)

            await db.commit()
            print("✅ Тестовые фильмы добавлены успешно")
    except Exception as e:
        print(f"⚠️  Ошибка при добавлении тестовых фильмов: {e}")

# Тестовый эндпоинт для проверки
@app.get("/")
async def root():
    return {"message": "Кинопоиск API работает!", "status": "ok"}

# Тестовый эндпоинт для проверки CORS
@app.get("/api/test")
async def test_endpoint():
    return {
        "message": "CORS работает!",
        "cors": "enabled",
        "timestamp": datetime.now().isoformat()
    }

# Регистрация пользователя
@app.post("/api/auth/register")
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Регистрация нового пользователя
    """
    try:
        print(f"🔵 [REGISTER] Получен запрос: email={user_data.email}, username={user_data.username}")

        # Проверяем, существует ли пользователь с таким email
        result = await db.execute(select(User).where(User.email == user_data.email))
        existing_user = result.scalar_one_or_none()

        if existing_user:
            print(f"🔴 [REGISTER] Пользователь с email {user_data.email} уже существует")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже существует"
            )

        # Проверяем, существует ли пользователь с таким username
        result = await db.execute(select(User).where(User.username == user_data.username))
        existing_username = result.scalar_one_or_none()

        if existing_username:
            print(f"🔴 [REGISTER] Пользователь с именем {user_data.username} уже существует")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким именем уже существует"
            )

        # Хешируем пароль
        hashed_password = get_password_hash(user_data.password)
        print(f"🟡 [REGISTER] Пароль захеширован")

        # Создаем нового пользователя
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password
        )

        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)

        print(f"🟢 [REGISTER] Пользователь создан: id={db_user.id}, email={db_user.email}")

        # Создаем токен доступа
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": db_user.email}, expires_delta=access_token_expires
        )

        print(f"🟢 [REGISTER] Токен создан")

        # Возвращаем ответ в формате, который ожидает фронтенд
        response_data = {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": db_user.id,
                "email": db_user.email,
                "username": db_user.username
            }
        }

        print(f"🟢 [REGISTER] Возвращаем ответ: {response_data}")
        return response_data

    except HTTPException:
        # Повторно выбрасываем HTTPException, чтобы FastAPI правильно обработал
        raise
    except Exception as e:
        print(f"🔴 [REGISTER] Критическая ошибка: {str(e)}")
        import traceback
        traceback.print_exc()  # Печатаем полный стек вызовов

        # Обработка ошибки длины пароля
        error_msg = str(e)
        if "password cannot be longer than 72 bytes" in error_msg:
            error_msg = "Пароль слишком длинный. Используйте пароль короче 72 символов."

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST if "password" in error_msg.lower() else status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg
        )

# Вход пользователя
@app.post("/api/auth/login")
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Аутентификация пользователя
    """
    try:
        print(f"🔵 [LOGIN] Попытка входа: email={user_data.email}")

        # Аутентифицируем пользователя
        user = await authenticate_user(db, user_data.email, user_data.password)
        if not user:
            print(f"🔴 [LOGIN] Неверные учетные данные для {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный email или пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )

        print(f"🟢 [LOGIN] Пользователь аутентифицирован: id={user.id}")

        # Создаем токен доступа
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )

        print(f"🟢 [LOGIN] Токен создан для пользователя {user.email}")

        # Возвращаем ответ
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"🔴 [LOGIN] Ошибка: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сервера при входе: {str(e)}"
        )

# Получение данных текущего пользователя
@app.get("/api/auth/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Получение информации о текущем пользователе
    """
    try:
        print(f"🔵 [ME] Запрос данных пользователя: id={current_user.id}, email={current_user.email}")

        return {
            "id": current_user.id,
            "email": current_user.email,
            "username": current_user.username
        }
    except Exception as e:
        print(f"🔴 [ME] Ошибка: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении данных пользователя: {str(e)}"
        )

# Эндпоинт OPTIONS для CORS (важно для браузера)
@app.options("/api/auth/{path:path}")
async def options_handler(path: str):
    """
    Обработчик OPTIONS запросов для CORS
    """
    return {
        "message": "CORS разрешен"
    }

# Эндпоинт для проверки здоровья
@app.get("/api/health")
async def health_check():
    """
    Проверка состояния сервера
    """
    from datetime import datetime
    return {
        "status": "healthy",
        "service": "kinopoisk-api",
        "timestamp": datetime.now().isoformat()
    }

# Получение всех фильмов
@app.get("/api/movies", response_model=List[MovieResponse])
async def get_movies(
        skip: int = 0,
        limit: int = 100,
        search: str = None,
        genre: str = None,
        db: AsyncSession = Depends(get_db)
):
    """
    Получение списка фильмов с возможностью поиска и фильтрации
    """
    try:
        query = select(Movie)

        if search:
            query = query.where(
                or_(
                    Movie.title.ilike(f"%{search}%"),
                    Movie.description.ilike(f"%{search}%"),
                    Movie.director.ilike(f"%{search}%")
                )
            )

        if genre:
            query = query.where(Movie.genre.ilike(f"%{genre}%"))

        query = query.order_by(Movie.rating.desc()).offset(skip).limit(limit)

        result = await db.execute(query)
        movies = result.scalars().all()

        print(f"🔵 [MOVIES] Возвращено {len(movies)} фильмов")
        return movies

    except Exception as e:
        print(f"🔴 [MOVIES] Ошибка: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении фильмов: {str(e)}"
        )

# Получение информации о конкретном фильме
@app.get("/api/movies/{movie_id}", response_model=MovieResponse)
async def get_movie(movie_id: int, db: AsyncSession = Depends(get_db)):
    """
    Получение информации о конкретном фильме по ID
    """
    try:
        result = await db.execute(select(Movie).where(Movie.id == movie_id))
        movie = result.scalar_one_or_none()

        if not movie:
            raise HTTPException(status_code=404, detail="Фильм не найден")

        return movie

    except HTTPException:
        raise
    except Exception as e:
        print(f"🔴 [MOVIE_DETAIL] Ошибка: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении информации о фильме: {str(e)}"
        )

# Добавление фильма в избранное
@app.post("/api/movies/{movie_id}/favorite")
async def add_to_favorites(
        movie_id: int,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Добавление фильма в избранное для текущего пользователя
    """
    try:
        # Проверяем существует ли фильм
        result = await db.execute(select(Movie).where(Movie.id == movie_id))
        movie = result.scalar_one_or_none()

        if not movie:
            raise HTTPException(status_code=404, detail="Фильм не найден")

        # Проверяем уже ли в избранном
        result = await db.execute(
            select(Favorite).where(
                Favorite.user_id == current_user.id,
                Favorite.movie_id == movie_id
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            raise HTTPException(status_code=400, detail="Фильм уже в избранном")

        # Добавляем в избранное
        favorite = Favorite(
            user_id=current_user.id,
            movie_id=movie_id
        )
        db.add(favorite)
        await db.commit()

        print(f"🟢 [FAVORITE] Фильм {movie_id} добавлен в избранное пользователем {current_user.id}")

        return {"message": "Фильм добавлен в избранное", "movie_id": movie_id}

    except HTTPException:
        raise
    except Exception as e:
        print(f"🔴 [ADD_FAVORITE] Ошибка: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при добавлении в избранное: {str(e)}"
        )

# Удаление из избранного
@app.delete("/api/movies/{movie_id}/favorite")
async def remove_from_favorites(
        movie_id: int,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Удаление фильма из избранного для текущего пользователя
    """
    try:
        result = await db.execute(
            select(Favorite).where(
                Favorite.user_id == current_user.id,
                Favorite.movie_id == movie_id
            )
        )
        favorite = result.scalar_one_or_none()

        if not favorite:
            raise HTTPException(status_code=404, detail="Фильм не найден в избранном")

        await db.delete(favorite)
        await db.commit()

        print(f"🟢 [UNFAVORITE] Фильм {movie_id} удален из избранного пользователем {current_user.id}")

        return {"message": "Фильм удален из избранного"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"🔴 [REMOVE_FAVORITE] Ошибка: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при удалении из избранного: {str(e)}"
        )

# Получение избранных фильмов пользователя
@app.get("/api/users/me/favorites", response_model=List[MovieResponse])
async def get_user_favorites(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Получение списка избранных фильмов текущего пользователя
    """
    try:
        result = await db.execute(
            select(Movie)
            .join(Favorite, Favorite.movie_id == Movie.id)
            .where(Favorite.user_id == current_user.id)
            .order_by(Favorite.added_at.desc())
        )
        movies = result.scalars().all()

        print(f"🟢 [FAVORITES] Для пользователя {current_user.id} найдено {len(movies)} избранных фильмов")
        return movies

    except Exception as e:
        print(f"🔴 [GET_FAVORITES] Ошибка: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении избранных фильмов: {str(e)}"
        )

# Проверка, добавлен ли фильм в избранное
@app.get("/api/movies/{movie_id}/is_favorite")
async def check_if_favorite(
        movie_id: int,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Проверка, добавлен ли фильм в избранное у текущего пользователя
    """
    try:
        result = await db.execute(
            select(Favorite).where(
                Favorite.user_id == current_user.id,
                Favorite.movie_id == movie_id
            )
        )
        favorite = result.scalar_one_or_none()

        return {"is_favorite": favorite is not None}

    except Exception as e:
        print(f"🔴 [CHECK_FAVORITE] Ошибка: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при проверке избранного: {str(e)}"
        )

# Создание нового фильма (административная функция)
@app.post("/api/movies", response_model=MovieResponse)
async def create_movie(
        movie_data: MovieCreate,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Создание нового фильма (требует аутентификации)
    """
    try:

        movie = Movie(**movie_data.dict())
        db.add(movie)
        await db.commit()
        await db.refresh(movie)

        print(f"🟢 [CREATE_MOVIE] Создан фильм: {movie.title} (ID: {movie.id})")

        return movie

    except Exception as e:
        print(f"🔴 [CREATE_MOVIE] Ошибка: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при создании фильма: {str(e)}"
        )