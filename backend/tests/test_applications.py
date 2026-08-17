from httpx import AsyncClient


async def test_create_and_list_application(client: AsyncClient, auth_headers: dict[str, str]):
    resp = await client.post(
        "/applications",
        json={"company": "Acme", "role_title": "SWE Intern"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["status"] == "applied"

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


async def test_ever_interviewed_stays_true_after_rejection(client: AsyncClient, auth_headers: dict[str, str]):
    create_resp = await client.post(
        "/applications", json={"company": "Acme", "role_title": "SWE Intern"}, headers=auth_headers
    )
    app_id = create_resp.json()["id"]
    assert create_resp.json()["ever_interviewed"] is False

    resp = await client.patch(f"/applications/{app_id}", json={"status": "interview"}, headers=auth_headers)
    assert resp.json()["ever_interviewed"] is True

    # Rejected afterward — the flag must survive, unlike `status` itself.
    resp = await client.patch(f"/applications/{app_id}", json={"status": "rejected"}, headers=auth_headers)
    assert resp.json()["status"] == "rejected"
    assert resp.json()["ever_interviewed"] is True


async def test_ever_interviewed_not_set_by_bare_rejection(client: AsyncClient, auth_headers: dict[str, str]):
    create_resp = await client.post(
        "/applications", json={"company": "Acme", "role_title": "SWE Intern"}, headers=auth_headers
    )
    app_id = create_resp.json()["id"]

    # Straight to rejected, no screening/interview/offer in between.
    resp = await client.patch(f"/applications/{app_id}", json={"status": "rejected"}, headers=auth_headers)
    assert resp.json()["ever_interviewed"] is False


async def test_ever_interviewed_set_on_create_with_qualifying_status(
    client: AsyncClient, auth_headers: dict[str, str]
):
    resp = await client.post(
        "/applications",
        json={"company": "Acme", "role_title": "SWE Intern", "status": "interview"},
        headers=auth_headers,
    )
    assert resp.json()["ever_interviewed"] is True


async def test_ever_interviewed_manual_override_corrects_a_mistake(
    client: AsyncClient, auth_headers: dict[str, str]
):
    create_resp = await client.post(
        "/applications", json={"company": "Acme", "role_title": "SWE Intern"}, headers=auth_headers
    )
    app_id = create_resp.json()["id"]

    # Status mistakenly set to Interview — auto-detection (correctly) flags it.
    resp = await client.patch(f"/applications/{app_id}", json={"status": "interview"}, headers=auth_headers)
    assert resp.json()["ever_interviewed"] is True

    # Realized the mistake: fix the status back and explicitly correct the flag in the same request.
    resp = await client.patch(
        f"/applications/{app_id}",
        json={"status": "applied", "ever_interviewed": False},
        headers=auth_headers,
    )
    assert resp.json()["status"] == "applied"
    assert resp.json()["ever_interviewed"] is False


async def test_ever_interviewed_untouched_field_does_not_block_auto_detection(
    client: AsyncClient, auth_headers: dict[str, str]
):
    create_resp = await client.post(
        "/applications", json={"company": "Acme", "role_title": "SWE Intern"}, headers=auth_headers
    )
    app_id = create_resp.json()["id"]

    # Omitting ever_interviewed entirely must not suppress auto-detection — this is the normal
    # edit path (the frontend only includes it when the checkbox was actually touched).
    resp = await client.patch(f"/applications/{app_id}", json={"status": "screening"}, headers=auth_headers)
    assert resp.json()["ever_interviewed"] is True


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
