"""
Seed script for ReviewShield AI.
Populates the liedetection_backup database with realistic test data
using the submit_review stored procedure to maintain data integrity.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import random
from datetime import datetime, timedelta, timezone
from app import create_app
from db.connection import db, call_procedure, get_raw_connection
from services.auth_service import hash_password
from models.user import User
from models.product import Product

app = create_app()

# --- Seed Data ---

USERS = [
    ('admin', 'admin@reviewshield.ai', 'admin123', 'admin', 85.0, True),
    ('priya_sharma', 'priya@gmail.com', 'pass123', 'user', 72.5, True),
    ('john_doe', 'john@gmail.com', 'pass123', 'user', 68.0, True),
    ('sarah_tech', 'sarah@outlook.com', 'pass123', 'user', 90.0, True),
    ('mike_reviews', 'mike@yahoo.com', 'pass123', 'user', 45.0, False),
    ('deepak_v', 'deepak@gmail.com', 'pass123', 'user', 82.0, True),
    ('emily_jones', 'emily@gmail.com', 'pass123', 'user', 15.0, False),
    ('alex_smith', 'alex@outlook.com', 'pass123', 'user', 55.0, True),
    ('neha_kapoor', 'neha@gmail.com', 'pass123', 'user', 78.0, True),
    ('ryan_blogger', 'ryan@blog.com', 'pass123', 'user', 33.0, False),
    ('lisa_m', 'lisa@gmail.com', 'pass123', 'user', 88.0, True),
    ('arjun_tech', 'arjun@tech.com', 'pass123', 'user', 62.0, True),
    ('fake_reviewer', 'fakeguy@temp.com', 'pass123', 'user', 8.0, False),
    ('maya_desai', 'maya@gmail.com', 'pass123', 'user', 75.0, True),
    ('bot_account', 'bot@spam.net', 'pass123', 'user', 5.0, False),
    ('raj_patel', 'raj@gmail.com', 'pass123', 'user', 70.0, True),
    ('claire_b', 'claire@yahoo.com', 'pass123', 'user', 60.0, True),
    ('spam_king', 'spam@fake.com', 'pass123', 'user', 3.0, False),
    ('anita_roy', 'anita@gmail.com', 'pass123', 'user', 80.0, True),
    ('david_w', 'david@outlook.com', 'pass123', 'user', 52.0, True),
]

PRODUCTS = [
    ('MacBook Pro 16"', 'Laptop', 'Apple', 'M3 Max chip, 36GB RAM, 1TB SSD', '2024-11-01', 249999.00),
    ('iPhone 15 Pro Max', 'Phone', 'Apple', 'A17 Pro chip, Titanium design', '2024-09-22', 159999.00),
    ('Galaxy S24 Ultra', 'Phone', 'Samsung', 'Snapdragon 8 Gen 3, S Pen', '2024-01-17', 134999.00),
    ('Sony WH-1000XM5', 'Headphones', 'Sony', 'Industry-leading noise canceling', '2023-05-12', 29999.00),
    ('Dell XPS 15', 'Laptop', 'Dell', 'Intel i9, 32GB RAM, OLED display', '2024-03-15', 189999.00),
    ('OnePlus 12', 'Phone', 'OnePlus', 'Snapdragon 8 Gen 3, Hasselblad camera', '2024-01-23', 64999.00),
    ('AirPods Pro 2', 'Audio', 'Apple', 'H2 chip, adaptive audio', '2023-09-12', 24999.00),
    ('Samsung Galaxy Watch 6', 'Wearable', 'Samsung', 'BioActive sensor, Wear OS', '2023-07-26', 32999.00),
    ('iPad Pro 12.9"', 'Tablet', 'Apple', 'M2 chip, Liquid Retina XDR', '2023-10-30', 112999.00),
    ('Bose QuietComfort Ultra', 'Headphones', 'Bose', 'Spatial audio, immersive sound', '2023-10-03', 35999.00),
    ('Google Pixel 8 Pro', 'Phone', 'Google', 'Tensor G3, AI camera features', '2023-10-12', 106999.00),
    ('Dyson V15 Detect', 'Home', 'Dyson', 'Laser dust detection vacuum', '2023-03-01', 62999.00),
    ('Nintendo Switch OLED', 'Gaming', 'Nintendo', '7-inch OLED screen', '2021-10-08', 34999.00),
    ('Sony PlayStation 5', 'Gaming', 'Sony', 'DualSense controller, 825GB SSD', '2020-11-12', 49999.00),
    ('LG C3 65" OLED TV', 'TV', 'LG', '4K OLED evo, webOS 23', '2023-03-20', 164999.00),
]

GENUINE_REVIEWS = [
    "Absolutely love this {product}! The build quality is exceptional and it performs flawlessly.",
    "Great value for money. The {product} exceeded my expectations in every way.",
    "I've been using the {product} for 3 months and it's been rock solid. Highly recommend.",
    "The {product} has a few minor issues but overall it's a solid purchase. Battery life is great.",
    "Decent product. The {product} does what it claims. Camera quality could be better though.",
    "After extensive research, I chose the {product} and I'm glad I did. Premium feel throughout.",
    "The {product} arrived well-packaged. Setup was easy. Performance is top-notch.",
    "Really impressed with the {product}. The display quality is stunning and speakers are loud.",
    "Good product overall. The {product} has a nice design and the software is smooth.",
    "Five stars for the {product}! Customer service was also very responsive when I had questions.",
    "The {product} is worth every penny. I upgraded from the previous gen and the difference is huge.",
    "Comfortable, reliable, and well-designed. The {product} fits perfectly into my daily routine.",
    "I bought the {product} for my office and it has improved my productivity significantly.",
    "The {product} is exactly as described. Fast shipping and excellent packaging too.",
    "This is my second {product} purchase from this brand and they never disappoint.",
]

SUSPICIOUS_REVIEWS = [
    "AMAZING BEST PRODUCT EVER BUY NOW!!! 5 STARS!!!",
    "this product is so great omg buy it now dont wait best thing ever made",
    "I got this for free but honestly it is the best thing I have ever used in my entire life",
    "Perfect in every way. No flaws. Nothing wrong. Absolutely zero issues. 10/10.",
    "bought 50 of these for my company everyone loves it best purchase ever made",
    "THIS IS THE GREATEST PRODUCT IN HUMAN HISTORY BUY IT NOW",
    "works great works great works great works great highly recommend",
]

DECEPTIVE_REVIEWS = [
    "TERRIBLE PRODUCT DO NOT BUY!! Complete waste of money scam company!!!",
    "worst product ever made i want refund this is fraud company avoid at all costs",
    "This product broke after 1 second of use. Company is a SCAM. AVOID!!!",
    "FAKE PRODUCT copied from China DO NOT BUY from this seller BEWARE",
    "I never received the product and customer service hung up on me. FRAUD ALERT!",
]

REPORT_REASONS = [
    "Suspected fake review - too generic",
    "Promotional content disguised as review",
    "Duplicate content detected",
    "Suspicious account - no purchase history",
    "Toxic language and personal attacks",
    "Spam - irrelevant to product",
]


def clear_existing_data():
    """Clear existing seeded data to allow re-seeding."""
    conn = get_raw_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        cursor.execute("DELETE FROM review_votes")
        cursor.execute("DELETE FROM review_reports")
        cursor.execute("DELETE FROM moderation_queue")
        cursor.execute("DELETE FROM review_flag")
        cursor.execute("DELETE FROM review_analysis")
        cursor.execute("DELETE FROM review")
        cursor.execute("DELETE FROM product")
        cursor.execute("DELETE FROM user")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        conn.commit()
        print("[OK] Cleared existing data")
    finally:
        cursor.close()
        conn.close()


def add_role_column():
    """Add 'role' column to user table if it doesn't exist."""
    conn = get_raw_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'liedetection_backup'
            AND TABLE_NAME = 'user'
            AND COLUMN_NAME = 'role'
        """)
        exists = cursor.fetchone()[0]
        if not exists:
            cursor.execute("""
                ALTER TABLE user
                ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user'
                AFTER password_hash
            """)
            conn.commit()
            print("[OK] Added 'role' column to user table")
        else:
            print("[--] 'role' column already exists")
    finally:
        cursor.close()
        conn.close()


def seed_users():
    """Insert users with bcrypt-hashed passwords."""
    users = []
    for username, email, password, role, credibility, verified in USERS:
        user = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            role=role,
            credibility_score=credibility,
            verified_status=verified,
            report_count=0,
            review_count=0,
            account_status='active' if credibility > 10 else 'watchlist',
            created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 365))
        )
        db.session.add(user)
        users.append(user)

    db.session.commit()
    print(f"[OK] Seeded {len(users)} users")
    return users


def seed_products():
    """Insert products."""
    products = []
    for name, category, brand, desc, launch, price in PRODUCTS:
        product = Product(
            product_name=name,
            category=category,
            brand=brand,
            description=desc,
            launch_date=datetime.strptime(launch, '%Y-%m-%d').date(),
            price=price,
            overall_trust_score=50.0,
            authenticity_percent=100.0,
            total_reviews=0,
            flagged_reviews=0,
        )
        db.session.add(product)
        products.append(product)

    db.session.commit()
    print(f"[OK] Seeded {len(products)} products")
    return products


def seed_reviews(users, products):
    """Submit reviews using the submit_review stored procedure."""
    review_count = 0

    # Genuine reviews from high-credibility users
    credible_users = [u for u in users if float(u.credibility_score or 0) >= 60]
    for _ in range(30):
        user = random.choice(credible_users)
        product = random.choice(products)
        template = random.choice(GENUINE_REVIEWS)
        text = template.format(product=product.product_name)
        rating = random.choice([3, 4, 4, 4, 5, 5])
        verified = random.choice([True, True, True, False])

        try:
            call_procedure('submit_review', [
                user.user_id, product.product_id, text, rating,
                1 if verified else 0, f'ip_{random.randint(100,999)}', 'web'
            ])
            review_count += 1
        except Exception as e:
            print(f"  [!] Failed: {e}")

    # Suspicious reviews from medium-credibility users
    medium_users = [u for u in users if 20 < float(u.credibility_score or 0) < 60]
    for _ in range(15):
        user = random.choice(medium_users)
        product = random.choice(products)
        text = random.choice(SUSPICIOUS_REVIEWS)
        rating = random.choice([1, 5, 5, 5])
        try:
            call_procedure('submit_review', [
                user.user_id, product.product_id, text, rating,
                0, f'ip_{random.randint(100,999)}', 'mobile'
            ])
            review_count += 1
        except Exception as e:
            print(f"  [!] Failed: {e}")

    # Deceptive reviews from low-credibility users
    low_users = [u for u in users if float(u.credibility_score or 0) <= 20]
    for _ in range(10):
        user = random.choice(low_users)
        product = random.choice(products)
        text = random.choice(DECEPTIVE_REVIEWS)
        rating = random.choice([1, 1, 1, 5])
        try:
            call_procedure('submit_review', [
                user.user_id, product.product_id, text, rating,
                0, f'ip_{random.randint(100,999)}', 'bot'
            ])
            review_count += 1
        except Exception as e:
            print(f"  [!] Failed: {e}")

    print(f"[OK] Seeded {review_count} reviews via stored procedure")


def seed_reports(users):
    """Create some review reports."""
    conn = get_raw_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT review_id, user_id FROM review WHERE status != 'hidden' LIMIT 20")
    reviews = cursor.fetchall()
    cursor.close()
    conn.close()
    if not reviews:
        print("[--] No reviews found for reports, skipping")
        return
    report_count = 0
    for _ in range(12):
        user = random.choice(users)
        review = random.choice(reviews)
        if user.user_id != review['user_id']:
            reason = random.choice(REPORT_REASONS)
            try:
                call_procedure('report_review', [
                    review['review_id'], user.user_id, reason
                ])
                report_count += 1
            except Exception:
                pass
    print(f"[OK] Seeded {report_count} review reports")


def seed_votes(users):
    """Create some helpful/not_helpful votes."""
    conn = get_raw_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT review_id, user_id FROM review LIMIT 30")
    reviews = cursor.fetchall()
    cursor.close()
    conn.close()
    if not reviews:
        print("[--] No reviews found for votes, skipping")
        return
    vote_count = 0
    voted_pairs = set()
    for _ in range(40):
        user = random.choice(users)
        review = random.choice(reviews)
        pair = (review['review_id'], user.user_id)
        if user.user_id != review['user_id'] and pair not in voted_pairs:
            voted_pairs.add(pair)
            vote_type = random.choice(['helpful', 'helpful', 'not_helpful'])
            try:
                vconn = get_raw_connection()
                vcursor = vconn.cursor()
                vcursor.execute(
                    "INSERT INTO review_votes (review_id, user_id, vote) VALUES (%s, %s, %s)",
                    (review['review_id'], user.user_id, vote_type)
                )
                if vote_type == 'helpful':
                    vcursor.execute(
                        "UPDATE review SET helpful_votes = helpful_votes + 1 WHERE review_id = %s",
                        (review['review_id'],)
                    )
                vconn.commit()
                vcursor.close()
                vconn.close()
                vote_count += 1
            except Exception:
                pass
    print(f"[OK] Seeded {vote_count} votes")


def update_product_stats():
    """Recalculate product trust scores based on their reviews."""
    from sqlalchemy import text
    db.session.execute(text("""
        UPDATE product p SET
            overall_trust_score = COALESCE(
                (SELECT AVG(ra.trust_score)
                 FROM review r JOIN review_analysis ra ON r.review_id = ra.review_id
                 WHERE r.product_id = p.product_id), 50
            ),
            authenticity_percent = COALESCE(
                (SELECT (SUM(CASE WHEN rf.classification = 'genuine' THEN 1 ELSE 0 END) * 100.0 / COUNT(*))
                 FROM review r JOIN review_flag rf ON r.review_id = rf.review_id
                 WHERE r.product_id = p.product_id), 100
            )
    """))
    db.session.commit()
    print("[OK] Updated product trust scores")


def run_seed():
    with app.app_context():
        print("\n=======================================")
        print("  ReviewShield AI -- Database Seeder")
        print("=======================================\n")

        add_role_column()
        clear_existing_data()

        users = seed_users()
        products = seed_products()
        seed_reviews(users, products)
        seed_reports(users)
        seed_votes(users)
        update_product_stats()

        print("\n=======================================")
        print("  Seeding complete!")
        print("=======================================")
        print("  Admin login: admin@reviewshield.ai / admin123")
        print("  User login: priya@gmail.com / pass123")
        print("=======================================\n")


if __name__ == '__main__':
    run_seed()
