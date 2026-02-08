# Project Constitution: Next.js Todo App

## Code Quality Standards:
- Use TypeScript strict mode with comprehensive type definitions
- Implement proper error handling and validation
- Follow Next.js 14 best practices (Server Components, Streaming)
- Use Tailwind CSS utility-first approach with consistent design tokens
- All API routes must return proper HTTP status codes
- Database operations must handle connection errors gracefully
- Frontend components must be responsive and accessible

## User Experience Guidelines:
- Real-time feedback for user actions (loading states, success/error messages)
- Mobile-first responsive design
- Keyboard navigation support
- Clean, modern dashboard showing all todos with filter/search capabilities

## Performance Requirements:
- Implement proper database connection pooling for NeonDB
- Use Next.js caching strategies appropriately
- Optimize images and assets
- Implement pagination for large todo lists

## Security Principles:
- Never expose database credentials in client code
- Implement input validation and sanitization
- Use environment variables for all secrets
- Store NeonDB connection string in .env.local file only