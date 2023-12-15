import os from 'os';
import express from "express";
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from "cors";

import {router as webpages} from './components/webpages.js';
import { router as firestore } from "./components/firestore.js";


//Initialize Application
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({ origin: "*" }));  // Set allowed URLs || "*" for no CORS restrictions
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Define application port and ip address (this must also be set manually in /public/index.js as "url")
const PORT = process.env.PORT || 3000;
const IP = process.env.IP || '0.0.0.0';


// Webpage routes
app.use(webpages);

// Firestore routes
app.use(firestore)


// Start server
const server = createServer(app);
server.listen(PORT, IP, () => {
    displayNetworkInterfaces();
});

// Helper function for displaying applications network interfaces
function displayNetworkInterfaces() {
    console.log("Server accessible at:")
    if(process.env.IP == "127.0.0.1") {
        console.log(`http://127.0.0.1:${PORT}`);
    } else {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                continue;
            }
            console.log(`http://${iface.address}:${PORT}`);
        }
    }
    console.log(`http://127.0.0.1:${PORT}`);
    }
}
