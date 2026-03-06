# ClawMaster SaaS — E2E Test Plan

**Version:** 1.0
**Date:** 2026-03-05
**Coverage:** Manual & Automated E2E Testing

---

## 1. Authentication Flows

### 1.1 User Registration
- [ ] Navigate to `/register` page
- [ ] Enter valid email (e.g., `testuser@example.com`)
- [ ] Enter password (min 8 chars, must include uppercase and number)
- [ ] Confirm password matches
- [ ] Click "Sign Up"
- [ ] Verify redirect to `/onboarding` page
- [ ] Check email validation:
  - [ ] Reject invalid email format
  - [ ] Reject duplicate email
- [ ] Check password validation:
  - [ ] Reject password < 8 characters
  - [ ] Reject mismatched passwords

### 1.2 User Login
- [ ] Navigate to `/login` page
- [ ] Enter registered email
- [ ] Enter correct password
- [ ] Click "Login"
- [ ] Verify redirect to `/dashboard`
- [ ] Check session is established
- [ ] Test failed login:
  - [ ] Reject incorrect password
  - [ ] Show appropriate error message

### 1.3 User Logout
- [ ] Click logout button from dashboard/settings
- [ ] Verify session is cleared
- [ ] Verify redirect to login page
- [ ] Verify cannot access protected routes without session

### 1.4 Session Persistence
- [ ] Log in successfully
- [ ] Refresh page
- [ ] Verify still logged in
- [ ] Close browser tab
- [ ] Reopen browser
- [ ] Navigate to app
- [ ] Verify must log in again (session expired)

---

## 2. Onboarding Flow

### 2.1 Initial Onboarding
- [ ] After signup, land on `/onboarding`
- [ ] Fill out profile information:
  - [ ] Display name (optional)
  - [ ] Skill level (beginner/intermediate/advanced)
  - [ ] Learning goals (multi-select)
- [ ] Click "Get Started"
- [ ] Verify user_profiles record created with onboarding_complete = true
- [ ] Redirect to `/dashboard`

### 2.2 Skip Onboarding
- [ ] Option to skip onboarding (if implemented)
- [ ] Verify minimal profile is created
- [ ] Verify can still access dashboard

---

## 3. Dashboard Features

### 3.1 Dashboard Load
- [ ] Navigate to `/dashboard`
- [ ] Verify page loads within 3 seconds
- [ ] Display user profile (name, avatar)
- [ ] Display XP and current level
- [ ] Display recent activity
- [ ] Display recent achievements

### 3.2 Progress Overview
- [ ] Show total XP and level
- [ ] Show progress bar towards next level
- [ ] List recent modules worked on (last 5)
- [ ] Show completion percentages for in-progress modules
- [ ] Display recent achievements (last 5)

### 3.3 Quick Stats
- [ ] Show modules completed count
- [ ] Show total modules count
- [ ] Show learning streak (consecutive days)
- [ ] Show time spent learning (if tracked)

---

## 4. Learning Modules

### 4.1 Module Listing
- [ ] Navigate to `/learn` page
- [ ] List all available modules
- [ ] Show module title, description, level, estimated time
- [ ] Filter by level (beginner/intermediate/advanced)
- [ ] Sort by XP reward, time, or alphabetical
- [ ] Search modules by title/description

### 4.2 Module Details
- [ ] Click on module to view details
- [ ] Display full module content
- [ ] Show XP reward
- [ ] Show estimated time to complete
- [ ] Show prerequisites (if any)
- [ ] Show user's current progress

### 4.3 Module Progress
- [ ] Start module → create progress record with status="in_progress"
- [ ] Mark sections as read/completed
- [ ] Update progress bar (0-100%)
- [ ] Complete module → set status="completed", progress=100%
- [ ] Award XP on completion
- [ ] Mark completed_at timestamp

### 4.4 Multiple Module Scenarios
- [ ] Complete 1 module → check for "First Module" achievement
- [ ] Complete 5 modules → check for "Module Master" achievement
- [ ] Try to access advanced module without completing prerequisite → show locked state

---

## 5. Achievement System

