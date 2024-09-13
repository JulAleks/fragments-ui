
# Fragments UI Lab - AWS and Microservice Security

This lab covers working with AWS and securing a fragments microservice, while also creating a simple web client, **Fragments UI**, for manual testing of the fragments microservice API. The project demonstrates key concepts such as AWS Cognito for authentication and authorization, and AWS Amplify for connecting the client to the cloud.

## Key Concepts

- **AWS Cognito**: Used to manage user authentication (sign-up, sign-in) and secure API access.
- **Fragments Microservice**: A backend microservice that manages and serves fragments (data or resources).
- **Fragments UI**: A simple web client built to interact with the fragments microservice API for manual testing.
- **AWS Amplify**: Utilized to streamline cloud integration for the frontend.

## Features

- **User Authentication**: Users sign up and sign in via AWS Cognito.
- **OAuth2 Authorization**: The web client authenticates users and retrieves secure tokens to interact with the microservice.
- **JWT Secured API**: The fragments microservice uses JWT tokens from Cognito to authenticate requests.
- **Manual Testing Interface**: The Fragments UI allows users to test API endpoints for retrieving, creating, and managing fragments.

## Project Structure

```bash
fragments-ui/
├── src/                  # Source code for the client-side app
│   ├── auth.js           # Handles AWS Cognito authentication
│   ├── api.js            # API calls to the fragments microservice
│   ├── app.js            # Core logic for the UI
├── public/               # Static assets (HTML, CSS)
├── .env                  # Environment variables for AWS Cognito and API config
└── package.json          # Project dependencies and scripts
```

## Prerequisites

Before running this project, ensure you have:

- **AWS Academy Learner Lab** account.
- **Node.js** (v14 or higher) installed.
- **npm** or **yarn** installed.

## Setup and Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/fragments-ui.git
   cd fragments-ui
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create an `.env` file in the root of your project and add your AWS Cognito and API details:
   ```bash
   API_URL=http://localhost:8080
   AWS_COGNITO_POOL_ID=us-east-1_xxxxxxxx
   AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx
   AWS_COGNITO_HOSTED_UI_DOMAIN=xxxxxxxx.auth.us-east-1.amazoncognito.com
   OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:1234
   OAUTH_SIGN_OUT_REDIRECT_URL=http://localhost:1234
   ```

4. **Run the project**:
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:1234`.

## AWS Setup

1. **Create Cognito User Pool**: Set up a User Pool in AWS Cognito to manage user authentication.
2. **Configure OAuth**: Set the callback URLs for login and logout.
3. **Amplify Setup**: Use `aws-amplify` to manage authentication flows in your UI.

## API Routes

- **GET /v1/fragments**: Fetch user-specific fragments.
- **POST /v1/fragments**: Add a new fragment.
- **DELETE /v1/fragments/:id**: Delete a specific fragment.

## Testing and Usage

1. Start your **fragments microservice** and **fragments-ui** client.
2. Open the Fragments UI in your browser at `http://localhost:1234`.
3. Use the UI to log in and interact with the microservice via the JWT-secured API endpoints.

## Security

- **JWT Authentication**: The Fragments UI securely sends JWT tokens from AWS Cognito to authenticate API requests.
- **Authorization Headers**: Tokens are included in the request headers to validate users.

## Development

- **Run in development mode**:
   ```bash
   npm run dev
   ```

- **Build for production**:
   ```bash
   npm run build
   ```
