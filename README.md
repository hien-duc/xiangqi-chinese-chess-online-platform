# Xiangqi (Chinese Chess)

A modern implementation of Chinese Chess using Next.js and TypeScript.

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Authentication**: NextAuth.js
- **Database**: MongoDB
- **Styling**: CSS Modules

## Project Structure

```
src/
├── app/          # Next.js app router pages and layouts
├── components/   # Reusable UI components
├── hooks/        # Custom React hooks
├── lib/          # Utility functions and configurations
├── styles/       # CSS modules and global styles
└── types/        # TypeScript type definitions
```

## Getting Started
1. Clone the repository
2. Install dependencies:
Using nodejs 23.1.0
   ```bash
   npm install --legacy-peer-deps
   ```
4. Set up your environment variables:
   ```
   Copy .env.example to .env.local and fill in your values
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

The following environment variables are required:

- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `NEXTAUTH_URL` - NextAuth.js URL

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License.
