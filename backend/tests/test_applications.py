from httpx import AsyncClient


async def test_create_and_list_application(client: AsyncClient, auth_headers: dict[str, str]):
    resp = await client.post(
        "/applications",
        json={"company": "Acme", "role_title": "SWE Intern"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["status"] == "saved"

    resp = await client.get("/applications", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


async def test_patch_status_and_get(client: AsyncClient, auth_headers: dict[str, str]):
    create_resp = await client.post(
        "/applications", json={"company": "Acme", "role_title": "SWE Intern"}, headers=auth_headers
    )
    app_id = create_resp.json()["id"]

    resp = await client.patch(f"/applications/{app_id}", json={"status": "applied"}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "applied"

    resp = await client.get(f"/applications/{app_id}", headers=auth_headers)
    assert resp.json()["status"] == "applied"


async def test_patch_status_to_withdrawn(client: AsyncClient, auth_headers: dict[str, str]):
    create_resp = await client.post(
        "/applications", json={"company": "Acme", "role_title": "SWE Intern"}, headers=auth_headers
    )
    app_id = create_resp.json()["id"]

    resp = await client.patch(f"/applications/{app_id}", json={"status": "withdrawn"}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "withdrawn"


async def test_delete_application(client: AsyncClient, auth_headers: dict[str, str]):
    create_resp = await client.post(
        "/applications", json={"company": "Acme", "role_title": "SWE Intern"}, headers=auth_headers
    )
    app_id = create_resp.json()["id"]

    resp = await client.delete(f"/applications/{app_id}", headers=auth_headers)
    assert resp.status_code == 204

    resp = await client.get(f"/applications/{app_id}", headers=auth_headers)
    assert resp.status_code == 404


async def test_applications_scoped_per_user(client: AsyncClient, auth_headers: dict[str, str]):
    await client.post("/applications", json={"company": "Acme", "role_title": "SWE Intern"}, headers=auth_headers)

    await client.post("/auth/register", json={"email": "other@example.com", "password": "password123"})
    login_resp = await client.post("/auth/login", json={"email": "other@example.com", "password": "password123"})
    other_headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    resp = await client.get("/applications", headers=other_headers)
    assert resp.status_code == 200
    assert resp.json() == []


async def test_applications_requires_auth(client: AsyncClient):
    resp = await client.get("/applications")
    assert resp.status_code == 401
