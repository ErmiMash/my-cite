# from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
# from sqlalchemy.orm import sessionmaker, declarative_base
# from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean
# from datetime import datetime
# import os
#
# # SQLite база данных
# DATABASE_URL = "sqlite+aiosqlite:///./kinopoisk.db"
#
# engine = create_async_engine(DATABASE_URL, echo=True)
# AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
#
# Base = declarative_base()
#
# # Таблица пользователей
# class User(Base):
#     __tablename__ = "users"
#
#     id = Column(Integer, primary_key=True, index=True)
#     email = Column(String, unique=True, index=True, nullable=False)
#     username = Column(String, nullable=False)
#     hashed_password = Column(String, nullable=False)
#     avatar_url = Column(String, default="")
#     created_at = Column(DateTime, default=datetime.utcnow)
#     is_active = Column(Boolean, default=True)
#
# # Таблица фильмов
# class Movie(Base):
#     __tablename__ = "movies"
#
#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String, nullable=False)
#     original_title = Column(String)
#     year = Column(Integer)
#     genre = Column(String)
#     rating = Column(Float, default=0.0)
#     description = Column(Text)
#     duration = Column(Integer)  # в минутах
#     poster_url = Column(String)
#     trailer_url = Column(String)
#     director = Column(String)
#     actors = Column(Text)  # JSON строка
#     country = Column(String)
#     created_at = Column(DateTime, default=datetime.utcnow)
#
# # Таблица сериалов
# class Series(Base):
#     __tablename__ = "series"
#
#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String, nullable=False)
#     year_start = Column(Integer)
#     year_end = Column(Integer)
#     genre = Column(String)
#     rating = Column(Float, default=0.0)
#     description = Column(Text)
#     seasons = Column(Integer)
#     episodes = Column(Integer)
#     poster_url = Column(String)
#     trailer_url = Column(String)
#     created_at = Column(DateTime, default=datetime.utcnow)
#
# # Просмотренные фильмы пользователями
# class WatchedMovie(Base):
#     __tablename__ = "watched_movies"
#
#     id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, ForeignKey("users.id"))
#     movie_id = Column(Integer, ForeignKey("movies.id"))
#     user_rating = Column(Float)  # оценка пользователя от 1 до 10
#     review = Column(Text)
#     watched_date = Column(DateTime, default=datetime.utcnow)
#     is_favorite = Column(Boolean, default=False)
#
# # Просмотренные сериалы пользователями
# class WatchedSeries(Base):
#     __tablename__ = "watched_series"
#
#     id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, ForeignKey("users.id"))
#     series_id = Column(Integer, ForeignKey("series.id"))
#     watched_seasons = Column(Integer, default=0)
#     user_rating = Column(Float)
#     review = Column(Text)
#     last_watched = Column(DateTime, default=datetime.utcnow)
#
# # Рецензии на фильмы
# class Review(Base):
#     __tablename__ = "reviews"
#
#     id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, ForeignKey("users.id"))
#     movie_id = Column(Integer, ForeignKey("movies.id"))
#     title = Column(String)
#     content = Column(Text)
#     rating = Column(Float)
#     likes = Column(Integer, default=0)
#     created_at = Column(DateTime, default=datetime.utcnow)
#
# # Избранное пользователей
# class Favorite(Base):
#     __tablename__ = "favorites"
#
#     id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, ForeignKey("users.id"))
#     movie_id = Column(Integer, ForeignKey("movies.id"), nullable=True)
#     series_id = Column(Integer, ForeignKey("series.id"), nullable=True)
#     added_at = Column(DateTime, default=datetime.utcnow)
#
# # Для создания таблиц
# async def create_tables():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)
#
# # Получить сессию базы данных
# async def get_db():
#     async with AsyncSessionLocal() as session:
#         try:
#             yield session
#         finally:
#             await session.close()


from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from models import Base

# SQLite база данных
DATABASE_URL = "sqlite+aiosqlite:///./kinopoisk.db"

# Создаем движок
engine = create_async_engine(DATABASE_URL, echo=True)

# Создаем фабрику сессий
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Функция для получения сессии
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Функция для создания таблиц
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)