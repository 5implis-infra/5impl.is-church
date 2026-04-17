/**
 * @adponte/types — Tipos TypeScript globais do ecossistema AD Ponte
 * Compartilhado entre workers, services e apps.
 */

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export type MediaType = 'video' | 'audio' | 'image';

export type ContentTarget = 'short' | 'reel' | 'feed' | 'story' | 'aftermovie';

export type JobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'awaiting_approval';

export interface MediaAsset {
  id: string;
  url: string;
  type: MediaType;
  mimeType: string;
  /** Duração em segundos (vídeo/áudio) */
  durationSeconds?: number;
  sizeBytes: number;
  uploadedAt: string; // ISO 8601
  eventId?: string;
  tags: string[];
}

export interface MediaJob {
  id: string;
  assetId: string;
  target: ContentTarget;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  result?: {
    outputUrl?: string;
    error?: string;
  };
}

// ---------------------------------------------------------------------------
// Transcrição
// ---------------------------------------------------------------------------

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscriptResult {
  language: string;
  languageProbability: number;
  text: string;
  segments: TranscriptSegment[];
}

// ---------------------------------------------------------------------------
// Eventos / Igreja
// ---------------------------------------------------------------------------

export type ChurchEventType = 'culto' | 'evento' | 'ensaio' | 'reuniao';

export interface ChurchEvent {
  id: string;
  title: string;
  startsAt: string;
  endsAt?: string;
  type: ChurchEventType;
}
