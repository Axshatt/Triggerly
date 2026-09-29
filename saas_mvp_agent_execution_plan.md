# SaaS MVP — Agent Execution Plan

## Objective

Build and deploy a production-ready MVP of the SaaS today.

The agent must work **step by step**, verify each stage before moving to the next, and avoid building unnecessary features.

### Definition of Done

A stranger must be able to:

1. Visit the landing page.
2. Understand what the product does.
3. Sign up / log in.
4. Enter the required input.
5. Run the core SaaS workflow.
6. Receive a useful result.
7. See usage/plan information.
8. Upgrade through payment.
9. Use the paid functionality after successful payment.
10. Access the product from the Vercel production URL.

---

# 1. Product Scope

Before writing code, inspect the existing repository and identify:

- Current framework
- Existing UI/components
- Existing database/auth
- Existing API routes
- Existing SuperProfile/MCP integration
- Existing payment integration
- Existing environment variables
- Existing deployment configuration

Do **not** replace working infrastructure unnecessarily.

## Product concept

The SaaS is intended for SuperProfile users/content creators, particularly educational creators who repeatedly add digital products to content and want to understand which content/product combinations generate purchases.

The product should make this workflow feel like a conversational assistant that sets things up for the creator rather than forcing them to perform repetitive manual work.

## Core problem

Creators currently spend time repeatedly adding products to content and manually tracking which content drives product purchases.

## Core value

Automate the repetitive setup and provide useful product/content performance information.

## MVP rule

Build only the smallest workflow that demonstrates this value.

Do not build:
- Mobile app
- Complex AI agent system
- Referral system
- Affiliate system
- Team accounts
- Large admin panel
- Multiple integrations unless required by the core workflow
- Complex animations
- Custom domain
- Microservices
- Kubernetes
- Unnecessary abstractions

---

# 2. Required User Flow

Implement this exact high-level flow:

```text
Landing Page
      ↓
Sign Up / Login
      ↓
Dashboard
      ↓
Connect / Configure SuperProfile
      ↓
Run Core Action
      ↓
MCP / Backend Processing
      ↓
Result
      ↓
Usage Tracking
      ↓
Upgrade / Payment
      ↓
Paid Features
```

If the current product architecture requires a different technical implementation, preserve the user-facing flow unless there is a strong reason not to.

---

# 3. Recommended Stack

Prefer the existing project stack.

If the project does not already specify alternatives, use:

- Next.js
- TypeScript
- Tailwind CSS
- Vercel
- Supabase for database/auth
- Stripe or Razorpay for payments
- SuperProfile MCP/API for the core integration

Do not migrate technologies merely for preference.

---

# 4. Phase 0 — Repository Audit

## Tasks

1. Inspect the complete repository structure.
2. Identify the application entry points.
3. Inspect `package.json`.
4. Inspect existing environment configuration.
5. Identify existing API routes.
6. Identify existing database schema.
7. Identify existing authentication.
8. Identify existing SuperProfile/MCP code.
9. Identify existing payment code.
10. Run the application locally.
11. Run the existing build.
12. Record existing errors before modifying anything.

## Acceptance criteria

The agent must know:

- How the application currently works.
- Which parts already exist.
- Which parts need to be built.
- Which parts should not be touched.

Create a short internal implementation checklist before proceeding.

---

# 5. Phase 1 — Core Backend

Build the core SaaS workflow before polishing the UI.

## Required backend flow

```text
Authenticated user
        ↓
Validate input
        ↓
Check user plan
        ↓
Check usage limit
        ↓
Call SuperProfile/MCP
        ↓
Process response
        ↓
Save result
        ↓
Record usage
        ↓
Return structured response
```

## Requirements

Every core API route must:

- Require authentication.
- Validate input.
- Validate user ownership.
- Check plan/usage limits.
- Handle MCP/API failures.
- Return predictable JSON.
- Avoid exposing secrets.
- Log useful errors without logging sensitive credentials.

## API behavior

Use clear HTTP status codes.

Example:

