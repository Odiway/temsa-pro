# Git Commands to Push Changes

After installing Git, restart your PowerShell terminal and run these commands in order:

## 1. Initialize Git repository (if not already done)
```powershell
cd "c:\Users\tinan\Downloads\temsa-pro\temsa-pro-main"
git init
```

## 2. Configure Git (replace with your GitHub credentials)
```powershell
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

## 3. Add all files to staging
```powershell
git add .
```

## 4. Commit your changes
```powershell
git commit -m "Fix role management and add Turkish translations

- Added comprehensive Turkish translation system
- Fixed role naming inconsistencies (DEPARTMENT/FIELD vs DEPARTMENT_HEAD/FIELD_WORKER)
- Updated user management APIs with role normalization
- Enhanced user management UI with Turkish localization
- Prepared production configuration for Vercel deployment"
```

## 5. Add your GitHub repository as remote (replace with your actual repo URL)
```powershell
git remote add origin https://github.com/yourusername/your-repo-name.git
```

## 6. Push to GitHub
```powershell
git push -u origin main
```

## Alternative: If repository already exists on GitHub
If you already have a GitHub repository set up:

```powershell
git remote set-url origin https://github.com/yourusername/your-repo-name.git
git push origin main
```

## Troubleshooting

If you get authentication errors:
1. Use GitHub Personal Access Token instead of password
2. Or set up SSH keys for GitHub

If you get "branch not found" errors:
```powershell
git branch -M main
git push -u origin main
```
