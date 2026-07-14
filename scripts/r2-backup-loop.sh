#!/bin/sh
set -eu

interval_hours="${R2_BACKUP_INTERVAL_HOURS:-}"

if [ -z "$interval_hours" ] || [ "$interval_hours" = "0" ]; then
  exit 0
fi

case "$interval_hours" in
  *[!0-9]*)
    echo "ERROR: R2_BACKUP_INTERVAL_HOURS must be a whole number of hours." >&2
    exit 1
    ;;
esac

interval_seconds=$((interval_hours * 3600))

echo "R2 backup loop enabled: every ${interval_hours} hour(s)."

while true; do
  if /app/scripts/backup-r2.sh; then
    echo "R2 backup completed."
  else
    echo "R2 backup failed; will retry on next interval." >&2
  fi
  sleep "$interval_seconds"
done
