const fs = require("fs");
const multer = require("multer");
const multers3 = require("multer-s3");
const aws = require("aws-sdk");
const crpyto = require("crypto");

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    region: process.env.REGION
});
const bucketName = process.env.BUCKET_NAME;

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
    console.log(req.body, "req.body in fileFilter");
    console.log(file, "file Filter");
    if (file.mimetype === "application/pdf" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "video/mp4" ||
        file.mimetype === "video/mov"

    ) {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};

const fileStorage = multers3({
    s3: s3,
    bucket: bucketName,
    acl: "public-read",
    key: function (req, file, cb) {
        console.log(file)
        if (file.fieldname && file.fieldname === "link") {
            cb(null, crpyto.randomBytes(10).toString("hex") + "-" + file.originalname);
        }
        else {
            cb(null, file);
        }
    },
});

exports.uploadToS3 = multer({
    storage: fileStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
}).single('link');



// download File from s3
exports.downloadFile = (fileKey) => {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName,
    };

    return s3.getObject(downloadParams).createReadStream();
}

// Delete file from s3
exports.deleteFile = (fileKey) => {
    const deleteParams = {
        Key: fileKey,
        Bucket: bucketName,
    };

    return s3.deleteObject(deleteParams).promise();
};
