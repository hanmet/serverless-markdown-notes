export interface NoteItem {
  userId: string
  noteId: string
  createdAt: string
  title: string
  text: string
  attachmentUrls: [string]
}
