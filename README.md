# Secrets-Website
The "Secrets" project is a web application built with Node.js, Express, and MongoDB. It allows users to register, log in, and submit secrets anonymously. The application supports local authentication as well as OAuth 2.0 authentication via Google.

## Description

Secrets is a web application that allows users to share their secrets anonymously. It supports both local authentication and sign-in with Google.

## Features

- **User Authentication:**
  - Users can register with a username and password.
  - Passwords are securely hashed using bcrypt before storing in the database.
  - Local authentication is implemented using Passport.js and passport-local-mongoose.
 
 
- **Google OAuth 2.0 authentication:**
  - Users can sign in using their Google accounts through OAuth 2.0.
  - Passport.js is used to handle Google OAuth authentication.

- **Session Management:**
  - The application uses Express sessions for user session management.

- **Database:**
  - MongoDB is used as the database to store user information and secrets.
  - Mongoose is used as the ODM (Object Data Modeling) library for MongoDB and provides a straightforward schema-based solution..

- **Secrets Submission:**
  - Authenticated users can submit their secrets.
  - Secrets are associated with the user who submitted them.

- **Error Handling:**
  - Async/await and try/catch syntax are employed to handle asynchronous operations and potential errors more effectively.


## Technologies Used

- **Backend:**
   1. Node.js
   2. Express.js
   3. MongoDB
   4. Mongoose
   
- **Authentication:**
   1.Passport.js
   2.passport-local-mongoose
   3.passport-google-oauth20


## How to Run
  
1. **Environment Variables:**
   - Create a `.env` file in the project root and add the following environment variables including MongoDB connection details, Google OAuth credentials, etc. :
     
     ```env
       SECRET=Thisisourlittlesecret.
       DB_USERNAME=your_mongodb_username
       DB_PASSWORD=your_mongodb_password
       CLIENT_ID=your_google_client_id
       CLIENT_SECRET=your_google_client_secret
       CALL_BACK_URL=http://localhost:3000
     ```

     Make sure to replace `your_mongodb_username`, `your_mongodb_password`, `your_google_client_id`, and `your_google_client_secret` with your actual MongoDB and Google OAuth credentials.

     `CALL_BACK_URL`: This variable specifies the callback URL for Google OAuth. It indicates the URL to which Google will redirect the user after the user grants/denies permission on the consent screen. In your case, it's set to http://localhost:3000, but when deploying your application, you should update it to the actual production URL.

2. **Install Dependencies:**
   ```bash
     npm install
   ```

3. **Run the Application:**
   ```bash
     nodemon app.js
   ```

4. **Access the Application:**
   Open your browser and go to [http://localhost:3000](http://localhost:3000) to see the Secrets website in action.


## Contributing:
Contributions to this project are welcome. If you find any issues or have suggestions for improvements, please open an issue or create a pull request.

