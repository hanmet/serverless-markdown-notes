import 'source-map-support/register';

import {APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler} from 'aws-lambda';
import {getUserId} from '../utils';
import {NoteService} from '../../services/noteService';
import {createLogger} from '../../utils/logger';

const logger = createLogger('auth');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const noteId = event.pathParameters.noteId;

    logger.info('about to delete item', {noteId: noteId});

    const userId = getUserId(event);

    logger.info('got userId for event', {userId: userId});

    const service = new NoteService();
    await service.deleteItem(userId, noteId);

    logger.info('deleted item', {userId: userId, noteId: noteId});

    return {
        statusCode: 200,
        body: '',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        }
    };
};
