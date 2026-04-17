---

name: auth-management
description: "Implement authentication and authorization systems using Better Auth and Neon Postgres with secure, scalable patterns."
risk: medium
source: custom
---

# Auth Management

## Purpose

Execute full authentication and authorization systems, including APIs, sessions, and database integration.

## Uses Knowledge From

* auth-implementation-patterns
* better-auth-best-practices

## Works With

* neon-postgres
* security-auditor
* api-design-principles
* api-rate-limiting

## Capabilities

* Build signup/login systems
* Configure Better Auth (`auth.ts`)
* Implement email/password and OAuth login
* Manage sessions (JWT, cookies, or Better Auth sessions)
* Create protected API routes
* Design user and session schema
* Integrate with Neon Postgres
* Handle logout, session refresh, and token validation

## When to Use

* When user asks to build authentication system
* When login/signup functionality is needed
* When securing APIs or routes
* When implementing user-based features
* When integrating Better Auth

## Do not use when

* Only auth theory or explanation is needed
* Only UI/login page design is requested

## Execution Plan

1. Analyze requirements using auth-implementation-patterns
2. Select authentication strategy (Better Auth + session/JWT)
3. Configure Better Auth:

   * Create `auth.ts`
   * Set environment variables
   * Configure database adapter (Neon)
4. Design database schema:

   * users
   * sessions
   * accounts (for OAuth)
5. Run migrations (Better Auth CLI)
6. Implement authentication endpoints:

   * signup
   * login
   * logout
   * session check
7. Add middleware for route protection
8. Connect APIs with Neon Postgres
9. Apply security best practices:

   * hashed passwords (bcrypt)
   * secure cookies
   * CSRF protection
10. Validate using security-auditor

## Output

* `auth.ts` configuration
* API route handlers
* Middleware for protected routes
* Database schema
* Example usage (client + server)

## Safety

* Never expose secrets, tokens, or credentials
* Always hash passwords
* Use secure cookies and HTTPS
* Enforce least privilege access
* Validate all inputs

## Notes

* Prefer Better Auth for flexibility and plugin support
* Use Neon Postgres for persistent storage
* Store sessions securely (DB or secondary storage)
* Ensure environment variables are properly configured
