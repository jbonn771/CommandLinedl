import { Request, Response } from 'express';
import axios from 'axios';


export const sendMessageToSlack = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body as { email: string }; // Type the request body

    // Validate the email field in the request body
    if (!email) {
        res.status(400).send('Email is required');
        return;
    }

    try {
        console.log(`Sending email to Slack: ${email}`);
        
        // Send the message to Slack webhook
        await axios.post('https://hooks.slack.com/triggers/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', 
        {
            email
        }, 
        {
            headers: {
                'Content-Type': 'application/json' // Ensure correct headers are sent
            }
        });

        res.status(200).send('Message sent successfully');
    } catch (error) {
        // Handle and log the error with type checking
        if (axios.isAxiosError(error) && error.response) {
            console.error('Error sending message to Slack:', error.response.data);
            res.status(500).send(`Failed to send message to Slack: ${error.response.data}`);
        } else {
            console.error('Error sending message to Slack:', error instanceof Error ? error.message : 'Unknown error');
            res.status(500).send('Failed to send message to Slack');
        }
    }
};