import type { ImagesSaver } from './ImagesSaver';
import { browser } from '$app/environment';

export class ZipArchiveWithFSImageSaver implements ImagesSaver {
  public static readonly isSupported = browser && 'showSaveFilePicker' in window;

  public async save(
    name: string,
    images: AsyncGenerator<File>,
    onprogress?: () => void,
  ): Promise<void> {
    const jszipPromise = import('jszip');
    // @ts-expect-error https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker
    const handle: FileSystemFileHandle = await showSaveFilePicker({
      id: 'cropybara-results-zip',
      startIn: 'downloads',
      suggestedName: name + '.zip',
      types: [
        {
          description: 'Zip archive',
          accept: { 'application/zip': ['.zip'] },
        },
      ],
    });

    const fileStream = await handle.createWritable();
    const { default: JSZip } = await jszipPromise;

    const zip = new JSZip();

    for await (const file of images) {
      zip.file(file.name, file.bytes());
      onprogress?.();
    }

    const content = await zip.generateAsync({ type: 'blob' });

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
