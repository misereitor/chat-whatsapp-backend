import { s3Client } from '../../config/awsS3connect';
import { Upload } from '@aws-sdk/lib-storage';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { blobToStream } from '../../util/convertBase64InBlob';

export async function uploadFileService(filename: string, body: Blob) {
  try {
    const stream = blobToStream(body);
    const upload = new Upload({
      client: s3Client,
      params: {
        ACL: 'public-read',
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
        Body: stream
      }
    });

    await upload.done();

    const region = process.env.AWS_REGION; // Certifique-se de que a região está setada nas variáveis de ambiente
    const bucketName = process.env.AWS_BUCKET_NAME;
    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${filename}`;

    return fileUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

export async function deleteFileService(filename: string) {
  try {
    const command = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filename
    };
    await s3Client.send(new DeleteObjectCommand(command));
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}
