// frontend/src/utils/cropImage.js
/**
 * getCroppedImg
 * @param {string} imageSrc - Base64 encoded image source
 * @param {object} pixelCrop - Cropped area in pixels {x, y, width, height}
 * @param {string} fileType - The desired output file type (e.g., 'image/jpeg', 'image/webp')
 * @param {number} quality - The desired image quality (0.0 to 1.0)
 */
export const getCroppedImg = async (
  imageSrc,
  pixelCrop,
  fileType = "image/jpeg",
  quality = 0.85
) => {
  // Tambahkan fileType dan quality
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

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const originalFileName =
              imageSrc.name || `cropped-image.${fileType.split("/")[1]}`;
            const file = new File([blob], originalFileName, {
              type: fileType,
            });
            resolve(file);
          } else {
            reject(new Error("Failed to create blob from canvas."));
          }
        },
        fileType,
        quality
      );
    };

    image.onerror = (error) => {
      reject(error);
    };
  });
};
