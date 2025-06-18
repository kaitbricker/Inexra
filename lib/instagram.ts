// Instagram OAuth Configuration
export const INSTAGRAM_CONFIG = {
  clientId: process.env.INSTAGRAM_CLIENT_ID,
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`,
  scope: 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement',
  apiVersion: 'v18.0',
  graphApiBase: 'https://graph.facebook.com',
  instagramApiBase: 'https://graph.instagram.com',
};

// Instagram API endpoints
export const INSTAGRAM_ENDPOINTS = {
  authorize: `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_CONFIG.clientId}&redirect_uri=${INSTAGRAM_CONFIG.redirectUri}&scope=${INSTAGRAM_CONFIG.scope}&response_type=code`,
  accessToken: 'https://api.instagram.com/oauth/access_token',
  graphApi: `${INSTAGRAM_CONFIG.graphApiBase}/${INSTAGRAM_CONFIG.apiVersion}`,
  instagramApi: `${INSTAGRAM_CONFIG.instagramApiBase}/${INSTAGRAM_CONFIG.apiVersion}`,
};

// Instagram message types
export const INSTAGRAM_MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  FILE: 'file',
  LOCATION: 'location',
  CONTACT: 'contact',
};

// Types for Instagram messages
export interface InstagramMessage {
  id: string;
  sender: {
    id: string;
    username: string;
    profile_pic_url: string;
  };
  text: string;
  timestamp: number;
  is_from_me: boolean;
  media?: {
    type: string;
    url: string;
  }[];
}

export class InstagramService {
  private accessToken: string;
  private baseUrl = 'https://graph.instagram.com/me';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getMessages(limit: number = 50): Promise<InstagramMessage[]> {
    try {
      // Get the user's conversations
      const response = await fetch(
        `${INSTAGRAM_ENDPOINTS.graphApi}/me/conversations?fields=messages{message,from,created_time}&limit=${limit}&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform the messages to our format
      return data.data.map((conversation: any) => {
        const message = conversation.messages.data[0]; // Get the latest message
        return {
          id: message.id,
          sender: {
            id: message.from.id,
            username: message.from.name,
            profile_pic_url: '', // Instagram API doesn't provide profile pics in messages
          },
          text: message.message,
          timestamp: new Date(message.created_time).getTime() / 1000,
          is_from_me: message.from.id === 'me',
          media: [], // Instagram messages don't include media in the basic API
        };
      });
    } catch (error) {
      console.error('Error fetching Instagram messages:', error);
      throw error;
    }
  }

  // Convert Instagram message format to our app's message format
  static async convertToAppFormat(message: InstagramMessage) {
    return {
      id: message.id,
      sender: message.sender.username,
      tag: message.is_from_me ? 'Outbound' : 'Inbound',
      tagColor: message.is_from_me 
        ? 'bg-blue-100 text-blue-700' 
        : 'bg-purple-100 text-purple-700',
      preview: message.text,
      time: new Date(message.timestamp * 1000).toISOString(),
      media: message.media,
      profilePic: message.sender.profile_pic_url,
      content: message.text, // Full message text
      aiContext: 'This message was analyzed by InexraAI.', // Placeholder
      aiConfidence: 90, // Placeholder
      aiSuggestions: [
        'Thank you for your message! We will get back to you soon.',
        'Can you provide more details?',
        'We appreciate your feedback!'
      ],
    };
  }
}

// Helper function to get Instagram user info
export async function getInstagramUserInfo(accessToken: string) {
  try {
    const response = await fetch(`${INSTAGRAM_ENDPOINTS.instagramApi}/me?fields=id,username,account_type&access_token=${accessToken}`);
    if (!response.ok) throw new Error('Failed to fetch Instagram user info');
    return await response.json();
  } catch (error) {
    console.error('Error fetching Instagram user info:', error);
    throw error;
  }
}

// Helper function to get Instagram messages
export async function getInstagramMessages(accessToken: string, userId: string) {
  try {
    const response = await fetch(
      `${INSTAGRAM_ENDPOINTS.graphApi}/${userId}/conversations?fields=messages{message,from,created_time}&access_token=${accessToken}`
    );
    if (!response.ok) throw new Error('Failed to fetch Instagram messages');
    return await response.json();
  } catch (error) {
    console.error('Error fetching Instagram messages:', error);
    throw error;
  }
}

// Helper function to transform Instagram messages to our format
export function transformInstagramMessages(messages: any[], platform: string = 'Instagram') {
  return messages.map(msg => ({
    content: msg.message,
    sender: msg.from?.name || 'Unknown',
    timestamp: new Date(msg.created_time),
    platform,
    sentiment: 'Neutral', // Default sentiment
    status: 'New',
    tags: [],
    hasInsight: false
  }));
} 