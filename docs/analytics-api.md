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
POST analytics/charging/powerConsumed/record
GET analytics/charging/powerConsumed/:start/:end
```

**Earned money for charging**
```
POST analytics/charging/turnover/record
GET analytics/charging/turnover/:start/:end
```

**Mean and max parking duration**
```
POST analytics/parking/duration/record
GET analytics/parking/duration/mean
GET analytics/parking/duration/mean/:start/:end
GET analytics/parking/duration/max
GET analytics/parking/duration/max/:start/:end
```

## Property Management

**record new or updated defect with its state**
```
POST analytics/defects/record
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
POST analytics/requests/record/:tenant
GET analytics/requests/:tenant
```

**tenants**
```
POST analytics/tenants/record
GET analytics/tenants
```


# Notes

There has to be a collection per garage, so there has to be a database per analytics stat that is stored. E.g.:

parking-status-analytics > garageId > status entries with timestamp
charging-status-analytics > garageId > status entries with stationIds and timestamp (simplified: just store status with timestamp)
charging-consumption-analytics > garageId > consumption entries with stationId and timestamp
charging-turnover-analytics > garageId > turnover entries with stationId and timestamp
parking-duration-analytics > garageId > parking duration entries with start and end timestamp
defects-created-analytics > garageId > defect creation entries with timestamp
defects-edit-analytics > garageId > defect edit entries with defect id, new status and timestamp

How to handle multitenancy? -> suffix the analytics databases with the tenant id


solution wide analytics:

tenant-analytics > requests > tenant id with timestamp (for each request one entry is stored)

or 

tenant-analytics > requests > tenantId (for each request the number of requests is updated) -> unable to say in which time range how many requests where executed.

tenant-analytics > tenants > tenant entries (infos about tenants, new entry everytime a tenant is added)