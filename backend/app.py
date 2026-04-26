import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask
from flask_cors import CORS
from config import Config
from db.connection import db

# Import models so SQLAlchemy knows about them
from models.user import User
from models.product import Product
from models.review import Review
from models.review_analysis import ReviewAnalysis
from models.review_flag import ReviewFlag
from models.review_report import ReviewReport
from models.moderation import ModerationQueue
from models.review_vote import ReviewVote


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)

    # Register blueprints
    from routes.auth import auth_bp
    from routes.products import products_bp
    from routes.reviews import reviews_bp
    from routes.analytics import analytics_bp
    from routes.admin import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(reviews_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(admin_bp)

    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return {'success': False, 'message': 'Resource not found'}, 404

    @app.errorhandler(500)
    def server_error(e):
        return {'success': False, 'message': 'Internal server error'}, 500

    @app.errorhandler(405)
    def method_not_allowed(e):
        return {'success': False, 'message': 'Method not allowed'}, 405

    # Health check
    @app.route('/api/health', methods=['GET'])
    def health():
        return {'success': True, 'message': 'ReviewShield API is running'}

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
