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