```text
200 = success
400 = invalid input
401 = unauthenticated
403 = plan/permission restriction
404 = resource not found
429 = usage limit
500 = unexpected server error
```

Do not expose raw internal errors to users.

---

# 6. Phase 2 — Database

Create or adapt a minimal schema.

## Users

Use the authentication provider's user table where possible.

Store:

```text
id
email
plan
created_at
```

## Usage

```text
id
user_id
action
credits_used
created_at
```

## Outputs

```text
id
user_id
input
result
created_at
```

Add additional tables only if the core workflow actually requires them.

## Security requirement

Every user-owned query must be scoped to the authenticated user's ID.

Never trust a user-provided `user_id`.

Bad:

```ts
db.outputs.find({ user_id: request.user_id })
```

Better:

```ts
db.outputs.find({ user_id: authenticatedUser.id })
```

Enable database-level row-level security where supported.

---

# 7. Phase 3 — Authentication

Implement:

- Sign up
- Login
- Logout
- Session persistence
- Protected dashboard
- Redirect unauthenticated users
- Password reset if supported by the selected auth provider

## Test

Verify:

- User can create an account.
- User can log in.
- User can log out.
- Refreshing the dashboard preserves the session.
- Logged-out users cannot call protected APIs.
- User A cannot access User B's data.

---

# 8. Phase 4 — Dashboard

Create a simple dashboard.

Required sections:

```text
Dashboard
├── Account / user information
├── Current plan
├── Usage
├── Core product action
└── Recent results
```

Do not create a complicated navigation system.

## Core action

The main action should be visually obvious.

Example:

```text
What do you want to automate?

[ Input / configuration ]

[ Run ]
```

The user should understand what to do without documentation.

---

# 9. Phase 5 — Core SuperProfile/MCP Integration

Connect the dashboard to the actual SuperProfile/MCP workflow.

## Important rule

Do not expose MCP complexity to the user.

The user should see:

```text
Generate
```

or

```text
Set up
```

or another clear product action.

They should NOT need to understand:

- MCP
- API internals
- Tool schemas
- Server routing
- Authentication implementation

## Backend architecture

```text
Frontend
   ↓
Your API
   ↓
Authentication
   ↓
Authorization / usage check
   ↓
SuperProfile MCP
   ↓
Data processing
   ↓
Database
   ↓
Frontend
```

Reuse the existing MCP implementation if available.

If MCP integration is not yet implemented, inspect the available SuperProfile MCP tools/API and implement only the tools necessary for the MVP.

---

# 10. Phase 6 — Usage Limits

Implement server-side limits.

Example:

## Free

```text
5 core actions / month
```

## Pro

```text
100 core actions / month
```

These numbers are placeholders. Use the project's existing pricing decision if one exists.

## Requirements

Before running the expensive operation:

```text
Authenticate
→ Determine plan
→ Determine current usage
→ Compare against limit
→ Allow or reject
```

If rejected:

```text
You've reached your free usage limit.

[ Upgrade ]
```

The frontend must not be the only place enforcing limits.

---

# 11. Phase 7 — Payments

Implement a simple paid plan.

## Required flow

```text
Pricing
   ↓
Checkout
   ↓
Payment provider
   ↓
Webhook
   ↓
Verify payment
   ↓
Update user plan
   ↓
Unlock paid limits/features
```

## Critical rule

Do NOT upgrade users based only on a frontend success redirect.

The backend must verify payment using the payment provider's webhook/API.

## Store

At minimum:

```text
plan
subscription/customer ID if required
subscription status if required
```

Never store raw card details.

---

# 12. Phase 8 — Landing Page

Build the landing page after the core product works.

## Hero

Clearly communicate:

```text
What it does
+
Who it is for
+
What painful work it removes
```

Use one primary CTA.

Example:

```text
Try it free
```

## Required sections

### Hero

- Product name
- One-line value proposition
- CTA
- Product visual/demo

### Problem

Explain the repetitive manual workflow.

### Solution

Show:

```text
Connect → Automate → Track
```

