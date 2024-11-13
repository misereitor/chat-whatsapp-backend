import sharp from 'sharp';
import fs from 'fs';
import fluentFfmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlinkFile = promisify(fs.unlink);

export async function getVideoDimensionsFromBlob(videoBlob: Blob) {
  const tempFilePath = 'temp-video-file.mp4';

  try {
    const arrayBuffer = await videoBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // Salva o blob (Buffer) como um arquivo temporário
    await writeFile(tempFilePath, buffer);

    // Processa o vídeo e obtém as dimensões e duração
    const metadata = await new Promise<fluentFfmpeg.FfprobeData>(
      (resolve, reject) => {
        fluentFfmpeg.ffprobe(tempFilePath, (error, metadata) => {
          if (error) {
            reject(error);
          } else {
            resolve(metadata);
          }
        });
      }
    );

    // Procura o stream de vídeo com informações de largura e altura
    const videoStream = metadata.streams.find(
      (stream) => stream.width && stream.height
    );
    if (videoStream) {
      const width = videoStream.width || 0;
      const height = videoStream.height || 0;
      return width > height;
    } else {
      throw new Error('Stream de vídeo não encontrado.');
    }
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    // Certifique-se de deletar o arquivo temporário, mesmo em caso de erro
    try {
      await unlinkFile(tempFilePath);
    } catch (deleteError) {
      console.error('Erro ao deletar arquivo temporário:', deleteError);
    }
  }
}

export async function getAudioDurationFromBlob(audioBlob: Blob) {
  const tempFilePath = 'temp-audio-file.mp3'; // ou .wav, conforme o formato do áudio

  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // Salva o blob de áudio como um arquivo temporário
    await writeFile(tempFilePath, buffer);

    // Usa `ffprobe` para obter os metadados do áudio
    const metadata = await new Promise<fluentFfmpeg.FfprobeData>(
      (resolve, reject) => {
        fluentFfmpeg.ffprobe(tempFilePath, (error, metadata) => {
          if (error) {
            reject(error);
          } else {
            resolve(metadata);
          }
        });
      }
    );

    // Retorna a duração do áudio em segundos
    const duration = metadata.format.duration;
    return duration ? duration : 0;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    // Deleta o arquivo temporário, mesmo em caso de erro
    try {
      await unlinkFile(tempFilePath);
    } catch (deleteError) {
      console.error('Erro ao deletar arquivo temporário:', deleteError);
    }
  }
}

export async function getImageDimensions(imageBlob: Blob) {
  try {
    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const metadata = await sharp(buffer).metadata();

    const width = metadata.width || 0;
    const height = metadata.height || 0;

    return width > height;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
