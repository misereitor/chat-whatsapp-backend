export interface WebhookMessage {
  event: string;
  session: string;
  payload: Payload;
  me: ME;
}
interface ME {
  id: string;
  pushName: string;
}
interface Payload {
  id: string;
  timestamp: number | Timestamp;
  from: string;
  fromMe: boolean;
  to?: string;
  participant?: string;
  body: string;
  hasMedia: boolean;
  media: Media | null;
  ack: number;
  ackName: string;
  author?: string;
  location?: Location | null;
  vCard?: string[];
  replyTo?: ReplyTo | null;
}

interface Media {
  url?: string;
  mimetype?: string;
  filename?: string;
  s3?: S3;
  error?: Error;
}

interface S3 {
  bucket: string;
  key: string;
}

interface ReplyTo {
  id: string;
  participant: string;
  body: string;
}

export interface Timestamp {
  low: number;
  high: number;
  unsigned: boolean;
}