Adapt these labels to the actual product.

### Product demo

Use screenshots or a short screen recording.

### Benefits

Focus on outcomes, not technical implementation.

### Pricing

Show Free and Pro if both exist.

### FAQ

Answer:

- What does it do?
- Who is it for?
- How does the integration work?
- Is there a free plan?
- How does billing work?
- How can users get support?

### CTA

Repeat the primary CTA.

---

# 13. Phase 9 — UX States

Every important async operation must have:

## Loading

Example:

```text
Setting things up...
```

## Success

Clearly show what happened.

## Error

Explain what the user can do next.

Bad:

```text
Error 500
```

Better:

```text
Something went wrong while connecting to SuperProfile.
Please try again.
```

## Empty state

Example:

```text
No results yet.

Run your first analysis to see your data here.
```

## Disabled state

Disable buttons while requests are running to prevent duplicate submissions.

---

# 14. Phase 10 — Security

Before deployment, verify:

- No API keys in frontend code.
- No secrets committed to Git.
- Protected API routes require authentication.
- User data is scoped to the authenticated user.
- Payment webhooks are verified.
- MCP credentials are server-side only.
- Inputs are validated.
- Rate/usage limits are server-side.
- Sensitive error details are not returned to users.
- Database access policies are enabled where applicable.

Search the repository for:

```text
API_KEY
SECRET
TOKEN
PASSWORD
PRIVATE_KEY
```

Make sure no actual secrets are committed.

---

# 15. Phase 11 — Analytics

Track the basic funnel.

Events:

```text
landing_view
signup
login
dashboard_view
core_action_started
core_action_completed
core_action_failed
checkout_started
payment_success
upgrade
```

The purpose is to answer:

```text
How many visitors?
        ↓
How many signups?
        ↓
How many activate?
        ↓
How many start checkout?
        ↓
How many pay?
```

Do not build a custom analytics dashboard today.

Use an existing analytics solution if already present.

---

# 16. Phase 12 — Production Deployment

Deploy to Vercel.

## Required environment variables

Use the actual variables required by the implementation.

Typical examples:

```env
DATABASE_URL=
AUTH_SECRET=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

MCP_API_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

NEXT_PUBLIC_APP_URL=
```

Do not blindly add variables that are not used.

## Vercel checklist

- Connect GitHub repository.
- Configure environment variables.
- Configure production environment.
- Deploy.
- Verify build.
- Verify production URL.
- Configure payment webhook URL.
- Verify authentication callback URLs.
- Verify MCP/API callback URLs if applicable.

The `vercel.app` domain is acceptable for the first launch.

Do NOT block launch waiting for a custom domain.

---

# 17. Phase 13 — Production Smoke Test

Run the following on the actual production URL.

## Visitor

```text
[ ] Landing page loads
[ ] CTA works
[ ] Pricing works
[ ] Mobile layout works
```

## Authentication

```text
[ ] Signup works
[ ] Login works
[ ] Logout works
[ ] Protected dashboard works
```

## Core product

```text
[ ] Input works
[ ] Core action works
[ ] MCP integration works
[ ] Result appears
[ ] Result is saved
```

## Usage

```text
[ ] Usage increments
[ ] Free limit works
[ ] Limit blocks additional requests
```

## Payments

```text
[ ] Checkout opens
[ ] Payment succeeds
[ ] Webhook is received
[ ] User plan changes
[ ] Paid limit is unlocked
```

---

# 18. Phase 14 — Security / Abuse Test

Act as a malicious user.

Test:

### Unauthenticated API

Call protected APIs without a session.

Expected:

```text
401
```

### Other user's data

Change resource IDs manually.

Expected:

```text
403 or 404
```

Never another user's data.

### Usage bypass

Try calling the API directly after reaching the limit.

Expected:

```text
429
```

or an equivalent upgrade response.

### Duplicate requests

Click the core action multiple times quickly.

Expected:

- No accidental duplicate charges.
- No uncontrolled duplicate jobs.
- No corrupted state.

