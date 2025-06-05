// frontend/src/utils/cropImage.js
/**
 * getCroppedImg
 * @param {string} imageSrc
 * @param {object} pixelCrop
 * @param {string} fileType
 * @param {number} quality
 */
export const getCroppedImg = async (
  imageSrc,
  pixelCrop,
  fileType = "image/jpeg",
  quality = 0.75
) => {
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

      const originalFileName =
        imageSrc.name || `cropped-image.${fileType.split("/")[1] || "jpg"}`;

      canvas.toBlob(
        (blob) => {
          if (blob) {
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
