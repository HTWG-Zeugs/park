$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$PSNativeCommandUseErrorActionPreference = $true

docker compose -f $PSScriptRoot\docker-compose.yml up -d

Get-Content -Path $PSScriptRoot\once-in-a-lifetime-test.js -Raw | docker run --rm --network k6 -e K6_OUT=influxdb=http://load-test-influx:8086 -i grafana/k6 run -
