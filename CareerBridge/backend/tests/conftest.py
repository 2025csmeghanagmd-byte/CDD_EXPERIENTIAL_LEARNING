import pytest
from app import create_app

class TestConfig:
    TESTING = True
    SECRET_KEY = "test-secret"
    SQLALCHEMY_DATABASE_URI = "sqlite://"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = ["http://localhost:5173"]

@pytest.fixture()
def app():
    app = create_app(TestConfig)
    yield app

@pytest.fixture()
def client(app):
    return app.test_client()
