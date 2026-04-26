from flask import Blueprint, request
from models.review import Review
from models.user import User
from utils.responses import success_response, error_response
from utils.decorators import jwt_required
from services.review_service import submit_review, report_review, vote_review

reviews_bp = Blueprint('reviews', __name__, url_prefix='/api/reviews')


@reviews_bp.route('/create', methods=['POST'])
@jwt_required
def create_review(current_user):
    """Submit a new review using the submit_review stored procedure."""
    data = request.get_json()
    if not data:
        return error_response('Request body is required', 400)

    product_id = data.get('product_id')
    review_text = data.get('review_text', '').strip()
    rating = data.get('rating')
    verified_purchase = data.get('verified_purchase', False)
    device_type = data.get('device_type', 'web')

    if not product_id:
        return error_response('product_id is required', 400)
    if not review_text or len(review_text) < 10:
        return error_response('Review text must be at least 10 characters', 400)
    if not rating or rating not in [1, 2, 3, 4, 5]:
        return error_response('Rating must be between 1 and 5', 400)

    try:
        result = submit_review(
            user_id=current_user.user_id,
            product_id=product_id,
            review_text=review_text,
            rating=rating,
            verified_purchase=verified_purchase,
            ip_address=request.remote_addr,
            device_type=device_type
        )
        return success_response(result, 'Review submitted successfully', 201)
    except Exception as e:
        return error_response(f'Failed to submit review: {str(e)}', 500)


@reviews_bp.route('/<int:review_id>', methods=['GET'])
def get_review(review_id):
    """Get a single review with full analysis and flag data."""
    review = Review.query.get(review_id)
    if not review:
        return error_response('Review not found', 404)

    review_data = review.to_dict(include_analysis=True)

    # Attach author info
    author = User.query.get(review.user_id)
    if author:
        review_data['username'] = author.username
        review_data['user_credibility'] = float(author.credibility_score or 0)
        review_data['user_verified'] = bool(author.verified_status)

    # Attach product info
    if review.product:
        review_data['product_name'] = review.product.product_name
        review_data['product_category'] = review.product.category

    # Vote counts
    from models.review_vote import ReviewVote
    helpful = ReviewVote.query.filter_by(
        review_id=review_id, vote='helpful'
    ).count()
    not_helpful = ReviewVote.query.filter_by(
        review_id=review_id, vote='not_helpful'
    ).count()
    review_data['votes'] = {
        'helpful': helpful,
        'not_helpful': not_helpful
    }

    return success_response({'review': review_data})


@reviews_bp.route('/<int:review_id>/report', methods=['POST'])
@jwt_required
def create_report(current_user, review_id):
    """Report a suspicious review using the report_review stored procedure."""
    data = request.get_json()
    if not data:
        return error_response('Request body is required', 400)

    reason = data.get('reason', '').strip()
    if not reason:
        return error_response('Reason is required', 400)

    try:
        result = report_review(review_id, current_user.user_id, reason)
        return success_response(result, 'Review reported')
    except Exception as e:
        return error_response(f'Failed to report review: {str(e)}', 500)


@reviews_bp.route('/<int:review_id>/vote', methods=['POST'])
@jwt_required
def cast_vote(current_user, review_id):
    """Cast a helpful/not_helpful vote on a review."""
    data = request.get_json()
    if not data:
        return error_response('Request body is required', 400)

    vote_type = data.get('vote')
    if vote_type not in ['helpful', 'not_helpful']:
        return error_response('Vote must be "helpful" or "not_helpful"', 400)

    try:
        result = vote_review(review_id, current_user.user_id, vote_type)
        return success_response(result)
    except Exception as e:
        return error_response(f'Failed to vote: {str(e)}', 500)
