const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { Storage } = require("@google-cloud/storage");
const { http } = require("@google-cloud/functions-framework");

if (process.env.FIRESTORE_DB_ID === undefined)
  throw new Error("FIRESTORE_DB_ID is not defined");
if (process.env.GCS_BUCKET_ID === undefined)
  throw new Error("GCS_BUCKET_ID is not defined");

const dbId = process.env.FIRESTORE_DB_ID;

initializeApp({
  credential: applicationDefault(),
});

const firestore = getFirestore(dbId);

const defectsReportsBucketId = process.env.GCS_BUCKET_ID;
const storage = new Storage();

function toReadableDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}

http("createChangedDefectsReport", async (req, res) => {
  const docs = await firestore.collection("defects").get();
  const defects = docs.docs.map((doc) => {
    const dto = doc.data();
    return {
      ...dto,
      Id: doc.id,
    };
  });

  const changedDefects = defects.filter((defect) => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return new Date(defect.LastModifiedAt) > oneHourAgo;
  });

  const reportDate = new Date();

  const report = {
    ReportDate: toReadableDate(reportDate),
    Report: "Changed defects",
    Defects: changedDefects,
  };

  let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${report.Report}</title>
            <style>
                body { font-family: Arial, sans-serif; }
                .defect { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; }
                h1, h3 { color: #333; }
            </style>
        </head>
        <body>
            <h1>${report.Report}</h1>
            <p><strong>Report Date:</strong> ${report.ReportDate}</p>
    `;

  report.Defects.forEach((defect) => {
    html += `
            <div class="defect">
                <p><strong>ID:</strong> ${defect.Id}</p>
                <p><strong>Object:</strong> ${defect.Object}</p>
                <p><strong>Location:</strong> ${defect.Location}</p>
                <p><strong>Reporting Date:</strong> ${toReadableDate(
                  new Date(defect.ReportingDate)
                )}</p>
                <p><strong>Status:</strong> ${defect.Status}</p>
                <p><strong>Last Modified At:</strong> ${toReadableDate(
                  new Date(defect.LastModifiedAt)
                )}</p>
                <p><strong>Image Names:</strong> ${defect.ImageNames.join(
                  ", "
                )}</p>
            </div>
        `;
  });

  html += `
        </body>
        </html>
    `;

  const fileName = `defects-report-${reportDate.toISOString().replace(":", "-")}.html`;

  const file = storage.bucket(defectsReportsBucketId).file(fileName);
  await file.save(html, {
    contentType: "text/html",
  });

  res.status(200).send(`Report saved to ${fileName}`);
});
