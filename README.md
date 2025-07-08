# Online Mobile Installment System (Installment Phone Portal)

A comprehensive management platform for online mobile phone installment purchases, designed for retailers, admins, and customers. This system enables seamless product management, installment sales, and secure iCloud account binding for both store and customer sides. Built with modern web technologies and a robust backend API, it is suitable for real-world deployment in retail or service businesses.

## Project Overview

The Installment Phone Portal is a full-featured web application for managing the lifecycle of mobile phone sales and installment contracts. It streamlines the process of adding and managing products, handling installment plans, and securely associating iCloud accounts with each device. The platform is designed for both administrative and operational efficiency, supporting multiple user roles and advanced product tracking.

## Key Features

- **Product Management**: Add, edit, delete, and view detailed information for each mobile phone in inventory, including images, IMEI, pricing, and stock levels.
- **Installment & Leasing System**: Create and manage installment contracts, track payment status, and link products to customer orders.
- **iCloud Account Binding**: Securely bind iCloud accounts to products for both store and customer, with support for locking/unlocking and status notifications.
- **Advanced Search & Filtering**: Quickly locate products or contracts using powerful search and filter tools.
- **Admin & Store Tools**: Role-based access, order management, and notification features for efficient business operations.
- **Real Backend API**: Fully integrated with a backend API for data persistence, authentication, and business logic.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, CSS Modules
- **Linting/Quality**: ESLint
- **Backend**: (Integrated API, not included in this repo)

## Installation & Usage

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

## Project Structure

```
src/
  ├── assets/        # Images and static assets
  ├── components/    # Shared React components
  ├── pages/         # Application pages (admin, products, icloud, etc.)
  ├── services/      # API and backend service calls
  ├── styles/        # CSS modules and global styles
  ├── App.tsx        # Main App component
  └── main.tsx       # Application entry point
```

## Development Workflow

1. Clone this repository
2. Install dependencies with `npm install`
3. Start the development server using `npm run dev`
4. Build and test features as needed
5. For production, use `npm run build` and `npm run preview` to verify the build

## License

MIT
