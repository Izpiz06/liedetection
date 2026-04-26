from db.connection import db
from datetime import datetime


class User(db.Model):
    __tablename__ = 'user'

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('user', 'admin'), default='user')
    credibility_score = db.Column(db.Numeric(5, 2), default=50.00)
    verified_status = db.Column(db.Boolean, default=False)
    report_count = db.Column(db.Integer, default=0)
    review_count = db.Column(db.Integer, default=0)
    account_status = db.Column(
        db.Enum('active', 'watchlist', 'banned'), default='active'
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_active = db.Column(db.DateTime, nullable=True)

    reviews = db.relationship('Review', backref='author', lazy='dynamic')
    reports_made = db.relationship('ReviewReport', backref='reporter', lazy='dynamic')
    votes = db.relationship('ReviewVote', backref='voter', lazy='dynamic')

    def to_dict(self, include_private=False):
        data = {
            'user_id': self.user_id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'credibility_score': float(self.credibility_score or 0),
            'verified_status': bool(self.verified_status),
            'report_count': self.report_count,
            'review_count': self.review_count,
            'account_status': self.account_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_active': self.last_active.isoformat() if self.last_active else None,
        }
        return data
