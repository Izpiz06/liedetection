import os
from datetime import timedelta

class Config:
    """Application configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'reviewshield-secret-key-2026')
    JWT_SECRET = os.environ.get('JWT_SECRET', 'reviewshield-jwt-secret-2026')
    JWT_EXPIRY = timedelta(hours=24)

    # MySQL Database
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_PORT = int(os.environ.get('DB_PORT', 3306))
    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', 'tiger')
    DB_NAME = os.environ.get('DB_NAME', 'liedetection_backup')

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}"
        f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # CORS
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173').split(',')
