import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/sessions.js';
import boardroomRoutes from './routes/boardroom.js';
import dashboardRoutes from './routes/dashboard.js';
import cofounderRoutes from './routes/cofounder.js';
import teamRoutes from './routes/teams.js';
import documentRoutes from './routes/documents.js';
import websiteRoutes from './routes/websites.js';
import projectRoutes from './routes/projects.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// ---- CORS FIRST ----
const allowedOrigins = [
    'http://localhost:5173',
    'https://ai-boardroom-fawn.vercel.app',
    process.env.CORS_ORIGIN,
].filter(Boolean);

const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-CSRF-Token', 'X-Requested-With', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Date', 'X-Api-Version'],
};

app.use(cors(corsOptions));

// Preflight handling globally — uses SAME config
app.options('*', cors(corsOptions));

// ---- Helmet (CSP disabled to avoid blocking preflight) ----
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    })
);

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Security middleware
app.use(compression());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/boardroom', boardroomRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/co-founder', cofounderRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/projects', projectRoutes);

// Health check
app.get('/api/health', (req, res) =>
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;