from flask import jsonify


def success_response(data=None, message="Success", status=200):
    """Build a standardized success JSON response."""
    body = {'success': True, 'message': message}
    if data is not None:
        body['data'] = data
    return jsonify(body), status


def error_response(message="An error occurred", status=400, errors=None):
    """Build a standardized error JSON response."""
    body = {'success': False, 'message': message}
    if errors:
        body['errors'] = errors
    return jsonify(body), status
