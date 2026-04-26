from db.connection import db
from datetime import datetime


class ReviewFlag(db.Model):
    __tablename__ = 'review_flag'

    flag_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    review_id = db.Column(
        db.Integer, db.ForeignKey('review.review_id'), unique=True
    )
    confidence_score = db.Column(db.Numeric(5, 2))
    flag_reason = db.Column(db.String(255))
    classification = db.Column(
        db.Enum('genuine', 'suspicious', 'deceptive'), default='genuine'
    )
    severity = db.Column(
        db.Enum('low', 'medium', 'high'), default='medium'
    )
    rule_triggered = db.Column(db.String(100))
    reviewed_by_admin = db.Column(db.Boolean, default=False)
    resolution_status = db.Column(
        db.Enum('pending', 'approved', 'rejected'), default='pending'
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'flag_id': self.flag_id,
            'review_id': self.review_id,
            'confidence_score': float(self.confidence_score or 0),
            'flag_reason': self.flag_reason,
            'classification': self.classification,
            'severity': self.severity,
            'rule_triggered': self.rule_triggered,
            'reviewed_by_admin': bool(self.reviewed_by_admin),
            'resolution_status': self.resolution_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
