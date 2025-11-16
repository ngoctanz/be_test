import cloudinary from "../config/cloudinary.js";

class CloudinaryService {
  async uploadImage(file, folder = "party-management") {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
          transformation: [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result) return reject(error);

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadMultipleImages(files, folder = "party-management") {
    const uploadTasks = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadTasks);
  }

  async deleteImage(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error(`Delete failed: ${publicId}`, err);
    }
  }

  async deleteMultipleImages(publicIds) {
    const deleteTasks = publicIds.map((id) => this.deleteImage(id));
    await Promise.all(deleteTasks);
  }

  extractPublicId(url) {
    try {
      const uploadIndex = url.indexOf("/upload/");
      if (uploadIndex === -1) {
        throw new Error("Invalid Cloudinary URL");
      }

      const afterUpload = url.substring(uploadIndex + "/upload/".length);
      const pathWithoutVersion = afterUpload.replace(/^v\d+\//, "");

      const lastDot = pathWithoutVersion.lastIndexOf(".");
      if (lastDot === -1) return pathWithoutVersion;

      return pathWithoutVersion.substring(0, lastDot);
    } catch (err) {
      const parts = url.split("/");
      const filename = parts.pop();
      const folder = parts.pop();
      return `${folder}/${filename.split(".")[0]}`;
    }
  }
}

export const cloudinaryService = new CloudinaryService();
