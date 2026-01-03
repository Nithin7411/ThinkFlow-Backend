# medium backend

## Steps to setup

1. If you have not run `npm install` in the root of the repo, please finish that at the root level first that will take care of setting up a few things for you.
2. Export the following environment variables

- `CLIENT_ID` - used for github oauth
- `CLIENT_SECRET` - used for github oauth
- `SECRET_MSG` - used for managing session
- `DB_NAME="database/medium.db"` - Path to the sqlite database
- `FRONT_END_URL="http://localhost:5173"` - URL to the front end

3. Run `npm run setup-db` to setup the database with a mock data for stories/drafts/claps etc.
4. Run `npm start` to start the backend

## API DOCS

Once you start the backend, visit http://localhost:8000/api-docs to access documentation for the APIs available

## Authentication

To access some of the APIs you need to be authenticated, please refer the [authentation](../frontend/README.md#authentication) from fronted.

## Serving static files

1. Create a folder `public` in the backend
2. Copy the generated static files such as `index.html`, `*.css`, `*.js`, `assets`.. into `public`
3. Start the backend
4. Open the `http://localhost:8000`
