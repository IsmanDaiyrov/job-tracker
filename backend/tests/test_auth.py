from httpx import AsyncClient


async def test_register_and_login(client: AsyncClient):
    resp = await client.post("/auth/register", json={"email": "a@example.com", "password": "password123"})
    assert resp.status_code == 201
    assert "access_token" in resp.json()

    resp = await client.post("/auth/login", json={"email": "a@example.com", "password": "password123"})
    assert resp.status_code == 200
    token = resp.json()["access_token"]

    resp = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "a@example.com"


async def test_register_duplicate_email_rejected(client: AsyncClient):
    await client.post("/auth/register", json={"email": "dup@example.com", "password": "password123"})
    resp = await client.post("/auth/register", json={"email": "dup@example.com", "password": "password123"})
    assert resp.status_code == 409


async def test_login_wrong_password_rejected(client: AsyncClient):
    await client.post("/auth/register", json={"email": "b@example.com", "password": "password123"})
    resp = await client.post("/auth/login", json={"email": "b@example.com", "password": "wrong"})
    assert resp.status_code == 401


async def test_me_requires_auth(client: AsyncClient):
    resp = await client.get("/auth/me")
    assert resp.status_code == 401
