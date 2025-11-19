# Download Project from GitHub Codespace

## Your Project Location:
**Path in Codespace:** `/home/user/campusgtm`

## Method 1: Download Individual Files

1. **In VS Code (Codespace):**
   - Open the file you want (e.g., CLAUDE.md)
   - Right-click the file
   - Select "Download"
   - File saves to your computer's Downloads folder

## Method 2: Download Entire Folder

1. **In VS Code Explorer:**
   - Right-click on "campusgtm" folder (root)
   - Select "Download"
   - Entire project downloads as a folder

## Method 3: Create ZIP Archive

Run this in Codespace terminal:

```bash
# Create a ZIP of the entire project
cd /home/user
zip -r campusgtm-backup.zip campusgtm \
  -x "*/node_modules/*" \
  -x "*/.next/*" \
  -x "*/.git/*"

# This creates: campusgtm-backup.zip
# Download it from the file explorer
```

## Method 4: Use GitHub (Recommended)

Since your code is already in GitHub:

```bash
# On your local computer:
git clone https://github.com/adamwolfe2/campusgtm.git
cd campusgtm
git checkout claude/setup-campus-gtm-rules-01YTqb4XjPcaDLx3udWyBW26
```

## What You'll Get:

```
campusgtm/
├── CLAUDE.md                    ✅ Your development rules
├── DESIGN.md                    ✅ Design system
├── V0_COMPONENT_PROMPTS.md      ✅ v0 prompts
├── FINAL_AUDIT_REPORT.md        ✅ Complete audit
├── DEPLOYMENT.md                ✅ Deploy guide
├── V0_MIGRATION.md              ✅ v0 handoff
├── AUDIT_SUMMARY.md             ✅ Infrastructure audit
├── app/                         ✅ All pages
├── components/                  ✅ All components
├── lib/                         ✅ Services & utils
├── types/                       ✅ TypeScript types
├── supabase/                    ✅ Database migrations
└── package.json                 ✅ Dependencies
```

## Files Sizes (Approximate):

- **With node_modules:** ~800 MB
- **Without node_modules:** ~5 MB (recommended)
- **Just .md files:** < 1 MB

## Recommended: Download WITHOUT node_modules

```bash
# They can be reinstalled with: npm install
```
