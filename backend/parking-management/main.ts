const express = require('express')
const app = express();
const port = 8081;

app.use(express.json())

app.get('/garage/parking/occupancy/:garageId', (req, res) => {
    const garageId = req.params.garageId;
    // check the occupancy status of the garage
    res.status(200).send(garageId);
});

app.post('/garage/enter/:garageId', (req, res) => {
    const garageId = req.params.garageId;
    // record entry of a car
    res.status(200).send('POST garage/enter');
});

app.post('/garage/exit/:garageId', (req, res) => {
    const garageId = req.params.garageId;
    // record exit of a car
    res.status(200).send('POST garage/exit');
});

app.get('/garage/mayExit/:ticketId', (req, res) => {
    // check if car has payed and may exit
    res.status(200).send('GET garage/mayExit');
});

app.get('/garage/charging/occupancy/:garageId', (req, res) => {
    // get status (occupancy) of e-charging stations
    res.status(200).send('GET charging/stations');
});

app.post('/garage/charging/startSession/:garageId/:stationId', (req, res) => {
    const garageId = req.params.garageId;
    const stationId = req.params.stationId;
    const userId = req.body;
    // start charging session at an e-charging station
    res.status(200).send('POST charging/startSession');
});

app.post('/garage/charging/endSession/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    // end charging session at an e-charging station
    res.status(200).send('POST charging/endSession');
});

app.get('/garage/charging/session/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    // get session information for analytics (duration, user ID, session ID ...)
    res.status(200).send('GET charging/session');
});

app.get('/garage/charging/invoice/:sessionId', (req, res) => {
    // retrieve invoice for finished charging session
    res.status(200).send('GET charging/invoice');
});

app.listen(port, () => {
    console.log(`parking management service listening on port ${port}`);
});