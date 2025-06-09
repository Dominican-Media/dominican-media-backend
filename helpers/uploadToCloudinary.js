const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const retry = require("async-retry");

cloudinary.config({ log_level: "debug" });

const uploadFile = (fileBuffer, folder) =>
  retry(
    () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: "auto",
            type: "upload",
            timeout: 120000,
          },
          (error, result) => {
            if (error) {
              console.error("Upload error:", JSON.stringify(error, null, 2));
              return reject(error);
            }
            resolve(result);
          }
        );

        const readStream = streamifier.createReadStream(fileBuffer);
        readStream.on("error", (err) => {
          console.error("Stream error:", err);
          reject(err);
        });
        readStream.pipe(stream);
      }),
    {
      retries: 3,
      minTimeout: 1000,
      factor: 2,
      onRetry: (error) => {
        console.log(`Retrying due to error: ${error.message}`);
      },
    }
  );

module.exports = { uploadFile };
