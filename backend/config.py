from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str
    access_token: str
    token_type: str

class MovieResponse(BaseModel):
    id: int
    title: str
    year: Optional[int]
    genre: Optional[str]
    rating: Optional[str]
    description: Optional[str]
    image_url: Optional[str]