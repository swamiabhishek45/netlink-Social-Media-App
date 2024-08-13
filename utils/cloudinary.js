const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: "swamiabhishek45",
    api_key: "625887367238184",
    api_secret: "9oy52IrR-ggfYU0R81Cj9VeQ4wE",
});

exports.uploadCloudinary = async (localFilePath) => {
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
        throw error;
    }
};