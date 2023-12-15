import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

router.get('/overview', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/overview.html'));
});

router.get('/quickstart', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/quickstart.html'));
});

router.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/privacy.html'));
});

export { router };
