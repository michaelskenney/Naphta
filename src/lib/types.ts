/** Shared API response types used by both API routes and frontend */

export type ImageState = "ready" | "pending" | "failed" | "moderated" | "none";

export interface EmailListItem {
  id: string;
  subject: string | null;
  sender: string | null;
  recipients: string | null;
  sentAt: string | null;
  imageState: ImageState;
}

export interface EmailDetail {
  id: string;
  subject: string | null;
  sender: string | null;
  recipients: string | null;
  sentAt: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  imageState: ImageState;
  imageUrl: string | null;
}

export interface EmailSearchResponse {
  emails: EmailListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ImageStatusResponse {
  emailId: string;
  state: ImageState;
  imageUrl: string | null;
  errorReason: string | null;
}

export interface GalleryItem {
  emailId: string;
  subject: string | null;
  sender: string | null;
  sentAt: string | null;
  imageUrl: string | null;
  promptUsed: string | null;
  model: string | null;
  generatedAt: string | null;
}

export interface GalleryResponse {
  images: GalleryItem[];
  total: number;
}
