# schemas.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=72)

    @validator('password')
    def validate_and_truncate_password(cls, v):
        # Обрезаем пароль СРАЗУ при валидации
        if len(v) > 72:
            print(f"⚠️  Пароль обрезан с {len(v)} до 72 символов")
            v = v[:72]
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    access_token: Optional[str] = None
    token_type: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str