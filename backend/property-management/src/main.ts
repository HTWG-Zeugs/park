import express from "express";
import cors from "cors";
import defectsRoute from "./defects/DefectRoute";
import garagesRoute from "./garages/GaragesRoute";
import process from "process";
const app = express();
const port = process.env.PORT ?? 8080;

app.use(cors());

app.use(express.json());

app.use("/defects", defectsRoute);
app.use("/garages", garagesRoute);

app.get("/livez", (req, res) => {
  res.status(200).send("Property management service is running.");
});

const server = app.listen(port, () => {
  console.log("Server running on port " + port);
});

// The signals we want to handle
// NOTE: although it is tempting, the SIGKILL signal (9) cannot be intercepted and handled
const signals = {
  SIGHUP: 1, // Terminal line hangup
  SIGINT: 2, // Interrupt program
  SIGTERM: 15, // Software termination signal
};

// Node.js’s exit code is 128 plus the signal code’s value if it
// gets a fatal signal like SIGKILL or SIGHUP.
const BASE_EXIT_CODE = 128;

const shutdown = (signal, value) => {
  console.log("shutting down...");
  server.close(() => {
    console.log(`server stopped by ${signal} with value ${value}`);
    process.exit(BASE_EXIT_CODE + value);
  });
};

Object.keys(signals).forEach((signal) => {
  process.on(signal, () => {
    console.log(`process received a ${signal} signal`);
    shutdown(signal, signals[signal]);
  });
});
