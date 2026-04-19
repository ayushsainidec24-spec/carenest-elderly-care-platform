from fastapi import APIRouter
from app.schemas.user import UserCreate

router = APIRouter()

@router.post("/register")
def register(user: UserCreate):
    return {
        "email": user.email,
        "password": user.password
    }

@router.post("/signup")
def signup(user: UserCreate):
    return {
        "email": user.email,
        "password": user.password
    }