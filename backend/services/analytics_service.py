from sqlalchemy import text
from db.connection import db


def get_overview_stats():
    """Get dashboard overview statistics."""
    result = db.session.execute(text("""
        SELECT
            (SELECT COUNT(*) FROM review) as total_reviews,
            (SELECT COUNT(*) FROM review WHERE status = 'flagged') as flagged_reviews,
            (SELECT COUNT(*) FROM review_flag WHERE classification IN ('suspicious', 'deceptive')) as suspicious_count,
            (SELECT AVG(trust_score) FROM review_analysis) as avg_trust_score,
            (SELECT COUNT(*) FROM user) as total_users,
            (SELECT COUNT(*) FROM product) as total_products,
            (SELECT COUNT(*) FROM moderation_queue WHERE status = 'pending') as pending_moderation
    """)).mappings().first()

    return dict(result) if result else {}


def get_product_trust_data():
    """Query the product_trust view for product analytics."""
    results = db.session.execute(text(
        "SELECT * FROM product_trust ORDER BY overall_trust_score DESC"
    )).mappings().all()
    return [dict(r) for r in results]


def get_top_reviewers():
    """Query the top_reviewers view for reviewer leaderboard."""
    results = db.session.execute(text(
        "SELECT * FROM top_reviewers LIMIT 20"
    )).mappings().all()
    return [dict(r) for r in results]


def get_suspicious_reviews():
    """Query the suspicious_reviews view."""
    results = db.session.execute(text(
        "SELECT * FROM suspicious_reviews ORDER BY trust_score ASC"
    )).mappings().all()
    return [dict(r) for r in results]


def get_review_overview():
    """Query the full review_overview view."""
    results = db.session.execute(text(
        "SELECT * FROM review_overview ORDER BY review_id DESC"
    )).mappings().all()
    return [dict(r) for r in results]


def get_sentiment_trend():
    """Get sentiment scores over time for trend charts."""
    results = db.session.execute(text("""
        SELECT
            DATE(r.created_at) as date,
            AVG(ra.sentiment_score) as avg_sentiment,
            AVG(ra.trust_score) as avg_trust,
            COUNT(*) as review_count
        FROM review r
        JOIN review_analysis ra ON r.review_id = ra.review_id
        GROUP BY DATE(r.created_at)
        ORDER BY date
    """)).mappings().all()
    return [dict(r) for r in results]


def get_classification_distribution():
    """Get distribution of review classifications for pie charts."""
    results = db.session.execute(text("""
        SELECT
            classification,
            COUNT(*) as count
        FROM review_flag
        GROUP BY classification
    """)).mappings().all()
    return [dict(r) for r in results]


def get_trust_score_distribution():
    """Get trust score distribution in buckets."""
    results = db.session.execute(text("""
        SELECT
            CASE
                WHEN trust_score >= 75 THEN '75-100 (Genuine)'
                WHEN trust_score >= 45 THEN '45-74 (Suspicious)'
                ELSE '0-44 (Deceptive)'
            END as bucket,
            COUNT(*) as count
        FROM review_analysis
        GROUP BY bucket
        ORDER BY bucket
    """)).mappings().all()
    return [dict(r) for r in results]
