'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { Instagram, Linkedin, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const platforms: Platform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: <Instagram className="h-5 w-5" />,
    color: '#E1306C',
    description: 'Connect your Instagram account to manage comments and messages',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: <Linkedin className="h-5 w-5" />,
    color: '#0077B5',
    description: 'Connect your LinkedIn account to manage professional communications',
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: <Twitter className="h-5 w-5" />,
    color: '#1DA1F2',
    description: 'Connect your Twitter account to manage tweets and direct messages',
  },
];

interface PlatformConnectionProps {
  onConnect: (platformId: string) => Promise<void>;
  connectedPlatforms: string[];
}

export function PlatformConnection({ onConnect, connectedPlatforms }: PlatformConnectionProps) {
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (platformId: string) => {
    try {
      setConnecting(platformId);
      await onConnect(platformId);
    } catch (error) {
      console.error(`Failed to connect ${platformId}:`, error);
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="grid gap-4">
      {platforms.map(platform => {
        const isConnected = connectedPlatforms.includes(platform.id);
        const isLoading = connecting === platform.id;

        return (
          <TooltipProvider key={platform.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    className={cn(
                      'p-4 cursor-pointer transition-all',
                      isConnected ? 'border-accent bg-accent/5' : 'hover:border-primary/50'
                    )}
                    onClick={() => !isConnected && handleConnect(platform.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className="p-2 rounded-full"
                          style={{ backgroundColor: `${platform.color}20` }}
                        >
                          {platform.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{platform.name}</h3>
                          <p className="text-sm text-muted-foreground">{platform.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isConnected ? (
                          <div className="flex items-center space-x-1 text-accent">
                            <div className="h-2 w-2 rounded-full bg-accent" />
                            <span className="text-sm">Connected</span>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" disabled={isLoading}>
                            {isLoading ? 'Connecting...' : 'Connect'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{platform.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}
