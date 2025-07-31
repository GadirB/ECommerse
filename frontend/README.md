# E-Commerce Frontend

A modern React/Next.js frontend application for the e-commerce platform.

## Overview

This frontend application provides a complete e-commerce user interface built with Next.js 14, TypeScript, and Tailwind CSS. It features a modern, responsive design with comprehensive shopping functionality including product browsing, cart management, checkout process, and user authentication.

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx         # Home page
│   │   ├── products/        # Product listing and details
│   │   ├── cart/           # Shopping cart
│   │   ├── checkout/       # Checkout process
│   │   ├── login/          # Authentication
│   │   └── orders/         # Order history
│   ├── components/         # Reusable components
│   │   ├── ui/            # Basic UI components
│   │   ├── layout/        # Layout components
│   │   └── product/       # Product-specific components
│   ├── context/           # React Context providers
│   ├── services/          # API service layer
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── styles/            # Global CSS files
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── next.config.js         # Next.js configuration
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Backend API running on `http://localhost:8000`

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

3. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Features

### Core Functionality
- 🏠 **Home Page**: Featured products and hero section
- 🛍️ **Product Catalog**: Browse, search, and filter products
- 🔍 **Product Details**: Detailed product information and reviews
- 🛒 **Shopping Cart**: Add, remove, and manage cart items
- 💳 **Checkout Process**: Secure payment and order placement
- 👤 **User Authentication**: Login, registration, and profile management
- 📦 **Order Management**: Order history and tracking

### Technical Features
- 📱 **Responsive Design**: Mobile-first, cross-device compatibility
- ⚡ **Performance Optimized**: Next.js optimizations and lazy loading
- 🔒 **Secure Authentication**: JWT-based authentication system
- 🎨 **Modern UI**: Clean, intuitive user interface
- 🔄 **Real-time Updates**: Dynamic cart and order status updates

## Technology Stack

### Frontend Framework
- **Next.js 14**: React framework with App Router
- **React 18**: Component-based UI library
- **TypeScript**: Type-safe JavaScript

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **React Hot Toast**: Toast notifications

### State Management & Data
- **React Context**: Global state management
- **Axios**: HTTP client for API requests
- **React Hook Form**: Form handling and validation

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## API Integration

The frontend integrates with the Go backend API running on `http://localhost:8000`. Key API endpoints include:

- **Authentication**: `/api/users/signup`, `/api/users/login`
- **Products**: `/api/admin/products`, `/api/admin/products/:id`
- **Cart**: `/api/users/addtocart`, `/api/users/listcart`
- **Orders**: `/api/users/orders`, `/api/users/checkout`
- **Addresses**: `/api/users/addresses`

## Development Guidelines

### Code Organization
- Components are organized by feature and reusability
- TypeScript interfaces are defined in the `types/` directory
- API calls are centralized in the `services/` directory
- Utility functions are placed in the `utils/` directory

### Best Practices
- All components are written in TypeScript
- Responsive design using Tailwind CSS utilities
- Error handling and loading states for all API calls
- Form validation using React Hook Form
- Consistent code formatting with ESLint

### Performance Considerations
- Next.js automatic code splitting
- Image optimization with Next.js Image component
- Lazy loading for non-critical components
- Efficient state management with React Context

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## Environment Configuration

The application expects the backend API to be running on `http://localhost:8000`. This can be configured in the `services/api.ts` file.

## Contributing

When contributing to this project:
1. Follow the existing code style and structure
2. Add TypeScript types for new features
3. Include error handling for API calls
4. Test responsive design on multiple devices
5. Update documentation for new features