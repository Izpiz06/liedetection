from db.connection import db
from datetime import datetime


class ReviewReport(db.Model):
    __tablename__ = 'review_reports'

    report_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    review_id = db.Column(
        db.Integer, db.ForeignKey('review.review_id'), nullable=False
    )
    reported_by = db.Column(
        db.Integer, db.ForeignKey('user.user_id'), nullable=False
    )
    reason = db.Column(db.String(255), nullable=False)
    status = db.Column(db.Enum('open', 'resolved'), default='open')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'report_id': self.report_id,
            'review_id': self.review_id,
            'reported_by': self.reported_by,
            'reason': self.reason,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
