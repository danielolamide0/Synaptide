# Contributing to Synaptide

Thank you for your interest in contributing to Synaptide! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Create a new branch for your feature/fix
5. Make your changes
6. Test your changes thoroughly
7. Submit a pull request

## Development Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Firebase project (for testing)
- OpenAI API key (for testing)

### Environment Setup
1. Copy `.env.example` to `.env`
2. Fill in your Firebase and OpenAI credentials
3. Run `npm run dev` to start the development server

## Code Style

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure type safety throughout

## Project Structure

- `client/` - React frontend application
- `server/` - Express.js backend server
- `shared/` - Shared types and schemas
- `components.json` - UI component configuration

## Testing

Before submitting a pull request:
1. Test the application thoroughly
2. Ensure all existing functionality still works
3. Test with different user scenarios
4. Verify Firebase integration works correctly

## Submitting Changes

### Pull Request Process
1. Create a descriptive title for your PR
2. Provide a detailed description of changes
3. Include any relevant issue numbers
4. Ensure your code follows the project's style
5. Test your changes thoroughly

### Commit Message Format
Use clear, descriptive commit messages:
- `feat: add new feature`
- `fix: resolve bug in user authentication`
- `docs: update README with new setup instructions`
- `style: improve UI component styling`

## Reporting Issues

When reporting issues:
1. Use the GitHub issue tracker
2. Provide a clear description
3. Include steps to reproduce
4. Add relevant error messages
5. Specify your environment (browser, OS, etc.)

## Feature Requests

For new features:
1. Check if the feature already exists
2. Describe the feature in detail
3. Explain the use case and benefits
4. Consider the impact on existing functionality

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain a positive environment

## Questions?

If you have questions about contributing, feel free to:
- Open an issue for discussion
- Ask questions in pull request comments
- Review existing issues and discussions

Thank you for contributing to Synaptide!