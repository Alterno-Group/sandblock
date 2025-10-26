# How to Get On-Ramp API Keys - Complete Guide

This guide will walk you through getting API keys for all three supported on-ramp providers: MoonPay, Transak, and Ramp Network.

---

## 🌙 MoonPay

MoonPay is one of the most popular crypto on-ramp providers with support for 160+ countries.

### Step 1: Create an Account

1. Go to [https://www.moonpay.com/](https://www.moonpay.com/)
2. Click **"Sign Up"** or **"Get Started"**
3. Fill in your business information:
   - Business name: "SandBlock"
   - Email address
   - Password

### Step 2: Access the Dashboard

1. After signing up, log in to [https://www.moonpay.com/dashboard](https://www.moonpay.com/dashboard)
2. You'll be redirected to the MoonPay Developer Portal

### Step 3: Get Your API Key

1. Navigate to **"API Keys"** or **"Settings"** section
2. You should see your API keys:
   - **Publishable Key** (starts with `pk_test_` for test mode)
   - **Secret Key** (starts with `sk_test_` for test mode)
3. Copy the **Publishable Key** (this is what you need for the frontend)

### Step 4: Enable Test Mode (Optional)

For development:
1. Look for a toggle between **Test Mode** and **Live Mode**
2. Use **Test Mode** keys for development
3. Use **Live Mode** keys for production

### Step 5: Configure Your Integration

1. In the dashboard, go to **"Integration"** or **"Settings"**
2. Add your website URL to the allowed domains
3. Configure webhook URLs (optional for now)

### API Key Format:
```
Test: pk_test_xxxxxxxxxxxxxxxxxxxxx
Live: pk_live_xxxxxxxxxxxxxxxxxxxxx
```

### Environment Variable:
```bash
NEXT_PUBLIC_MOONPAY_API_KEY=pk_test_your_key_here
```

---

## 💳 Transak

Transak offers low fees and global coverage with a developer-friendly API.

### Step 1: Create an Account

1. Go to [https://transak.com/](https://transak.com/)
2. Click **"Get Started"** or **"Sign Up"**
3. Choose **"I'm a business"** or **"Partner with us"**

### Step 2: Register Your Application

1. Fill in the partner application form:
   - Company/Project name: "SandBlock"
   - Website: Your website URL
   - Email address
   - Use case: "Energy investment platform"
   - Expected volume: Select appropriate range
2. Submit the application

### Step 3: Access the Developer Dashboard

1. You'll receive an email with login credentials
2. Go to [https://global.transak.com/partners/login](https://global.transak.com/partners/login)
3. Log in with your credentials

### Step 4: Get Your API Key

1. Navigate to **"Settings"** → **"API Keys"**
2. You'll see:
   - **Staging/Test API Key** (for development)
   - **Production API Key** (for live use)
3. Copy the **Staging API Key** for development

### Step 5: Configure Your Integration

1. Go to **"Integration"** section
2. Add your website domain to the whitelist
3. Configure allowed cryptocurrencies (enable USDT)
4. Set up webhook URLs (optional)

### API Key Format:
```
Test: your-staging-api-key-here
Live: your-production-api-key-here
```

### Environment Variable:
```bash
NEXT_PUBLIC_TRANSAK_API_KEY=your-staging-api-key-here
```

### Note:
Transak may require a video call or additional verification before approving your account, especially for production access.

---

## 🚀 Ramp Network

Ramp Network offers fast KYC and is particularly popular in Europe.

### Step 1: Create an Account

1. Go to [https://ramp.network/](https://ramp.network/)
2. Click **"For Businesses"** or **"Get Started"**
3. Choose **"Become a Partner"**

### Step 2: Register Your Business

1. Fill in the registration form:
   - Company name: "SandBlock"
   - Website URL
   - Email address
   - Business type: "DeFi/Web3 Platform"
2. Submit the application

### Step 3: Access the Dashboard

1. After approval, you'll receive an email with access to the dashboard
2. Go to [https://app.ramp.network/](https://app.ramp.network/)
3. Log in with your credentials

### Step 4: Get Your API Key

1. Navigate to **"Settings"** → **"API"** or **"Developers"**
2. You'll see your **Host API Key**
3. Copy the key (it's the same for both test and production)

### Step 5: Configure Your Integration

1. In the dashboard, add your website URL to allowed origins
2. Configure supported assets (enable USDT)
3. Set up webhooks (optional)

### API Key Format:
```
your-ramp-api-key-here (alphanumeric string)
```

### Environment Variable:
```bash
NEXT_PUBLIC_RAMP_API_KEY=your-ramp-api-key-here
```

### Note:
Ramp Network typically has a faster approval process than Transak, often within 24-48 hours.

---

## 📝 Setting Up Environment Variables

After getting your API keys, add them to your `.env.local` file:

### Step 1: Open .env.local

```bash
cd /Users/macintoshhd/SandBlock/SandBlock/packages/frontend
nano .env.local
```

### Step 2: Add Your API Keys

```bash
# On-Ramp Payment Providers
NEXT_PUBLIC_MOONPAY_API_KEY=pk_test_your_moonpay_key_here
NEXT_PUBLIC_TRANSAK_API_KEY=your_transak_staging_key_here
NEXT_PUBLIC_RAMP_API_KEY=your_ramp_api_key_here
```

### Step 3: Save and Restart

1. Save the file (Ctrl+O, Enter, Ctrl+X in nano)
2. Restart your Next.js development server:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   yarn dev
   ```

### Step 4: Verify

1. Open the app in your browser
2. Click "Invest in This Project"
3. Click "💳 Buy USDT"
4. The provider buttons should now be enabled (not grayed out)

---

## 🧪 Testing Your Integration

### Test Mode Recommendations:

1. **MoonPay Test Mode**:
   - Use test credit card: `4000 0000 0000 0002`
   - CVV: any 3 digits
   - Expiry: any future date
   - [Full test card list](https://dev.moonpay.com/docs/test-mode)

2. **Transak Staging**:
   - Use test environment
   - Test transactions won't use real money
   - Verify integration before going live

3. **Ramp Network**:
   - Ramp automatically detects test vs production
   - Use test mode by default during development

---

## 💰 Fee Comparison

| Provider | Fees | KYC Speed | Countries | Best For |
|----------|------|-----------|-----------|----------|
| **MoonPay** | 3.5-4.5% | Medium | 160+ | Global reach |
| **Transak** | 0.99-2% | Slow | 150+ | Low fees |
| **Ramp Network** | 2.5-3.5% | Fast | EU focus | European users |

---

## 🔐 Security Best Practices

### 1. Use Environment Variables
```bash
# ✅ Good - Environment variables (never committed to git)
NEXT_PUBLIC_MOONPAY_API_KEY=pk_test_xxx

# ❌ Bad - Hardcoded in code
const apiKey = "pk_test_xxx"; // DON'T DO THIS
```

### 2. Separate Test and Production Keys
```bash
# Development (.env.local)
NEXT_PUBLIC_MOONPAY_API_KEY=pk_test_xxx

# Production (.env.production)
NEXT_PUBLIC_MOONPAY_API_KEY=pk_live_xxx
```

### 3. Restrict API Key Permissions
- Limit to specific domains
- Use read-only keys where possible
- Regularly rotate production keys

### 4. Add .env.local to .gitignore
```bash
# Verify it's ignored:
cat .gitignore | grep .env.local

# Should show:
# .env*.local
```

---

## 🚫 Troubleshooting

### Issue 1: "On-ramp providers not configured"

**Cause**: API keys not set or not loaded

**Solution**:
```bash
# Check if .env.local exists:
ls packages/frontend/.env.local

# If not, create it:
touch packages/frontend/.env.local

# Add your keys:
nano packages/frontend/.env.local
```

### Issue 2: Buttons are grayed out/disabled

**Cause**: API keys are empty or invalid

**Solution**:
1. Check that keys are correctly formatted (no extra spaces)
2. Verify keys start with correct prefix:
   - MoonPay: `pk_test_` or `pk_live_`
   - Transak: alphanumeric string
   - Ramp: alphanumeric string
3. Restart your dev server after adding keys

### Issue 3: Payment window doesn't open

**Cause**: Browser popup blocker

**Solution**:
1. Allow popups for localhost:3000
2. Test in different browser
3. Check browser console for errors

### Issue 4: API key not found in environment

**Cause**: Next.js not loading .env.local

**Solution**:
```bash
# Verify environment variables are loaded:
# Add this to OnRampModal.tsx temporarily:
console.log('MoonPay:', process.env.NEXT_PUBLIC_MOONPAY_API_KEY);
console.log('Transak:', process.env.NEXT_PUBLIC_TRANSAK_API_KEY);
console.log('Ramp:', process.env.NEXT_PUBLIC_RAMP_API_KEY);

# Should show your keys in browser console
# If showing 'undefined', restart your dev server
```

---

## 📋 Quick Setup Checklist

- [ ] Register with MoonPay → Get publishable API key
- [ ] Register with Transak → Get staging API key
- [ ] Register with Ramp Network → Get host API key
- [ ] Create/edit `packages/frontend/.env.local`
- [ ] Add all three API keys to `.env.local`
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Restart Next.js dev server
- [ ] Test "Buy USDT" button
- [ ] Verify provider buttons are enabled
- [ ] Click a provider to test popup window
- [ ] Complete a test transaction (optional)

---

## 🔗 Useful Links

### Documentation:
- [MoonPay Docs](https://dev.moonpay.com/docs)
- [Transak Docs](https://docs.transak.com/)
- [Ramp Network Docs](https://docs.ramp.network/)

### Dashboards:
- [MoonPay Dashboard](https://www.moonpay.com/dashboard)
- [Transak Dashboard](https://global.transak.com/partners)
- [Ramp Dashboard](https://app.ramp.network/)

### Support:
- MoonPay: support@moonpay.com
- Transak: partners@transak.com
- Ramp Network: hello@ramp.network

---

## 💡 Alternative Option: Use Without API Keys

If you want to test quickly without getting API keys:

### Option 1: Use Manual Testing

Users can still buy USDT manually:
1. Use the **"💧 Faucet"** button to get test USDT on testnet
2. Or use a centralized exchange (Binance, Coinbase) to buy USDT
3. Transfer USDT to their wallet
4. Then invest in projects

### Option 2: Implement Custom On-Ramp

You could also implement your own on-ramp solution:
- Integrate with Circle's USDC/USDT APIs directly
- Use Coinbase Commerce
- Set up a manual process for large investors

---

## 📊 Recommended Setup for Different Stages

### 🧪 Development (Local Testing)
```bash
NEXT_PUBLIC_MOONPAY_API_KEY=pk_test_xxx
NEXT_PUBLIC_TRANSAK_API_KEY=staging_xxx
NEXT_PUBLIC_RAMP_API_KEY=test_xxx
```

### 🚀 Staging (Testnet Deployment)
```bash
NEXT_PUBLIC_MOONPAY_API_KEY=pk_test_xxx
NEXT_PUBLIC_TRANSAK_API_KEY=staging_xxx
NEXT_PUBLIC_RAMP_API_KEY=test_xxx
```

### 💼 Production (Mainnet)
```bash
NEXT_PUBLIC_MOONPAY_API_KEY=pk_live_xxx
NEXT_PUBLIC_TRANSAK_API_KEY=production_xxx
NEXT_PUBLIC_RAMP_API_KEY=live_xxx
```

---

## ✅ Summary

To get your SandBlock on-ramp working:

1. **Register** with all three providers (MoonPay, Transak, Ramp)
2. **Get API keys** from each dashboard
3. **Add keys** to `packages/frontend/.env.local`
4. **Restart** your Next.js server
5. **Test** the "Buy USDT" button

**Estimated Time**:
- MoonPay: 5-10 minutes (instant approval for test mode)
- Transak: 1-3 days (manual review required)
- Ramp Network: 1-2 days (faster than Transak)

**Recommendation**: Start with **MoonPay** for immediate testing, then add the others as they're approved.

---

**Need help?** Check the [troubleshooting section](#-troubleshooting) or reach out to each provider's support team.

Good luck! 🚀
