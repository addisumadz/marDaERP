# WBill v5 - Full-Stack Billing System

A comprehensive billing and customer management system with Ethiopian calendar support.

## Project Structure

```
wbillv5/
├── Wbill_FT11-main/          # Next.js Frontend Application
├── wbillBEv10-main/          # Spring Boot Backend API
└── README.md                 # This file
```

## Frontend (Wbill_FT11-main)
- **Technology**: Next.js, React, Tailwind CSS
- **Features**: 
  - Customer management with Ethiopian calendar integration
  - Advanced filtering and search capabilities
  - Responsive UI with modern design
  - Multi-language support (English/Amharic)

## Backend (wbillBEv10-main)
- **Technology**: Spring Boot, Java, JPA/Hibernate
- **Features**:
  - RESTful API for billing operations
  - Ethiopian calendar conversion utilities
  - JWT authentication and authorization
  - Comprehensive customer and billing management

## Key Features

### Ethiopian Calendar Integration
- Bidirectional conversion between Gregorian and Ethiopian calendars
- Date filtering and display in Ethiopian format
- Support for Amharic month names
- Comprehensive date validation and formatting

### Customer Management
- Advanced customer filtering (6+ filter types)
- Customer registration and history tracking
- Payment and billing management
- Meter reading and consumption tracking

### Technical Highlights
- Full-stack TypeScript/JavaScript and Java implementation
- Modern responsive UI with Tailwind CSS
- Comprehensive API with Spring Boot
- Database integration with JPA/Hibernate
- JWT-based authentication system

## Getting Started

### Frontend Setup
```bash
cd Wbill_FT11-main
npm install
npm run dev
```

### Backend Setup
```bash
cd wbillBEv10-main
./mvnw spring-boot:run
```

## Development

This project combines a modern Next.js frontend with a robust Spring Boot backend, specifically designed for Ethiopian billing systems with comprehensive calendar support.

## License

This project is proprietary software developed for billing system management.
