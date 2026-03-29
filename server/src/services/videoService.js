import dotenv from 'dotenv';
dotenv.config();

/**
 * Orchestrates text-to-video generations mapping perfectly to Pika or Runway Gen-3 structure.
 */
export const generateAdVideo = async (prompt, template, style) => {
    // ── MOCK ENGINE FALLBACK ──
    // Because Video API generation takes ~60-120 seconds and costs credits, 
    // developers can seamlessly verify frontend integrations instantly via dummy clips.
    if (!process.env.RUNWAY_API_KEY) {
        console.warn('[AI AD STUDIO] ⚠️ RUNWAY_API_KEY missing. Simulating Video compilation delay.');
        // Simulate a 8-15 second rendering delay for videos
        await new Promise(resolve => setTimeout(resolve, 8000));

        let mockVideo = 'https://videos.pexels.com/video-files/3163534/3163534-uhd_2560_1440_30fps.mp4'; // Abstract fluid tech loop
        if (style === 'Cyberpunk' || style === 'Dark Neon') {
            mockVideo = 'https://videos.pexels.com/video-files/5849826/5849826-uhd_2560_1440_30fps.mp4'; // Cyberglow lines
        } else if (style === 'Corporate') {
            mockVideo = 'https://videos.pexels.com/video-files/3252077/3252077-uhd_2560_1440_25fps.mp4'; // Desk/Typing
        }

        return mockVideo;
    }

    // ── LIVE ENGINE (Runway ML v1) ──
    try {
            // Step 1: Push Prompt to RunwayML Queue
            const initResponse = await fetch('https://api.runwayml.com/v1/image_to_video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`
                },
                body: JSON.stringify({
                    text_prompt: prompt,
                    duration: 5, // 5 seconds is optimal for ad B-roll
                    resolution: template === 'Instagram Story' ? "1080p_vertical" : "1080p"
                })
            });

            if (!initResponse.ok) throw new Error(`Runway API Initialization Failed: ${initResponse.statusText}`);

            const initData = await initResponse.json();
            const taskId = initData.id || initData.task_id || initData.task?.id;

            if (!taskId) throw new Error('Video generation failed to return a valid deployment Task ID.');

            console.log(`[AI AD STUDIO] Video Generation Queued. Task ID: ${taskId}. Initiating Polling Engine...`);

            // Step 2: Poll RunwayML / Task Queue for completion
            let attempts = 0;
            const maxAttempts = 18; // 18 attempts * 8 seconds = 144 seconds
            
            while (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 8000));
                attempts++;

                try {
                    const pollResponse = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}` }
                    });

                    if (!pollResponse.ok) continue;

                    const pollData = await pollResponse.json();
                    const status = (pollData.status || pollData.state || '').toUpperCase();

                    console.log(`[AI AD STUDIO] RunwayML Polling Status (Task ${taskId}) [Attempt ${attempts}/${maxAttempts}]: ${status}`);

                    // Analyze Output
                    if (status === 'SUCCEEDED' || status === 'COMPLETED') {
                        const finalVideoUrl = pollData.task?.url || pollData.video_url || pollData.output?.[0];
                        if (finalVideoUrl) {
                            console.log(`[AI AD STUDIO] RunwayML Compilation Finished!`);
                            return finalVideoUrl;
                        }
                    } else if (status === 'FAILED' || status === 'CANCELED') {
                        throw new Error(`Runway explicitly rejected or failed the generation. Reason: ${pollData.failure || 'Unknown'}`);
                    }
                    
                    // IF 'PENDING' or 'PROCESSING', loops naturally.
                } catch (pollErr) {
                    console.warn(`[AI AD STUDIO] Video polling cycle interrupted tick: ${pollErr.message}`);
                }
            }

            throw new Error(`Video generation task [${taskId}] timed out. Exceeded 2.5 minutes compilation constraint.`);

    } catch (err) {
        console.error('[AI AD STUDIO] Video Generation Failed:', err.message);
        throw new Error('Failed to render video ad.');
    }
};
