# Word Counter

This application is a word counter that interacts with the Cartesi rollup server. It processes two types of requests (`advance_state` and `inspect_state`) and manages state data such as user information and word counts.

## Prerequisites
- Node.js
- Cartesi CLI
- Docker Desktop
- WSL2 and Ubuntu 24.04 LTS (for Windows users only).

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/Oyinlolatechie/Cartesi.git
    cd wordCounter
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start application using:
```bash
Cartesi build
