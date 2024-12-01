import express from 'express';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Twilio webhook handler
app.post('/webhook/twilio', async (req, res) => {
    // Extract media URL from Twilio request
    const mediaUrl = req.body.MediaUrl0;

    if (!mediaUrl) {
        return res.status(400).send('No media found');
    }

    try {
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
        console.error('Error processing image:', error);
        res.status(500).send('Error processing image');
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