### 5.1 Achievement Triggers
- [ ] **First Login** → Trigger on first dashboard visit
  - [ ] Award 50 XP
  - [ ] Show notification
  - [ ] Mark as notified
- [ ] **Module Completion**
  - [ ] 1 module completed
  - [ ] 5 modules completed
  - [ ] 10 modules completed (if exists)
- [ ] **Login Streak**
  - [ ] 7 consecutive days login
  - [ ] 30 consecutive days login
- [ ] **Channels Configured** → If user configures OpenClaw channels
- [ ] **Gateway Configured** → If user sets up OpenClaw gateway
- [ ] **ClawBot Messages** → 10+ messages with AI assistant
- [ ] **Early Signup** → If signed up before specific date

### 5.2 Achievement Notifications
- [ ] Notification appears when achievement unlocked
- [ ] Display achievement icon, title, description, XP reward
- [ ] Notification marks as "notified" after dismissed
- [ ] Unnotified achievements persist across sessions

### 5.3 Achievement List
- [ ] View `/achievements` page
- [ ] See all achievements with locked/unlocked status
- [ ] Show earned date for completed achievements
- [ ] Filter by earned/not earned
- [ ] Show total XP earned from achievements

### 5.4 XP System
- [ ] XP updates immediately on achievement earn
- [ ] Level calculation: level = floor(xp/500) + 1
- [ ] Test XP progression:
  - [ ] 0 XP = Level 1
  - [ ] 500 XP = Level 2
  - [ ] 1500 XP = Level 4
  - [ ] 2500+ XP = Level 6+
- [ ] Verify XP never decreases

---

## 6. AI Chat (ClawBot)

### 6.1 Chat Interface
- [ ] Navigate to `/chat`
- [ ] Load chat history for conversation
- [ ] Input message field functional
- [ ] Send button triggers API call
- [ ] Verify streaming response displays in real-time
- [ ] Messages appear in conversation order

### 6.2 Credit System
- [ ] User with 0 credits cannot send messages (unless using own API key)
- [ ] Message cost deducted from credits
- [ ] Credits display updated after message
- [ ] Show warning when credits low (< 10)

### 6.3 Conversations
- [ ] Create new conversation → POST to `/api/conversations`
- [ ] Load existing conversations
- [ ] Switch between conversations
- [ ] View conversation history
- [ ] Delete conversation (if implemented)

### 6.4 ClawBot Behavior
- [ ] AI responds to OpenClaw-related questions
- [ ] Provides code examples in code blocks
- [ ] Maintains conversation context (last 20 messages)
- [ ] Handles off-topic questions gracefully (redirects to OpenClaw)

---

## 7. Payments & Credits

### 7.1 Credit Purchase
- [ ] Navigate to `/checkout` or upgrade page
- [ ] Click "Buy 1000 Credits for $19"
- [ ] Redirect to PayPal sandbox
- [ ] Complete PayPal payment
- [ ] Verify return to `/checkout/success`

### 7.2 Order Creation
- [ ] POST to `/api/payments/create-order`
- [ ] Verify PayPal order created with:
  - [ ] Amount: $19.00 USD
  - [ ] Description: "ClawMaster Full Access — Lifetime License"
  - [ ] Return URL: `/checkout/success`
  - [ ] Cancel URL: `/checkout`
- [ ] Return order ID in response

### 7.3 Order Capture
- [ ] POST to `/api/payments/capture-order` with orderId
- [ ] Verify PayPal payment captured successfully
- [ ] Verify order status = "COMPLETED"
- [ ] Award 1000 credits to user
- [ ] Create purchase record in database
- [ ] Show success message to user

### 7.4 Credit Balance
- [ ] Display credits in user profile
- [ ] Credits persist across sessions
- [ ] Credit history (if implemented)

---

## 8. User Profile & Settings

### 8.1 Profile Settings
- [ ] Navigate to `/settings` or profile page
- [ ] Edit display name
- [ ] View email address
- [ ] View account created date
- [ ] View total XP and level

### 8.2 Preferences
- [ ] Theme toggle (dark/light)
- [ ] Email notifications toggle
- [ ] Language selection (if supported)

