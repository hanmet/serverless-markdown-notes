/**
 * Fields in a request to create a single NOTE item.
 */
export interface CreateNoteRequest {
  title: string
  text: string
  attachmentUrls: [string]
}
