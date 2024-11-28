const express = require('express')
 
const app = express();
const port = 8081;

app.get('/garage/occupancy', (req, res) => {
    // check the occupancy status of the garage
    res.status(200).send('GET garage/occupancy');
});

app.post('/garage/enter', (req, res) => {
    // record entry of a car
    res.status(200).send('POST garage/enter');
});

app.post('/garage/exit', (req, res) => {
    // record exit of a car
    res.status(200).send('POST garage/exit');
});

app.get('/garage/mayExit', (req, res) => {
    // check if car has payed and may exit
    res.status(200).send('GET garage/mayExit');
});

app.get('/charging/stations', (req, res) => {
    // get status (occupancy) of e-charging stations
    res.status(200).send('GET charging/stations');
});

app.post('/charging/startSession', (req, res) => {
    // start charging session at an e-charging station
    res.status(200).send('POST charging/startSession');
});

app.post('/charging/endSession', (req, res) => {
    // end charging session at an e-charging station
    res.status(200).send('POST charging/endSession');
});

app.get('/charging/session', (req, res) => {
    // get session information for analytics (duration, user ID, session ID ...)
    res.status(200).send('GET charging/session');
});

app.get('/charging/invoice', (req, res) => {
    // retrieve invoice for finished charging session
    res.status(200).send('GET charging/invoice');
});

app.listen(port, () => {
    console.log(`parking management service listening on port ${port}`);
});