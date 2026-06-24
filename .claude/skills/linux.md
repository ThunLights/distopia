---
description: Linux command reference for working inside the distopia devcontainer (Ubuntu 24.04)
---

# Linux Command Reference

The devcontainer runs **Ubuntu 24.04**. The default user is `ubuntu` with passwordless `sudo`.
Working directory inside the container: `/workspaces/distopia`

## Running Commands Inside the Container

From the host `docker/` directory:

```bash
# One-off command
docker compose exec app <command>

# Commands needing sudo
docker compose exec app sudo <command>

# Commands in a specific package directory
docker compose exec app sh -c "cd src/presentation/web && <command>"

# Interactive shell
docker compose exec -it app bash
```

## Installed Tools

| Tool | Purpose |
|---|---|
| `bash` | Default shell |
| `curl` | HTTP requests, downloading files |
| `git` | Version control |
| `jq` | JSON processing in scripts |
| `psql` (`postgresql-client`) | Direct PostgreSQL access |
| `htop` | Process monitor |
| `gitleaks` | Secret scanning in git history |
| `trufflehog` | Secret scanning in git history |
| `golang` | Required to build gitleaks |

## Common Operations

### File and directory inspection

```bash
ls -la                          # list with hidden files and permissions
find . -name "*.ts" -not -path "*/node_modules/*"
du -sh node_modules/            # directory size
df -h                           # disk usage
```

### Process management

```bash
ps aux                          # all processes
kill -9 <pid>                   # force-kill a process
htop                            # interactive process monitor
```

### Permissions

```bash
chmod +x scripts/setup.sh       # make a script executable
chown ubuntu:ubuntu <file>      # change ownership to the ubuntu user
sudo chmod 0440 /etc/sudoers.d/ubuntu
```

### Environment variables

```bash
printenv                        # list all env vars
printenv DATABASE_URL           # inspect a specific var
export MY_VAR=value             # set for the current shell session
```

### Package management (apt)

```bash
sudo apt-get update
sudo apt-get install -y <package>
sudo apt purge -y <package>
sudo apt clean && sudo rm -rf /var/lib/apt/lists/*
```

### Log inspection

```bash
tail -f /var/log/syslog
journalctl -f                   # follow system journal
```

### Networking

```bash
curl -s http://distopia-db:5432   # check DB container reachability
ss -tlnp                          # listening TCP ports
```

### Script patterns used in this project

```bash
# Get the project root directory from anywhere in the scripts/ directory
project_dir=$(cd $(dirname $0); cd ../; pwd)

# Conditional user/group UID fix (used in Dockerfile)
[[ $(id -u ubuntu) = $USER_UID ]] || usermod -u $USER_UID ubuntu
```

## Secret Scanning

The container includes `gitleaks` and `trufflehog` for scanning secrets before committing:

```bash
# Scan git history for secrets
gitleaks detect --source .

# Scan with trufflehog
trufflehog git file://. --since-commit HEAD
```

## jq — JSON Processing

```bash
# Pretty-print JSON
echo '{"key":"value"}' | jq .

# Extract a field
cat package.json | jq '.name'

# Used in scripts/npm-publish.sh to read package.json fields
node -p "require('./package.json').version"
```

## User Context

- Default container user: `ubuntu` (UID 1000)
- Passwordless sudo configured via `/etc/sudoers.d/ubuntu`
- `bun run` and most dev commands work without sudo
- Some commands (e.g. `bun run build` via turbo with cache writes) require `sudo` in this setup
