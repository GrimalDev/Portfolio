// Rendering a PDF spawns a Chromium process, so only one render runs at a
// time. Extra callers wait in a bounded FIFO rather than piling up browsers.
// Once the queue is full the caller is rejected straight away so the route can
// answer 503 instead of leaving the client hanging.

const MAX_QUEUED = Number(process.env.PDF_QUEUE_MAX) || 5;
const QUEUE_WAIT_TIMEOUT_MS =
  Number(process.env.PDF_QUEUE_WAIT_TIMEOUT_MS) || 60_000;

let running = false;
const waiting = [];

function queueError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

// Hands the slot to the next waiter, or marks the renderer idle.
function releaseSlot() {
  const next = waiting.shift();

  if (!next) {
    running = false;
    return;
  }

  clearTimeout(next.timer);
  next.resolve();
}

function acquireSlot() {
  if (!running) {
    running = true;
    return Promise.resolve();
  }

  if (waiting.length >= MAX_QUEUED) {
    return Promise.reject(
      queueError(
        `PDF renderer is busy and its queue is full (${MAX_QUEUED} waiting)`,
        "PDF_GENERATION_BUSY",
      ),
    );
  }

  return new Promise((resolve, reject) => {
    const entry = { resolve };

    entry.timer = setTimeout(() => {
      const index = waiting.indexOf(entry);
      if (index !== -1) {
        waiting.splice(index, 1);
      }
      reject(
        queueError(
          `Waited more than ${QUEUE_WAIT_TIMEOUT_MS} ms for the PDF renderer`,
          "PDF_QUEUE_TIMEOUT",
        ),
      );
    }, QUEUE_WAIT_TIMEOUT_MS);

    waiting.push(entry);
  });
}

// Runs `task` with exclusive access to the renderer. The slot is held until the
// promise returned by `task` settles, so the caller decides when the browser is
// really finished. Rejects with PDF_GENERATION_BUSY when the queue is full, or
// PDF_QUEUE_TIMEOUT when the caller's turn never came in time.
export async function runExclusive(task) {
  await acquireSlot();

  try {
    return await task();
  } finally {
    releaseSlot();
  }
}

export function pdfQueueState() {
  return { running, waiting: waiting.length, maxQueued: MAX_QUEUED };
}
