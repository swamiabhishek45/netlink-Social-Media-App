import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs";

cloudinary.config({
    cloud_name: "swamiabhishek45",
    api_key: "625887367238184",
    api_secret: "9oy52IrR-ggfYU0R81Cj9VeQ4wE",
});

const uploadCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // file has been uploaded successfully
        console.log(
            "File is uploaded successfully on cloudinary",
            response.url
        );
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the locally saved temp file as the upload operation got failed
    }
};

export { uploadCloudinary };
