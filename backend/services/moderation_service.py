from db.connection import db
from models.moderation import ModerationQueue
from models.review import Review
from models.review_flag import ReviewFlag
from models.review_analysis import ReviewAnalysis


def get_moderation_queue():
    """Get all pending moderation items with review details."""
    items = (
        db.session.query(ModerationQueue, Review, ReviewFlag, ReviewAnalysis)
        .join(Review, ModerationQueue.review_id == Review.review_id)
        .outerjoin(ReviewFlag, Review.review_id == ReviewFlag.review_id)
        .outerjoin(ReviewAnalysis, Review.review_id == ReviewAnalysis.review_id)
        .order_by(ModerationQueue.priority.desc(), ModerationQueue.created_at.asc())
        .all()
    )

    result = []
    for queue_item, review, flag, analysis in items:
        entry = queue_item.to_dict()
        entry['review'] = review.to_dict() if review else None
        entry['flag'] = flag.to_dict() if flag else None
        entry['analysis'] = analysis.to_dict() if analysis else None
        # Get author username
        if review and review.author:
            entry['username'] = review.author.username
        # Get product name
        if review and review.product:
            entry['product_name'] = review.product.product_name
        result.append(entry)

    return result


def approve_review(review_id, admin_user):
    """Approve a reviewed item — marks the review as published and resolves moderation."""
    review = Review.query.get(review_id)
    if not review:
        raise ValueError('Review not found')

    review.status = 'published'

    flag = ReviewFlag.query.filter_by(review_id=review_id).first()
    if flag:
        flag.reviewed_by_admin = True
        flag.resolution_status = 'approved'

    queue_item = ModerationQueue.query.filter_by(review_id=review_id).first()
    if queue_item:
        queue_item.status = 'resolved'
        queue_item.assigned_admin = admin_user.username

    db.session.commit()
    return {'message': 'Review approved'}


def reject_review(review_id, admin_user):
    """Reject a reviewed item — hides the review and resolves moderation."""
    review = Review.query.get(review_id)
    if not review:
        raise ValueError('Review not found')

    review.status = 'hidden'

    flag = ReviewFlag.query.filter_by(review_id=review_id).first()
    if flag:
        flag.reviewed_by_admin = True
        flag.resolution_status = 'rejected'

    queue_item = ModerationQueue.query.filter_by(review_id=review_id).first()
    if queue_item:
        queue_item.status = 'resolved'
        queue_item.assigned_admin = admin_user.username

    # Increment flagged_reviews on product
    if review.product:
        review.product.flagged_reviews = (review.product.flagged_reviews or 0) + 1

    db.session.commit()
    return {'message': 'Review rejected'}
