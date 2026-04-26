from flask import Blueprint, request
from services.auth_service import register_user, login_user
from utils.responses import success_response, error_response
from utils.decorators import jwt_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api')


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    data = request.get_json()
    if not data:
        return error_response('Request body is required', 400)

    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not username or len(username) < 3:
        return error_response('Username must be at least 3 characters', 400)
    if not email or '@' not in email:
        return error_response('Valid email is required', 400)
    if not password or len(password) < 6:
        return error_response('Password must be at least 6 characters', 400)

    try:
        user = register_user(username, email, password)
        return success_response(
            {'user': user.to_dict()},
            'Registration successful',
            201
        )
    except ValueError as e:
        return error_response(str(e), 409)
    except Exception as e:
        return error_response(f'Registration failed: {str(e)}', 500)


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate and return JWT token."""
    data = request.get_json()
    if not data:
        return error_response('Request body is required', 400)

    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return error_response('Email and password are required', 400)

    try:
        user, token = login_user(email, password)
        return success_response({
            'token': token,
            'user': user.to_dict()
        }, 'Login successful')
    except ValueError as e:
        return error_response(str(e), 401)
    except Exception as e:
        return error_response(f'Login failed: {str(e)}', 500)


@auth_bp.route('/logout', methods=['POST'])
@jwt_required
def logout(current_user):
    """Logout (client-side token removal)."""
    return success_response(message='Logout successful')


@auth_bp.route('/me', methods=['GET'])
@jwt_required
def me(current_user):
    """Get the current authenticated user's profile."""
    return success_response({'user': current_user.to_dict()})
