import twilio from 'twilio';

class TwilioClient {
    constructor() {
        // Validate environment variables
        if (!process.env.TWILIO_ACCOUNT_SID || 
            !process.env.TWILIO_AUTH_TOKEN || 
            !process.env.TWILIO_PHONE_NUMBER) {
            throw new Error('Missing Twilio credentials');
        }

        // Initialize Twilio client
        this.client = twilio(
            process.env.TWILIO_ACCOUNT_SID, 
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    async sendSMS(toNumber, messageBody) {
        try {
            const message = await this.client.messages.create({
                from: process.env.TWILIO_PHONE_NUMBER,
                to: toNumber,
                body: messageBody
            });
            return message;
        } catch (error) {
            console.error('Error sending SMS:', error);
            throw error;
        }
    }
}

export default TwilioClient;