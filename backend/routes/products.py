from flask import Blueprint, request
from models.product import Product
from models.review import Review
from models.user import User
from utils.responses import success_response, error_response

products_bp = Blueprint('products', __name__, url_prefix='/api/products')


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
