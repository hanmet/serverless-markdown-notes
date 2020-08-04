/**
 * Fields in a request to update a single Note item.
 */
export interface UpdateNoteRequest {
  title: string
  text: string
  attachmentUrls: [string]
}
