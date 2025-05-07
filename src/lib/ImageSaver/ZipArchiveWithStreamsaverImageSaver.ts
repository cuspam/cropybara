import type { ImagesSaver } from './ImagesSaver';

export class ZipArchiveWithStreamsaverImageSaver implements ImagesSaver {
  public async save(
    name: string,
    images: AsyncGenerator<File>,
    onprogress?: () => void,
  ): Promise<void> {
    const [{ default: streamSaver }, { default: JSZip }] = await Promise.all([
      import('streamsaver'),
      import('jszip'),
    ]);

    const zip = new JSZip();

    for await (const file of images) {
      zip.file(file.name, file.bytes());
      onprogress?.();
    }

    const content = await zip.generateAsync({ type: 'blob', compression: 'STORE' });

    const fileStream = streamSaver.createWriteStream(name + '.zip', {
      size: content.size,
    });

    const readableStream = content.stream();

    // more optimized pipe version
    // (Safari may have pipeTo but it's useless without the WritableStream)
    if (window.WritableStream && readableStream.pipeTo) {
      return readableStream.pipeTo(fileStream).then(() => console.log('done writing'));
    }

    // Write (pipe) manually
    const writer = fileStream.getWriter();

    const reader = readableStream.getReader();
    const pump: () => Promise<void> = () =>
      reader.read().then((res) => (res.done ? writer.close() : writer.write(res.value).then(pump)));

    pump();
  }
}
