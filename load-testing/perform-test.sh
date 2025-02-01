#!/bin/bash

set -e
set -u

SCRIPT_ROOT="$(dirname "$(readlink -f "$0")")"

docker compose -f "$SCRIPT_ROOT/docker-compose.yml" up -d

docker run --rm --network k6 -e K6_OUT=influxdb=http://load-test-influx:8086 -i grafana/k6 run - < "$SCRIPT_ROOT/continuous-changing-test.js"
