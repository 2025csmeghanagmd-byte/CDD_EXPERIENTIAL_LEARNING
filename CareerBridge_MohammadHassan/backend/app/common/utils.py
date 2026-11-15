"""
CareerBridge - Common Utility Functions
Shared helpers for consistent API responses and input validation.
"""

from flask import jsonify


def success_response(data=None, message="Success", status=200):
    """
    Build a standardised JSON success response.

    Args:
        data:    Payload to include under the ``data`` key (default None).
        message: Human-readable status message.
        status:  HTTP status code (default 200).

    Returns:
        A Flask ``Response`` object with the JSON body and status code.
    """
    response = {
        "success": True,
        "message": message
    }
    if data is not None:
        response["data"] = data
    return jsonify(response), status


def error_response(message="Error", status=400):
    """
    Build a standardised JSON error response.

    Args:
        message: Human-readable error description.
        status:  HTTP status code (default 400).

    Returns:
        A Flask ``Response`` object with the JSON body and status code.
    """
    return jsonify({
        "success": False,
        "message": message
    }), status


def validate_required_fields(data, fields):
    """
    Check that every field in *fields* is present and non-empty in *data*.

    Args:
        data:   Dictionary (typically ``request.get_json()``).
        fields: Iterable of required key names.

    Returns:
        A list of field names that are missing or empty.  An empty list
        means validation passed.
    """
    missing = []
    if data is None:
        return list(fields)
    for field in fields:
        value = data.get(field)
        if value is None or (isinstance(value, str) and value.strip() == ''):
            missing.append(field)
    return missing
