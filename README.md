# First 10 Forward Single Page Application

A React + TypeScript admin application for managing First 10 Forward organization data, integrated with Hugo static site generator and deployed on Azure Static Web Apps.

## Overview

This SPA provides administrative tools for F10F including:
- 📇 **Address Book**: Member contact management
- 🏆 **Nominations**: Organization nomination system with email notifications
- 💰 **Donations**: Membership fee and donation tracking (coming soon)
- 📊 **Reports**: Data analytics and reporting (coming soon)

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Bootstrap 3.3.7 (matching Hugo site)
- **Storage**: Azure Blob Storage with localStorage fallback
- **Email**: Azure Communication Services with mailto fallback
- **Deployment**: Azure Static Web Apps (free tier)
- **Integration**: Hugo static site navigation

## Email System

The application supports two email methods:

### 1. Azure Communication Services (Recommended)
Professional email sending with:
- Emails from your domain (`noreply@first10forward.org`)
- Automatic delivery without user interaction
- HTML formatting and delivery tracking
- Member CC functionality

See [Azure Email Setup Guide](./docs/azure-email-setup.md) for configuration details.

### 2. Mailto Links (Fallback)
Opens user's email client with pre-filled content:
- Works without configuration
- Requires user to manually send email
- Uses user's email client and settings
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Azure account (for production deployment)
- Hugo 0.120+ (for integrated site)

### Local Development

1. **Clone and install**:
   ```bash
   git clone <repository-url>
   cd f10f-spa
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Azure Communication Services credentials
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ./build-all.sh  # Includes Hugo integration
   ```

### Hugo Integration

The app integrates with the main F10F Hugo site:
- React app builds to `public/app/`
- Hugo navigation includes "Admin Tools" link
- Hash-based routing for direct nomination access
- Shared Bootstrap 3.3.7 styling for consistency

## Deployment

### Azure Static Web Apps

1. **Create Static Web App** in Azure portal
2. **Connect GitHub repository** for automatic deployment
3. **Configure environment variables**:
   - `VITE_AZURE_COMMUNICATION_ENDPOINT`
   - `VITE_AZURE_COMMUNICATION_ACCESS_KEY`
4. **Push to repository** triggers automatic deployment

See [Azure Email Setup Guide](./docs/azure-email-setup.md) for detailed configuration.

## Support

For technical issues:
- Check the [Azure Email Setup Guide](./docs/azure-email-setup.md)
- Review Azure portal logs and metrics

For F10F organization questions:
- Email: hello@first10forward.org
- Nominations: nominations@first10forward.org

icon source: https://www.streamlinehq.com/icons/freehand-duotone-free
