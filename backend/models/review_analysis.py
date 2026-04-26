from db.connection import db
from datetime import datetime


class ReviewAnalysis(db.Model):
    __tablename__ = 'review_analysis'

    analysis_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    review_id = db.Column(
        db.Integer, db.ForeignKey('review.review_id'), unique=True
    )
    sentiment_score = db.Column(db.Numeric(5, 2))
    toxicity_score = db.Column(db.Numeric(5, 2))
    duplicate_score = db.Column(db.Numeric(5, 2))
    anomaly_score = db.Column(db.Numeric(5, 2))
    trust_score = db.Column(db.Numeric(5, 2))
    explanation = db.Column(db.Text)
    model_version = db.Column(db.String(20))
    analyzed_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'analysis_id': self.analysis_id,
            'review_id': self.review_id,
            'sentiment_score': float(self.sentiment_score or 0),
            'toxicity_score': float(self.toxicity_score or 0),
            'duplicate_score': float(self.duplicate_score or 0),
            'anomaly_score': float(self.anomaly_score or 0),
            'trust_score': float(self.trust_score or 0),
            'explanation': self.explanation,
            'model_version': self.model_version,
            'analyzed_at': self.analyzed_at.isoformat() if self.analyzed_at else None,
        }
