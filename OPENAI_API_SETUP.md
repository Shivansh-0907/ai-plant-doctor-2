# 🔑 OpenAI API Setup Guide

## Current Issue

Your Plant Analyzer is getting an **"Internal server error"** from OpenAI's API. This typically means:

1. ❌ The API key is **invalid or expired**
2. ❌ The OpenAI account doesn't have **billing enabled**
3. ❌ The API key has **insufficient credits/quota**
4. ❌ The API key doesn't have access to **vision models** (GPT-4o-mini)

## How to Fix

### Step 1: Verify Your OpenAI Account

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Log in to your account
3. Check your account status

### Step 2: Enable Billing (Required for API Access)

1. Navigate to [Billing Settings](https://platform.openai.com/settings/organization/billing/overview)
2. Add a payment method
3. Add at least **$5-10 in credits** to start
4. ⚠️ **Without billing enabled, API calls will fail with "internal_error"**

### Step 3: Generate a New API Key

1. Go to [API Keys](https://platform.openai.com/api-keys)
2. Click **"Create new secret key"**
3. Give it a name (e.g., "Plant Analyzer")
4. **Important**: Copy the key immediately (you won't see it again!)
5. Your key should look like: `sk-proj-xxxxxxxxxxxxxxxxxx`

### Step 4: Update Your `.env` File

Replace the current `OPENAI_API_KEY` in your `.env` file:

```bash
OPENAI_API_KEY=your-new-api-key-here
```

### Step 5: Restart the Dev Server

After updating the API key, restart your development server to load the new environment variable.

## API Costs

The Plant Analyzer uses `gpt-4o-mini` which is very cost-effective:

- **Input**: ~$0.15 per 1M tokens
- **Output**: ~$0.60 per 1M tokens
- **Typical analysis**: ~$0.001-0.005 per image (very cheap!)

With $10 in credits, you can analyze **thousands of images**.

## Testing the Fix

Once you've:
1. ✅ Enabled billing
2. ✅ Generated a new API key
3. ✅ Updated your `.env` file
4. ✅ Restarted the dev server

Try uploading a plant image to test!

## Still Having Issues?

Check the server logs for detailed error messages. The error will now show:
- Whether it's an API key issue
- Whether it's a quota issue
- The exact OpenAI error message

## Alternative: Use a Different AI Provider

If you don't want to use OpenAI, you can:
- Use **Anthropic Claude** (has vision capabilities)
- Use **Google Gemini** (has vision capabilities)
- Use **Hugging Face** models (free but self-hosted)

Let me know if you want to switch to a different provider!
