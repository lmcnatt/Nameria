# pnpm Setup Guide

This project uses **pnpm** (performant npm) as the package manager instead of npm. pnpm is faster, more efficient with disk space, and has better monorepo support.

---

## Why pnpm?

- ⚡ **Faster**: 2x faster than npm, uses hard links and symlinks
- 💾 **Disk efficient**: Saves disk space with a global store
- 🔒 **Strict**: Better dependency resolution, prevents phantom dependencies
- 📦 **Monorepo friendly**: Native workspace support

---

## Installing pnpm

### Option 1: Using npm (Recommended)

```bash
npm install -g pnpm
```

### Option 2: Using Homebrew (macOS)

```bash
brew install pnpm
```

### Option 3: Using standalone script

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### Verify Installation

```bash
pnpm --version
# Should show: 8.0.0 or higher
```

---

## Basic pnpm Commands

| Task | npm | pnpm |
|------|-----|------|
| Install deps | `npm install` | `pnpm install` |
| Add package | `npm install pkg` | `pnpm add pkg` |
| Add dev dep | `npm install -D pkg` | `pnpm add -D pkg` |
| Remove package | `npm uninstall pkg` | `pnpm remove pkg` |
| Run script | `npm run script` | `pnpm run script` or `pnpm script` |
| Update deps | `npm update` | `pnpm update` |

---

## Project Setup with pnpm

### 1. Initial Installation

```bash
# Install all dependencies
pnpm install

# This installs:
# - Root dependencies (Tailwind CSS, AWS SDK)
# - Lambda function dependencies (via workspace)
```

### 2. Lambda Functions

This project uses pnpm workspaces for Lambda functions:

```bash
# Install dependencies for a specific Lambda
cd lambda/getSpecies
pnpm install

# Or install all workspace packages from root
pnpm install -r
```

### 3. Build Tailwind CSS

```bash
# Build CSS from Tailwind
pnpm run build:css

# This compiles:
# frontend/css/input.css → frontend/css/styles.css
```

---

## Project Structure with pnpm

```
Nameria/
├── pnpm-workspace.yaml    # Workspace configuration
├── package.json            # Root dependencies (Tailwind, scripts)
├── pnpm-lock.yaml         # Lock file (committed to git)
├── node_modules/          # Dependencies
├── lambda/
│   ├── getSpecies/
│   │   ├── package.json   # Function dependencies
│   │   └── node_modules/  # Function-specific deps
│   └── getSpeciesById/
│       ├── package.json
│       └── node_modules/
└── frontend/
    └── css/
        ├── input.css      # Tailwind source
        └── styles.css     # Compiled output
```

---

## Workspace Configuration

The `pnpm-workspace.yaml` defines workspace packages:

```yaml
packages:
  - 'lambda/*'
```

This allows pnpm to manage Lambda function dependencies efficiently.

---

## Common Tasks

### Install All Dependencies

```bash
# From project root
pnpm install

# This installs:
# 1. Root dependencies (Tailwind CSS)
# 2. All Lambda function dependencies
```

### Add a New Package

```bash
# Add to root (for Tailwind, build tools)
pnpm add -D package-name

# Add to specific Lambda function
cd lambda/getSpecies
pnpm add package-name
```

### Update Dependencies

```bash
# Update all packages
pnpm update

# Update specific package
pnpm update package-name

# Check outdated packages
pnpm outdated
```

### Build Frontend CSS

```bash
# Build Tailwind CSS
pnpm run build:css

# Watch mode (for development)
pnpm run build:css -- --watch
```

### Deploy Frontend

```bash
# Sync to S3
pnpm run deploy-frontend

# Invalidate CloudFront cache
pnpm run invalidate-cache
```

---

## CI/CD with pnpm

The `buildspec.yml` is configured for pnpm:

```yaml
install:
  commands:
    - npm install -g pnpm@8
    - cd lambda/getSpecies && pnpm install
    - cd lambda/getSpeciesById && pnpm install
    - pnpm install  # Root dependencies

pre_build:
  commands:
    - pnpm run build:css  # Build Tailwind
```

---

## Troubleshooting

### Issue: "pnpm: command not found"

**Solution**: Install pnpm globally:
```bash
npm install -g pnpm
```

### Issue: Permission errors

**Solution**: Use appropriate permissions or switch to nvm:
```bash
# Using sudo (not recommended)
sudo npm install -g pnpm

# Better: Use nvm
nvm install 18
npm install -g pnpm
```

### Issue: Workspace packages not found

**Solution**: Ensure `pnpm-workspace.yaml` exists and run:
```bash
pnpm install
```

### Issue: Old lock file

**Solution**: Remove old lock files:
```bash
# Remove npm/yarn lock files
rm package-lock.json yarn.lock

# Reinstall with pnpm
pnpm install
```

### Issue: Lambda deployment fails

**Solution**: Ensure dependencies are installed:
```bash
cd lambda/getSpecies && pnpm install
cd lambda/getSpeciesById && pnpm install
```

---

## Migration from npm

If you previously used npm:

```bash
# 1. Remove old lock file
rm package-lock.json

# 2. Remove node_modules (optional but recommended)
rm -rf node_modules
rm -rf lambda/*/node_modules

# 3. Install with pnpm
pnpm install

# 4. Verify everything works
pnpm run build:css
```

---

## Performance Benefits

### Installation Speed

```
npm install:     ~45 seconds
pnpm install:    ~22 seconds
(2x faster!)
```

### Disk Usage

```
npm:  125 MB in node_modules
pnpm: 85 MB in node_modules + global store
(Reuses packages across projects)
```

### Strictness

pnpm prevents accessing packages not listed in `package.json`, catching bugs early.

---

## Best Practices

1. **Always commit `pnpm-lock.yaml`**: Ensures consistent installs
2. **Use workspace for Lambda functions**: Efficient dependency management
3. **Run `pnpm install` after pulling**: Keep dependencies in sync
4. **Use `pnpm update`**: Keep packages up to date
5. **Check `pnpm outdated`**: Monitor for outdated packages

---

## Additional Resources

- **pnpm Docs**: [pnpm.io](https://pnpm.io)
- **Workspace Guide**: [pnpm.io/workspaces](https://pnpm.io/workspaces)
- **CLI Commands**: [pnpm.io/cli/install](https://pnpm.io/cli/install)

---

*Last Updated: December 2024*

