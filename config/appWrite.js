require("dotenv").config();
const appwrite = require("node-appwrite");
const multer = require("multer");

// APPWRITE CONFIG
const client = new appwrite.Client();
const storage = new appwrite.Storage(client);

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.APPWRITE_PROECT_ID)
  .setKey(process.env.APPWRITE_APISECRET_KEY);

const memoryStorage = multer.memoryStorage();

const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 1 * 1024 * 1024, // Limit file size to 1 MB
  },
});

const FileReader = upload.array("file");

// FILE UPLOADER
const FileUploader = async (Files) => {
  const uploadedFiles = []
  if (Files) {
    for(const file of Files ){
      const uniqueFilename = Math.random().toString(36).substring(2, 8) + "-" + file.originalname;

      const uploadedFile = await storage.createFile(
        process.env.APPWRITE_BUCKET_ID,
        appwrite.ID.unique(),
        appwrite.InputFile.fromBuffer(file.buffer, uniqueFilename)
      );

      uploadedFiles.push(uploadedFile.$id);
      console.log(`File ${uniqueFilename} uploaded successfully.`);

      if (uploadedFiles.length == Files.length) {
        return uploadedFiles
      }
    }
  }
};

module.exports = { storage, FileReader, FileUploader };