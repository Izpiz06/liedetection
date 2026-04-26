from flask import Blueprint
from utils.responses import success_response, error_response
from utils.decorators import admin_required
from services.moderation_service import (
    get_moderation_queue,
    approve_review,
    reject_review
)

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


@admin_bp.route('/moderation', methods=['GET'])
@admin_required
def moderation_queue(current_user):
    """Get the moderation queue with review details."""
    try:
        queue = get_moderation_queue()
        return success_response({'queue': queue})
    except Exception as e:
        return error_response(f'Failed to load moderation queue: {str(e)}', 500)


@admin_bp.route('/review/<int:review_id>/approve', methods=['POST'])
@admin_required
def approve(current_user, review_id):
    """Approve a review in the moderation queue."""
    try:
        result = approve_review(review_id, current_user)
        return success_response(result)
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(f'Failed to approve review: {str(e)}', 500)


@admin_bp.route('/review/<int:review_id>/reject', methods=['POST'])
@admin_required
def reject(current_user, review_id):
    """Reject a review in the moderation queue."""
    try:
        result = reject_review(review_id, current_user)
        return success_response(result)
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(f'Failed to reject review: {str(e)}', 500)
