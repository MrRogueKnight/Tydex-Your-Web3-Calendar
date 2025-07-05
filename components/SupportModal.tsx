'use client';

import { useState } from 'react';
import { Heart, Github, Linkedin, Copy, ExternalLink, X, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps): JSX.Element | null {
  const [copied, setCopied] = useState<boolean>(false);
  const ethAddress = '0x58ad103D0C0E69250CaC89Ddf0BDaD396914C411';

  const handleCopyAddress = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(ethAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/MrRogueKnight',
      icon: Github,
      color: 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105',
      description: 'Follow my code & projects'
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/MrRogueKnight',
      icon: Linkedin,
      color: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105',
      description: 'Professional connections'
    },
    {
      name: 'Farcaster',
      url: 'https://warpcast.com/MrRogueKnight',
      icon: ExternalLink,
      color: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105',
      description: 'Web3 social discussions'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Enhanced Header */}
        <div className="relative p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20">
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <Heart className="h-6 w-6 text-red-500 animate-pulse" />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Support the Creator
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Help make Tydex even better! 🚀
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Enhanced Creator Info */}
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                <span className="text-2xl font-bold text-white">MR</span>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              MrRogueKnight
            </h3>
            <Badge variant="secondary" className="mb-4">
              🏗️ Creator of Tydex Web3 Calendar
            </Badge>
            
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Passionate Web3 developer building innovative decentralized applications that empower users with data sovereignty and cutting-edge technology. 
                  <span className="font-semibold text-blue-600 dark:text-blue-400"> Building the future, one commit at a time! 💻✨</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Social Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-blue-600" />
              Connect & Follow
            </h4>
            <div className="space-y-3">
              {socialLinks.map((link) => (
                <Button
                  key={link.name}
                  variant="outline"
                  size="lg"
                  className={`w-full justify-between ${link.color} border-0 transition-all duration-200`}
                  onClick={() => window.open(link.url, '_blank')}
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">{link.name} - @MrRogueKnight</div>
                      <div className="text-xs opacity-90">{link.description}</div>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Enhanced Funding Options */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <h4 className="text-lg font-bold text-green-900 dark:text-green-100 mb-4 flex items-center gap-2">
              💰 Support with Crypto
              <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                Instant
              </Badge>
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    ETH
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    Base
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    EVM
                  </Badge>
                </div>
                <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                  All chains supported!
                </span>
              </div>
              
              <div className="flex items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-green-200 dark:border-green-700 shadow-sm">
                <code className="text-xs flex-1 break-all text-gray-700 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {ethAddress}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAddress}
                  className={`shrink-0 transition-all duration-200 ${copied ? 'bg-green-100 text-green-700 border-green-300' : 'hover:bg-green-50 hover:border-green-300'}`}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copied ? 'Copied! ✓' : 'Copy'}
                </Button>
              </div>
              
              <p className="text-xs text-green-600 dark:text-green-400 text-center font-medium">
                🔒 Your contribution directly supports Tydex development
              </p>
            </div>
          </div>



          {/* Enhanced Thank You Message */}
          <div className="text-center p-6 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800 relative overflow-hidden">
            <div className="absolute top-2 right-2 opacity-20">
              <Sparkles className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
            <div className="relative z-10">
              <h5 className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-2">
                Thank you for your support! 🙏
              </h5>
              <p className="text-sm text-purple-600 dark:text-purple-400 mb-3">
                Built with ❤️ for the Web3 community
              </p>
              <div className="flex justify-center gap-2">
                <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  #Web3
                </Badge>
                <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  #OpenSource
                </Badge>
                <Badge className="bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200">
                  #Community
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}