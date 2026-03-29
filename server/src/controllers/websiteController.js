import Website from '../models/Website.js';
import { generateAgentResponse } from '../services/aiService.js';
import axios from 'axios';

// Get all websites for user
export const getWebsites = async (req, res, next) => {
    try {
        const websites = await Website.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(websites);
    } catch (error) {
        next(error);
    }
};

// Get single website
export const getWebsiteById = async (req, res, next) => {
    try {
        const website = await Website.findOne({ _id: req.params.id, user: req.user._id });
        if (!website) return res.status(404).json({ message: 'Website not found' });
        res.status(200).json(website);
    } catch (error) {
        next(error);
    }
};

// Generate a website using AI
export const generateWebsite = async (req, res, next) => {
    try {
        const { prompt, name, brandKit } = req.body;

        if (!prompt || !name) {
            return res.status(400).json({ message: 'Prompt and Name are required' });
        }

        const systemPrompt = `You are an elite Silicon Valley web designer and copywriter. 
Your goal is to generate high-converting landing page copy and structure based on a startup idea.
You MUST reply with ONLY a strictly formatted JSON object.
Use the following exact schema:
{
  "hero": {
    "title": "A captivating, high-impact headline",
    "subtitle": "A persuasive subheadline explaining the value proposition clearly",
    "ctaText": "Action-oriented button text",
    "imageUrl": "Generate a descriptive Unsplash image query (e.g., 'startup technology team', 'abstract dark computing')"
  },
  "features": [
    {
      "title": "Feature 1",
      "description": "Benefit-driven description",
      "icon": "Zap" // Use a lucide-react icon name like Zap, Shield, Sparkles, TrendingUp, Globe, Box, Layers
    },
    // must provide exactly 3 features
  ],
  "testimonials": [
    // Provide 2 realistic, professional testimonials
    { "quote": "Amazing product!", "author": "John Doe", "role": "CEO at TechCorp" }
  ],
  "ctaSection": {
    "title": "Ready to get started?",
    "subtitle": "Join thousands of others today.",
    "buttonText": "Start Free Trial"
  },
  "footer": {
    "text": "© 2026 Company Name",
    "links": ["Privacy Policy", "Terms of Service", "Contact Us"]
  }
}
Do not include any text, markdown formatting, or explanations outside the JSON object.`;

        let contentJson = null;

        try {
            const rawResponse = await generateAgentResponse({
                systemPrompt,
                messages: [{ role: 'user', content: `Startup Idea: ${prompt}` }],
                requireJson: true
            });

            // Clean up potentially wrapped markdown
            const cleanedResponse = rawResponse.trim().replace(/^```json/, '').replace(/```$/, '');
            contentJson = JSON.parse(cleanedResponse);
        } catch (genError) {
            console.error("Agent parsing error:", genError);
            return res.status(500).json({ message: 'AI failed to generate a valid website structure. Please try again.' });
        }

        // Translate the image URL hint into a real Unsplash source link
        const unsplashQuery = encodeURIComponent(contentJson.hero.imageUrl || 'technology');
        contentJson.hero.imageUrl = `https://source.unsplash.com/1200x800/?${unsplashQuery}`;

        const newWebsite = await Website.create({
            user: req.user._id,
            name,
            prompt,
            brandKit: brandKit || {},
            content: contentJson,
        });

        res.status(201).json(newWebsite);
    } catch (error) {
        next(error);
    }
};

// Update brand details or content
export const updateWebsite = async (req, res, next) => {
    try {
        const { brandKit, content } = req.body;
        
        const website = await Website.findOne({ _id: req.params.id, user: req.user._id });
        if (!website) return res.status(404).json({ message: 'Website not found' });

        if (brandKit) website.brandKit = brandKit;
        if (content) website.content = content;

        await website.save();

        res.status(200).json(website);
    } catch (error) {
        next(error);
    }
};

