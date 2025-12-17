from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from models import Base

# SQLite
DATABASE_URL = "sqlite+aiosqlite:///./kinopoisk.db"

# Или PostgreSQL:
# DATABASE_URL = "postgresql+asyncpg://user:password@localhost/kinopoisk"

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()