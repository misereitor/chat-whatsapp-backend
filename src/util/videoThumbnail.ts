import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { Readable } from 'stream';
import { promises as fs } from 'fs';

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

export async function extractThumbnail(videoBlob: Blob): Promise<Buffer> {
  const arrayBuffer = await videoBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const outputFilePath = 'thumbnail.png'; // Caminho temporário para a thumbnail

    ffmpeg()
      .input(bufferToStream(buffer))
      .inputFormat('mp4')
      .output(outputFilePath)
      .outputOptions('-vframes', '1') // Extrai apenas um frame
      .on('end', async () => {
        try {
          // Lê a thumbnail gerada como Buffer
          const thumbnailBuffer = await fs.readFile(outputFilePath);
          // Remove o arquivo temporário
          await fs.unlink(outputFilePath);
          resolve(thumbnailBuffer);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(error);
      })
      .run();
  });
}
