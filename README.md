# Dynamics NAV BFF Application

This project is a full-stack application designed to act as a Backend-for-Frontend (BFF) proxy for Microsoft Dynamics NAV SOAP services.

## Architecture

- **Recommended Environment**: Node.js **^22.0.0**
- **Backend**: NestJS application that handles SOAP/XML mapping and NTLM authentication.
- **Frontend**: Angular application using Standalone Components, Signals, and Tailwind CSS.

## Authentication Logic

The application supports two levels of authentication:

1.  **Default Credentials**: Defined in the backend `.env` file (`NAV_USER`, `NAV_PASS`). These are typically "Service Admin" or high-privileged credentials used for master data fetching (Item Categories, etc.) and as a fallback.
2.  **User Override**: The frontend includes a header bar where users can enter their own Dynamics NAV credentials.
    - If provided, these credentials are sent via custom HTTP headers (`x-nav-user`, `x-nav-pass`) to the BFF.
    - The BFF prioritizes these headers for the specific request, allowing normal users to perform actions (like viewing POs) with their own permissions.
    - When user overrides are used, server-side caching is bypassed to ensure data accuracy and security for that specific user.

## Getting Started

### Backend

1.  Navigate to `/backend`.
2.  Copy `.env.example` to `.env` and fill in your NAV details.
3.  `npm install`
4.  `npm run start`

### Frontend

1.  Navigate to `/frontend`.
2.  `npm install`
3.  `npm run start` (App will be available at `http://localhost:4200`)

## Troubleshooting & Debugging

### Addressing 401 Unauthorized
If you encounter a `401 Unauthorized` error while the credentials appear correct:
1.  **Domain Format**: Ensure the username is provided in the `DOMAIN\User` format. The BFF logic automatically splits this for the NTLM handshake.
2.  **Special Characters**: If your password contains special characters, ensure they are correctly handled in the `.env` file (wrapped in quotes) or the frontend input.
3.  **Workstation**: Some NAV configurations require a specific workstation name. Currently, this is set to empty in `NavHttpClientService`.

### Enabling Debug Mode
To see the full SOAP request and response cycle:
- **Backend Logging**: Configured in `backend/src/main.ts`. You can control visibility by setting `LOG_LEVEL` in `.env` (e.g., `LOG_LEVEL="log,error,warn,debug"`).
- **Payload Inspection**: Set `DEBUG=true` in `.env` to trigger `NavHttpClientService` to log the raw XML payloads being sent to Dynamics NAV.

## Features

- **Items**: Create and Update item records.
- **Purchase Orders**: Master-Detail view showing PO Headers and their corresponding Lines.
- **Customers & Categories**: Data tables with server-side caching enabled for high performance.
- **NTLM Auth**: Seamless proxying of NTLM/Negotiate authentication to NAV.