// One-Click Deploy (Vercel API)
export const deployWebsite = async (req, res, next) => {
    try {
        const websiteId = req.params.id;
        const website = await Website.findOne({ _id: websiteId, user: req.user._id });

        if (!website) return res.status(404).json({ message: 'Website not found' });

        const vercelToken = process.env.VERCEL_API_TOKEN;
        
        // Mock response if token is not available
        if (!vercelToken) {
            console.log("No VERCEL_API_TOKEN found. Simulating deployment.");
            // Simulate 2s deployment wait
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            website.deployedUrl = `https://${website.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-preview.vercel.app`;
            website.vercelDeploymentId = 'mock_deploy_' + Date.now();
            await website.save();

            return res.status(200).json({ 
                message: 'Simulation: Site successfully deployed', 
                url: website.deployedUrl 
            });
        }

        // Actual Vercel API Implementation
        const primaryColor = website.brandKit.primaryColor || '#3b82f6';
        
        // We inject the JSON into a standalone compiled React application payload
        const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${website.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: '${primaryColor}',
          }
        }
      }
    }
  </script>
  <!-- React & ReactDOM -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <!-- Babel -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <!-- Lucide Icons as a quick SVG map for the demo -->
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background-color: #f8fafc; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect } = React;
    const content = ${JSON.stringify(website.content)};
    
    // Minimal Icon Component
    const IconRenderer = ({ name }) => {
        // Fallback generic SVG
        return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>;
    };

    const App = () => {
      return (
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-white border-b py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
            <div className="font-bold text-xl text-gray-900 flex items-center gap-2">
                ${website.brandKit?.logoUrl ? `<img src="${website.brandKit.logoUrl}" class="h-8" alt="Logo"/>` : ''}
                ${website.name}
            </div>
            <button className="bg-brand text-white px-5 py-2 rounded-lg font-medium shadow-sm hover:opacity-90 transition">
                Get Started
            </button>
          </header>

          {/* Hero */}
          <section className="flex-1 max-w-6xl mx-auto px-6 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    {content.hero.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                    {content.hero.subtitle}
                </p>
                <div className="pt-4">
                    <button className="bg-brand text-white px-8 py-3.5 rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full md:w-auto text-lg">
                        {content.hero.ctaText}
                    </button>
                </div>
            </div>
            <div className="relative">
                <div className="absolute inset-0 bg-brand/10 rounded-3xl transform rotate-3 scale-105"></div>
                <img src={content.hero.imageUrl} alt="Hero" className="relative rounded-3xl shadow-2xl object-cover h-[500px] w-full" />
            </div>
          </section>

          {/* Features */}
          <section className="bg-gray-50 py-24">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900">Why choose us?</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {content.features.map((feature, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-6">
                                <IconRenderer name={feature.icon} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-brand py-24 px-6 text-center text-white">
             <h2 className="text-3xl md:text-5xl font-bold mb-6">{content.ctaSection.title}</h2>
             <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto">{content.ctaSection.subtitle}</p>
             <button className="bg-white text-brand px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition-transform">
                {content.ctaSection.buttonText}
             </button>
          </section>

          <footer className="bg-gray-900 text-gray-400 py-12 text-center text-sm">
             <div className="mb-6 flex justify-center gap-6">
                {content.footer.links.map((link, i) => (
                    <a key={i} href="#" className="hover:text-white transition">{link}</a>
                ))}
             </div>
             <p>{content.footer.text}</p>
          </footer>
        </div>
      );
    };

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>`;

        // Create deployment via Vercel REST API
        const payload = {
            name: website.name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase() + "-site",
            files: [
                {
                    file: 'index.html',
                    data: indexHtmlContent // Vercel v13 allows small files 'data' inline
                }
            ],
            projectSettings: {
                framework: null
            }
        };

        const response = await axios.post('https://api.vercel.com/v13/deployments', payload, {
            headers: {
                'Authorization': `Bearer ${vercelToken}`,
                'Content-Type': 'application/json'
            }
        });

        website.deployedUrl = response.data.url ? `https://${response.data.url}` : null;
        website.vercelDeploymentId = response.data.id;
        await website.save();

        res.status(200).json({ 
            message: 'Successfully deployed to Vercel!', 
            url: website.deployedUrl 
        });

    } catch (error) {
        console.error("Vercel Deploy Error:", error.response?.data || error.message);
        // Fallback to error response
        res.status(500).json({ message: 'Deployment failed. ' + (error.response?.data?.error?.message || error.message) });
    }
};
