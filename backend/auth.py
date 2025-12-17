from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import hashlib
import secrets

from database import get_db
from models import User

# Настройки
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 дней

security = HTTPBearer()

# Функции для работы с паролями (SHA256 + salt)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверяет пароль"""
    try:
        # Разделяем соль и хеш
        salt, stored_hash = hashed_password.split('$')
        # Вычисляем хеш введенного пароля с той же солью
        calculated_hash = hashlib.sha256((plain_password + salt).encode()).hexdigest()
        # Безопасное сравнение
        return secrets.compare_digest(stored_hash, calculated_hash)
    except Exception as e:
        print(f"Ошибка верификации пароля: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Хеширует пароль с помощью SHA256 и соли"""
    salt = secrets.token_hex(16)  # 32 символа в hex
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}${password_hash}"

# Функции для работы с JWT
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})

    try:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    except Exception as e:
        print(f"Ошибка создания токена: {e}")
        raise

# Аутентификация пользователя
async def authenticate_user(db: AsyncSession, email: str, password: str):
    try:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user:
            print(f"Пользователь с email {email} не найден")
            return False

        if not verify_password(password, user.hashed_password):
            print(f"Неверный пароль для пользователя {email}")
            return False

        return user
    except Exception as e:
        print(f"Ошибка аутентификации: {e}")
        return False

# Получение текущего пользователя
async def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Неверные учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")

        if email is None:
            raise credentials_exception

        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if user is None:
            raise credentials_exception
        return user

    except JWTError as e:
        print(f"JWT ошибка: {e}")
        raise credentials_exception
    except Exception as e:
        print(f"Ошибка получения пользователя: {e}")
        raise credentials_exception