#!/bin/bash
set -e

if [ "$1" = '/opt/mssql/bin/sqlservr' ]; then
  if [ ! -f /tmp/app-initialized ]; then
    function initialize_local_db() {
      sleep 30s
      /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $SA_PASSWORD -i /docker-entrypoint-initdb.d/setup.sql
      touch /tmp/app-initialized
    }
    initialize_local_db &
  fi
fi

exec "$@"
