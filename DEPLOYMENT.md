# Deployment Guide

This guide covers deploying Synaptide to various platforms.

## Environment Variables Required

Before deploying, ensure you have these environment variables configured:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Database (if using PostgreSQL)
DATABASE_URL=your_database_url
```

## Replit Deployment

1. Push your code to a GitHub repository
2. Import the repository to Replit
3. Configure environment variables in Replit Secrets
4. Use Replit Deployments to deploy the application

## Vercel Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Configure environment variables in Vercel dashboard
4. Deploy with `vercel --prod`

## Netlify Deployment

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables in Netlify dashboard
4. Set up build command: `npm run build`

## Heroku Deployment

1. Create a Heroku app: `heroku create your-app-name`
2. Set environment variables: `heroku config:set VARIABLE=value`
3. Deploy: `git push heroku main`

## Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize Firebase: `firebase init hosting`
3. Build the project: `npm run build`
4. Deploy: `firebase deploy`

## Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t synaptide .
docker run -p 5000:5000 --env-file .env synaptide
```

## Database Setup

### Firebase Firestore
1. Create a Firebase project
2. Enable Firestore Database
3. Set up security rules for your domain
4. Configure authentication if needed

### PostgreSQL (Alternative)
1. Set up a PostgreSQL database
2. Configure DATABASE_URL environment variable
3. Run migrations if using database storage

## Security Considerations

- Keep API keys secure and never commit them to version control
- Configure Firebase security rules appropriately
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Validate all user inputs

## Monitoring and Logging

- Set up error tracking (e.g., Sentry)
- Monitor API usage and costs
- Implement proper logging for debugging
- Set up uptime monitoring

## Performance Optimization

- Enable compression for static assets
- Implement caching strategies
- Optimize bundle size
- Use CDN for static assets
- Monitor Core Web Vitals

## Troubleshooting

### Common Issues

1. **Firebase connection errors**: Check API keys and project configuration
2. **OpenAI API errors**: Verify API key and usage limits
3. **Build failures**: Ensure all dependencies are installed
4. **Environment variables not loading**: Check variable names and deployment platform configuration

### Debug Steps

1. Check browser console for client-side errors
2. Review server logs for backend issues
3. Verify environment variables are set correctly
4. Test API endpoints independently
5. Check Firebase rules and permissions

## Scaling Considerations

- Implement database indexing for better performance
- Use connection pooling for database connections
- Consider implementing caching layers
- Monitor resource usage and scale accordingly
- Implement load balancing if needed