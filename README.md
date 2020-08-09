# Serverless-Notes

This is a simple application using AWS Lambda and Serverless framework to manage notes.

# Functionality of the application

This application allows creating/removing/updating/fetching of Note items. Each Note item can optionally have multiple attachment images. Each user only has access to Note items he/she created.

## Listing Page
On the listing page of the application the user can see all his/her notes. Each note has a title, text and a list of images.
The user can add a new note, delete or edit an existing note.

A new note can be created by entering a title and clicking on the button "New Note".
To edit a note the user needs to click on the pencil button.
To delete a note, click on the trash can button.
![Alt text](/images/serverless-notes-listing-page.png "Listing Page")

## Edit Page
The Edit page automatically loads data for the selected note.
The user can edit the title and text. And he can upload images, that get attached to the note. By clicking on the trash can button next to an image, the image get removed from this note.
![Alt text](/images/serverless-notes-edit-page.png "Edit Page")

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
