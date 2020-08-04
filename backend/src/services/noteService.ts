import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import {NoteItem} from '../models/NoteItem';
import {UpdateNoteRequest} from '../requests/UpdateNoteRequest';

export class NoteService {

    notesTable: string;
    globalIndexTodo: string;
    XAWS: any;
    docClient: any;
    s3Client: any;
    localIndex: string;
    bucketName: string;
    urlExpiration: string;

    constructor() {
        console.log('inside todo service - ctor');

        this.XAWS = AWSXRay.captureAWS(AWS);
        this.docClient = this.createDynamoDBClient();
        this.s3Client = new this.XAWS.S3({
            signatureVersion: 'v4'
        });
        this.notesTable = process.env.TODOS_TABLE;
        this.globalIndexTodo = process.env.TODO_GLOBAL_INDEX;
        this.localIndex = process.env.TODO_LOCAL_INDEX;
        this.bucketName = process.env.IMAGES_S3_BUCKET;
        this.urlExpiration = process.env.SIGNED_URL_EXPIRATION;
    }

    async getNotes(userId: string): Promise<NoteItem> {
        console.log('inside note service - getNotes');

        const result = await this.docClient.query({
            TableName: this.notesTable,
            IndexName: this.globalIndexTodo,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
        }).promise();

        return result.Items as NoteItem;
    }

    async createItem(noteItem: NoteItem): Promise<NoteItem> {
        console.log('inside todo service - createItem');
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
                ':text': updateNote.text,
                ':attachmentUrls': updateNote.attachmentUrls,
            },
            ExpressionAttributeNames: {
                '#attrName': 'name'
            },
            UpdateExpression: 'SET #attrName=:name, done=:done, dueDate=:dueDate',
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

    async updateTodoAttachment(noteId: String, userId: String) {

        await this.docClient.update({
            TableName: this.notesTable,
            Key: {
                todoId: noteId,
                userId: userId
            },
            ExpressionAttributeValues: {
                ':attachmentUrl': `https://${this.bucketName}.s3.amazonaws.com/${noteId}`
            },
            ExpressionAttributeNames: {
                '#attachmentUrl': 'attachmentUrl'
            },
            UpdateExpression: 'SET #attachmentUrl=:attachmentUrl',
            ReturnValues: 'ALL_NEW'
        }).promise();
    }

    async todoIdExists(noteId: String, userId: String) {
        const result = await this.docClient.get({
            TableName: this.notesTable,
            Key: {
                todoId: noteId,
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
