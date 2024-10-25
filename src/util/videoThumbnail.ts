import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { Readable } from 'stream';
import { promises as fs } from 'fs';

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

/**
 * Converte um Buffer em um Readable Stream.
 * @param buffer - O Buffer a ser convertido.
 * @returns Um Readable Stream.
 */
function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null); // Indica que não há mais dados a serem enviados
  return stream;
}

/**
 * Extrai uma thumbnail de um vídeo recebido como Blob.
 * @param videoBlob - O Blob do vídeo.
 * @returns O Buffer da thumbnail extraída.
 */
export async function extractThumbnail(videoBlob: Blob): Promise<Buffer> {
  // Converte o Blob para um Buffer
  const arrayBuffer = await videoBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const outputFilePath = 'thumbnail.png'; // Caminho temporário para a thumbnail

    ffmpeg()
      .input(bufferToStream(buffer)) // Converte Buffer para Readable Stream
      .inputFormat('mp4') // Altere conforme o formato do seu vídeo
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
