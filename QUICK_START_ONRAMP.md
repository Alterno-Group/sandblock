# Quick Start: Enable "Buy USDT" Feature

This guide will help you enable the "Buy USDT" button in under 10 minutes using MoonPay test mode.

---

## 🚀 Fastest Method (MoonPay Test Mode)

### Step 1: Get MoonPay Test API Key (2 minutes)

1. Go to: **https://www.moonpay.com/**
2. Click **"Sign Up"** → Fill in basic info
3. Go to dashboard: **https://www.moonpay.com/dashboard**
4. Navigate to **"API Keys"** section
5. Copy your **Publishable Test Key** (starts with `pk_test_`)

### Step 2: Create .env.local File (1 minute)

```bash
# Navigate to frontend directory
cd /Users/macintoshhd/SandBlock/SandBlock/packages/frontend

# Copy the example file
cp .env.local.example .env.local

# Open the file
nano .env.local
```

### Step 3: Add Your API Key (1 minute)

Paste this into `.env.local`:

```bash
# On-Ramp Payment Providers
NEXT_PUBLIC_MOONPAY_API_KEY=pk_test_YOUR_KEY_HERE
```

Replace `pk_test_YOUR_KEY_HERE` with your actual MoonPay test key.

**Save**: Press `Ctrl+O`, `Enter`, `Ctrl+X`

### Step 4: Restart Your Server (1 minute)

```bash
# Go back to project root
cd ../..

# Stop your current server (Ctrl+C if running)

# Start it again
yarn dev
```

### Step 5: Test It! (1 minute)

1. Open: **http://localhost:3000**
2. Click on any project
3. Click **"Invest in This Project"**
4. Click **"💳 Buy USDT"** button
5. You should see the OnRamp modal with MoonPay enabled! ✅

---

## ✅ Verification Checklist

- [ ] MoonPay button is **NOT** grayed out
- [ ] Clicking MoonPay opens a new window
- [ ] You see the MoonPay test interface
- [ ] No "providers not configured" warning

---

## 🧪 Test a Purchase (Optional)

To test the full flow:

1. Click **MoonPay** in the OnRamp modal
2. In the MoonPay window, use test credit card:
   - **Card Number**: `4000 0000 0000 0002`
   - **CVV**: `123`
   - **Expiry**: `12/25` (any future date)
   - **ZIP**: `12345`
3. Complete the flow
4. **Note**: This is test mode - no real money is charged!

---

## 📱 What Users Will See

**Before (No API Keys)**:
```
❌ "On-ramp providers not configured"
❌ All buttons grayed out
```

**After (With MoonPay Key)**:
```
✅ MoonPay button active
❌ Transak button grayed out (no key)
❌ Ramp button grayed out (no key)
```

**After (All Keys Added)**:
```
✅ MoonPay button active
✅ Transak button active
✅ Ramp button active
```

---

## 🔄 Adding More Providers Later

### Add Transak (Optional):

1. Register: https://transak.com/
2. Get staging API key
3. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_TRANSAK_API_KEY=your_transak_key_here
   ```
4. Restart server

### Add Ramp Network (Optional):

1. Register: https://ramp.network/
2. Get host API key
3. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_RAMP_API_KEY=your_ramp_key_here
   ```
4. Restart server

---

## 🐛 Troubleshooting

### Issue: Button still grayed out after adding key

**Solution**:
```bash
# 1. Verify your .env.local file exists
ls packages/frontend/.env.local

# 2. Check the file content
cat packages/frontend/.env.local

# 3. Make sure the key has no extra spaces
# Bad:  NEXT_PUBLIC_MOONPAY_API_KEY= pk_test_xxx
# Good: NEXT_PUBLIC_MOONPAY_API_KEY=pk_test_xxx

# 4. Restart the dev server
yarn dev
```

### Issue: "On-ramp providers not configured" still shows

**Cause**: Environment variable not loaded

**Solution**:
```bash
# Stop the server completely (Ctrl+C)
# Wait 2 seconds
# Start again
yarn dev

# If still not working, try:
yarn clean
yarn install
yarn dev
```

### Issue: Can't find .env.local file

**Solution**:
```bash
# Create it manually
cd packages/frontend
touch .env.local
nano .env.local

# Paste your API key:
NEXT_PUBLIC_MOONPAY_API_KEY=pk_test_your_key_here

# Save and exit: Ctrl+O, Enter, Ctrl+X
```

---

## 📊 Quick Reference

| Provider | Registration | Approval Time | Best For |
|----------|-------------|---------------|----------|
| **MoonPay** | https://moonpay.com | Instant (test) | Quick testing |
| **Transak** | https://transak.com | 1-3 days | Low fees |
| **Ramp** | https://ramp.network | 1-2 days | Europe |

---

## 🎯 Next Steps

Once you have MoonPay working:

1. **Test the full investment flow**:
   - Buy test USDT with MoonPay
   - Invest in a project
   - Verify investment recorded

2. **Add other providers**:
   - Register with Transak
   - Register with Ramp Network
   - Add their API keys

3. **Prepare for production**:
   - Get production API keys
   - Test on testnet first
   - Deploy to production

---

## 📚 More Information

- **Full Setup Guide**: See [ONRAMP_API_KEYS_GUIDE.md](ONRAMP_API_KEYS_GUIDE.md)
- **API Key Management**: See [.env.local.example](.env.local.example)
- **Troubleshooting**: See [BUY_USDT_BUTTON_FIX.md](BUY_USDT_BUTTON_FIX.md)

---

## ✨ Summary

**Total Time**: ~5-10 minutes

1. Get MoonPay test key → 2 min
2. Create `.env.local` → 1 min
3. Add API key → 1 min
4. Restart server → 1 min
5. Test the button → 1 min

**Result**: Working "Buy USDT" button! 🎉

---

**Need Help?**

- Check browser console for errors
- Verify API key format: `pk_test_xxxxxx...`
- Make sure `.env.local` is in correct location: `packages/frontend/.env.local`
- Restart dev server after any changes

Good luck! 🚀
