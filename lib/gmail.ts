// Gmail API Service
// Handles Gmail OAuth and email operations

import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

// Set refresh token if available
if (process.env.GMAIL_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });
}

export const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// Generate OAuth URL for authorization
export function getAuthUrl() {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force to get refresh token
  });
}

// Exchange authorization code for tokens
export async function getTokensFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}

// Get unread emails from inbox
export async function getUnreadEmails(maxResults: number = 10) {
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread in:inbox',
      maxResults,
    });

    return response.data.messages || [];
  } catch (error) {
    console.error('Error fetching unread emails:', error);
    throw error;
  }
}

// Get email details by ID
export async function getEmailById(messageId: string) {
  try {
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching email:', error);
    throw error;
  }
}

// Mark email as read
export async function markEmailAsRead(messageId: string) {
  try {
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });
  } catch (error) {
    console.error('Error marking email as read:', error);
    throw error;
  }
}

// Add label to email
export async function addLabelToEmail(messageId: string, labelName: string) {
  try {
    // First, get or create the label
    const labelsResponse = await gmail.users.labels.list({ userId: 'me' });
    let label = labelsResponse.data.labels?.find(l => l.name === labelName);

    if (!label) {
      // Create label if it doesn't exist
      const createResponse = await gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name: labelName,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show',
        },
      });
      label = createResponse.data;
    }

    if (label?.id) {
      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: [label.id],
        },
      });
    }
  } catch (error) {
    console.error('Error adding label to email:', error);
    throw error;
  }
}

// Parse email headers
export function parseEmailHeaders(headers: any[]) {
  const headerMap: Record<string, string> = {};
  
  headers.forEach((header: any) => {
    headerMap[header.name.toLowerCase()] = header.value;
  });

  return {
    from: headerMap['from'] || '',
    to: headerMap['to'] || '',
    subject: headerMap['subject'] || '',
    date: headerMap['date'] || '',
    messageId: headerMap['message-id'] || '',
    inReplyTo: headerMap['in-reply-to'] || '',
    references: headerMap['references'] || '',
  };
}

// Decode email body
export function decodeEmailBody(payload: any): string {
  let body = '';

  if (payload.body?.data) {
    body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
  } else if (payload.parts) {
    // Multi-part email
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
        if (part.body?.data) {
          body += Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      } else if (part.parts) {
        // Nested parts
        body += decodeEmailBody(part);
      }
    }
  }

  return body;
}

// Extract email address from "Name <email@domain.com>" format
export function extractEmailAddress(emailString: string): string {
  const match = emailString.match(/<(.+?)>/);
  return match ? match[1] : emailString.trim();
}

// Check if email is a reply to our outreach
export function isReplyToOutreach(headers: any): boolean {
  const { inReplyTo, references, subject } = parseEmailHeaders(headers);
  
  // Check if it's a reply (has In-Reply-To or References header)
  if (inReplyTo || references) {
    return true;
  }
  
  // Check if subject starts with Re: or Fwd:
  if (subject.toLowerCase().startsWith('re:') || subject.toLowerCase().startsWith('fwd:')) {
    return true;
  }
  
  return false;
}
