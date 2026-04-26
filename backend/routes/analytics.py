from flask import Blueprint
from utils.responses import success_response, error_response
from services.analytics_service import (
    get_overview_stats,
    get_product_trust_data,
    get_top_reviewers,
    get_suspicious_reviews,
    get_review_overview,
    get_sentiment_trend,
    get_classification_distribution,
    get_trust_score_distribution,
)

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')


@analytics_bp.route('/overview', methods=['GET'])
def overview():
    """Dashboard overview stats: totals, averages, pending items."""
    try:
        stats = get_overview_stats()
        # Convert Decimal types to float for JSON serialization
        for key, val in stats.items():
            if hasattr(val, '__float__'):
                stats[key] = float(val)
        return success_response(stats)
    except Exception as e:
        return error_response(f'Failed to load analytics: {str(e)}', 500)


@analytics_bp.route('/products', methods=['GET'])
def products_analytics():
    """Product trust analytics from the product_trust view."""
    try:
        data = get_product_trust_data()
        # Convert Decimals
        for item in data:
            for key, val in item.items():
                if hasattr(val, '__float__'):
                    item[key] = float(val)
        return success_response(data)
    except Exception as e:
        return error_response(f'Failed to load product analytics: {str(e)}', 500)


@analytics_bp.route('/reviewers', methods=['GET'])
def reviewers_analytics():
    """Top reviewers leaderboard from the top_reviewers view."""
    try:
        data = get_top_reviewers()
        for item in data:
            for key, val in item.items():
                if hasattr(val, '__float__'):
                    item[key] = float(val)
        return success_response(data)
    except Exception as e:
        return error_response(f'Failed to load reviewer analytics: {str(e)}', 500)


@analytics_bp.route('/suspicious', methods=['GET'])
def suspicious():
    """Suspicious reviews feed from the suspicious_reviews view."""
    try:
        data = get_suspicious_reviews()
        for item in data:
            for key, val in item.items():
                if hasattr(val, '__float__'):
                    item[key] = float(val)
        return success_response(data)
    except Exception as e:
        return error_response(f'Failed to load suspicious reviews: {str(e)}', 500)


@analytics_bp.route('/reviews', methods=['GET'])
def all_reviews_overview():
    """Full review overview from the review_overview view."""
    try:
        data = get_review_overview()
        for item in data:
            for key, val in item.items():
                if hasattr(val, '__float__'):
                    item[key] = float(val)
        return success_response(data)
    except Exception as e:
        return error_response(f'Failed to load reviews overview: {str(e)}', 500)


@analytics_bp.route('/sentiment-trend', methods=['GET'])
def sentiment_trend():
    """Sentiment trend data for line charts."""
    try:
        data = get_sentiment_trend()
        for item in data:
            for key, val in item.items():
                if hasattr(val, '__float__'):
                    item[key] = float(val)
                elif hasattr(val, 'isoformat'):
                    item[key] = val.isoformat()
        return success_response(data)
    except Exception as e:
        return error_response(f'Failed to load sentiment trend: {str(e)}', 500)


@analytics_bp.route('/classification-distribution', methods=['GET'])
def classification_dist():
    """Classification distribution for pie charts."""
    try:
        data = get_classification_distribution()
        return success_response(data)
    except Exception as e:
        return error_response(f'Failed to load classification data: {str(e)}', 500)


@analytics_bp.route('/trust-distribution', methods=['GET'])
def trust_dist():
    """Trust score distribution in buckets."""
    try:
        data = get_trust_score_distribution()
        return success_response(data)
    except Exception as e:
        return error_response(f'Failed to load trust distribution: {str(e)}', 500)
