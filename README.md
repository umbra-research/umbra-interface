# Umbra Interface (Frontend)

## Overview

`umbra-interface` is the reference implementation of a web-based client for Umbra. Built with Next.js, it provides a user-friendly way to send and claim privacy-preserving transfers on Solana.

## Features

-   **Wallet Connection**: Integration with Solana Wallet Adapter (Phantom, Solflare, etc.).
-   **Stealth Transfer**: Simple UI to send SOL to a recipient without revealing their address on-chain.
-   **Inbox**: Real-time view of incoming claimable funds.
-   **Claims**: One-click claim functionality (delegated to backend).

## Tech Stack

-   **Framework**: Next.js 14+ (App Router).
-   **Styling**: Custom CSS-in-JS (Vanilla-extract style themes).
-   **State**: React Hooks + Context API.
-   **Integration**: Fetches data from `umbra-system` API.

## Setup

1.  **Install Dependencies**:
    ```bash
    yarn install
    # or
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Configuration**:
    The app expects `umbra-system` to be running at `http://localhost:8080`. This can be configured in `src/lib/api.ts`.
