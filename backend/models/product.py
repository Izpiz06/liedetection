from db.connection import db
from datetime import datetime


class Product(db.Model):
    __tablename__ = 'product'

    product_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    brand = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=True)
    launch_date = db.Column(db.Date, nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=True)
    overall_trust_score = db.Column(db.Numeric(5, 2), default=50.00)
    authenticity_percent = db.Column(db.Numeric(5, 2), default=100.00)
    total_reviews = db.Column(db.Integer, default=0)
    flagged_reviews = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    reviews = db.relationship('Review', backref='product', lazy='dynamic')

    def to_dict(self):
        return {
            'product_id': self.product_id,
            'product_name': self.product_name,
            'category': self.category,
            'brand': self.brand,
            'description': self.description,
            'launch_date': self.launch_date.isoformat() if self.launch_date else None,
            'price': float(self.price) if self.price else None,
            'overall_trust_score': float(self.overall_trust_score or 0),
            'authenticity_percent': float(self.authenticity_percent or 0),
            'total_reviews': self.total_reviews,
            'flagged_reviews': self.flagged_reviews,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
