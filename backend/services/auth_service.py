import jwt
import bcrypt
from datetime import datetime, timezone
from config import Config
from models.user import User
from db.connection import db


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def check_password(password: str, password_hash: str) -> bool:
    """Verify a password against its bcrypt hash."""
    try:
        return bcrypt.checkpw(
            password.encode('utf-8'),
            password_hash.encode('utf-8')
        )
    except Exception:
        return False


def generate_token(user: User) -> str:
    """Generate a JWT token for the given user."""
    payload = {
        'user_id': user.user_id,
        'username': user.username,
        'role': user.role or 'user',
        'exp': datetime.now(timezone.utc) + Config.JWT_EXPIRY,
        'iat': datetime.now(timezone.utc)
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')


def register_user(username: str, email: str, password: str) -> User:
    """Register a new user. Raises ValueError on conflict."""
    if User.query.filter_by(username=username).first():
        raise ValueError('Username already taken')
    if User.query.filter_by(email=email).first():
        raise ValueError('Email already registered')

    user = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
        role='user',
        credibility_score=50.00,
        verified_status=False,
        created_at=datetime.now(timezone.utc)
    )
    db.session.add(user)
    db.session.commit()
    return user


def login_user(email: str, password: str):
    """Authenticate a user. Returns (user, token) or raises ValueError."""
    user = User.query.filter_by(email=email).first()
    if not user:
        raise ValueError('Invalid email or password')
    if not check_password(password, user.password_hash):
        raise ValueError('Invalid email or password')
    if user.account_status == 'banned':
        raise ValueError('Account has been banned')

    user.last_active = datetime.now(timezone.utc)
    db.session.commit()

    token = generate_token(user)
    return user, token
