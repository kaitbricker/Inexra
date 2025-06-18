import { TAGS } from '../tagConfig';

export function getVisibleTags(userTagStack: string | null | undefined) {
  return TAGS.filter(tag => 
    // Always show tags marked as alwaysOn
    tag.alwaysOn || 
    // Show tags that match the user's preferred stack
    (userTagStack && tag.stack === userTagStack)
  );
} 