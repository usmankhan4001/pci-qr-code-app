#!/bin/sh
set -eu

require_env() {
  name="$1"
  eval "value=\${$name:-}"
  if [ -z "$value" ]; then
    echo "ERROR: $name must be set for R2 backups." >&2
    exit 1
  fi
}

require_env R2_ACCOUNT_ID
require_env R2_ACCESS_KEY_ID
require_env R2_SECRET_ACCESS_KEY
require_env R2_BUCKET

POSTGRES_USER="${POSTGRES_USER:-pciqr}"
POSTGRES_DB="${POSTGRES_DB:-pci_qr}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_HOST="${POSTGRES_HOST:-127.0.0.1}"
R2_PREFIX="${R2_PREFIX:-pci-qr-code-generator}"
UPLOADS_DIR="${UPLOADS_DIR:-/app/public/uploads}"

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_name="${POSTGRES_DB}-${timestamp}"
workdir="$(mktemp -d)"

cleanup() {
  rm -rf "$workdir"
}
trap cleanup EXIT INT TERM

export PGPASSWORD="${POSTGRES_PASSWORD:-}"
export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="auto"

if [ -z "$PGPASSWORD" ]; then
  echo "ERROR: POSTGRES_PASSWORD must be set for database backups." >&2
  exit 1
fi

echo "Creating Postgres backup ${backup_name}.dump..."
pg_dump \
  -h "$POSTGRES_HOST" \
  -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --format=custom \
  --no-owner \
  --no-acl \
  --file "$workdir/${backup_name}.dump"

echo "Archiving uploaded assets..."
if [ -d "$UPLOADS_DIR" ]; then
  tar -C "$(dirname "$UPLOADS_DIR")" -czf "$workdir/${backup_name}-uploads.tar.gz" "$(basename "$UPLOADS_DIR")"
else
  mkdir -p "$workdir/empty-uploads/uploads"
  tar -C "$workdir/empty-uploads" -czf "$workdir/${backup_name}-uploads.tar.gz" uploads
fi

cat > "$workdir/${backup_name}-manifest.json" <<EOF
{
  "app": "pci-qr-code-generator",
  "database": "$POSTGRES_DB",
  "createdAt": "$timestamp",
  "format": "pg_dump-custom",
  "uploadsArchive": "${backup_name}-uploads.tar.gz"
}
EOF

endpoint="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
target="s3://${R2_BUCKET}/${R2_PREFIX}/${timestamp}"

echo "Uploading backup to ${target}..."
aws --endpoint-url "$endpoint" s3 cp "$workdir/${backup_name}.dump" "$target/${backup_name}.dump"
aws --endpoint-url "$endpoint" s3 cp "$workdir/${backup_name}-uploads.tar.gz" "$target/${backup_name}-uploads.tar.gz"
aws --endpoint-url "$endpoint" s3 cp "$workdir/${backup_name}-manifest.json" "$target/${backup_name}-manifest.json"

echo "Backup uploaded: ${target}"
