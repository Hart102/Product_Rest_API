require("dotenv").config();
const appwrite = require("node-appwrite");
const multer = require("multer");

// APPWRITE CONFIG
const client = new appwrite.Client();
const storage = new appwrite.Storage(client);

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.APPWRITE_PROECT_ID)
  .setKey(process.env.APPWRITE_APIKEY);

const upload = multer.memoryStorage({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // Limit file size to 1 MB
  },
});
const FileReader = multer({ storage: upload }).array("file").limits(4);

// FILE UPLOADER
const AppWriteFileUploader = async (Files) => {
    const uploadedFiles = []
  if (Files) {
    for(let i = 0; i < Files.length; i++ ){
        const uniqueFilename = Math.random().toString(36).substring(2, 8) + "-" + Files[i].originalname;

        const file = await storage.createFile(
          process.env.APPWRITE_BUCKET_ID,
          appwrite.ID.unique(),
          appwrite.InputFile.fromBuffer(Files[i].buffer, uniqueFilename)
        );

        uploadedFiles.push(file.$id);
        console.log(`File ${uniqueFilename} uploaded successfully.`);

        if(uploadedFiles.length == Files.length){
            return uploadedFiles
        }
        return uploadedFiles
    }

    return uploadedFile;
  }
};

module.exports = { storage, FileReader, AppWriteFileUploader };