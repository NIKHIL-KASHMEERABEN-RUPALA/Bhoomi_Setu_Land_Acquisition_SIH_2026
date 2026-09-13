from typing import Any, Dict, Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse
from app.core.logging import logger


class BhoomiSetuException(Exception):
    """Base domain exception for BhoomiSetu platform."""

    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}


class EntityNotFoundException(BhoomiSetuException):
    def __init__(self, entity_name: str, entity_id: Any):
        super().__init__(
            message=f"{entity_name} with id '{entity_id}' not found.",
            code=f"{entity_name.upper()}_NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class AuthorizationDeniedException(BhoomiSetuException):
    def __init__(self, message: str = "Access denied: insufficient permissions or scope."):
        super().__init__(
            message=message,
            code="AUTHORIZATION_DENIED",
            status_code=status.HTTP_403_FORBIDDEN,
        )


class AuthenticationException(BhoomiSetuException):
    def __init__(self, message: str = "Invalid credentials or token expired."):
        super().__init__(
            message=message,
            code="AUTHENTICATION_FAILED",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class AccountLockedException(BhoomiSetuException):
    def __init__(self, message: str = "Account temporarily locked due to repeated failed logins."):
        super().__init__(
            message=message,
            code="ACCOUNT_LOCKED",
            status_code=status.HTTP_423_LOCKED,
        )


class ValidationException(BhoomiSetuException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details,
        )


class ModelInferenceException(BhoomiSetuException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="MODEL_INFERENCE_ERROR",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            details=details,
        )


class ConflictException(BhoomiSetuException):
    def __init__(self, message: str):
        super().__init__(
            message=message,
            code="RESOURCE_CONFLICT",
            status_code=status.HTTP_409_CONFLICT,
        )


async def app_exception_handler(request: Request, exc: BhoomiSetuException) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "unknown")
    logger.warning(
        f"Domain exception: {exc.code} - {exc.message}",
        extra={"request_id": request_id, "code": exc.code, "status_code": exc.status_code},
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "request_id": request_id,
                "details": exc.details if exc.details else None,
            }
        },
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "unknown")
    logger.exception(
        f"Unhandled server error: {str(exc)}",
        extra={"request_id": request_id},
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected server error occurred. Please contact system administrator.",
                "request_id": request_id,
            }
        },
    )
