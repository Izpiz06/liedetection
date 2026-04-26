from db.connection import db
from datetime import datetime


class Review(db.Model):
    __tablename__ = 'review'

    review_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.product_id'), nullable=False)
    review_text = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    verified_purchase = db.Column(db.Boolean, default=False)
    helpful_votes = db.Column(db.Integer, default=0)
    report_count = db.Column(db.Integer, default=0)
    language = db.Column(db.String(20), default='en')
    ip_hash = db.Column(db.String(255), nullable=True)
    device_type = db.Column(db.String(50), nullable=True)
    status = db.Column(
        db.Enum('published', 'flagged', 'hidden'), default='published'
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    analysis = db.relationship(
        'ReviewAnalysis', backref='review', uselist=False, lazy='joined'
    )
    flag = db.relationship(
        'ReviewFlag', backref='review', uselist=False, lazy='joined'
    )
    reports = db.relationship('ReviewReport', backref='review', lazy='dynamic')
    votes = db.relationship('ReviewVote', backref='review', lazy='dynamic')

    def to_dict(self, include_analysis=False):
        data = {
            'review_id': self.review_id,
            'user_id': self.user_id,
            'product_id': self.product_id,
            'review_text': self.review_text,
            'rating': self.rating,
            'verified_purchase': bool(self.verified_purchase),
            'helpful_votes': self.helpful_votes,
            'report_count': self.report_count,
            'language': self.language,
            'device_type': self.device_type,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_analysis:
            data['analysis'] = self.analysis.to_dict() if self.analysis else None
            data['flag'] = self.flag.to_dict() if self.flag else None
        return data
