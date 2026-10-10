import {fileURLToPath} from "node:url";
import path from "node:path"
import dotenv from "dotenv";
import { createApp } from "./app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({path: __dirname + "/../.env"});

const PORT = process.env.BACKEND_PORT || 5000;
const frontendOrigin = `http://localhost:${process.env.VITE_FRONTEND_PORT || 5173}`;
const app = createApp(frontendOrigin);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
