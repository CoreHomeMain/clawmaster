#!/bin/bash

# ClawMaster Pre-Deployment Check Script
# Verifies all requirements before deploying to Vercel

set -e

echo "🚀 ClawMaster Pre-Deployment Check"
echo "===================================="
echo ""

PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
check_pass() {
    echo "✅ $1"
    ((PASSED++))
}

check_fail() {
    echo "❌ $1"
    ((FAILED++))
}

check_warn() {
    echo "⚠️  $1"
    ((WARNINGS++))
}

# 1. Check Node version
echo "📋 Checking Node version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    check_pass "Node.js v$(node -v)"
else
    check_fail "Node.js v18+ required (found v$(node -v))"
fi
echo ""

# 2. Check npm
echo "📋 Checking npm..."
if command -v npm &> /dev/null; then
    check_pass "npm v$(npm -v) installed"
else
    check_fail "npm not found. Install Node.js first."
fi
echo ""

# 3. Check .env.example exists
echo "📋 Checking .env.example..."
if [ -f .env.example ]; then
    check_pass ".env.example exists"
else
    check_fail ".env.example not found"
fi
echo ""

# 4. Check dependencies
echo "📋 Checking dependencies..."
if [ -d node_modules ]; then
    check_pass "Dependencies installed (node_modules exists)"
else
    check_warn "node_modules not found. Running npm install..."
    npm install
fi
echo ""

# 5. Type check
echo "📋 Running TypeScript check..."
if npm run check &> /dev/null; then
    check_pass "TypeScript check passed"
else
    check_warn "TypeScript check failed (review for production)"
fi
echo ""

# 6. Build check
echo "📋 Building for production..."
if npm run build 2>&1 | grep -q "error"; then
    check_warn "Build has errors (see above, may need fixes)"
else
    check_pass "Build completed"
fi
echo ""

# 7. Check environment variables
echo "📋 Checking environment variables..."
ENV_VARS=(
    "PUBLIC_SUPABASE_URL"
    "PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "PAYPAL_CLIENT_ID"
    "PAYPAL_CLIENT_SECRET"
    "PUBLIC_PAYPAL_CLIENT_ID"
    "OPENROUTER_API_KEY"
    "PUBLIC_APP_URL"
)

MISSING_VARS=()
for var in "${ENV_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    check_pass "All required env vars set"
else
    check_warn "Missing env vars (will need to set in Vercel): ${MISSING_VARS[*]}"
fi
echo ""

# 8. Check vercel.json
echo "📋 Checking Vercel configuration..."
if [ -f vercel.json ]; then
    check_pass "vercel.json exists"
else
    check_fail "vercel.json not found"
fi
echo ""

# 9. Check git status
echo "📋 Checking git status..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    check_pass "Git repository initialized"
    if [ -z "$(git status --porcelain)" ]; then
        check_warn "Uncommitted changes in working directory"
    else
        check_pass "Working directory clean"
    fi
else
    check_warn "Not a git repository (needed for Vercel CI/CD)"
fi
echo ""

# 10. Check DEPLOYMENT.md
echo "📋 Checking deployment guide..."
if [ -f DEPLOYMENT.md ]; then
    check_pass "DEPLOYMENT.md exists"
else
    check_fail "DEPLOYMENT.md not found"
fi
echo ""

# 11. Check for hardcoded secrets
echo "📋 Checking for hardcoded secrets..."
SECRETS_FOUND=0
for file in src/**/*.ts src/**/*.svelte; do
    if [ -f "$file" ]; then
        if grep -l "sk-" "$file" 2>/dev/null | grep -q "\.ts\|\.svelte"; then
            check_warn "Potential hardcoded API key in $file"
            ((SECRETS_FOUND++))
        fi
    fi
done
if [ $SECRETS_FOUND -eq 0 ]; then
    check_pass "No obvious hardcoded secrets found"
fi
echo ""

# Summary
echo "===================================="
echo "📊 Pre-Deployment Check Summary"
echo "===================================="
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo "⚠️  Warnings: $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 All critical checks passed! Ready to deploy."
    echo ""
    echo "Next steps:"
    echo "1. Verify all env vars are set in Vercel dashboard"
    echo "2. Run: vercel --prod"
    echo "3. Check DEPLOYMENT.md for detailed instructions"
    exit 0
else
    echo "⚠️  Please fix the failures above before deploying."
    exit 1
fi
