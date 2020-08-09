/**
 * Fields in a request to update a single Note item.
 */
export interface UpdateNoteRequest {
  title: string
  content: string
  attachmentUrls: [string]
}
