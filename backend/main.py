from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from database import get_db, engine, Base
from models import User, Movie
from auth import create_access_token, get_current_user, verify_password, get_password_hash
from schemas import UserCreate, UserLogin, UserResponse, MovieResponse

app = FastAPI(title="Кинопоиск API")

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создание таблиц
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Роуты аутентификации
@app.post("/api/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Проверяем существует ли пользователь
    existing_user = await User.get_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")

    # Создаем пользователя
    user = await User.create(db, user_data)
    access_token = create_access_token(data={"sub": user.email})

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.post("/api/auth/login", response_model=UserResponse)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await User.authenticate(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Неверный email или пароль")

    access_token = create_access_token(data={"sub": user.email})

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "access_token": access_token,
        "token_type": "bearer"
    }

# Защищенные роуты
@app.get("/api/user/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Роуты фильмов
@app.get("/api/movies", response_model=List[MovieResponse])
async def get_movies(db: AsyncSession = Depends(get_db)):
    return await Movie.get_all(db)

@app.post("/api/movies/{movie_id}/watched")
async def mark_movie_watched(
    movie_id: int,
    rating: int,
    review: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await current_user.add_watched_movie(db, movie_id, rating, review)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)