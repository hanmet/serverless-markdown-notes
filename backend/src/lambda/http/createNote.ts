import 'source-map-support/register';

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda';

import {CreateNoteRequest} from '../../requests/CreateNoteRequest';
import {getUserId} from '../utils';
import {NoteService} from '../../services/noteService';
import {v4 as uuidv4} from 'uuid';
import {createLogger} from '../../utils/logger';

const logger = createLogger('auth');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newNote: CreateNoteRequest = JSON.parse(event.body);

    const timestamp = new Date().toISOString();
    const noteId = uuidv4();
    const userId = getUserId(event);

    const newItem = {
        userId,
        noteId,
        createdAt: timestamp,
        title: '',
        text: '',
        attachmentUrls: [],
        ...newNote
    };

    const service = new NoteService();
    const result = await service.createItem(newItem);

    logger.info('new note item was created', {newItem: result});

    return {
        statusCode: 200,
        body: JSON.stringify({item: result}),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        }
    };
};
