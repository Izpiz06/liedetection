from functools import wraps
from flask import request
import jwt
from config import Config
from models.user import User
from utils.responses import error_response


def jwt_required(f):
    """Decorator that requires a valid JWT token in the Authorization header."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return error_response('Authentication token is missing', 401)

        try:
            payload = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
            current_user = User.query.get(payload['user_id'])
            if not current_user:
                return error_response('User not found', 401)
            if current_user.account_status == 'banned':
                return error_response('Account has been banned', 403)
        except jwt.ExpiredSignatureError:
            return error_response('Token has expired', 401)
        except jwt.InvalidTokenError:
            return error_response('Invalid token', 401)

        return f(current_user, *args, **kwargs)
    return decorated


def admin_required(f):
    """Decorator that requires the user to have admin role."""
    @wraps(f)
    @jwt_required
    def decorated(current_user, *args, **kwargs):
        if current_user.role != 'admin':
            return error_response('Admin access required', 403)
        return f(current_user, *args, **kwargs)
    return decorated
