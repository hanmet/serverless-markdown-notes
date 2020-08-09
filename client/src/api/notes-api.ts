import { apiEndpoint } from '../config'
import { Note } from '../types/Note';
import { CreateNoteRequest } from '../types/CreateNoteRequest';
import { UpdateNoteRequest } from '../types/UpdateNoteRequest';
import Axios from 'axios'

export async function getNotes(idToken: string): Promise<Note[]> {
  console.log('Fetching notes')

  const response = await Axios.get(`${apiEndpoint}/notes`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Notes:', response.data)
  return response.data.items
}

export async function createNote(
  idToken: string,
  newNote: CreateNoteRequest
): Promise<Note> {
  const response = await Axios.post(`${apiEndpoint}/notes`,  JSON.stringify(newNote), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchNote(
  idToken: string,
  noteId: string,
  updatedNote: UpdateNoteRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/notes/${noteId}`, JSON.stringify(updatedNote), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteNote(
  idToken: string,
  noteId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/notes/${noteId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  noteId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/notes/${noteId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  console.log("uploadUrl: " + response.data.uploadUrl)
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  let axiosResponse = await Axios.put(uploadUrl, file);
  console.log("AXIOS RESPONSE: " + JSON.stringify(axiosResponse));
}
