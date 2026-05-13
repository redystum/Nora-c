
# Nora-C

**Nora-C** is a high-performance, C-based UI testing platform featuring a Preact-driven Web UI and a robust JSON/WebSocket backend. Designed for project and file management, it integrates a custom WebDriver implementation for automated workflows and real-time system interaction.

## 🏗 Architecture

The project is split into three core components designed to work in tandem:

* **Core Backend (C):** Powered by the **Mongoose** networking library, handling high-concurrency HTTP endpoints and stateful WebSocket connections (`/ws`).
* **Web UI (Preact + Vite):** A modern, reactive frontend compiled into static assets and served directly by the C server.
* **WebDriver:** A dedicated, standalone library for browser automation and UI testing, located in `webDriver/`.

---

## 🛠 Prerequisites

Ensure your system has the following dependencies installed:

* **Compiler:** `gcc` and `make`
* **Tools:** `gengetopt`, `node.js` (v16+), and `npm`
* **System Libraries:**
* `libcurl` (Networking)
* `cjson` (JSON parsing)
* `pthread` (Threading)
* `dl`, `m` (Dynamic loading/Math)



---

## 🚀 Quick Start

### 1. Build the Project

The top-level `Makefile` is configured to handle the entire lifecycle, including compiling the C source and building the frontend assets if they are missing.

```bash
git clone https://github.com/your-repo/nora-c.git
cd nora-c
make
```

### 2. Launch

Run the application using the default configuration:

```bash
make run
```

*The application will automatically attempt to open the Web UI in your default browser.*

---

## ⚙️ Configuration (CLI)

You can customize the network binding and behavior via command-line arguments:

| Option | Shorthand | Description | Default |
| --- | --- | --- | --- |
| `--fhost` | `-h` | Frontend Host | `localhost` |
| `--fport` | `-p` | Frontend Port | `3333` |
| `--bhost` | `-H` | Backend Host | `localhost` |
| `--bport` | `-P` | Backend Port | `8888` |
| `--sport` | `-s` | WebSocket Port | `8880` |
| `--open` | `-o` | Auto-open browser (0/1) | `1` |

---

## 🧪 Development Workflow

### UI Development

For rapid frontend iteration with Hot Module Replacement (HMR), run the Vite development server independently:

```bash
cd frontend/web
npm install
npm run dev

```

### Backend Logic

The backend is located in the root directory and is written in pure C. It utilizes a dynamic configuration injection system where the frontend server writes connection metadata to `backend.txt` upon startup to ensure the UI remains synced with the current backend ports.

---

## 📝 Technical Notes

* **WebDriver Integration:** The bundled WebDriver includes its own build system and documentation within the `webDriver/` directory for isolated testing.
* **AI:** Also, the frontend and readme are mostly AI-generated, but the backend is 100% handwritten by me (except for the libraries, of course).

---