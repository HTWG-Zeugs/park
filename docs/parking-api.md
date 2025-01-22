# Parking API Documentation

### GET
get parking occupancy
`http://<host>:8081/garage/parking/occupancy/<garage_id>`

### GET
get charging occupancy
`http://<host>:8081/garage/charging/occupancy/<garage_id>`

### PUT
create garage
`http://<host>:8081/garage/create`

**Example request body:**
raw (json)
```json
{
    "id": "03a8a43f-ec66-49a0-9d63-5933309729c0",
    "isOpen": true,
    "totalParkingSpaces": 120,
    "totalChargingSpaces": 10,
    "chargingStations": [
        {
            "id": "e4a49acd-d010-4c41-a44b-b197c31afaac",
            "isOccupied": false,
            "chargingSpeedInKw": 350,
            "pricePerKwh": 0.25
        }
    ]
}
```

### PUT
update garage
`http://<host>:8081/garage/update`

**Example request body:**
raw (json)
```json
{
    "id": "03a8a43f-ec66-49a0-9d63-5933309729c0",
    "isOpen": true,
    "totalParkingSpaces": 120,
    "totalChargingSpaces": 10,
    "chargingStations": [
        {
            "id": "e4a49acd-d010-4c41-a44b-b197c31afaac",
            "isOccupied": false,
            "chargingSpeedInKw": 350,
            "pricePerKwh": 0.25
        }
    ]
}
```

### POST
enter garage
`http://<host>:8081/garage/enter/<garage_id>`

### POST
handle ticket payment
`http://<host>:8081/garage/handlePayment/<ticket_id>`

### GET
mayExit
`http://<host>:8081/garage/mayExit/<ticket_id>`

### POST
exit garage
`http://<host>:8081/garage/exit/<garage_id>`

### POST
start charging session
`http://<host>:8081/garage/charging/startSession/<garage_id>/<station_id>/<user_id>`

### POST
end charging session
`http://<host>:8081/garage/charging/endSession/<garage_id>/<session_id>`

### GET
get charging session
`http://<host>:8081/garage/charging/session/<session_id>`