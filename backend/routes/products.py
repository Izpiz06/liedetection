from flask import Blueprint, request
from datetime import datetime
from models.product import Product
from models.review import Review
from models.user import User
from db.connection import db
from utils.responses import success_response, error_response
from utils.decorators import jwt_required

products_bp = Blueprint('products', __name__, url_prefix='/api/products')


@products_bp.route('', methods=['POST'])
@jwt_required
def create_product(current_user):
    """Create a new product listing."""
    data = request.get_json()
    if not data:
        return error_response('Request body is required', 400)

    product_name = data.get('product_name', '').strip()
    category = data.get('category', '').strip()
    brand = data.get('brand', '').strip() or None
    description = data.get('description', '').strip() or None
    product_link = data.get('product_link', '').strip() or None
    price = data.get('price')
    launch_date_str = data.get('launch_date', '').strip() or None

    if not product_name:
        return error_response('Product name is required', 400)
    if not category:
        return error_response('Category is required', 400)

    # Parse price
    if price is not None:
        try:
            price = float(price)
            if price < 0:
                return error_response('Price cannot be negative', 400)
        except (ValueError, TypeError):
            return error_response('Invalid price value', 400)

    # Parse launch date
    launch_date = None
    if launch_date_str:
        try:
            launch_date = datetime.strptime(launch_date_str, '%Y-%m-%d').date()
        except ValueError:
            return error_response('Invalid date format. Use YYYY-MM-DD', 400)

    try:
        product = Product(
            product_name=product_name,
            category=category,
            brand=brand,
            description=description,
            product_link=product_link,
            price=price,
            launch_date=launch_date,
        )
        db.session.add(product)
        db.session.commit()
        return success_response(
            {'product': product.to_dict()},
            'Product created successfully',
            201
        )
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to create product: {str(e)}', 500)


@products_bp.route('', methods=['GET'])
def get_products():
    """List products with optional search and category filter."""
    search = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = Product.query

    if search:
        query = query.filter(
            Product.product_name.ilike(f'%{search}%') |
            Product.brand.ilike(f'%{search}%')
        )
    if category:
        query = query.filter(Product.category == category)

    query = query.order_by(Product.overall_trust_score.desc())

    # Get all categories for filter options
    categories = [
        r[0] for r in
        Product.query.with_entities(Product.category).distinct().all()
    ]

    total = query.count()
    products = query.offset((page - 1) * per_page).limit(per_page).all()

    return success_response({
        'products': [p.to_dict() for p in products],
        'categories': categories,
        'total': total,
        'page': page,
        'per_page': per_page
    })


@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product with trust metrics."""
    product = Product.query.get(product_id)
    if not product:
        return error_response('Product not found', 404)
    return success_response({'product': product.to_dict()})


@products_bp.route('/<int:product_id>/reviews', methods=['GET'])
def get_product_reviews(product_id):
    """Get all reviews for a product with analysis data."""
    product = Product.query.get(product_id)
    if not product:
        return error_response('Product not found', 404)

    sort = request.args.get('sort', 'newest')
    query = Review.query.filter_by(product_id=product_id)

    if sort == 'newest':
        query = query.order_by(Review.created_at.desc())
    elif sort == 'oldest':
        query = query.order_by(Review.created_at.asc())
    elif sort == 'highest':
        query = query.order_by(Review.rating.desc())
    elif sort == 'lowest':
        query = query.order_by(Review.rating.asc())
    elif sort == 'helpful':
        query = query.order_by(Review.helpful_votes.desc())

    reviews = query.all()
    result = []
    for r in reviews:
        review_data = r.to_dict(include_analysis=True)
        author = User.query.get(r.user_id)
        if author:
            review_data['username'] = author.username
            review_data['user_credibility'] = float(author.credibility_score or 0)
        result.append(review_data)

    return success_response({
        'product': product.to_dict(),
        'reviews': result
    })
