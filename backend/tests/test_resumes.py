from unittest.mock import patch

from httpx import AsyncClient


async def test_create_resume_returns_upload_url(client: AsyncClient, auth_headers: dict[str, str]):
    with patch("app.routers.resumes.generate_presigned_upload_url", return_value="https://fake-s3-url/put"):
        resp = await client.post(
            "/resumes", json={"label": "Base Resume", "content_type": "application/pdf"}, headers=auth_headers
        )

    assert resp.status_code == 201
    body = resp.json()
    assert body["upload_url"] == "https://fake-s3-url/put"
    assert body["resume"]["label"] == "Base Resume"
    assert body["resume"]["is_base"] is False
    assert body["resume"]["content_type"] == "application/pdf"


async def test_create_resume_rejects_unsupported_content_type(client: AsyncClient, auth_headers: dict[str, str]):
    resp = await client.post(
        "/resumes", json={"label": "Suspicious", "content_type": "image/png"}, headers=auth_headers
    )
    assert resp.status_code == 400


async def test_list_resumes(client: AsyncClient, auth_headers: dict[str, str]):
    with patch("app.routers.resumes.generate_presigned_upload_url", return_value="https://fake-s3-url/put"):
        await client.post(
            "/resumes", json={"label": "Base Resume", "content_type": "application/pdf"}, headers=auth_headers
        )

    resp = await client.get("/resumes", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


async def test_is_base_mutual_exclusivity(client: AsyncClient, auth_headers: dict[str, str]):
    with patch("app.routers.resumes.generate_presigned_upload_url", return_value="https://fake-s3-url/put"):
        r1 = await client.post(
            "/resumes", json={"label": "Resume 1", "content_type": "application/pdf"}, headers=auth_headers
        )
        r2 = await client.post(
            "/resumes", json={"label": "Resume 2", "content_type": "application/pdf"}, headers=auth_headers
        )
    resume1_id = r1.json()["resume"]["id"]
    resume2_id = r2.json()["resume"]["id"]

    resp = await client.patch(f"/resumes/{resume1_id}", json={"is_base": True}, headers=auth_headers)
    assert resp.json()["is_base"] is True

    resp = await client.patch(f"/resumes/{resume2_id}", json={"is_base": True}, headers=auth_headers)
    assert resp.json()["is_base"] is True

    resumes = (await client.get("/resumes", headers=auth_headers)).json()
    by_id = {r["id"]: r for r in resumes}
    assert by_id[resume1_id]["is_base"] is False
    assert by_id[resume2_id]["is_base"] is True


async def test_resume_ownership_enforced(client: AsyncClient, auth_headers: dict[str, str]):
    with patch("app.routers.resumes.generate_presigned_upload_url", return_value="https://fake-s3-url/put"):
        create_resp = await client.post(
            "/resumes", json={"label": "Mine", "content_type": "application/pdf"}, headers=auth_headers
        )
    resume_id = create_resp.json()["resume"]["id"]

    await client.post("/auth/register", json={"email": "other@example.com", "password": "password123"})
    login_resp = await client.post("/auth/login", json={"email": "other@example.com", "password": "password123"})
    other_headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    resp = await client.get(f"/resumes/{resume_id}/download", headers=other_headers)
    assert resp.status_code == 404


async def test_tailor_resume(client: AsyncClient, auth_headers: dict[str, str]):
    with patch("app.routers.resumes.generate_presigned_upload_url", return_value="https://fake-s3-url/put"):
        create_resp = await client.post(
            "/resumes", json={"label": "Base Resume", "content_type": "application/pdf"}, headers=auth_headers
        )
    resume_id = create_resp.json()["resume"]["id"]

    fake_result = {
        "bullets": [{"original": "Wrote code.", "suggested": "Shipped features.", "why": "Matches the listing"}],
        "cover_letter": "Dear hiring team...",
    }
    with (
        patch("app.routers.resumes.get_object_bytes", return_value=b"%PDF-fake"),
        patch("app.routers.resumes.tailor_resume", return_value=fake_result) as mock_tailor,
    ):
        resp = await client.post(
            f"/resumes/{resume_id}/tailor",
            json={"job_description": "Looking for a backend engineer."},
            headers=auth_headers,
        )

    assert resp.status_code == 200
    assert resp.json() == fake_result
    mock_tailor.assert_called_once_with(b"%PDF-fake", "application/pdf", "Looking for a backend engineer.")


async def test_tailor_resume_ownership_enforced(client: AsyncClient, auth_headers: dict[str, str]):
    with patch("app.routers.resumes.generate_presigned_upload_url", return_value="https://fake-s3-url/put"):
        create_resp = await client.post(
            "/resumes", json={"label": "Mine", "content_type": "application/pdf"}, headers=auth_headers
        )
    resume_id = create_resp.json()["resume"]["id"]

    await client.post("/auth/register", json={"email": "other2@example.com", "password": "password123"})
    login_resp = await client.post("/auth/login", json={"email": "other2@example.com", "password": "password123"})
    other_headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    resp = await client.post(
        f"/resumes/{resume_id}/tailor", json={"job_description": "n/a"}, headers=other_headers
    )
    assert resp.status_code == 404


async def test_download_and_delete_resume(client: AsyncClient, auth_headers: dict[str, str]):
    with patch("app.routers.resumes.generate_presigned_upload_url", return_value="https://fake-s3-url/put"):
        create_resp = await client.post(
            "/resumes", json={"label": "Temp", "content_type": "application/pdf"}, headers=auth_headers
        )
    resume_id = create_resp.json()["resume"]["id"]

    with patch("app.routers.resumes.generate_presigned_download_url", return_value="https://fake-s3-url/get"):
        resp = await client.get(f"/resumes/{resume_id}/download", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["download_url"] == "https://fake-s3-url/get"

    with patch("app.routers.resumes.delete_object") as mock_delete:
        resp = await client.delete(f"/resumes/{resume_id}", headers=auth_headers)
    assert resp.status_code == 204
    mock_delete.assert_called_once()

    resumes = (await client.get("/resumes", headers=auth_headers)).json()
    assert resumes == []
