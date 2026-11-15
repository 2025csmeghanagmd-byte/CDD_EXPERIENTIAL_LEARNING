"""
CareerBridge - User Model Helpers
Raw-SQL data-access functions for the ``users`` table (no ORM).
"""

import bcrypt
from app import get_db


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------

def create_user(name, email, password, role='student'):
    """
    Hash *password* with bcrypt, insert a new row into ``users``, and
    return the new ``user_id``.
    """
    hashed_password = bcrypt.hashpw(
        password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')

    connection = get_db()
    try:
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO users (name, email, password, role)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql, (name, email, hashed_password, role))
        connection.commit()
        return cursor.lastrowid
    finally:
        connection.close()


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------

def find_user_by_email(email):
    """Return the user dict whose email matches, or ``None``."""
    connection = get_db()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM users WHERE email = %s"
            cursor.execute(sql, (email,))
            return cursor.fetchone()
    finally:
        connection.close()


def find_user_by_email_or_username(identifier):
    """
    Find user by either exact email, exact name/username, or email username prefix.
    Case-insensitive matching.
    """
    if not identifier:
        return None
    ident = str(identifier).strip().lower()
    ident_nospace = ident.replace(' ', '')
    connection = get_db()
    try:
        with connection.cursor() as cursor:
            # 1. Direct email match
            cursor.execute("SELECT * FROM users WHERE LOWER(email) = %s", (ident,))
            user = cursor.fetchone()
            if user:
                return user

            # 2. Direct name/username match
            cursor.execute("SELECT * FROM users WHERE LOWER(name) = %s", (ident,))
            user = cursor.fetchone()
            if user:
                return user

            # 3. Email username prefix match (e.g. 'student' matches 'student@careerbridge.com')
            cursor.execute("SELECT * FROM users WHERE LOWER(email) LIKE %s", (f"{ident}@%",))
            user = cursor.fetchone()
            if user:
                return user

            # 4. Name without spaces match (e.g. 'alexjohnson' matches 'Alex Johnson')
            cursor.execute("SELECT * FROM users WHERE REPLACE(LOWER(name), ' ', '') = %s", (ident_nospace,))
            user = cursor.fetchone()
            if user:
                return user

            return None
    finally:
        connection.close()


def find_user_by_id(user_id):
    """Return the user dict whose id matches, or ``None``."""
    connection = get_db()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM users WHERE id = %s"
            cursor.execute(sql, (user_id,))
            return cursor.fetchone()
    finally:
        connection.close()


def get_all_students():
    """Return a list of all users whose ``role`` is ``'student'``."""
    connection = get_db()
    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT id, name, email, phone, college, department,
                       year, bio, skills, linkedin, github, role,
                       created_at
                FROM users
                WHERE role = 'student'
                ORDER BY created_at DESC
            """
            cursor.execute(sql)
            return cursor.fetchall()
    finally:
        connection.close()


# ---------------------------------------------------------------------------
# Update
# ---------------------------------------------------------------------------

# Fields that may be updated via the profile endpoint
UPDATABLE_FIELDS = {
    'name', 'phone', 'college', 'department',
    'year', 'bio', 'skills', 'linkedin', 'github'
}


def update_user_profile(user_id, data_dict):
    """
    Update the profile columns for *user_id* using only the keys in
    *data_dict* that are in the allow-list.  Returns the number of
    rows affected (0 or 1).
    """
    # Filter to allowed fields only
    fields_to_update = {
        k: v for k, v in data_dict.items()
        if k in UPDATABLE_FIELDS
    }

    if not fields_to_update:
        return 0

    # Build dynamic SET clause
    set_clause = ', '.join(f"{field} = %s" for field in fields_to_update)
    values = list(fields_to_update.values())
    values.append(user_id)

    connection = get_db()
    try:
        with connection.cursor() as cursor:
            sql = f"UPDATE users SET {set_clause} WHERE id = %s"
            cursor.execute(sql, tuple(values))
        connection.commit()
        return cursor.rowcount
    finally:
        connection.close()
