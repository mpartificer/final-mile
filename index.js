import express from 'express';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Twilio webhook handler
app.post('/webhook/twilio', async (req, res) => {
    console.log('Received Twilio webhook request');
    console.log('Request method:', req.method);
    console.log('Request body:', req.body);

    // Verify the request method is POST
    if (req.method !== 'POST') {
        console.warn('Received non-POST request');
        return res.status(405).send('Method Not Allowed');
    }

    try {
            const mediaUrl = req.body.MediaUrl0;
            if (!mediaUrl) {
                console.warn('No media URL found in request');
                return res.status(400).send('No media found');
            }
        // Download the image
        const imageResponse = await axios({
            method: 'get',
            url: mediaUrl,
            responseType: 'arraybuffer'
        });

        // Generate unique filename
        const filename = `manifest_${Date.now()}.jpg`;

        // Upload to Supabase
        const supabase = createClient(
            process.env.SUPABASE_URL, 
            process.env.SUPABASE_KEY
        );

        const { data, error } = await supabase.storage
            .from('Manifests')
            .upload(filename, imageResponse.data, {
                contentType: 'image/jpeg'
            });

        if (error) throw error;

        res.status(200).send('Image uploaded successfully');
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).send('Webhook processing failed');
    }
});

// Twilio request validator middleware
const twilioWebhook = twilio.webhook(process.env.TWILIO_AUTH_TOKEN, {
    validate: true
});

// Apply Twilio webhook validation to the route
app.post('/webhook/twilio', twilioWebhook, async (req, res) => {
    // Existing webhook logic remains the same
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;