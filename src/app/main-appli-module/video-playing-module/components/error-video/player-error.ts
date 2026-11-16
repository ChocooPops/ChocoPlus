// What went wrong in the internal player, from the raw error it received: an Error or a message coming from
// the main process (ffprobe / ffmpeg output, app.js), the MSE engine or the <video> element.

export type PlayerErrorKind = 'server' | 'ffmpeg-missing' | 'unauthorized' | 'network' | 'not-available' | 'unsupported' | 'unknown';

export interface PlayerError {
    kind: PlayerErrorKind,
    // Raw message, shown in the technical details
    detail: string,
    // 'server': the message the server sent with its refusal, shown as it is
    serverMessage?: string
}

// Added by the main process (media-player.js) when the server refused a stream with a message
const SERVER_ERROR_PATTERN = /^Server error (\d{3}): (.+)$/m;

// First match wins: the most specific first (a 401 is not a missing video, an internal stream failure is not a 404)
const RULES: { kind: PlayerErrorKind, pattern: RegExp }[] = [
    { kind: 'ffmpeg-missing', pattern: /(ffmpeg|ffprobe) not found|spawn .*ENOENT/i },
    { kind: 'unauthorized', pattern: /\b40[13]\b|Unauthorized|Forbidden/i },
    { kind: 'network', pattern: /Server unreachable|Server not answering|Stream request failed|Connection (refused|reset|timed out)|Failed to resolve|I\/O error|End of file|ETIMEDOUT|ECONNREFUSED|ECONNRESET|ENETUNREACH|network|timed out|Server returned 5(\d\d|XX)|MEDIA_ERR_NETWORK/i },
    { kind: 'not-available', pattern: /neither downloaded nor reachable|\b404\b|Not Found|No such file|does not exist|ENOENT/i },
    { kind: 'unsupported', pattern: /No video stream|Unknown media duration|could not be decoded|Invalid data found|not supported|NotSupportedError|MEDIA_ERR_(DECODE|SRC_NOT_SUPPORTED)|codec/i }
];

export function toPlayerError(error: unknown): PlayerError {
    const message = getMessage(error);
    const server = SERVER_ERROR_PATTERN.exec(message);
    if (server) {
        // The server sends { statusCode, message } for every error: the usual ones keep their translated advice
        // ("Unauthorized", "Cannot GET ..." would tell nothing), its message stays in the technical details.
        // The other refusals (409: a video already playing...) show its message.
        const kind = getKindFromStatus(Number(server[1]));
        return kind
            ? { kind, detail: removeUrls(message) }
            : { kind: 'server', detail: removeUrls(message), serverMessage: server[2].trim() };
    }
    const rule = RULES.find((candidate) => candidate.pattern.test(message));
    return { kind: rule ? rule.kind : 'unknown', detail: removeUrls(message) };
}

function getKindFromStatus(status: number): PlayerErrorKind | null {
    if (status === 401 || status === 403) return 'unauthorized';
    if (status === 404) return 'not-available';
    if (status >= 500) return 'network';
    return null;
}

// The stream URLs carry the server address and the user's token: never shown, only the error around them.
// ffmpeg's context prefixes ("[in#0 @ 000001...]") and repeated lines are dropped too.
function removeUrls(message: string): string {
    const lines = message
        .split(/\r?\n/)
        .map((line) => line
            .replace(/^\[[^\]]+ @ [0-9a-fx]+\]\s*/i, '')
            .replace(/(https?|chocostream):\/\/[^\s'"]+/gi, '')
            .replace(/\s+([:.,;)])/g, '$1')
            .replace(/[ \t]{2,}/g, ' ')
            .replace(/\s*:\s*$/, '')
            .trim())
        .filter((line) => line.length > 0);
    return [...new Set(lines)].join('\n');
}

function getMessage(error: unknown): string {
    const raw = error instanceof Error ? error.message : typeof error === 'string' ? error : error ? String(error) : '';
    // Errors thrown in the main process come back as "Error invoking remote method 'player:prepare': Error: ..."
    return raw.replace(/^Error invoking remote method '[^']+':\s*(Error:\s*)?/, '').trim();
}
