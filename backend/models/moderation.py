from db.connection import db
from datetime import datetime


class ModerationQueue(db.Model):
    __tablename__ = 'moderation_queue'

    queue_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    review_id = db.Column(
        db.Integer, db.ForeignKey('review.review_id'), unique=True
    )
    priority = db.Column(db.Integer, default=1)
    assigned_admin = db.Column(db.String(100), nullable=True)
    status = db.Column(
        db.Enum('pending', 'reviewing', 'resolved'), default='pending'
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    review_rel = db.relationship('Review', backref='moderation', uselist=False)

    def to_dict(self):
        return {
            'queue_id': self.queue_id,
            'review_id': self.review_id,
            'priority': self.priority,
            'assigned_admin': self.assigned_admin,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
