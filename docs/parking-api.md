# Parking API Documentation

### GET
get parking occupancy
`http://localhost:8081/garage/parking/occupancy/6df541559918a808c2402bba5012f6c60b27661c`

### GET
get charging occupancy
`http://localhost:8081/garage/charging/occupancy/6df541559918a808c2402bba5012f6c60b27661c`

### PUT
create garage
`http://localhost:8081/garage/create`

**Example request body:**
raw (json)
```json
{
    "id": "6df541559918a808c2402bba5012f6c60b27661c",
    "isOpen": true,
    "totalParkingSpaces": 120,
    "totalChargingSpaces": 10,
    "chargingStations": [
        {
            "id": "92429d82a418a808c2402bba5012f6f9c0669b97",
            "isOccupied": false,
            "chargingSpeedInKw": 350,
            "pricePerKwh": 0.25
        }
    ]
}
```

### PUT
update garage
`http://localhost:8081/garage/update`

**Example request body:**
raw (json)
```json
{
    "id": "6df541559918a808c2402bba5012f6c60b27661c",
    "isOpen": true,
    "totalParkingSpaces": 120,
    "totalChargingSpaces": 10,
    "chargingStations": [
        {
            "id": "92429d82a418a808c2402bba5012f6f9c0669b97",
            "isOccupied": false,
            "chargingSpeedInKw": 350,
            "pricePerKwh": 0.25
        }
    ]
}
```

### POST
enter garage
`http://localhost:8081/garage/enter/6df541559918a808c2402bba5012f6c60b27661c`

### POST
handle ticket payment
`http://localhost:8081/garage/handlePayment/e2103f2f-bd47-4a53-98cb-67190c079364`

### GET
mayExit
`http://localhost:8081/garage/mayExit/e2103f2f-bd47-4a53-98cb-67190c079364`

### POST
exit garage
`http://localhost:8081/garage/exit/6df541559918a808c2402bba5012f6c60b27661c`

### POST
start charging session
`http://localhost:8081/garage/charging/startSession/6df541559918a808c2402bba5012f6c60b27661c/92429d82a418a808c2402bba5012f6f9c0669b97/92429d82a41e930486c6de5ebda9602d55c39986`

### POST
end charging session
`http://localhost:8081/garage/charging/endSession/6df541559918a808c2402bba5012f6c60b27661c/03a8a43f-ec66-49a0-9d63-5933309729c0`

### GET
get charging session
`http://localhost:8081/garage/charging/session/03a8a43f-ec66-49a0-9d63-5933309729c0`