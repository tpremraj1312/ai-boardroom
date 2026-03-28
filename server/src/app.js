import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/sessions.js';
import boardroomRoutes from './routes/boardroom.js';
import dashboardRoutes from './routes/dashboard.js';
import cofounderRoutes from './routes/cofounder.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ── SECURITY MIDDLEWARE (ORDER MATTERS) ──────────────────────────
// 1. Helmet: sets secure HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        }
    },
    crossOriginEmbedderPolicy: false
}));

// 2. CORS — only allow defined origin
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// 3. Body parsers with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Compression
app.use(compression());

// 5. NoSQL injection sanitization (removes $ and . from req.body, query, params)
app.use(mongoSanitize());

// 6. XSS protection (sanitizes user input HTML)
app.use(xss());

// 7. HTTP Parameter Pollution prevention
app.use(hpp());

// 8. Request logging (development only)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ── ROUTES ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/teams', (await import('./routes/teams.js')).default);
app.use('/api/documents', (await import('./routes/documents.js')).default);
app.use('/api/sessions', sessionRoutes);
app.use('/api/boardroom', boardroomRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/co-founder', cofounderRoutes);

// ── HEALTH CHECK ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ── ERROR HANDLING ────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
