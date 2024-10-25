import { Readable } from 'stream';
export function base64ToBlob(
  base64: string,
  contentType = '',
  sliceSize = 512
): Blob {
  // Extrai o tipo MIME da string base64 (que vem após 'data:' e antes de ';base64')

  // Remove o cabeçalho 'data:image/png;base64,' ou similar
  const byteCharacters = atob(base64.split(',')[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

export function blobToStream(blob: Blob): Readable {
  const arrayBufferPromise = blob.arrayBuffer();

  const readable = new Readable({
    async read() {
      const arrayBuffer = await arrayBufferPromise;
      this.push(Buffer.from(arrayBuffer)); // Converte o ArrayBuffer em Buffer
      this.push(null); // Indica o fim do stream
    }
  });

  return readable;
}