### 8.3 API Keys (Optional)
- [ ] Option to add custom OpenRouter API key
- [ ] Use custom key for chat instead of platform credits
- [ ] Regenerate/revoke API keys

---

## 9. Responsive Design

### 9.1 Mobile Devices (360px+)
- [ ] All pages responsive on mobile width
- [ ] Navigation accessible (hamburger menu if needed)
- [ ] Forms fill width appropriately
- [ ] Buttons touch-friendly (min 44px height)
- [ ] No horizontal scroll

### 9.2 Tablet (768px+)
- [ ] Layout optimized for tablet width
- [ ] Sidebar visible (if applicable)
- [ ] Comfortable touch interaction

### 9.3 Desktop (1280px+)
- [ ] Full layout with sidebar
- [ ] Multi-column layouts where appropriate
- [ ] No extraneous white space

---

## 10. Performance & Loading

### 10.1 Page Load Times
- [ ] Dashboard loads < 2 seconds on 4G
- [ ] Module page loads < 1.5 seconds
- [ ] Checkout flow < 1 second

### 10.2 Animations & Transitions
- [ ] Smooth page transitions
- [ ] Achievement notification animations
- [ ] Progress bar updates smoothly
- [ ] Chat messages appear smoothly

### 10.3 Real-time Updates
- [ ] Profile updates without reload
- [ ] Progress updates in real-time
- [ ] Achievements appear immediately

---

## 11. Error Handling & Edge Cases

### 11.1 Network Errors
- [ ] Show error banner on API failures
- [ ] Retry mechanism for transient failures
- [ ] Graceful fallbacks for missing data

### 11.2 Authentication Errors
- [ ] Handle expired sessions gracefully
- [ ] Redirect to login on 401
- [ ] Show authentication errors clearly

### 11.3 PayPal Errors
- [ ] Handle PayPal sandbox errors
- [ ] Show user-friendly error messages
- [ ] Allow retry on payment failure
- [ ] Don't award credits until payment confirmed

### 11.4 Database Errors
- [ ] Handle Supabase unavailability
- [ ] Show appropriate error messages
- [ ] Don't lose user data on failure

---

## 12. Security Checks

### 12.1 Authentication
- [ ] Passwords never logged
- [ ] Session tokens used in requests
- [ ] HTTPS enforced (production)
- [ ] XSS protection (Svelte escaping)

### 12.2 Authorization
- [ ] Users can only see their own data
- [ ] Users cannot modify others' progress
- [ ] Achievements verified server-side
- [ ] XP awards verified server-side

### 12.3 Data Protection
- [ ] Supabase RLS policies enforced
- [ ] API auth validated
- [ ] Environment variables not exposed
- [ ] PayPal credentials not in frontend

### 12.4 Input Validation
- [ ] Email format validated
- [ ] Progress percentage clamped 0-100
- [ ] Status values validated
- [ ] XP values positive

---

## 13. Browser Compatibility

- [ ] Chrome/Chromium latest
- [ ] Firefox latest
- [ ] Safari latest
- [ ] Edge latest
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 14. Acceptance Criteria Summary

| Criteria | Status | Notes |
|----------|--------|-------|
| Auth flow works (signup/login/logout) | [ ] | |
| Onboarding completes successfully | [ ] | |
| Dashboard loads and displays data | [ ] | |
| Modules list, load, track progress | [ ] | |
| Achievements trigger correctly | [ ] | |
| XP awards and levels calculate | [ ] | |
| ClawBot chat functional | [ ] | |
| PayPal integration works | [ ] | |
| Credits awarded and tracked | [ ] | |
| Responsive on mobile/tablet/desktop | [ ] | |
| No console errors | [ ] | |
| < 2s page load time | [ ] | |
| All error cases handled | [ ] | |
| Security validations pass | [ ] | |

---

## Test Execution Notes

**Environment:** Supabase Sandbox + PayPal Sandbox
**Browser DevTools:** Console open for error checking
**Test Data:** Use test@example.com account with known state
**Cleanup:** Clear test data after each full run

**Run Frequency:**
- Before each release
- After significant feature changes
- Weekly regression testing
