A simple RESTful API built with Node.js, Express, and TypeScript that returns profile information along with a random cat fact fetched from the [Cat Facts API](https://catfact.ninja/fact).

## Features
- GET `/me` endpoint returning profile information
- Dynamic UTC timestamp in ISO 8601 format
- Integration with Cat Facts API for random cat facts
- Error handling for API failures with fallback response
- Content-Type set to `application/json`
- TypeScript for type safety and better code quality
- CORS enabled for cross-origin requests


### Project Structure
```
├── src/
│   └── index.ts       # Main API logic
├── dist/              # Compiled JavaScript output
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── .env               # Environment variables (optional)
└── README.md          # This file
```

### Technologies Used
- **Node.js** with **Express.js**: Web server framework
- **TypeScript**: Type-safe JavaScript
- **Axios**: For HTTP requests to Cat Facts API
- **CORS**: Middleware for cross-origin requests
- **dotenv** (optional): For environment variable management
- **nodemon** and **ts-node**: For development with auto-reload

### Live Demo 
[https://your-hosted-url/me](https://your-hosted-url/me)  

## Getting Started

### Prerequisites
- Node.js (>=18.0.0)
- npm
- TypeScript

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```
PORT=3000  # Optional, defaults to 3000
```

*Note*: Unlike the provided pattern, the user’s email, name, and stack are hardcoded in `src/index.ts` (as shown in the previous code). Update them directly in the code or extend to use `.env` if preferred.

### Installation
1. Clone this repository:
```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
```

2. Install dependencies:
```bash
   npm install
```
   **Dependencies**:
   - `express`: Web framework
   - `axios`: HTTP client for Cat Facts API
   - `typescript`: For TypeScript support
   - `@types/express`, `@types/node`: Type definitions
   - `ts-node`, `nodemon`: For development

3. Update profile details:
   - Edit `src/index.ts` to set your `email`, `name`, and `stack` in the `user` object:
```typescript
     const user = {
       email: 'your.email@example.com',
       name: 'Your Full Name',
       stack: 'Node.js/Express/TypeScript',
     };
```

4. Start the server:
   - For production:
```bash
     npm run build
     npm start
```
   - For development with auto-reload:
```bash
     npm run dev
```

### Usage
Send a GET request to the `/me` endpoint:

```bash
curl http://localhost:3000/me
```

**Example Response**:
```json
{
  "status": "success",
  "user": {
    "email": "blardcodes@gmail.com",
    "name": "Peter Omu",
    "stack": "Node.js/Express/TypeScript"
  },
  "timestamp": "2025-10-17T12:08:56.789Z",
  "fact": "Cats have 32 muscles in each ear."
}
```

### Deployment
This API can be deployed to platforms like Railway, Heroku, AWS, Render or others (Vercel is forbidden).

#### Railway Deployment
1. Create a new project on [Railway](https://railway.app).
2. Connect your GitHub repository.
3. Add environment variables (if any) in Railway’s dashboard:
   - `PORT`: 3000 (optional, Railway assigns one if not set).
4. Deploy the application. Railway will run `npm run build` and `npm start`.
5. Access the API at `https://your-project.railway.app/me`.


### Testing
- **Local Testing**:
  - Run `npm run dev` and test with:
```bash
    curl http://localhost:3000/me
```
  - Verify:
    - Response matches the required JSON structure.
    - Timestamp updates per request (ISO 8601 format).
    - A new cat fact is fetched each time.
    - Content-Type is `application/json`.
    - Errors (e.g., Cat Facts API failure) return a 503 status with JSON error message.

- **Hosted Testing**:
  - Test the deployed URL from multiple networks to ensure accessibility.

### Notes
- The API fetches a fresh cat fact on every request (no caching).
- Error handling ensures a fallback response if the Cat Facts API is down.
- TypeScript’s strict mode (`"strict": true`) ensures robust code.
- Update the `Live Demo` link after deployment.

## Author
- Name: BLARD
- Email: blardcodes@gmail.com

## License
ISC
