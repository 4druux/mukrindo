// utils/cropImage.js
/**
 * getCroppedImg
 * @param {string} imageSrc - Base64 encoded image source
 * @param {object} pixelCrop - Cropped area in pixels {x, y, width, height}
 */
export const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], "cropped-image.jpeg", {
            type: "image/jpeg",
          }); // Use a consistent file type
          resolve(file);
        } else {
          reject(new Error("Failed to create blob from canvas."));
        }
      }, "image/jpeg"); // Use a consistent MIME type
    };

    image.onerror = (error) => {
      reject(error);
    };
  });
};
