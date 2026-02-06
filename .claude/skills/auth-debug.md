# Auth Debug Skill

Comprehensive authentication and authorization debugging workflow for RehabCareLink.

## Overview

This skill helps diagnose authentication and authorization issues by examining backend middleware, frontend route guards, race conditions, and subscription state caching.

## Workflow Steps

### 1. Check Backend API Permission Middleware

Examine authentication and authorization middleware:

```bash
# Find all middleware files
find server -name "*middleware*" -o -name "*auth*" -o -name "*permission*"

# Search for authentication logic
grep -r "authenticate\|authorize\|permission\|role" server/ --include="*.js"
```

Key files to review:
- `server/index.js` - Main route definitions and middleware
- Any dedicated auth middleware files
- Route-specific permission checks

Look for:
- JWT token verification
- Session validation
- Role-based access control (RBAC)
- Permission checking logic
- Error handling for unauthorized access

### 2. Check Frontend Route Guards

Examine frontend routing and authentication guards:

```bash
# Find routing configuration
find src -name "*router*" -o -name "*route*"

# Search for auth guards and protected routes
grep -r "ProtectedRoute\|AuthGuard\|requireAuth\|isAuthenticated" src/ --include="*.jsx" --include="*.js"
```

Key files to review:
- `src/App.jsx` - Main routing setup
- `src/RehabCareLink.jsx` - Application entry point
- Any route guard components
- Authentication context providers

Look for:
- Route protection logic
- Redirect behavior for unauthenticated users
- Role-based route access
- Authentication state checks

### 3. Find Race Conditions in Auth State Loading

Search for authentication state initialization and loading:

```bash
# Find useEffect hooks that load auth state
grep -r "useEffect.*auth\|useEffect.*user\|useEffect.*login" src/ --include="*.jsx" --include="*.js" -A 5

# Find localStorage usage for auth
grep -r "localStorage.*auth\|localStorage.*token\|localStorage.*user" src/ --include="*.jsx" --include="*.js"

# Find async auth operations
grep -r "async.*auth\|await.*auth\|Promise.*auth" src/ --include="*.jsx" --include="*.js" -A 3
```

Common race condition patterns:
- Auth state loaded after component renders
- Multiple simultaneous auth checks
- Async operations without proper loading states
- Missing dependency arrays in useEffect
- Stale closures capturing old auth state

### 4. Check Subscription State Caching

Examine how subscription/permission state is cached:

```bash
# Find subscription-related state management
grep -r "subscription\|subscribe\|plan\|tier" src/ --include="*.jsx" --include="*.js" -A 3

# Find caching mechanisms
grep -r "cache\|memo\|useMemo\|useCallback" src/ --include="*.jsx" --include="*.js" | grep -i "auth\|user\|permission"

# Check for stale state issues
grep -r "useState.*user\|useState.*auth" src/ --include="*.jsx" --include="*.js" -A 5
```

Look for:
- Where subscription state is stored (localStorage, state, context)
- When subscription state is refreshed
- Cache invalidation logic
- Stale data after login/logout

### 5. Display All Relevant Code

After identifying issues, display the relevant code sections:

#### Backend Authentication Middleware

```bash
# Show main server file
cat server/index.js | head -200

# Show any auth middleware
find server -name "*auth*" -o -name "*middleware*" -exec cat {} \;
```

#### Frontend Auth Components

```bash
# Show main app component
cat src/App.jsx

# Show RehabCareLink component
cat src/RehabCareLink.jsx

# Show any auth context or hooks
find src -name "*auth*" -o -name "*user*" | grep -E "\.(jsx|js)$" | xargs cat
```

#### Route Protection Logic

```bash
# Show route definitions
grep -r "Route\|router" src/ --include="*.jsx" -B 2 -A 10
```

### 6. Analyze and Suggest Fixes

After reviewing all code, provide specific recommendations:

#### Common Auth Issues and Fixes

