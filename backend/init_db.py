import asyncio
import json
from database import create_tables, engine, Base
from crud import create_movie
from schemas import MovieCreate

# Примерные данные для наполнения базы
sample_movies = [
    MovieCreate(
        title="Иллюзия обмана 3",
        year=2025,
        genre="Фантастика, Триллер",
        rating=8.1,
        description="Продолжение знаменитой франшизы об иллюзионистах.",
        duration=130,
        poster_url="/nysm3.jpg",
        director="Джон М. Чу",
        actors=["Джесси Айзенберг", "Марк Руффало", "Вуди Харрельсон"],
        country="США"
    ),
    MovieCreate(
        title="СКВОРЦОВЫ",
        year=2024,
        genre="Драма, Семейный",
        rating=9.0,
        description="История обычной семьи из провинциального города.",
        duration=115,
        poster_url="/scvortsovy.jpg",
        director="Анна Бавтрук",
        actors=["Анна Бавтрук", "Иван Иванов", "Мария Петрова"],
        country="Россия"
    ),
    # Добавьте больше фильмов по аналогии
]

async def init_database():
    # Создаем таблицы
    await create_tables()
    print("✅ Таблицы созданы")

    # Здесь можно добавить наполнение базы данными
    # async with AsyncSession(engine) as session:
    #     for movie_data in sample_movies:
    #         await create_movie(session, movie_data)
    # print("✅ Данные добавлены")

if __name__ == "__main__":
    asyncio.run(init_database())