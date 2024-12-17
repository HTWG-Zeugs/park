# Analytics information for the parking management solution

In this document we collect all information and endpoints that seem interesting for analytics from all microservices.

## Parking Management

**Occupancy Status for parking spaces (current status and its evolution)**
```
POST analytics/parking/status
GET analytics/parking/status/:timestamp
GET analytics/parking/status/:start/:end
```

**Occupancy Status for charging (current status, running sessions and their evolution)**
```
POST analytics/charging/status
GET analytics/charging/status/:timestamp
GET analytics/charging/status/:start/:end
```

**Consumed power for charging**
```
POST analytics/charging/powerConsumed
GET analytics/charging/powerConsumed/:start/:end
```

**Earned money for charging**
```
POST analytics/charging/turnover
GET analytics/charging/turnover/:start/:end
```

**Mean and max parking duration**
```
POST analytics/parking/duration
GET analytics/parking/duration/mean
GET analytics/parking/duration/mean/:start/:end
GET analytics/parking/duration/max
GET analytics/parking/duration/max/:start/:end
```


## Property Management

**record new or updated defect with its state**
```
POST analytics/defects
```

**number of reported defects (current and their evolution)**
```
GET analytics/defects/open/:start/:end
```

**number of edited defects in the lase week, month, ...**
```
GET analytics/defects/edited/:start/:end
```

**number of defects with different states ("x open, y in progress, z closed")**
```
GET analytics/defects/:state
```

## Tenant stuff

**number of requests per day per tenant**
```
POST analytics/requests/:tenant
GET analytics/requests/:tenant
```