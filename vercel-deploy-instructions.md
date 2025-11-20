# Deploy Campus GTM to Vercel

## Quick Deploy Steps:

1. **Go to Vercel Dashboard:**
   https://vercel.com/new

2. **Import Git Repository:**
   - Click "Import Project"
   - Select "Import Git Repository"
   - Authorize GitHub if needed
   - Select: `adamwolfe2/campusgtm`

3. **Configure Project:**
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next
   - Install Command: `npm install`

4. **Environment Variables:**
   Add these in Vercel dashboard (copy from .env.local):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://cymlsawrricfuqgrxtjj.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   GOOGLE_GEMINI_API_KEY=your_gemini_key (optional)
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait ~2 minutes
   - Get your URL: https://campusgtm.vercel.app

## After Deployment:

1. **Update Clerk Settings:**
   - Go to https://dashboard.clerk.com
   - Add your Vercel URL to allowed domains
   - Update redirect URLs

2. **Update Supabase Settings:**
   - Go to https://supabase.com/dashboard
   - Add Vercel URL to allowed origins

3. **Test the Site:**
   - Visit your Vercel URL
   - Test onboarding flow
   - Test workspace creation

## Then Use v0:

Once deployed, you can:
1. Share the Vercel URL with v0 for reference
2. Generate components based on your live site
3. Copy improved components back to your codebase
