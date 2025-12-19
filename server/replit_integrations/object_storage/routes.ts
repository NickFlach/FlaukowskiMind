import type { Express } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import { ObjectStorageService, ObjectNotFoundError, objectStorageClient } from "./objectStorage";

const upload = multer({ storage: multer.memoryStorage() });

export function registerObjectStorageRoutes(app: Express): void {
  const objectStorageService = new ObjectStorageService();

  app.post("/api/uploads/request-url", async (req, res) => {
    const { name, size, contentType } = req.body;
    console.log("[Object Storage] Request URL called with:", { name, size, contentType });

    if (!name) {
      return res.status(400).json({
        error: "Missing required field: name",
      });
    }

    try {
      console.log("[Object Storage] Generating presigned URL...");
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      console.log("[Object Storage] Got presigned URL");

      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      console.log("[Object Storage] Object path:", objectPath);

      res.json({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
        useServerUpload: false,
      });
    } catch (error) {
      console.log("[Object Storage] Presigned URL failed, falling back to server upload:", error instanceof Error ? error.message : error);
      
      res.json({
        useServerUpload: true,
        uploadEndpoint: "/api/uploads/direct",
        metadata: { name, size, contentType },
      });
    }
  });

  app.post("/api/uploads/direct", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const privateObjectDir = objectStorageService.getPrivateObjectDir();
      const objectId = randomUUID();
      const fullPath = `${privateObjectDir}/uploads/${objectId}`;
      
      const pathParts = fullPath.startsWith("/") ? fullPath.slice(1).split("/") : fullPath.split("/");
      if (pathParts.length < 2) {
        return res.status(500).json({ error: "Invalid storage path configuration" });
      }
      
      const bucketName = pathParts[0];
      const objectName = pathParts.slice(1).join("/");
      
      console.log("[Object Storage] Direct upload to:", { bucketName, objectName });
      
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      
      const writeStream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype || "application/octet-stream",
        },
        resumable: false,
      });

      await new Promise<void>((resolve, reject) => {
        writeStream.on("error", (err) => {
          console.error("[Object Storage] Stream error:", err);
          reject(err);
        });
        writeStream.on("finish", () => {
          console.log("[Object Storage] Upload complete");
          resolve();
        });
        writeStream.end(req.file!.buffer);
      });

      const objectPath = `/objects/uploads/${objectId}`;
      
      res.json({
        objectPath,
        metadata: {
          name: req.file.originalname,
          size: req.file.size,
          contentType: req.file.mimetype,
        },
      });
    } catch (error) {
      console.error("[Object Storage] Direct upload error:", error);
      const message = error instanceof Error ? error.message : "Failed to upload file";
      res.status(500).json({ error: message });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "Object not found" });
      }
      return res.status(500).json({ error: "Failed to serve object" });
    }
  });
}
