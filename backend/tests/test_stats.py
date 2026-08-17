import pytest
from httpx import AsyncClient


async def test_stats_overview_empty(client: AsyncClient, auth_headers: dict[str, str]):
    resp = await client.get("/stats/overview", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["status_breakdown"] == []
    assert body["applied_count"] == 0
    assert body["responded_count"] == 0
    assert body["response_rate"] is None
    assert body["time_in_stage"] == []
    assert body["interviewed_count"] == 0


async def test_stats_overview_status_breakdown_and_response_rate(client: AsyncClient, auth_headers: dict[str, str]):
    # Default status on create is "applied".
    await client.post("/applications", json={"company": "A", "role_title": "SWE"}, headers=auth_headers)
    await client.post("/applications", json={"company": "B", "role_title": "SWE"}, headers=auth_headers)

    await client.post(
        "/applications", json={"company": "C", "role_title": "SWE", "status": "saved"}, headers=auth_headers
    )

    screening_resp = await client.post(
        "/applications", json={"company": "D", "role_title": "SWE"}, headers=auth_headers
    )
    await client.patch(
        f"/applications/{screening_resp.json()['id']}", json={"status": "screening"}, headers=auth_headers
    )

    resp = await client.get("/stats/overview", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()

    counts = {row["status"]: row["count"] for row in body["status_breakdown"]}
    assert counts == {"applied": 2, "saved": 1, "screening": 1}

    # applied_count excludes 'saved' -> 2 applied + 1 screening = 3
    assert body["applied_count"] == 3
    # responded_count: only 'screening' counts as a response here -> 1
    assert body["responded_count"] == 1
    assert body["response_rate"] == pytest.approx(1 / 3)


async def test_status_changed_at_bumps_only_on_status_change(client: AsyncClient, auth_headers: dict[str, str]):
    create_resp = await client.post(
        "/applications", json={"company": "Acme", "role_title": "SWE Intern"}, headers=auth_headers
    )
    app_id = create_resp.json()["id"]
    original_status_changed_at = create_resp.json()["status_changed_at"]

    # Editing notes (not status) shouldn't bump status_changed_at — that's the whole point of
    # this field existing separately from updated_at.
    resp = await client.patch(
        f"/applications/{app_id}", json={"notes": "Follow up next week"}, headers=auth_headers
    )
    assert resp.json()["status_changed_at"] == original_status_changed_at

    # Changing status should bump it.
    resp = await client.patch(f"/applications/{app_id}", json={"status": "screening"}, headers=auth_headers)
    assert resp.json()["status_changed_at"] != original_status_changed_at


async def test_stats_overview_interviewed_count(client: AsyncClient, auth_headers: dict[str, str]):
    # Reaches screening, then gets rejected — should still count as interviewed.
    screened_resp = await client.post(
        "/applications", json={"company": "A", "role_title": "SWE"}, headers=auth_headers
    )
    screened_id = screened_resp.json()["id"]
    await client.patch(f"/applications/{screened_id}", json={"status": "screening"}, headers=auth_headers)
    await client.patch(f"/applications/{screened_id}", json={"status": "rejected"}, headers=auth_headers)

    # Rejected with no screening/interview in between — should not count.
    bare_reject_resp = await client.post(
        "/applications", json={"company": "B", "role_title": "SWE"}, headers=auth_headers
    )
    await client.patch(
        f"/applications/{bare_reject_resp.json()['id']}", json={"status": "rejected"}, headers=auth_headers
    )

    resp = await client.get("/stats/overview", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["interviewed_count"] == 1


async def test_stats_overview_scoped_per_user(client: AsyncClient, auth_headers: dict[str, str]):
    await client.post("/applications", json={"company": "Acme", "role_title": "SWE Intern"}, headers=auth_headers)

    await client.post("/auth/register", json={"email": "stats-other@example.com", "password": "password123"})
    login_resp = await client.post(
        "/auth/login", json={"email": "stats-other@example.com", "password": "password123"}
    )
    other_headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    resp = await client.get("/stats/overview", headers=other_headers)
    assert resp.status_code == 200
    assert resp.json()["status_breakdown"] == []


async def test_stats_overview_requires_auth(client: AsyncClient):
    resp = await client.get("/stats/overview")
    assert resp.status_code == 401
