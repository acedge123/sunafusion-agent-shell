from fastapi import HTTPException, Request, Depends
from typing import Optional, List, Dict, Any
import jwt
from jwt.exceptions import PyJWTError, InvalidSignatureError, ExpiredSignatureError
from utils.logger import logger
import os

def _get_jwt_secret() -> Optional[str]:
    """Get JWT secret from environment variable."""
    return os.getenv('SUPABASE_JWT_SECRET')

def _verify_jwt_token(token: str) -> dict:
    """
    Verify JWT token signature if secret is available.
    Falls back to unverified decode if secret not set (for backward compatibility).
    """
    secret = _get_jwt_secret()
    
    if secret:
        try:
            # Verify signature and expiration
            payload = jwt.decode(token, secret, algorithms=['HS256'])
            return payload
        except ExpiredSignatureError:
            raise HTTPException(
                status_code=401,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"}
            )
        except InvalidSignatureError:
            raise HTTPException(
                status_code=401,
                detail="Invalid token signature",
                headers={"WWW-Authenticate": "Bearer"}
            )
        except PyJWTError as e:
            raise HTTPException(
                status_code=401,
                detail=f"Invalid token: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"}
            )
    else:
        # Fallback: decode without verification (backward compatibility)
        # Log warning to encourage setting SUPABASE_JWT_SECRET
        logger.warning("SUPABASE_JWT_SECRET not set - JWT signature not verified. Set this env var for production security.")
        return jwt.decode(token, options={"verify_signature": False})

# This function extracts the user ID from Supabase JWT
async def get_current_user_id(request: Request) -> str:
    """
    Extract and verify the user ID from the JWT in the Authorization header.
    
    This function is used as a dependency in FastAPI routes to ensure the user
    is authenticated and to provide the user ID for authorization checks.
    
    Args:
        request: The FastAPI request object
        
    Returns:
        str: The user ID extracted from the JWT
        
    Raises:
        HTTPException: If no valid token is found or if the token is invalid
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(
            status_code=401,
            detail="No valid authentication credentials found",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = auth_header.split(' ')[1]
    
    try:
        # Verify JWT signature if secret is available, otherwise decode without verification
        payload = _verify_jwt_token(token)
        
        # Supabase stores the user ID in the 'sub' claim
        user_id = payload.get('sub')
        
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        return user_id
        
    except HTTPException:
        # Re-raise HTTP exceptions (from _verify_jwt_token)
        raise
    except PyJWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"}
        )

async def get_user_id_from_stream_auth(
    request: Request,
    token: Optional[str] = None
) -> str:
    """
    Extract and verify the user ID from either the Authorization header or query parameter token.
    This function is specifically designed for streaming endpoints that need to support both
    header-based and query parameter-based authentication (for EventSource compatibility).
    
    Args:
        request: The FastAPI request object
        token: Optional token from query parameters
        
    Returns:
        str: The user ID extracted from the JWT
        
    Raises:
        HTTPException: If no valid token is found or if the token is invalid
    """
    # Try to get user_id from token in query param (for EventSource which can't set headers)
    if token:
        try:
            payload = _verify_jwt_token(token)
            user_id = payload.get('sub')
            if user_id:
                return user_id
        except (HTTPException, PyJWTError):
            pass
    
    # If no valid token in query param, try to get it from the Authorization header
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        try:
            # Extract token from header
            header_token = auth_header.split(' ')[1]
            payload = _verify_jwt_token(header_token)
            user_id = payload.get('sub')
            if user_id:
                return user_id
        except (HTTPException, PyJWTError):
            pass
    
    # If we still don't have a user_id, return authentication error
    raise HTTPException(
        status_code=401,
        detail="No valid authentication credentials found",
        headers={"WWW-Authenticate": "Bearer"}
    )
async def verify_thread_access(client, thread_id: str, user_id: str):
    """
    Verify that a user has access to a specific thread based on account membership.
    
    Args:
        client: The Supabase client
        thread_id: The thread ID to check access for
        user_id: The user ID to check permissions for
        
    Returns:
        bool: True if the user has access
        
    Raises:
        HTTPException: If the user doesn't have access to the thread
    """
    # Query the thread to get account information
    thread_result = await client.table('threads').select('*,project_id').eq('thread_id', thread_id).execute()

    if not thread_result.data or len(thread_result.data) == 0:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    thread_data = thread_result.data[0]
    
    # Check if project is public
    project_id = thread_data.get('project_id')
    if project_id:
        project_result = await client.table('projects').select('is_public').eq('project_id', project_id).execute()
        if project_result.data and len(project_result.data) > 0:
            if project_result.data[0].get('is_public'):
                return True
        
    account_id = thread_data.get('account_id')
    # When using service role, we need to manually check account membership instead of using current_user_account_role
    if account_id:
        account_user_result = await client.schema('basejump').from_('account_user').select('account_role').eq('user_id', user_id).eq('account_id', account_id).execute()
        if account_user_result.data and len(account_user_result.data) > 0:
            return True
    raise HTTPException(status_code=403, detail="Not authorized to access this thread")

async def get_optional_user_id(request: Request) -> Optional[str]:
    """
    Extract the user ID from the JWT in the Authorization header if present,
    but don't require authentication. Returns None if no valid token is found.
    
    This function is used for endpoints that support both authenticated and 
    unauthenticated access (like public projects).
    
    Args:
        request: The FastAPI request object
        
    Returns:
        Optional[str]: The user ID extracted from the JWT, or None if no valid token
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    
    try:
        # Verify JWT signature if secret is available
        payload = _verify_jwt_token(token)
        
        # Supabase stores the user ID in the 'sub' claim
        user_id = payload.get('sub')
        
        return user_id
    except (HTTPException, PyJWTError):
        # Return None for optional auth - don't raise exception
        return None
