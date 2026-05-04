export interface VideoThumbnailOptions {
  seekSeconds: number;
  timeoutMs: number;
  maxDimension?: number;
}

export const withTimeout = async <T,>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string,
): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    promise
      .then((value) => {
        if (settled) {
          return;
        }
        settled = true;
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((error: unknown) => {
        if (settled) {
          return;
        }
        settled = true;
        window.clearTimeout(timer);
        reject(error);
      });
  });
};

export const extractVideoFrameThumbnail = async (
  sourceDataUrl: string,
  options: VideoThumbnailOptions,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    let settled = false;

    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
    };

    const fail = (message: string) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(new Error(message));
    };

    const succeed = (dataUrl: string) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(dataUrl);
    };

    const captureFrame = () => {
      if (!Number.isFinite(video.videoWidth) || !Number.isFinite(video.videoHeight)) {
        fail('Video metadata is unavailable');
        return;
      }

      if (video.videoWidth <= 0 || video.videoHeight <= 0) {
        fail('Video dimensions are invalid');
        return;
      }

      const maxDimension = options.maxDimension ?? 640;
      const scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale));

      const context = canvas.getContext('2d');
      if (!context) {
        fail('Failed to create thumbnail context');
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      succeed(canvas.toDataURL('image/jpeg', 0.82));
    };

    const timer = window.setTimeout(() => {
      fail('Timed out while extracting video thumbnail');
    }, options.timeoutMs);

    video.addEventListener(
      'error',
      () => {
        window.clearTimeout(timer);
        fail('Failed to decode video preview');
      },
      { once: true },
    );

    video.addEventListener(
      'loadeddata',
      () => {
        const duration = Number.isFinite(video.duration) ? video.duration : 0;
        const seekTarget =
          duration > 0
            ? Math.min(options.seekSeconds, Math.max(0, duration - 0.05))
            : 0;

        if (seekTarget <= 0) {
          window.clearTimeout(timer);
          captureFrame();
          return;
        }

        video.addEventListener(
          'seeked',
          () => {
            window.clearTimeout(timer);
            captureFrame();
          },
          { once: true },
        );

        try {
          video.currentTime = seekTarget;
        } catch {
          window.clearTimeout(timer);
          captureFrame();
        }
      },
      { once: true },
    );

    video.src = sourceDataUrl;
    video.load();
  });
};

export const ensureImageDataUrlDecodable = async (sourceDataUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    let settled = false;

    const fail = (message: string) => {
      if (settled) {
        return;
      }
      settled = true;
      reject(new Error(message));
    };

    const succeed = () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve();
    };

    image.addEventListener(
      'error',
      () => {
        fail('Failed to decode image preview');
      },
      { once: true },
    );
    image.addEventListener(
      'load',
      () => {
        succeed();
      },
      { once: true },
    );
    image.src = sourceDataUrl;
  });
};
