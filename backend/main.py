from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta
from sqlalchemy.future import select

from database import get_db, create_tables
from models import User
from schemas import UserCreate, UserLogin
from auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

app = FastAPI(title="Кинопоиск API")

# ВАЖНО: CORS настройки должны быть ПЕРВЫМИ
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
    except Exception as e:
        print(f"⚠️  Ошибка при создании таблиц: {e}")

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
        "timestamp": "текущее время"
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
    return {
        "status": "healthy",
        "service": "kinopoisk-api",
        "timestamp": "текущее время"
    }