# API documentation

For every endpoint, document:
- Module and owner
- HTTP method and URL
- Authentication/authorization requirement
- Query parameters and request JSON
- Success status and response JSON
- Validation rules and error responses

Suggested response envelope:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Agree on exact endpoints and payloads as a team before frontend/backend integration.
