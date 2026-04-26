from db.connection import db
from datetime import datetime


class ReviewVote(db.Model):
    __tablename__ = 'review_votes'
    __table_args__ = (
        db.UniqueConstraint('review_id', 'user_id', name='uq_review_user_vote'),
    )

    vote_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    review_id = db.Column(
        db.Integer, db.ForeignKey('review.review_id'), nullable=False
    )
    user_id = db.Column(
        db.Integer, db.ForeignKey('user.user_id'), nullable=False
    )
    vote = db.Column(db.Enum('helpful', 'not_helpful'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'vote_id': self.vote_id,
            'review_id': self.review_id,
            'user_id': self.user_id,
            'vote': self.vote,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
