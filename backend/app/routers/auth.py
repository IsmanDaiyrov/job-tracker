from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.oauth import oauth
from app.core.security import create_access_token, get_current_user, hash_password, verify_password
from app.crud.user import create_user, get_or_create_user_from_oauth, get_user_by_email
from app.db.session import get_db
from app.models.oauth_account import OAuthProvider
from app.models.user import User
from app.schemas.user import TokenResponse, UserLogin, UserRead, UserRegister

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()

# Receive HTTP requests related to user authentication, including registration, login, and OAuth-based authentication. 
# The endpoints handle user creation, password verification, token generation, and redirection after successful OAuth authentication.

# Register a new user with email and password, returning an access token upon successful registration.
@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    existing = await get_user_by_email(db, payload.email)
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = await create_user(db, email=payload.email, password_hash=hash_password(payload.password))
    return TokenResponse(access_token=create_access_token(user.id))


# Log in an existing user with email and password, returning an access token upon successful authentication.
@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    user = await get_user_by_email(db, payload.email)
    if user is None or user.password_hash is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    return TokenResponse(access_token=create_access_token(user.id))


# Get the currently authenticated user based on the access token provided in the request, returning the user's information.
@router.get("/me", response_model=UserRead)
async def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


# Helper function to redirect the user to the frontend with the access token after successful OAuth authentication.
def _oauth_redirect_to_frontend(token: str) -> RedirectResponse:
    return RedirectResponse(f"{settings.frontend_url}/auth/callback?token={token}")


# Get the OAuth login URL for Google, redirecting the user to Google's OAuth consent screen.
@router.get("/google")
async def google_login(request: Request):
    redirect_uri = request.url_for("google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)


# Get the OAuth callback from Google, exchanging the authorization code for an access token, retrieving user info, and creating or retrieving the user in the database. Finally, redirect to the frontend with the access token.
@router.get("/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    userinfo = token.get("userinfo") or await oauth.google.userinfo(token=token)
    email = userinfo["email"]
    provider_account_id = userinfo["sub"]

    user = await get_or_create_user_from_oauth(db, OAuthProvider.google, provider_account_id, email)
    return _oauth_redirect_to_frontend(create_access_token(user.id))


# Get the OAuth login URL for GitHub, redirecting the user to GitHub's OAuth consent screen.
@router.get("/github")
async def github_login(request: Request):
    redirect_uri = request.url_for("github_callback")
    return await oauth.github.authorize_redirect(request, redirect_uri)


# Get the OAuth callback from GitHub, exchanging the authorization code for an access token, retrieving user info, and creating or retrieving the user in the database. Finally, redirect to the frontend with the access token.
@router.get("/github/callback")
async def github_callback(request: Request, db: AsyncSession = Depends(get_db)):
    token = await oauth.github.authorize_access_token(request)
    profile = (await oauth.github.get("user", token=token)).json()
    provider_account_id = str(profile["id"])

    email = profile.get("email")
    if not email:
        emails = (await oauth.github.get("user/emails", token=token)).json()
        primary = next((e for e in emails if e.get("primary")), emails[0] if emails else None)
        email = primary["email"] if primary else f"{provider_account_id}@users.noreply.github.com"

    user = await get_or_create_user_from_oauth(db, OAuthProvider.github, provider_account_id, email)
    return _oauth_redirect_to_frontend(create_access_token(user.id))
