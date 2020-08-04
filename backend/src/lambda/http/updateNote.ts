import 'source-map-support/register';

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda';

import {UpdateNoteRequest} from '../../requests/UpdateNoteRequest';
import {getUserId} from '../utils';
import {NoteService} from '../../services/noteService';
import {createLogger} from '../../utils/logger';

const logger = createLogger('auth');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const noteId = event.pathParameters.noteId;
    const userId = getUserId(event);
    const updatedNote: UpdateNoteRequest = JSON.parse(event.body);

    logger.info('about to update note item', {noteId: noteId, userId: userId, updatedNote: updatedNote});

    const timestamp = new Date().toISOString();

    const newItem = {
        noteId: noteId,
        userId,
        timestamp,
        ...updatedNote
    };

    const service = new NoteService();
    await service.updateItem(userId, noteId, updatedNote);

    logger.info('updated item', {noteId: noteId, userId: userId, newItem: newItem});

    return {
        statusCode: 200,
        body: JSON.stringify({newItem}),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        }
    };
};
