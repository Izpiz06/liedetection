import hashlib
from db.connection import call_procedure, db
from models.review import Review
from models.review_vote import ReviewVote


def submit_review(user_id, product_id, review_text, rating,
                  verified_purchase, ip_address=None, device_type='web'):
    """
    Submit a review using the submit_review stored procedure.
    Returns the SP result containing review_id, trust_score, classification.
    """
    ip_hash = hashlib.sha256(
        (ip_address or 'unknown').encode()
    ).hexdigest()[:64] if ip_address else 'unknown'

    results = call_procedure('submit_review', [
        user_id,
        product_id,
        review_text,
        rating,
        1 if verified_purchase else 0,
        ip_hash,
        device_type
    ])

    if results:
        return results[0]
    return {'message': 'Review submitted'}


def report_review(review_id, user_id, reason):
    """
    Report a review using the report_review stored procedure.
    """
    call_procedure('report_review', [review_id, user_id, reason])
    return {'message': 'Review reported successfully'}


def vote_review(review_id, user_id, vote_type):
    """
    Cast a helpful/not_helpful vote on a review.
    Prevents duplicate votes via the unique constraint.
    """
    existing = ReviewVote.query.filter_by(
        review_id=review_id, user_id=user_id
    ).first()

    if existing:
        if existing.vote == vote_type:
            # Remove vote (toggle off)
            db.session.delete(existing)
            review = Review.query.get(review_id)
            if review and vote_type == 'helpful':
                review.helpful_votes = max(0, review.helpful_votes - 1)
            db.session.commit()
            return {'message': 'Vote removed', 'action': 'removed'}
        else:
            # Change vote
            old_vote = existing.vote
            existing.vote = vote_type
            review = Review.query.get(review_id)
            if review:
                if vote_type == 'helpful':
                    review.helpful_votes += 1
                elif old_vote == 'helpful':
                    review.helpful_votes = max(0, review.helpful_votes - 1)
            db.session.commit()
            return {'message': 'Vote updated', 'action': 'updated'}
    else:
        vote = ReviewVote(
            review_id=review_id, user_id=user_id, vote=vote_type
        )
        db.session.add(vote)
        review = Review.query.get(review_id)
        if review and vote_type == 'helpful':
            review.helpful_votes += 1
        db.session.commit()
        return {'message': 'Vote recorded', 'action': 'created'}
