import 'source-map-support/register';

import {APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler} from 'aws-lambda';
import {getUserId} from '../utils';
import {NoteService} from '../../services/noteService';
import {createLogger} from '../../utils/logger';
import {v4 as uuidv4} from 'uuid';

const logger = createLogger('auth');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const noteId = event.pathParameters.noteId;

    logger.info('about to generate upload url', {noteId: noteId});

    const userId = getUserId(event);
    const service = new NoteService();
    const attachmentId = uuidv4();

    const isValidNoteId = await service.noteIdExists(noteId, userId);
    console.log("isValidNoteId: " + isValidNoteId);
    if (!isValidNoteId) {
        logger.error('invalid note id', {noteId: noteId});
        return {
            statusCode: 404,
            body: JSON.stringify({
                error: 'note id doesn\'t exist!'
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            }
        };
    }

    await service.updateNoteAttachment(noteId, userId, attachmentId);

    const url = service.getUploadUrl(attachmentId);

    logger.info('successfully retrieved upload url', {noteId: noteId});

    return {
        statusCode: 201,
        body: JSON.stringify({
            uploadUrl: url
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        }
    };
};
