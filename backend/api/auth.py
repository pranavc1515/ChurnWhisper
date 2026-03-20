"""Authentication API routes."""

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId

from db.mongodb import get_database
from models.user import (
    UserCreate,
    UserLogin,
    UserUpdate,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
)
from services.auth_service import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    validate_password_strength,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)


def _user_to_response(doc: dict) -> UserResponse:
    """Convert MongoDB user document to UserResponse."""
    return UserResponse(
        id=str(doc["_id"]),
        name=doc["name"],
        email=doc["email"],
        company_name=doc.get("company_name"),
        role=doc.get("role"),
        avatar_url=doc.get("avatar_url"),
        created_at=doc["created_at"],
        last_login=doc.get("last_login"),
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
):
    """Dependency: get current user from JWT."""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/register", response_model=dict)
async def register(user_data: UserCreate):
    """Create account and return tokens."""
    is_valid, msg = validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    db = get_database()
    existing = await db.users.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    now = datetime.utcnow()
    user_doc = {
        "name": user_data.name,
        "email": user_data.email.lower(),
        "password_hash": get_password_hash(user_data.password),
        "company_name": user_data.company_name,
        "role": user_data.role,
        "avatar_url": None,
        "refresh_token": None,
        "reset_token": None,
        "reset_token_expires": None,
        "created_at": now,
        "updated_at": now,
        "last_login": None,
    }
    result = await db.users.insert_one(user_doc)

    access_token = create_access_token(str(result.inserted_id))
    refresh_token = create_refresh_token(str(result.inserted_id))

    await db.users.update_one(
        {"_id": result.inserted_id},
        {"$set": {"refresh_token": refresh_token, "last_login": now}},
    )

    return {
        "success": True,
        "data": {
            "user": _user_to_response({**user_doc, "_id": result.inserted_id}),
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": 60 * 24 * 60,
        },
    }


@router.post("/login", response_model=dict)
async def login(user_data: UserLogin, response: Response):
    """Login and return tokens."""
    db = get_database()
    user = await db.users.find_one({"email": user_data.email.lower()})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    now = datetime.utcnow()
    user_id = str(user["_id"])
    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)

    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "refresh_token": refresh_token,
                "last_login": now,
                "updated_at": now,
            }
        },
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
        path="/",
    )

    return {
        "success": True,
        "data": {
            "user": _user_to_response(user),
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": 60 * 24 * 60,
        },
    }


@router.post("/refresh", response_model=dict)
async def refresh(request: Request, response: Response):
    """Exchange refresh token for new access token."""
    refresh_token_val = request.cookies.get("refresh_token")
    if not refresh_token_val:
        raise HTTPException(status_code=401, detail="Refresh token required")

    payload = decode_token(refresh_token_val)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload.get("sub")
    db = get_database()
    user = await db.users.find_one(
        {"_id": ObjectId(user_id), "refresh_token": refresh_token_val}
    )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    access_token = create_access_token(user_id)
    new_refresh = create_refresh_token(user_id)
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"refresh_token": new_refresh, "updated_at": datetime.utcnow()}},
    )

    response.set_cookie(
        key="refresh_token",
        value=new_refresh,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
        path="/",
    )

    return {
        "success": True,
        "data": {
            "access_token": access_token,
            "refresh_token": new_refresh,
            "token_type": "bearer",
            "expires_in": 60 * 24 * 60,
        },
    }


@router.post("/logout", response_model=dict)
async def logout(
    request: Request,
    response: Response,
    user: dict = Depends(get_current_user),
):
    """Invalidate refresh token."""
    db = get_database()
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"refresh_token": None, "updated_at": datetime.utcnow()}},
    )
    response.delete_cookie(key="refresh_token", path="/")
    return {"success": True, "data": {"message": "Logged out"}}


@router.post("/forgot-password", response_model=dict)
async def forgot_password(data: ForgotPasswordRequest):
    """Generate password reset token (MVP: return in response)."""
    db = get_database()
    user = await db.users.find_one({"email": data.email.lower()})
    if not user:
        return {"success": True, "data": {"message": "If email exists, reset link sent"}}

    from uuid import uuid4
    reset_token = str(uuid4())
    expires = datetime.utcnow() + timedelta(hours=1)

    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "reset_token": reset_token,
                "reset_token_expires": expires,
                "updated_at": datetime.utcnow(),
            }
        },
    )

    return {
        "success": True,
        "data": {
            "message": "Reset token generated (MVP: use for /reset-password)",
            "reset_token": reset_token,
        },
    }


@router.post("/reset-password", response_model=dict)
async def reset_password(data: ResetPasswordRequest):
    """Reset password with token."""
    is_valid, msg = validate_password_strength(data.new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    db = get_database()
    user = await db.users.find_one({"reset_token": data.token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    if user.get("reset_token_expires") and user["reset_token_expires"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expired")

    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "password_hash": get_password_hash(data.new_password),
                "reset_token": None,
                "reset_token_expires": None,
                "updated_at": datetime.utcnow(),
            }
        },
    )
    return {"success": True, "data": {"message": "Password reset successfully"}}


@router.get("/me", response_model=dict)
async def get_me(user: dict = Depends(get_current_user)):
    """Get current user profile."""
    return {"success": True, "data": _user_to_response(user)}


@router.put("/me", response_model=dict)
async def update_me(
    data: UserUpdate,
    user: dict = Depends(get_current_user),
):
    """Update profile."""
    update = {"updated_at": datetime.utcnow()}
    if data.name is not None:
        update["name"] = data.name
    if data.company_name is not None:
        update["company_name"] = data.company_name
    if data.role is not None:
        update["role"] = data.role

    db = get_database()
    await db.users.update_one({"_id": user["_id"]}, {"$set": update})
    updated = await db.users.find_one({"_id": user["_id"]})
    return {"success": True, "data": _user_to_response(updated)}


@router.post("/change-password", response_model=dict)
async def change_password(
    data: ChangePasswordRequest,
    user: dict = Depends(get_current_user),
):
    """Change password (requires current password)."""
    if not verify_password(data.current_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password incorrect")

    is_valid, msg = validate_password_strength(data.new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    db = get_database()
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "password_hash": get_password_hash(data.new_password),
                "updated_at": datetime.utcnow(),
            }
        },
    )
    return {"success": True, "data": {"message": "Password changed"}}


