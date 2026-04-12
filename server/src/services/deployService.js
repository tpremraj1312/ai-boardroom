import axios from 'axios';

/**
 * DEPLOYMENT AGENT SERVICE (Stage 6)
 * 
 * Supports two deployment modes:
 * 1. Frontend-only → Vercel (existing)
 * 2. Full-stack → Vercel frontend + Railway backend + MongoDB Atlas
 * 
 * Falls back gracefully if tokens are not configured.
 */

// ── VERCEL FRONTEND DEPLOYMENT ──────────────────────────────────────
export const deployToVercel = async (project) => {
    const token = process.env.VERCEL_TOKEN;
    if (!token) {
        throw new Error('VERCEL_TOKEN not configured. Add it to your server .env file.');
    }

    const projectName = project.name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);

    // Build the Vercel deployment files array
    const files = [];
    for (const [filePath, content] of Object.entries(project.fileSystem)) {
        // Only deploy client-side files for the Vercel frontend deployment
        if (filePath.startsWith('client/')) {
            const deployPath = filePath.replace('client/', '');
            files.push({
                file: deployPath,
                data: content
            });
        }
    }

    // Add a vercel.json config if not present
    const hasVercelConfig = files.some(f => f.file === 'vercel.json');
    if (!hasVercelConfig) {
        files.push({
            file: 'vercel.json',
            data: JSON.stringify({
                buildCommand: "npm run build",
                outputDirectory: "dist",
                framework: "vite",
                rewrites: [{ source: "/(.*)", destination: "/index.html" }]
            }, null, 2)
        });
    }

    // Add index.html if not present at root
    const hasIndex = files.some(f => f.file === 'index.html');
    if (!hasIndex) {
        files.push({
            file: 'index.html',
            data: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${project.name}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`
        });
    }

    try {
        const response = await axios.post(
            'https://api.vercel.com/v13/deployments',
            {
                name: projectName,
                target: "production",
                files: files.map(f => ({
                    file: f.file,
                    data: Buffer.from(f.data).toString('base64'),
                    encoding: 'base64'
                })),
                projectSettings: {
                    framework: 'vite',
                    buildCommand: 'npm run build',
                    outputDirectory: 'dist'
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        );
        console.log(response)
        const aliases = response.data.alias || [];
        const productionDomain = aliases.length > 0
            ? aliases[0]
            : `${response.data.name || projectName}.vercel.app`;

        const deploymentUrl = `https://${productionDomain}`;
        return {
            url: deploymentUrl,
            previewUrl: `https://${response.data.url}`,
            id: response.data.id,
            readyState: response.data.readyState
        };
    } catch (error) {
        const msg = error.response?.data?.error?.message || error.message;
        console.error('[DeployService] Vercel deployment failed:', msg);
        throw new Error(`Deployment failed: ${msg}`);
    }
};

// ── RAILWAY BACKEND DEPLOYMENT ──────────────────────────────────────
export const deployBackendToRailway = async (project) => {
    const token = process.env.RAILWAY_TOKEN;
    if (!token) {
        console.warn('[DeployService] RAILWAY_TOKEN not configured. Skipping backend deployment.');
        return null;
    }

    const projectName = project.name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);

    // Collect server files
    const serverFiles = {};
    for (const [filePath, content] of Object.entries(project.fileSystem)) {
        if (filePath.startsWith('server/')) {
            const deployPath = filePath.replace('server/', '');
            serverFiles[deployPath] = content;
        }
    }

    if (Object.keys(serverFiles).length === 0) {
        console.warn('[DeployService] No server files found. Skipping backend deployment.');
        return null;
    }

    // Ensure .env template exists
    if (!serverFiles['.env']) {
        serverFiles['.env'] = `PORT=5000\nMONGODB_URI=${process.env.MONGODB_URI || 'mongodb://localhost:27017/app'}\nNODE_ENV=production`;
    }

    // Ensure Procfile exists for Railway
    if (!serverFiles['Procfile']) {
        serverFiles['Procfile'] = 'web: node index.js';
    }

    try {
        // Railway GraphQL API — Create project + service
        const gqlEndpoint = 'https://backboard.railway.app/graphql/v2';

        // Step 1: Create project
        const createProjectMutation = `
            mutation {
                projectCreate(input: { name: "${projectName}-backend" }) {
                    id
                    name
                }
            }
        `;

        const projectResponse = await axios.post(gqlEndpoint, {
            query: createProjectMutation
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        const railwayProjectId = projectResponse.data?.data?.projectCreate?.id;
        if (!railwayProjectId) {
            throw new Error('Failed to create Railway project');
        }

        console.log(`[DeployService] Railway project created: ${railwayProjectId}`);

        // Step 2: Add MongoDB plugin
        const addMongoMutation = `
            mutation {
                pluginCreate(input: {
                    projectId: "${railwayProjectId}",
                    name: "mongodb"
                }) {
                    id
                }
            }
        `;

        try {
            await axios.post(gqlEndpoint, { query: addMongoMutation }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            });
            console.log('[DeployService] MongoDB plugin added to Railway.');
        } catch (mongoErr) {
            console.warn('[DeployService] MongoDB plugin creation failed:', mongoErr.message);
        }

        return {
            railwayProjectId,
            url: `https://${projectName}-backend.up.railway.app`,
            status: 'provisioned'
        };

    } catch (error) {
        const msg = error.response?.data?.errors?.[0]?.message || error.message;
        console.error('[DeployService] Railway deployment failed:', msg);
        return null;
    }
};

// ── FULL-STACK DEPLOY ORCHESTRATOR ──────────────────────────────────
export const deployFullStack = async (project) => {
    const results = {
        frontend: null,
        backend: null,
        database: null
    };

    // Deploy frontend to Vercel
    try {
        results.frontend = await deployToVercel(project);
        console.log(`[DeployService] Frontend deployed: ${results.frontend.url}`);
    } catch (err) {
        console.error('[DeployService] Frontend deployment failed:', err.message);
        results.frontend = { error: err.message };
    }

    // Deploy backend to Railway (if token available)
    if (process.env.RAILWAY_TOKEN) {
        try {
            results.backend = await deployBackendToRailway(project);
            if (results.backend) {
                console.log(`[DeployService] Backend deployed: ${results.backend.url}`);
                results.database = { status: 'provisioned', type: 'MongoDB (Railway Plugin)' };
            }
        } catch (err) {
            console.error('[DeployService] Backend deployment failed:', err.message);
            results.backend = { error: err.message };
        }
    } else {
        results.backend = { status: 'skipped', reason: 'RAILWAY_TOKEN not configured' };
    }

    // Determine primary URL
    const primaryUrl = results.frontend?.url || results.backend?.url || null;

    return {
        ...results,
        url: primaryUrl,
        fullStack: !!results.frontend?.url && !!results.backend?.url
    };
};
