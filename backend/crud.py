from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from datetime import datetime
from typing import List, Optional
import json

from database import User, Movie, Series, WatchedMovie, Review, Favorite
from schemas import UserCreate, MovieCreate, ReviewCreate

# Пользователи
async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

async def create_user(db: AsyncSession, user: UserCreate, hashed_password: str) -> User:
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()

# Фильмы
async def get_movies(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Movie]:
    result = await db.execute(
        select(Movie)
        .order_by(Movie.rating.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_movie_by_id(db: AsyncSession, movie_id: int) -> Optional[Movie]:
    result = await db.execute(select(Movie).where(Movie.id == movie_id))
    return result.scalar_one_or_none()

async def search_movies(db: AsyncSession, query: str) -> List[Movie]:
    result = await db.execute(
        select(Movie).where(
            or_(
                Movie.title.ilike(f"%{query}%"),
                Movie.description.ilike(f"%{query}%"),
                Movie.director.ilike(f"%{query}%"),
                Movie.actors.ilike(f"%{query}%")
            )
        ).limit(20)
    )
    return result.scalars().all()

async def create_movie(db: AsyncSession, movie: MovieCreate) -> Movie:
    db_movie = Movie(
        title=movie.title,
        year=movie.year,
        genre=movie.genre,
        rating=movie.rating,
        description=movie.description,
        duration=movie.duration,
        poster_url=movie.poster_url,
        director=movie.director,
        actors=json.dumps(movie.actors),
        country=movie.country
    )
    db.add(db_movie)
    await db.commit()
    await db.refresh(db_movie)
    return db_movie

# Просмотренные фильмы
async def add_watched_movie(db: AsyncSession, user_id: int, movie_id: int, rating: float, review: str = None) -> WatchedMovie:
    watched = WatchedMovie(
        user_id=user_id,
        movie_id=movie_id,
        user_rating=rating,
        review=review
    )
    db.add(watched)
    await db.commit()
    await db.refresh(watched)
    return watched

async def get_watched_movies(db: AsyncSession, user_id: int) -> List[WatchedMovie]:
    result = await db.execute(
        select(WatchedMovie)
        .where(WatchedMovie.user_id == user_id)
        .order_by(WatchedMovie.watched_date.desc())
    )
    return result.scalars().all()

# Рецензии
async def create_review(db: AsyncSession, review: ReviewCreate, user_id: int) -> Review:
    db_review = Review(
        user_id=user_id,
        movie_id=review.movie_id,
        title=review.title,
        content=review.content,
        rating=review.rating
    )
    db.add(db_review)
    await db.commit()
    await db.refresh(db_review)
    return db_review

async def get_movie_reviews(db: AsyncSession, movie_id: int) -> List[Review]:
    result = await db.execute(
        select(Review)
        .where(Review.movie_id == movie_id)
        .order_by(Review.likes.desc())
    )
    return result.scalars().all()

async def like_review(db: AsyncSession, review_id: int) -> Review:
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if review:
        review.likes += 1
        await db.commit()
        await db.refresh(review)
    return review

# Избранное
async def add_to_favorites(db: AsyncSession, user_id: int, movie_id: int = None, series_id: int = None) -> Favorite:
    favorite = Favorite(
        user_id=user_id,
        movie_id=movie_id,
        series_id=series_id
    )
    db.add(favorite)
    await db.commit()
    await db.refresh(favorite)
    return favorite

async def get_user_favorites(db: AsyncSession, user_id: int) -> List[Favorite]:
    result = await db.execute(
        select(Favorite).where(Favorite.user_id == user_id)
    )
    return result.scalars().all()