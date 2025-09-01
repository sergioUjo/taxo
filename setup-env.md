# Environment Setup Instructions

## Fix the "Invalid URL" Error

The error you're seeing occurs because the `APP_URL` environment variable is not set in your Convex deployment. Here's how to fix it:

### 1. Set Environment Variables for Convex

Run these commands in your terminal:

```bash
# For development
npx convex env set APP_URL http://localhost:3000

# For production (replace with your actual deployed URL)
npx convex env set APP_URL https://your-app.vercel.app
```

### 2. Set Environment Variables for Next.js

Create a `.env.local` file in your project root:

```bash
# .env.local
APP_URL=http://localhost:3000
NEXT_PUBLIC_CONVEX_URL=https://your-convex-url.convex.cloud
```

### 3. Alternative: Skip API Calls During Development

If you don't want to set up the full Python integration right now, the system will automatically fall back to mock data when the API URL is not available.

The document processing will still work and create patients with sample data.

### 4. Verify the Setup

After setting the environment variables:

1. Restart your Convex dev server: `npx convex dev`
2. Restart your Next.js dev server: `npm run dev`
3. Upload a document to test - you should see no more URL errors

### 5. Python Integration (Optional)

To enable full Python integration:

1. Set up the Python environment:

   ```bash
   pip install -r requirements.txt
   ```

2. Run the Python integration example:

   ```bash
   python python_integration_example.py --document-path /path/to/test.pdf --mock
   ```

3. For production, deploy the Python service and update the `APP_URL` to point to your deployed Next.js app.

## Architecture Flow

```
Document Upload → Convex Action → API Route → Python Agent → Extract Data → Update Database
                              ↓ (if API fails)
                         Mock Data Processing → Create Patient with Sample Data
```

The system is designed to be resilient - if the Python API is unavailable, it will create patients with mock data so the application continues to work during development.
