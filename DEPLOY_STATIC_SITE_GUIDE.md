# Deploying a Static Website with GitHub Pages

This guide covers how to deploy a static informational website (like **NHE-facts**) using GitHub Pages — GitHub's free built-in hosting for static sites.

---

## Prerequisites

- A GitHub repository containing your static site files (HTML, CSS, JS, images)
- The repo must contain an `index.html` at the root (or in a `/docs` folder)

## Option 1: Deploy Directly from a Branch (Simplest)

This is the fastest way if your site is plain HTML/CSS/JS with no build step.

### Steps

1. **Go to your repo** → **Settings** → **Pages** (left sidebar)
2. Under **Source**, select **Deploy from a branch**
3. Choose the branch (usually `main`) and folder (`/ (root)` or `/docs`)
4. Click **Save**

Your site will be live at:
```
https://<your-username>.github.io/<repo-name>/
```

For the NHE-facts repo, that would be:
```
https://davidmooreppf.github.io/NHE-facts/
```

### Important Notes

- **Private repos**: GitHub Pages for private repos requires a **GitHub Pro**, **Team**, or **Enterprise** plan. On a free plan, the repo must be public for Pages to work.
- Changes pushed to the selected branch auto-deploy within a few minutes.

---

## Option 2: Deploy with GitHub Actions (Recommended for More Control)

GitHub Actions gives you a CI/CD pipeline that can run a build step, validate files, and then deploy.

### Step 1: Enable GitHub Pages with Actions

1. Go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**

### Step 2: Add the Workflow File

Create the file `.github/workflows/deploy-pages.yml` in your repo (see the file included in this repo for a ready-to-use workflow).

### Step 3: Push and Verify

```bash
git add .github/workflows/deploy-pages.yml
git commit -m "Add GitHub Pages deployment workflow"
git push origin main
```

Then check the **Actions** tab in your repo to see the deployment running.

---

## Typical Static Site Structure

A well-organized static informational site looks like this:

```
NHE-facts/
├── index.html          # Homepage (required)
├── css/
│   └── style.css       # Stylesheets
├── js/
│   └── main.js         # JavaScript (if any)
├── images/             # Image assets
│   ├── logo.png
│   └── chart.png
├── pages/              # Additional pages
│   ├── about.html
│   └── sources.html
├── data/               # Data files (if any)
│   └── nhe-data.json
└── .github/
    └── workflows/
        └── deploy-pages.yml  # Deployment automation
```

---

## Custom Domain (Optional)

To use a custom domain instead of `github.io`:

1. Go to **Settings** → **Pages**
2. Enter your custom domain under **Custom domain**
3. Add a **CNAME** DNS record pointing to `<username>.github.io`
4. Check **Enforce HTTPS**

GitHub will automatically provision an SSL certificate.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| 404 after enabling Pages | Ensure `index.html` exists in the root of the selected branch/folder |
| Site not updating | Check the Actions tab for failed deployments; clear browser cache |
| Private repo won't deploy | Upgrade to GitHub Pro or make the repo public |
| CSS/JS not loading | Use relative paths (`./css/style.css`) not absolute (`/css/style.css`) |
| Images broken | Check file paths are case-sensitive (Linux servers are case-sensitive) |

---

## Summary

| Method | Best For | Build Step | Cost |
|--------|----------|------------|------|
| Branch deploy | Plain HTML/CSS/JS sites | None | Free (public repos) |
| GitHub Actions | Sites needing validation or build steps | Optional | Free (public repos) |

For a straightforward informational site like NHE-facts, **branch deploy** is the simplest option. If you want automated checks or a build process, use the **GitHub Actions workflow** included in this repo.
