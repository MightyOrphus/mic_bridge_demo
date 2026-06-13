# Dynamics NAV BFF Application

This project is a full-stack application designed to act as a Backend-for-Frontend (BFF) proxy for Microsoft Dynamics NAV SOAP services.

## Architecture

- **Recommended Environment**: Node.js **^22.0.0**
- **Backend**: NestJS application that handles SOAP/XML mapping and robust NTLM/Negotiate authentication.
- **Frontend**: Angular application using Standalone Components, Signals, and Tailwind CSS.

## Authentication Logic

The application relies entirely on user-provided credentials from the frontend:

1.  **User Login**: The frontend includes a header bar where users **must** enter their Dynamics NAV credentials (`DOMAIN\User` and `Password`).
2.  **Credential Proxying**: These credentials are sent via custom HTTP headers (`x-nav-user`, `x-nav-pass`) to the BFF for every request.
3.  **Robust NTLM/Negotiate Handshake**: The BFF performs a multi-step authentication handshake (GET -> Challenge -> POST) with the Dynamics NAV server to support both NTLM and Negotiate (SPNEGO) protocols. Connection persistence is maintained via a shared HTTP agent.
4.  **Security**: No default credentials are stored in the backend, ensuring access control is managed by the Dynamics NAV server.
5.  **Caching**: Server-side caching is implemented using `@nestjs/cache-manager` for master data (Customers, Categories). Caching is automatically bypassed when user-specific credentials are used to ensure data privacy.

## Getting Started

### Backend Configuration (.env)

1.  Navigate to `/backend`.
2.  Create a `.env` file based on `.env.example`:
    ```env
    NAV_BASE_URL="http://your-nav-server:7047/DynamicsNAV/WS/YourCompany"
    PORT=3000
    LOG_LEVEL="log,error,warn,debug"
    DEBUG=true
    ```
3.  `npm install`
4.  `npm run start`

### Frontend Configuration

1.  Navigate to `/frontend`.
2.  `npm install`
3.  `npm run start` (App available at `http://localhost:4200`).

## Troubleshooting & Debugging

### Addressing 401/400 Errors (Authentication)
If you encounter authentication errors:
1.  **Domain Format**: Ensure the username is `DOMAIN\User`.
2.  **IIS/NAV Settings**: Ensure **NTLM** is enabled as a provider under the Windows Authentication settings in IIS and the Dynamics NAV Tier if Kerberos (Negotiate) is not properly configured for your network.
3.  **SOAPAction**: The BFF uses the raw `SOAPAction` string (e.g., `urn:microsoft-dynamics-schemas/page/item:ReadMultiple`).

### Enabling Debug Mode
- **Backend Logging**: Set `LOG_LEVEL="log,error,warn,debug"` in `.env`.
- **Payload Inspection**: Set `DEBUG=true` in `.env` to log raw outgoing XML payloads and authentication steps.

## Features

- **Items**: Create, Update, and View Item records.
- **Purchase Orders**: Specialized dual-table view showing PO Headers (Master) and PO Lines (Detail) with Signal-based selection. Supports creating new PO headers.
- **Master Data**: Responsive tables for Customers and Item Categories with caching.
- **Modern UI**: Clean, responsive layout built with Tailwind CSS and Angular Signals.
