import axios from 'axios';

/**
 * Deploys a project's file system to Vercel via their REST API.
 * Requires VERCEL_TOKEN in environment variables.
 */
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

        const deploymentUrl = `https://${response.data.url}`;
        return {
            url: deploymentUrl,
            id: response.data.id,
            readyState: response.data.readyState
        };
    } catch (error) {
        const msg = error.response?.data?.error?.message || error.message;
        console.error('[DeployService] Vercel deployment failed:', msg);
        throw new Error(`Deployment failed: ${msg}`);
    }
};
