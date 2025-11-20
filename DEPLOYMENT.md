# Campus GTM - Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ **1. Environment Setup**
- [ ] Supabase project created
- [ ] Supabase database migration executed successfully
- [ ] Clerk authentication configured
- [ ] At least one AI provider API key configured (Gemini/Claude/OpenAI)
- [ ] All environment variables set in hosting platform

### ✅ **2. Code Quality**
- [ ] `npm run build` completes without errors
- [ ] TypeScript strict mode enabled and passing
- [ ] No `console.log` statements in production code
- [ ] All error handlers in place
- [ ] No exposed secrets or API keys

### ✅ **3. Database**
- [ ] All 6 tables created in Supabase
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] RLS policies tested and working
- [ ] Database indexes created for performance
- [ ] Backup strategy configured

### ✅ **4. Authentication**
- [ ] Clerk production keys configured
- [ ] Sign-up flow tested
- [ ] Sign-in flow tested
- [ ] Protected routes verified
- [ ] Session management working

### ✅ **5. Security**
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] API rate limiting configured (if applicable)
- [ ] CORS configured correctly
- [ ] Content Security Policy set (if applicable)

---

## 🚀 Deployment Steps

### **Option 1: Deploy to Vercel (Recommended)**

#### **Step 1: Install Vercel CLI**
```bash
npm i -g vercel
```

#### **Step 2: Connect to Repository**
```bash
vercel login
vercel link
```

#### **Step 3: Set Environment Variables**
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add all variables from `.env.local`:
```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# AI Providers (at least one required)
GOOGLE_GEMINI_API_KEY=...
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
```

⚠️ **Important:** Use **Production** keys, not test keys!

#### **Step 4: Deploy**
```bash
# Production deployment
vercel --prod

# Or let GitHub auto-deploy on push to main
```

#### **Step 5: Verify Deployment**
- Visit your production URL
- Test sign-up flow
- Create a workspace
- Generate a strategy
- Verify database data in Supabase dashboard

---

### **Option 2: Deploy to Netlify**

#### **Step 1: Install Netlify CLI**
```bash
npm i -g netlify-cli
```

#### **Step 2: Initialize**
```bash
netlify login
netlify init
```

#### **Step 3: Configure Build Settings**
- Build command: `npm run build`
- Publish directory: `.next`
- Functions directory: `netlify/functions` (if using)

#### **Step 4: Set Environment Variables**
```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL "your_url"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your_key"
# ... repeat for all variables
```

#### **Step 5: Deploy**
```bash
netlify deploy --prod
```

---

### **Option 3: Self-Hosted (Docker)**

#### **Step 1: Create Dockerfile**
Already included in repository at `/Dockerfile`:

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

#### **Step 2: Build Docker Image**
```bash
docker build -t campus-gtm .
```

#### **Step 3: Run Container**
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="..." \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="..." \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..." \
  -e CLERK_SECRET_KEY="..." \
  -e GOOGLE_GEMINI_API_KEY="..." \
  campus-gtm
```

Or use `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    restart: unless-stopped
```

---

## 🔒 Security Best Practices

### **1. Environment Variables**
- ✅ Never commit `.env.local` or `.env.production`
- ✅ Use different keys for development and production
- ✅ Rotate API keys periodically
- ✅ Use Vercel/Netlify encrypted environment variables

### **2. Database Security**
- ✅ Enable RLS on all tables
- ✅ Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- ✅ Test RLS policies in Supabase dashboard
- ✅ Enable database backups

### **3. Authentication**
- ✅ Use Clerk production keys (`pk_live_...`, `sk_live_...`)
- ✅ Configure allowed redirect URLs in Clerk dashboard
- ✅ Enable MFA for admin accounts
- ✅ Set session timeout appropriately

### **4. API Keys**
- ✅ Set usage limits in AI provider dashboards
- ✅ Monitor API usage for abuse
- ✅ Implement rate limiting if needed
- ✅ Use separate keys per environment

---

## 📊 Monitoring & Logging

### **Recommended Tools**

#### **Error Tracking: Sentry**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Set `SENTRY_DSN` environment variable.

#### **Analytics: Vercel Analytics**
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### **Database Monitoring**
- Use Supabase Dashboard → Database → Performance
- Set up alerts for high query times
- Monitor storage usage

---

## 🧪 Post-Deployment Verification

### **Manual Testing Checklist**
```bash
# 1. Homepage loads
curl -I https://your-domain.com

# 2. Sign up works
# Test in browser

# 3. Database connection works
# Create a workspace → Check Supabase dashboard

# 4. AI generation works
# Complete onboarding → Verify strategy generates

# 5. Authentication protects routes
# Try accessing /dashboard without login
```

### **Automated Health Checks**
Create `/app/api/health/route.ts`:
```typescript
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    auth: await checkAuth(),
    timestamp: new Date().toISOString(),
  };

  const healthy = Object.values(checks).every(v => v === true);

  return Response.json(
    checks,
    { status: healthy ? 200 : 503 }
  );
}
```

---

## 🐛 Troubleshooting

### **Build Fails**
```bash
# Check TypeScript errors
npm run build

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
```

### **Database Connection Fails**
- Verify Supabase URL is correct
- Check anon key matches project
- Ensure RLS policies allow access
- Check network/firewall settings

### **Authentication Issues**
- Verify Clerk keys are production keys
- Check redirect URLs in Clerk dashboard
- Ensure middleware is configured correctly
- Check browser console for errors

### **AI Generation Fails**
- Verify API key is set correctly
- Check API key has credits/quota
- Monitor AI provider dashboard for errors
- Check network connectivity

---

## 📈 Scaling Considerations

### **When to Scale:**
- Response times > 2 seconds
- Database queries > 500ms
- Memory usage > 80%
- CPU usage consistently > 70%

### **Scaling Strategies:**
1. **Database:** Upgrade Supabase plan, add read replicas
2. **Compute:** Increase Vercel function memory/duration
3. **Caching:** Add Redis for session/data caching
4. **CDN:** Use Vercel Edge for static assets
5. **Load Balancing:** Multiple instances with load balancer

---

## 🔄 Rollback Procedure

### **Vercel:**
```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

### **Docker:**
```bash
# Tag previous image
docker tag campus-gtm:latest campus-gtm:rollback

# Revert to previous image
docker stop campus-gtm
docker run campus-gtm:previous
```

---

## 📞 Support & Maintenance

### **Regular Tasks:**
- [ ] Weekly: Check error logs
- [ ] Weekly: Review API usage/costs
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review database performance
- [ ] Quarterly: Rotate API keys
- [ ] Quarterly: Review and optimize queries

### **Emergency Contacts:**
- Supabase Status: https://status.supabase.com
- Clerk Status: https://status.clerk.com
- Vercel Status: https://www.vercel-status.com

---

**Last Updated:** 2024-11-19
**Version:** 1.0.0