### Payment bypass

Try changing the plan through browser devtools.

Expected:

- Nothing changes server-side.

---

# 19. Phase 15 — Performance Check

Do not optimize prematurely.

Check:

- Landing page loads reasonably quickly.
- Dashboard loads.
- Core request completes.
- Large results do not crash the UI.
- Images are optimized.
- No unnecessary API calls happen repeatedly.

Fix obvious performance problems only.

---

# 20. Phase 16 — Launch

After all tests pass:

1. Push production code.
2. Confirm Vercel deployment.
3. Open production URL in an incognito window.
4. Create a fresh test account.
5. Run the complete customer journey.
6. Confirm payment/upgrade flow.
7. Publish launch content.
8. Send the product directly to potential users.
9. Monitor errors and analytics.

---

# 21. Launch Messaging

Use a simple launch message.

Structure:

```text
I kept running into [problem].

So I built [product].

It lets [target user]:

→ [benefit 1]
→ [benefit 2]
→ [benefit 3]

It's live now.

Try it:
[URL]
```

Do not make exaggerated claims.

---

# 22. Post-Launch Priority

After launch, do NOT immediately build more features.

Collect evidence.

Track:

```text
Visitors
Signups
Activation
Core actions
Checkout starts
Payments
Retention
```

Talk to the first users.

Ask:

1. What were you trying to accomplish?
2. What did you expect the product to do?
3. Where did you get confused?
4. What part saved you the most time?
5. What would make you use it again?
6. What would make you pay more?
7. What did you expect that wasn't there?

Build the next feature only when the evidence supports it.

---

# Agent Operating Rules

The agent must follow these rules throughout implementation.

## Rule 1 — Work sequentially

Do not jump randomly between features.

Use:

```text
Audit
→ Backend
→ Database
→ Auth
→ Dashboard
→ MCP
→ Usage
→ Payments
→ Landing
→ Security
→ Analytics
→ Deployment
→ Testing
```

## Rule 2 — Verify before proceeding

After each major phase:

1. Run the relevant tests.
2. Run type checking.
3. Run linting if configured.
4. Run the application.
5. Confirm the feature manually where appropriate.
6. Fix errors before continuing.

## Rule 3 — Preserve working code

Do not rewrite existing functionality without a reason.

Prefer:

```text
small change
→ test
→ commit
→ next change
```

over:

```text
rewrite entire application
```

## Rule 4 — Don't over-engineer

If two implementations solve the problem, choose the simpler one.

## Rule 5 — Don't hide failures

If something cannot be implemented because a required credential, API, MCP capability, payment configuration, or external dependency is missing:

1. Identify the blocker.
2. Implement everything that can be implemented.
3. Clearly state what is blocked.
4. Do not fake successful functionality.

## Rule 6 — Never fake integrations

Do not create mock payment success, fake MCP responses, fake customer data, or fake analytics and present them as production functionality.

Mocks are allowed only for development/testing and must be clearly isolated.

## Rule 7 — Protect user data

Treat all customer data as private.

Every user-owned resource must be authorized server-side.

---

# Final Definition of Done

The task is complete only when all of the following are true:

```text
[ ] Existing repository audited
[ ] Core SaaS workflow works
[ ] Authentication works
[ ] Database works
[ ] User data isolation verified
[ ] SuperProfile/MCP integration works
[ ] Usage tracking works
[ ] Usage limits work
[ ] Payment flow works
[ ] Payment webhook verified
[ ] Paid plan unlock works
[ ] Landing page complete
[ ] Dashboard complete
[ ] Loading/error/empty states complete
[ ] Security checks complete
[ ] Analytics installed
[ ] Production environment configured
[ ] Vercel deployment succeeds
[ ] Production smoke test succeeds
[ ] Mobile layout checked
[ ] No secrets committed
[ ] Launch-ready URL available
```

## Most important goal

Do not optimize for:

> "I built a lot of features."

Optimize for:

> **"A real user can discover the product, sign up, get value, and pay without me manually doing anything."**
