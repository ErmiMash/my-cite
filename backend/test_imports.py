# test_imports.py
try:
    from schemas import UserCreate, UserLogin, UserResponse, Token
    print("✅ schemas импортированы успешно")
except ImportError as e:
    print(f"❌ Ошибка импорта schemas: {e}")

try:
    from auth import authenticate_user, create_access_token, get_current_user, get_password_hash
    print("✅ auth импортированы успешно")
except ImportError as e:
    print(f"❌ Ошибка импорта auth: {e}")

try:
    from models import User
    print("✅ models импортированы успешно")
except ImportError as e:
    print(f"❌ Ошибка импорта models: {e}")

try:
    from database import get_db, create_tables
    print("✅ database импортированы успешно")
except ImportError as e:
    print(f"❌ Ошибка импорта database: {e}")