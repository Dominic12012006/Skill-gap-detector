import pytest
from app.seed.demo_data import seed_database

@pytest.fixture(autouse=True, scope="module")
def setup_fresh_database():
    seed_database()
    yield

