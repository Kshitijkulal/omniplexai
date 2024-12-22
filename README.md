
# OmniplexAI

OmniplexAI is a feature-rich application that leverages AI to provide seamless interactions for users, such as stock data retrieval and AI-powered web search. This project was enhanced to include improved login functionality and a fully operational stocks feature.

## Getting Started

### 1. Clone the Repository
Clone the project repository using the following command:

```bash
git clone https://github.com/Kshitijkulal/omniplexai
cd omniplexai
```

### 2. Add API Keys
Create a `.env.local` file in the root of your project and fill in the required API keys. These include:

- OpenAI API Key
- Alpha Vantage API Key
- Bing API Key

Example `.env.local`:

```plaintext
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key
NEXT_PUBLIC_BING_API_KEY=your-bing-api-key
```

### 3. Configure Firebase
Add Firebase configuration for authentication and Firestore by creating a file `firebaseConfig.js` in the root directory:

```javascript
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;
```

### 4. Install Dependencies
Use yarn to install all required dependencies:

```bash
yarn install
```

### 5. Run the Project
Start the development server:

```bash
yarn dev
```

Visit the application at [http://localhost:3000](http://localhost:3000).

## Key Features

### 1. Improved Login Page
- Replaced the original popup-based login with a dedicated page at `/auth/login/`.
- Created a modern UI similar to Claude for a seamless user experience.
- This page allows users to log in with Firebase authentication.

### 2. Functional Stock Component
- The previously non-functional stock feature (causing 404 errors) was rebuilt to be fully functional.
- The new stock feature is located at `/plugins/stocks`.
- Integrated with the Alpha Vantage API to fetch real-time stock data.
- Includes a search feature for querying stocks and visualizing their prices with charts.

## Folder Structure

```bash
.
├── src
│   ├── app
│   │   ├── auth
│   │   │   └── login
│   │   │       └── page.tsx
│   │   ├── plugins
│   │   │   └── stocks
│   │   │       └── page.tsx
│   ├── components
│   │   ├── MainPrompt
│   │   ├── History
│   │   └── Stocks
│   ├── utils
│   │   ├── utils.js
│   │   └── types.js
│   └── store
│       └── authSlice.ts
├── firebaseConfig.js
├── .env.local
├── package.json
└── README.md
```

## Enhancements Summary

### Login Logic:
- Original popup-based authentication was replaced with a dedicated login page (`/auth/login`) for better user experience and routing.

### Stock Feature:
- Fixed the non-functional stock feature that previously returned a 404 error.
- Rebuilt as a dynamic component at `/plugins/stocks`.
- Uses Alpha Vantage API for real-time stock data retrieval.
- Includes a search feature to query stock prices and display charts.

## Contact

For questions or suggestions, feel free to reach out to kulalkshitij@gmail.com.