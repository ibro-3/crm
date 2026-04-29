#!/bin/bash
set -e

host="$1"
port="$2"
shift 2
cmd="$@"

until python -c "import psycopg2; psycopg2.connect(host='$host', port='$port', user='$DB_USER', password='$DB_PASSWORD', dbname='$DB_NAME')" 2>/dev/null; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec $cmd
