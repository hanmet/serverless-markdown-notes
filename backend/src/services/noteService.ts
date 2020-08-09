import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import {NoteItem} from '../models/NoteItem';
import {UpdateNoteRequest} from '../requests/UpdateNoteRequest';

export class NoteService {

    notesTable: string;
    globalIndexNote: string;
    XAWS: any;
    docClient: any;
    s3Client: any;
    localIndex: string;
    bucketName: string;
    urlExpiration: string;

    constructor() {
        console.log('inside note service - ctor');

        this.XAWS = AWSXRay.captureAWS(AWS);
        this.docClient = this.createDynamoDBClient();
        this.s3Client = new this.XAWS.S3({
            signatureVersion: 'v4'
        });
        this.notesTable = process.env.NOTES_TABLE;
        this.globalIndexNote = process.env.NOTE_GLOBAL_INDEX;
        this.localIndex = process.env.NOTE_LOCAL_INDEX;
        this.bucketName = process.env.IMAGES_S3_BUCKET;
        this.urlExpiration = process.env.SIGNED_URL_EXPIRATION;
    }

    async getNotes(userId: string): Promise<NoteItem> {
        console.log('inside note service - getNotes');

        const result = await this.docClient.query({
            TableName: this.notesTable,
            IndexName: this.globalIndexNote,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
        }).promise();

        return result.Items as NoteItem;
    }

    async createItem(noteItem: NoteItem): Promise<NoteItem> {
        console.log('inside note service - createItem');
        await this.docClient.put({
            TableName: this.notesTable,
            Item: noteItem
        }).promise();
        return noteItem;
    }

    async updateItem(userId: string, noteId: string, updateNote: UpdateNoteRequest) {
        await this.docClient.update({
            TableName: this.notesTable,
            Key: {
                noteId: noteId,
                userId: userId
            },
            ExpressionAttributeValues: {
                ':title': updateNote.title,
                ':content': updateNote.content,
                ':attachmentUrls': updateNote.attachmentUrls,
            },
            // ExpressionAttributeNames: {
            //     '#attrName': 'name'
            // },
            UpdateExpression: 'SET title=:title, content=:content, attachmentUrls=:attachmentUrls',
            ReturnValues: 'ALL_NEW'
        }).promise();
    }

    async deleteItem(userId: string, noteId: string) {
        await this.docClient.delete({
            TableName: this.notesTable,
            IndexName: this.localIndex,
            Key: {
                noteId: noteId,
                userId: userId
            }
        }).promise();
    }

    async updateNoteAttachment(noteId: String, userId: String, attachmentId: String) {

        await this.docClient.update({
            TableName: this.notesTable,
            Key: {
                noteId: noteId,
                userId: userId
            },
            ExpressionAttributeValues: {
                ':attachmentUrls': [`https://${this.bucketName}.s3.amazonaws.com/${attachmentId}`]
            },
            ExpressionAttributeNames: {
                '#attachmentUrls': 'attachmentUrls'
            },
            UpdateExpression: 'SET #attachmentUrls=:attachmentUrls',
            ReturnValues: 'ALL_NEW'
        }).promise();
    }

    async noteIdExists(noteId: String, userId: String) {
        const result = await this.docClient.get({
            TableName: this.notesTable,
            Key: {
                noteId: noteId,
                userId: userId
            }
        }).promise();

        return !!result;
    }

    getUploadUrl(id: String) {
        return this.s3Client.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: id,
            Expires: parseInt(this.urlExpiration)
        });
    }

    private createDynamoDBClient() {
        console.log(process.env);

        if (process.env.IS_OFFLINE) {
            console.log('creating dynamodb instance');
            return new this.XAWS.DynamoDB.DocumentClient({
                region: 'localhost',
                endpoint: 'http://localhost:8000'
            });
        }
        return new this.XAWS.DynamoDB.DocumentClient();
    }
}
