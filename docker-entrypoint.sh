#!/bin/sh
set -eu

POSTGRES_BIN="${POSTGRES_BIN:-/usr/lib/postgresql/15/bin}"
PGDATA="${PGDATA:-/var/lib/postgresql/data}"
POSTGRES_USER="${POSTGRES_USER:-pciqr}"
POSTGRES_DB="${POSTGRES_DB:-pci_qr}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

if [ -z "${POSTGRES_PASSWORD:-}" ]; then
  echo "ERROR: POSTGRES_PASSWORD must be set for the bundled Postgres instance." >&2
  exit 1
fi

if [ -z "${AUTH_SECRET:-}" ]; then
  echo "ERROR: AUTH_SECRET must be set." >&2
  exit 1
fi

export PGDATA POSTGRES_USER POSTGRES_DB POSTGRES_PORT
export DATABASE_URL="${DATABASE_URL:-postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@127.0.0.1:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public}"

mkdir -p "$PGDATA" /run/postgresql /app/public/uploads/logos
chown -R postgres:postgres "$PGDATA" /run/postgresql
chown -R nextjs:nodejs /app/public/uploads
chmod 700 "$PGDATA"

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  echo "Initializing bundled Postgres data directory..."
  gosu postgres "$POSTGRES_BIN/initdb" \
    -D "$PGDATA" \
    --username=postgres \
    --auth-local=trust \
    --auth-host=scram-sha-256

  {
    echo "listen_addresses = '127.0.0.1'"
    echo "port = ${POSTGRES_PORT}"
    echo "unix_socket_directories = '/run/postgresql'"
  } >> "$PGDATA/postgresql.conf"

  printf '\nhost all all 127.0.0.1/32 scram-sha-256\n' >> "$PGDATA/pg_hba.conf"
fi

echo "Starting bundled Postgres..."
gosu postgres "$POSTGRES_BIN/postgres" -D "$PGDATA" &
postgres_pid="$!"

shutdown() {
  echo "Stopping bundled Postgres..."
  kill -TERM "$postgres_pid" 2>/dev/null || true
  wait "$postgres_pid" 2>/dev/null || true
}
trap shutdown INT TERM

until gosu postgres "$POSTGRES_BIN/pg_isready" -h /run/postgresql -p "$POSTGRES_PORT" -U postgres >/dev/null 2>&1; do
  sleep 1
done

echo "Ensuring app database and role exist..."
gosu postgres "$POSTGRES_BIN/psql" -h /run/postgresql -p "$POSTGRES_PORT" -U postgres -d postgres \
  -v app_user="$POSTGRES_USER" \
  -v app_password="$POSTGRES_PASSWORD" \
  -v ON_ERROR_STOP=1 <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'app_user', :'app_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'app_user') \gexec
SELECT format('ALTER ROLE %I LOGIN PASSWORD %L', :'app_user', :'app_password') \gexec
SQL

db_exists=$(gosu postgres "$POSTGRES_BIN/psql" -h /run/postgresql -p "$POSTGRES_PORT" -U postgres -d postgres -v app_db="$POSTGRES_DB" -tAc "SELECT 1 FROM pg_database WHERE datname = :'app_db'")
if [ "$db_exists" != "1" ]; then
  gosu postgres "$POSTGRES_BIN/createdb" -h /run/postgresql -p "$POSTGRES_PORT" -U postgres -O "$POSTGRES_USER" "$POSTGRES_DB"
fi

echo "Running database migrations..."
npx prisma migrate deploy

if [ -n "${SEED_ADMIN_PASSWORD:-}" ]; then
  echo "Seeding admin user and default brand template..."
  npx tsx prisma/seed.ts
else
  echo "Skipping seed: SEED_ADMIN_PASSWORD is not set."
fi

echo "Starting Next.js server..."
exec gosu nextjs node server.js
