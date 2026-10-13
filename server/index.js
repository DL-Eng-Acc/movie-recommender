import {fileURLToPath} from "node:url";
import path from "node:path"
import dotenv from "dotenv";
import { startServer } from "./startServer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({path: __dirname + "/../.env"});

try {
	startServer().catch((error) => {
	console.error("Server startup failed:", error);
	process.exitCode = 1;
});
} catch (error) {
	console.error("Error occurred while initializing the server:", error);
}

