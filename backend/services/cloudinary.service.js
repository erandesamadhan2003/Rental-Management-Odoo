import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export function uploadBuffer(buffer, folder = 'rental-products', filename = 'upload') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${filename}-${Date.now()}`,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )

    uploadStream.end(buffer)
  })
}

export default cloudinary
