# Google Login Setup

CareNest uses Google Identity Services for Gmail login and signup.

## 1. Create a Google OAuth Client

1. Open Google Cloud Console.
2. Go to **APIs & Services > Credentials**.
3. Create an **OAuth client ID**.
4. Select **Web application**.
5. Add these authorized JavaScript origins for local development:

```text
http://localhost:3000
http://localhost:3001
http://127.0.0.1:3000
http://127.0.0.1:3001
```

6. Add your deployed frontend domain when you deploy the site.

## 2. Add the Same Client ID to the Project

In `frontend/.env`:

```text
REACT_APP_GOOGLE_CLIENT_ID=your-google-oauth-web-client-id.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:5000/api
```

In `backend/.env`:

```text
GOOGLE_CLIENT_ID=your-google-oauth-web-client-id.apps.googleusercontent.com
```

Both values must use the same Google **Web application** client ID.

## 3. Restart the App

After changing `.env` files, restart both servers:

```bash
npm run dev
```

The Google button should appear on both Login and Sign Up pages.

## Fix "Access blocked"

If Google shows **Access blocked**, fix these settings in Google Cloud Console:

1. Use an OAuth client with application type **Web application**.
2. In **Authorized JavaScript origins**, add the exact local site you open in the browser:

```text
https://carenest-elderly-care-platform-5pilt0bqm.vercel.app
http://localhost:3001
http://localhost:3000
http://127.0.0.1:3001
http://127.0.0.1:3000
```

3. Open the app with this URL while developing:

```text
http://localhost:3001/login
```

4. If OAuth consent screen publishing status is **Testing**, add your Gmail account in **OAuth consent screen > Test users**.
5. Save the Google Cloud changes and wait one or two minutes before trying again.
