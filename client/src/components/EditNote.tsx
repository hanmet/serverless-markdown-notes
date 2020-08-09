import * as React from 'react'
import {Form, Button, Image, Icon} from 'semantic-ui-react'
import Auth from '../auth/Auth'
import {getNotes, getUploadUrl, patchNote, uploadFile} from '../api/notes-api'
import {Note} from "../types/Note";


enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditNoteProps {
  match: {
    params: {
      noteId: string
    }
  }
  auth: Auth
}

interface EditNoteState {
  file: any
  uploadState: UploadState
  note: Note
}

export class EditNote extends React.PureComponent<EditNoteProps, EditNoteState> {

  state: EditNoteState = {
    file: "",
    uploadState: 0,
    note: {noteId: "", content: "", attachmentUrls: new Array(""), createdAt: "", title: ""}
  }

  async componentDidMount() {
    this.getNote();
  }

  async getNote() {
    try {
      console.log("about to get notes")
      let notes = await getNotes(this.props.auth.getIdToken())
      console.log(JSON.stringify(notes));
      console.log("Props NoteId: " + this.props.match.params.noteId)
      notes = notes.filter(n => n.noteId === this.props.match.params.noteId);
      console.log("NOTE: " + JSON.stringify(notes));
      this.setState({
        note: notes[0],
      })
      console.log("STATE NOTE: " + JSON.stringify(this.state.note));
    } catch (e) {
      alert(`Failed to fetch notes: ${e.message}`)
    }
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmitFile = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    console.log("handle submit")

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }
      console.log("about to get upload url")
      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.noteId)
      console.log("uploadUrl: " + uploadUrl)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)
      await this.getNote();
      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  handleSubmitNote = async (event: React.SyntheticEvent) => {
    console.log("About to save note")
    const updatedNote = this.state.note;
    try {
      await patchNote(this.props.auth.getIdToken(), this.state.note.noteId, updatedNote);
      alert('Note was saved!')
    } catch (e) {
      alert('Could not save note: ' + e.message)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
  }

  changeText(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const textValue: string = event.currentTarget.value;
    this.setState(prevState => ({
      note: {...prevState.note, content: textValue}
    }))
  }

  changeTitle(event: React.ChangeEvent<HTMLInputElement>) {
    const titleValue: string = event.currentTarget.value;
    this.setState(prevState => ({
      note: {...prevState.note, title: titleValue}
    }))
  }

  async onImageDelete(key: number) {
    console.log("deleting image: " + key);
    console.log("old attachmentUrls: " + JSON.stringify(this.state.note.attachmentUrls))
    let newAttachmentUrls = this.state.note.attachmentUrls;
    newAttachmentUrls.splice(key, 1);
    console.log("new attachmentUrls: " + JSON.stringify(newAttachmentUrls))
    this.setState(prevState => ({
      note: {...prevState.note, attachmentUrls: newAttachmentUrls}
    }))
    console.log(JSON.stringify(this.state.note));
  }


  render() {
    return (
      <div>
        <h1>Edit Note</h1>


        <Form onSubmit={this.handleSubmitNote}>
          <Form.Field>
            <label>Title</label>
            <input type="text" id="title" onChange={e => this.changeTitle(e)} value={this.state.note.title}/>
            <label>Text</label>
            <textarea id="text" onChange={e => this.changeText(e)} value={this.state.note.content}/>
          </Form.Field>

          <Button type="submit">
            Save
          </Button>
        </Form>

        <h3>Images</h3>
        <div>
          {this.state.note.attachmentUrls.map((url, key) =>
            <div>
              <Image src={url} key={"image" + key} size="small" wrapped/>
              <Button key={"button" + key} icon color="red" onClick={() => this.onImageDelete(key)}>
                <Icon name="delete"/>
              </Button>
            </div>
          )}
        </div>
        <Form onSubmit={this.handleSubmitFile}>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}
