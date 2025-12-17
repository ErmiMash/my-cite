# from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.sql import func
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy.future import select
# from passlib.context import CryptContext
# from typing import Optional
# import datetime
#
# Base = declarative_base()
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
#
# class User(Base):
#     __tablename__ = "users"
#
#     id = Column(Integer, primary_key=True, index=True)
#     email = Column(String, unique=True, index=True, nullable=False)
#     name = Column(String, nullable=False)
#     hashed_password = Column(String, nullable=False)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#
#     @classmethod
#     async def get_by_email(cls, db: AsyncSession, email: str) -> Optional['User']:
#         result = await db.execute(select(cls).where(cls.email == email))
#         return result.scalar_one_or_none()
#
#     @classmethod
#     async def create(cls, db: AsyncSession, user_data) -> 'User':
#         hashed_password = pwd_context.hash(user_data.password)
#         user = cls(
#             email=user_data.email,
#             name=user_data.name,
#             hashed_password=hashed_password
#         )
#         db.add(user)
#         await db.commit()
#         await db.refresh(user)
#         return user
#
#     @classmethod
#     async def authenticate(cls, db: AsyncSession, email: str, password: str) -> Optional['User']:
#         user = await cls.get_by_email(db, email)
#         if not user or not pwd_context.verify(password, user.hashed_password):
#             return None
#         return user
#
#     def verify_password(self, password: str) -> bool:
#         return pwd_context.verify(password, self.hashed_password)
#
# class Movie(Base):
#     __tablename__ = "movies"
#
#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String, nullable=False)
#     year = Column(Integer)
#     genre = Column(String)
#     rating = Column(String)
#     description = Column(Text)
#     image_url = Column(String)
#
#     @classmethod
#     async def get_all(cls, db: AsyncSession):
#         result = await db.execute(select(cls))
#         return result.scalars().all()
#
# class WatchedMovie(Base):
#     __tablename__ = "watched_movies"
#
#     id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, ForeignKey("users.id"))
#     movie_id = Column(Integer, ForeignKey("movies.id"))
#     rating = Column(Integer)
#     review = Column(Text)
#     watched_date = Column(DateTime(timezone=True), server_default=func.now())


from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<User {self.email}>"