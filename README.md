# Serverless-Notes

This is a simple application using AWS Lambda and Serverless framework to manage notes.

# Functionality of the application

This application allows creating/removing/updating/fetching of Note items. Each Note item can optionally have multiple attachment images. Each user only has access to Note items he/she created.


On the listing page of the application the user can see all his/her notes. Each note has a title, text and a list of images.
The user can add a new note, delete or edit an existing note.
![Alt text](/images/serverless-notes-listing-page.png "Listing Page")

## Authentication

The authentication of this application is done using Auth0 with an asymmetrically encrypted JWT token.

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless-notes application.
