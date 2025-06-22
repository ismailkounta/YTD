# YouTube Video Downloader

A modern, full-stack web application for downloading YouTube videos built with React, Node.js, and TypeScript.

## Features

- **Video Information Extraction**: Automatically fetch video metadata including title, author, duration, and thumbnail
- **Multiple Quality Options**: Choose from various video qualities and audio-only formats
- **Real-time Progress Tracking**: Monitor download progress with speed and time remaining indicators
- **Download History**: Keep track of all your downloads with status indicators
- **Responsive Design**: Modern UI that works on desktop and mobile devices
- **Type-safe Development**: Built with TypeScript for better code quality and developer experience

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for client-side routing
- **TanStack React Query** for server state management
- **Tailwind CSS** for styling
- **Shadcn/ui** components built on Radix UI
- **Vite** for fast development and building

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **ytdl-core** for YouTube video processing
- **Drizzle ORM** with PostgreSQL (ready for database integration)

## Quick Start

### Prerequisites
- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/youtube-downloader.git
cd youtube-downloader
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5000`

## Usage

1. **Enter YouTube URL**: Paste any YouTube video URL into the input field
2. **Select Quality**: Choose your preferred video quality or audio-only format
3. **Download**: Click the download button and monitor progress in real-time
4. **View History**: Check your download history in the sidebar panel

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utility functions and configs
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage layer
│   └── vite.ts            # Vite integration
├── shared/                 # Shared TypeScript types
│   └── schema.ts          # Database schemas and types
└── package.json
```

## API Endpoints

- `POST /api/video/info` - Fetch video information
- `POST /api/download/start` - Start a download
- `GET /api/download/:id` - Get download progress
- `GET /api/downloads` - Get all downloads
- `DELETE /api/downloads` - Clear download history

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:push` - Push database schema changes (when using database)

### Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (optional, uses in-memory storage by default)
- `NODE_ENV` - Environment setting (development/production)

## Deployment

This application is configured for deployment on Replit with automatic scaling. For other platforms:

1. Build the application:
```bash
npm run build
```

2. Set environment variables as needed
3. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests if applicable
4. Commit your changes: `git commit -m 'Add feature-name'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This tool is for educational purposes only. Please ensure you comply with YouTube's Terms of Service and respect content creators' rights when downloading videos.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/yourusername/youtube-downloader/issues) on GitHub.