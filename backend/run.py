import os
from app import create_app

app = create_app(os.getenv("FLASK_ENV", "development"))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"🚀 CareerBridge Internship & Application Management Module (Member 2)")
    print(f"📡 Server running at http://localhost:{port}")
    app.run(host=host, port=port, debug=True)

