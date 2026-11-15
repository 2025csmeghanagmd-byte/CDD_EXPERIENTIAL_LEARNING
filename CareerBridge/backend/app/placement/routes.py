"""
CareerBridge - Placement Preparation Routes
Member 3 ownership:
- Multidisciplinary preparation resources (DSA, Aptitude, Core Tech, Behavioral)
- Question bank by category and difficulty
- Mock test execution with auto-scoring and timer
- Performance tracking and test score history
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app import get_db
from app.common.utils import success_response, error_response

placement_bp = Blueprint('placement', __name__)


def _current_user_id_optional():
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        return int(identity) if identity else None
    except Exception:
        return None


@placement_bp.route('', methods=['GET'])
@placement_bp.route('/', methods=['GET'])
def index():
    return success_response(message="Placement Preparation API active")


@placement_bp.route('/categories', methods=['GET'])
def get_categories():
    """List all placement categories with question counts."""
    try:
        category_type = request.args.get('type')  # dsa, aptitude, interview, company
        conn = get_db()
        try:
            with conn.cursor() as cur:
                query = """
                    SELECT c.*, COUNT(q.id) as question_count
                    FROM categories c
                    LEFT JOIN questions q ON c.id = q.category_id
                """
                params = []
                if category_type:
                    query += " WHERE c.type = %s"
                    params.append(category_type)

                query += " GROUP BY c.id ORDER BY c.id ASC"
                cur.execute(query, params)
                cats = cur.fetchall()

            return success_response(data={"categories": cats, "count": len(cats)})
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to fetch categories: {str(e)}", 500)


@placement_bp.route('/questions', methods=['GET'])
def get_questions():
    """Get questions for practice."""
    try:
        category_id = request.args.get('category_id')
        difficulty = request.args.get('difficulty')

        conn = get_db()
        try:
            with conn.cursor() as cur:
                query = "SELECT * FROM questions WHERE 1=1"
                params = []
                if category_id:
                    query += " AND category_id = %s"
                    params.append(category_id)
                if difficulty:
                    query += " AND difficulty = %s"
                    params.append(difficulty)

                query += " ORDER BY id ASC LIMIT 50"
                cur.execute(query, params)
                qs = cur.fetchall()

            return success_response(data={"questions": qs, "count": len(qs)})
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to fetch questions: {str(e)}", 500)


@placement_bp.route('/mock-tests', methods=['GET'])
def get_mock_tests():
    """List all available mock tests."""
    try:
        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT m.*, c.name as category_name
                    FROM mock_tests m
                    LEFT JOIN categories c ON m.category_id = c.id
                    ORDER BY m.id ASC
                """)
                tests = cur.fetchall()

            return success_response(data={"mock_tests": tests, "count": len(tests)})
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to fetch mock tests: {str(e)}", 500)


@placement_bp.route('/mock-tests/<int:test_id>', methods=['GET'])
def get_mock_test_detail(test_id):
    """
    Get mock test and its questions for taking the test.
    Omits correct_answer and explanation so answers cannot be inspected in network tab!
    """
    try:
        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM mock_tests WHERE id = %s", (test_id,))
                test = cur.fetchone()
                if not test:
                    return error_response("Mock test not found", 404)

                cat_id = test.get('category_id')
                # Fetch questions for this category or generic
                if cat_id:
                    cur.execute(
                        """
                        SELECT id, category_id, question, option_a, option_b, option_c, option_d, difficulty
                        FROM questions WHERE category_id = %s
                        LIMIT %s
                        """,
                        (cat_id, test.get('total_questions', 10))
                    )
                else:
                    cur.execute(
                        """
                        SELECT id, category_id, question, option_a, option_b, option_c, option_d, difficulty
                        FROM questions LIMIT %s
                        """,
                        (test.get('total_questions', 10),)
                    )
                questions = cur.fetchall()

            d = dict(test)
            d['questions'] = questions
            return success_response(data={"mock_test": d})
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to load test: {str(e)}", 500)


@placement_bp.route('/mock-tests/<int:test_id>/submit', methods=['POST'])
def submit_mock_test(test_id):
    """
    Submit mock test answers, calculate score, record attempt if logged in,
    and return performance breakdown with explanations.
    Payload: { "answers": { "question_id": "A", ... }, "time_taken": 120 }
    """
    try:
        user_id = _current_user_id_optional()
        data = request.get_json() or {}
        user_answers = data.get('answers', {})
        time_taken = data.get('time_taken', 0)

        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM mock_tests WHERE id = %s", (test_id,))
                test = cur.fetchone()
                if not test:
                    return error_response("Mock test not found", 404)

                # Get all questions
                cat_id = test.get('category_id')
                if cat_id:
                    cur.execute("SELECT * FROM questions WHERE category_id = %s", (cat_id,))
                else:
                    cur.execute("SELECT * FROM questions")
                all_qs = {q['id']: q for q in cur.fetchall()}

                score = 0
                total = len(all_qs) if all_qs else 1
                breakdown = []

                for q_id, q_data in all_qs.items():
                    user_choice = str(user_answers.get(str(q_id), '')).strip().upper()
                    correct = str(q_data['correct_answer']).strip().upper()
                    is_correct = (user_choice == correct)

                    if is_correct:
                        score += 1

                    breakdown.append({
                        "question_id": q_id,
                        "question": q_data['question'],
                        "user_answer": user_choice,
                        "correct_answer": correct,
                        "is_correct": is_correct,
                        "explanation": q_data.get('explanation', '')
                    })

                percentage = round((score / total) * 100, 1) if total > 0 else 0

                # Record score in test_results if logged in
                if user_id:
                    cur.execute(
                        """
                        INSERT INTO test_results (user_id, test_id, score, total, time_taken)
                        VALUES (%s, %s, %s, %s, %s)
                        """,
                        (user_id, test_id, score, total, time_taken)
                    )
                    conn.commit()

            return success_response(
                data={
                    "test_id": test_id,
                    "title": test['title'],
                    "score": score,
                    "total": total,
                    "percentage": percentage,
                    "time_taken": time_taken,
                    "breakdown": breakdown
                },
                message=f"Test evaluated! You scored {score} out of {total} ({percentage}%)."
            )
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to submit test: {str(e)}", 500)


@placement_bp.route('/my-results', methods=['GET'])
@jwt_required()
def get_my_results():
    """Get test score history for the logged-in student."""
    try:
        user_id = int(get_jwt_identity())
        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT r.*, m.title as test_title, c.name as category_name
                    FROM test_results r
                    JOIN mock_tests m ON r.test_id = m.id
                    LEFT JOIN categories c ON m.category_id = c.id
                    WHERE r.user_id = %s
                    ORDER BY r.completed_at DESC
                """, (user_id,))
                results = cur.fetchall()

            return success_response(
                data={"results": results, "count": len(results)},
                message="Test history retrieved successfully"
            )
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to fetch test results: {str(e)}", 500)
