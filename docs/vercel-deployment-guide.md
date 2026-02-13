# Deploying to Vercel (Free Tier) -- Beginner Guide

A step-by-step guide for deploying a simple interactive site on Vercel's free Hobby plan.

## Prerequisites

- A [GitHub](https://github.com) account
- [Node.js](https://nodejs.org) installed locally
- Your project ready to deploy (e.g., a Next.js app created with `npx create-next-app`)

## Step 1: Create a GitHub Repository

Create a repo on GitHub (private or public -- both work on the free tier).

**Using the GitHub CLI:**

```bash
cd your-project
gh repo create my-site --private --source=. --push
```

**Or manually:**

1. Go to https://github.com/new
2. Name your repo and set visibility (private is fine)
3. Push your local project:

```bash
git remote add origin git@github.com:YOUR_USERNAME/my-site.git
git branch -M main
git push -u origin main
```

### Can the repo be private?

Yes. Vercel's free Hobby tier supports deploying from **personal** private repositories. The only restriction is on repos owned by a **GitHub Organization** -- those require Vercel's paid Pro plan for direct integration.

## Step 2: Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com) and click **Sign Up**
2. Choose **Continue with GitHub**
3. Authorize Vercel to access your GitHub account
4. This creates a free Hobby account -- no credit card required

## Step 3: Import and Deploy Your Project

1. In the Vercel dashboard, click **Add New** > **Project**
2. Find and select your GitHub repository
3. Vercel auto-detects your framework (Next.js, Vite, etc.) and configures build settings
4. Click **Deploy**
5. Wait for the build to complete -- you'll get a live URL like `https://my-site.vercel.app`

## Step 4: Automatic Deployments

Once connected, Vercel deploys automatically:

- **Push to `main`** -- triggers a production deployment
- **Open a pull request** -- creates a preview deployment with a unique URL

No CI/CD configuration needed. It just works.

## Alternative: Deploy with the Vercel CLI

If you prefer not to use GitHub integration:

```bash
# Install the CLI
npm i -g vercel

# Log in
vercel login

# Deploy (creates a preview deployment)
vercel

# Deploy to production
vercel --prod
```

## Using Claude Code in the Workflow

Claude Code can help you build and iterate on your site. A typical workflow:

1. Use Claude Code to create or modify your project
2. Test locally with `npm run dev`
3. Commit and push -- Vercel deploys automatically

```bash
# After making changes with Claude Code
git add .
git commit -m "Add interactive feature"
git push
# Vercel picks up the push and deploys
```

## Free Tier (Hobby Plan) Limits

| Resource                     | Limit              |
| ---------------------------- | ------------------ |
| Bandwidth                    | 100 GB / month     |
| Build minutes                | 6,000 / month      |
| Serverless function duration | 60 seconds max     |
| Team members                 | 1 (personal only)  |
| Commercial use               | Not allowed         |
| Edge requests                | 1M / month         |

These limits are generous for personal projects, portfolios, and demos. If you exceed a limit, usage pauses until the 30-day window resets.

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click **Domains**
3. Add your custom domain and follow the DNS configuration instructions
4. Vercel provides free HTTPS certificates automatically

## Troubleshooting

**Build fails:** Check the build logs in the Vercel dashboard. Common issues are missing dependencies (run `npm install` locally first) or environment variables not set in Vercel's project settings.

**Deploy doesn't trigger:** Make sure the GitHub user who pushes is the same user who owns the Vercel project. This is a requirement on the Hobby plan.

**Organization repo won't import:** Vercel requires a Pro plan for GitHub Organization repos. Workaround: use GitHub Actions with the Vercel CLI to deploy under your personal account. See the [Vercel docs on Git deployment](https://vercel.com/docs/git) for details.
