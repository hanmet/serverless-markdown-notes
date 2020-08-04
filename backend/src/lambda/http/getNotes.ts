import 'source-map-support/register';

import {APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler} from 'aws-lambda';
import {getUserId} from '../utils';
import {NoteService} from '../../services/noteService';
import {createLogger} from '../../utils/logger';

const logger = createLogger('auth');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);

    logger.info('about to request all notes for userId', {userId: userId});

    const service = new NoteService();
    const result = await service.getNotes(userId);

    logger.info('retrieved items for user', {userId: userId, items: result});

    return {
        statusCode: 200,
        body: JSON.stringify({items: result}),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        }
    };
};
