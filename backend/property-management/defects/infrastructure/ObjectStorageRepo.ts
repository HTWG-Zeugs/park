import { Storage, GetSignedUrlConfig } from "@google-cloud/storage";
import "dotenv/config";

export class ObjectStorageRepo {
  storage: Storage;

  imagesBucketId: string;

  constructor() {
    if (process.env.GCS_BUCKET_ID === undefined)
      throw new Error("GCS_BUCKET_ID is not defined");

    this.imagesBucketId = process.env.GCS_BUCKET_ID;
    this.storage = new Storage();
  }

  async deleteImage(imageName: string) {
    const [exists] = await this.storage
      .bucket(this.imagesBucketId)
      .file(imageName)
      .exists();
    if (!exists) {
      return;
    } else {
      await this.storage.bucket(this.imagesBucketId).file(imageName).delete();
    }
  }

  async checkImageExists(imageName: string) {
    const [exists] = await this.storage
      .bucket(this.imagesBucketId)
      .file(imageName)
      .exists();
    return exists;
  }

  async getSignedUrl(imageName: string) {
    const options = {
      version: "v4",
      action: "read",
      expires: Date.now() + 45 * 60 * 1000, // 45 minutes
    } as GetSignedUrlConfig;

    const url = await this.storage
      .bucket(this.imagesBucketId)
      .file(imageName)
      .getSignedUrl(options);

    return url;
  }

  async getSignedUploadUrl(imageName: string) {
    const options = {
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: "image/jpeg",
    } as GetSignedUrlConfig;

    const url = await this.storage
      .bucket(this.imagesBucketId)
      .file(imageName)
      .getSignedUrl(options);
    return url;
  }

  async getSignedDeleteUrl(imageName: string) {
    const options = {
      version: "v4",
      action: "delete",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    } as GetSignedUrlConfig;

    const url = await this.storage
      .bucket(this.imagesBucketId)
      .file(imageName)
      .getSignedUrl(options);
    return url;
  }
}
