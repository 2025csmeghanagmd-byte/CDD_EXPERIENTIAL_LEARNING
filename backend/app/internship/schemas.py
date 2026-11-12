import re

URL_REGEX = re.compile(
    r"^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$",
    re.IGNORECASE
)

def validate_application_data(data):
    """
    Validates application submission payload.
    Returns: (is_valid, sanitized_data_or_errors)
    """
    if not isinstance(data, dict):
        return False, {"error": "Request body must be a JSON object."}

    errors = {}

    internship_id = data.get("internship_id")
    if not internship_id:
        errors["internship_id"] = "Internship ID is required."
    else:
        try:
            internship_id = int(internship_id)
            if internship_id <= 0:
                errors["internship_id"] = "Internship ID must be a positive integer."
        except (ValueError, TypeError):
            errors["internship_id"] = "Internship ID must be an integer."

    resume_url = data.get("resume_url", "").strip() if isinstance(data.get("resume_url"), str) else ""
    if not resume_url:
        errors["resume_url"] = "Resume URL is required (e.g. Google Drive, LinkedIn, or personal portfolio link)."
    elif len(resume_url) > 500:
        errors["resume_url"] = "Resume URL must not exceed 500 characters."
    elif not (resume_url.startswith("http://") or resume_url.startswith("https://") or "drive.google.com" in resume_url or "github.com" in resume_url):
        # Basic friendly URL check
        if not URL_REGEX.match(resume_url):
            errors["resume_url"] = "Please provide a valid web URL starting with http:// or https://."

    cover_letter = data.get("cover_letter", "")
    if cover_letter and not isinstance(cover_letter, str):
        errors["cover_letter"] = "Cover letter must be text."

    relevant_skills = data.get("relevant_skills", "")
    if relevant_skills and not isinstance(relevant_skills, str):
        errors["relevant_skills"] = "Relevant skills must be a comma-separated string."

    if errors:
        return False, errors

    return True, {
        "internship_id": internship_id,
        "resume_url": resume_url,
        "cover_letter": cover_letter.strip() if cover_letter else "",
        "relevant_skills": relevant_skills.strip() if relevant_skills else ""
    }


def validate_status_update(data):
    """
    Validates application status update payload.
    Allowed statuses: 'Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'
    """
    if not isinstance(data, dict):
        return False, "Request body must be a JSON object."

    status = data.get("status")
    allowed_statuses = ["Applied", "Under Review", "Shortlisted", "Rejected", "Selected"]

    if not status:
        return False, f"Status is required. Allowed values: {', '.join(allowed_statuses)}"

    if status not in allowed_statuses:
        return False, f"Invalid status '{status}'. Allowed values are: {', '.join(allowed_statuses)}"

    return True, status