**Issue 1: Race Condition on Initial Load**

Symptoms:
- User sees login screen briefly before being redirected
- Protected routes flash "unauthorized" message
- Auth state not available when component mounts

Fix:
```javascript
// Add loading state
const [authLoading, setAuthLoading] = useState(true);

useEffect(() => {
  const loadAuth = async () => {
    try {
      // Load auth state from localStorage or API
      const user = await checkAuthStatus();
      setUser(user);
    } finally {
      setAuthLoading(false);
    }
  };
  loadAuth();
}, []);

// Don't render routes until auth is loaded
if (authLoading) {
  return <LoadingSpinner />;
}
```

**Issue 2: Stale Subscription Cache**

Symptoms:
- User permissions don't update after subscription change
- Features remain locked after upgrade
- Logout doesn't clear cached permissions

Fix:
```javascript
// Clear all auth-related cache on logout
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('subscription');
  localStorage.removeItem('permissions');
  setUser(null);
  setSubscription(null);
};

// Refresh subscription after changes
const refreshSubscription = async () => {
  const sub = await fetchSubscription();
  setSubscription(sub);
  localStorage.setItem('subscription', JSON.stringify(sub));
};
```

**Issue 3: Missing Backend Permission Checks**

Symptoms:
- Frontend shows/hides features but backend doesn't enforce
- API endpoints accessible without proper permissions
- Security vulnerability

Fix:
```javascript
// Add middleware to check permissions
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Apply to routes
app.post('/api/admin/action', requirePermission('admin'), (req, res) => {
  // Handler
});
```

**Issue 4: Token Expiration Not Handled**

Symptoms:
- User stays logged in with expired token
- API calls fail with 401 after some time
- No automatic token refresh

Fix:
```javascript
// Add token expiration check
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Check on app load and before API calls
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token && isTokenExpired(token)) {
    logout();
  }
}, []);
```

## Debugging Checklist

- [ ] Review backend authentication middleware
- [ ] Check backend authorization/permission logic
- [ ] Examine frontend route guards
- [ ] Find authentication context/state management
- [ ] Look for race conditions in auth loading
- [ ] Check useEffect dependency arrays
- [ ] Verify loading states during auth checks
- [ ] Review subscription state caching
- [ ] Check cache invalidation on logout
- [ ] Verify token expiration handling
- [ ] Test permission checks on both frontend and backend
- [ ] Display all relevant code before suggesting fixes

## Key Files to Check

### Backend
- `server/index.js` - Main server and routes
- `server/db.js` - Database queries for users/permissions
- Any middleware files

### Frontend
- `src/App.jsx` - Main routing
- `src/RehabCareLink.jsx` - App entry point
- `src/components/` - Auth-related components
- Any context providers for auth state

## Common Patterns to Search For

### Race Conditions
```javascript
// BAD: Auth state not loaded before render
useEffect(() => {
  loadUser();
}, []);
// Component renders before loadUser completes

// GOOD: Wait for auth before rendering
const [loading, setLoading] = useState(true);
useEffect(() => {
  loadUser().finally(() => setLoading(false));
}, []);
if (loading) return <Spinner />;
```

### Stale Cache
```javascript
// BAD: Cache never invalidated
const user = JSON.parse(localStorage.getItem('user'));

// GOOD: Refresh cache on important actions
const refreshUser = async () => {
  const user = await fetchUser();
  localStorage.setItem('user', JSON.stringify(user));
  setUser(user);
};
```

### Missing Backend Checks
```javascript
// BAD: Only frontend checks
if (user.role === 'admin') {
  <AdminButton />
}

// GOOD: Backend also enforces
app.post('/api/admin', requireAdmin, handler);
```

## Notes

- Always check both frontend AND backend for auth issues
- Race conditions are common with async auth loading
- Cache invalidation is critical for logout and permission changes
- Backend must enforce all permissions, not just frontend
- Use loading states to prevent race conditions
- Clear all auth-related data on logout
