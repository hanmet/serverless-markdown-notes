export interface NoteItem {
  userId: string
  noteId: string
  folderId: string
  createdAt: string
  title: string
  text: string
  attachmentUrls: [string]
}
