'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MemoizedMarkdown } from './memoized-markdown';

export default function FloatingChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState('');
    const { messages, sendMessage, status } = useChat();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        sendMessage({ text: input });
        setInput('');
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        setIsMinimized(false);
    };

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    return (
        <>
            {/* Chat Button - Always visible */}
            {!isOpen && (
                <Button
                    onClick={toggleChat}
                    size="lg"
                    className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg z-50 hover:scale-110 transition-transform"
                    aria-label="Open chat"
                >
                    <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <Card
                    className={cn(
                        'fixed shadow-2xl border-2 p-0 z-50 transition-all duration-200 flex flex-col',
                        // Mobile: Full screen with small margins
                        'bottom-0 left-0 right-0 m-2 sm:bottom-4 sm:left-auto sm:right-4 sm:m-0',
                        // Desktop: Fixed size in bottom right
                        isMinimized ? 'h-16 sm:w-80' : 'h-[calc(100vh-1rem)] sm:h-[600px] sm:w-96 max-h-[90vh]'
                    )}
                >
                    {/* Header */}
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 border-b bg-primary text-primary-foreground">
                        <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="truncate">AI Assistant</span>
                        </CardTitle>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleMinimize}
                                className="h-8 w-8 hover:bg-primary-foreground/10 text-primary-foreground hidden sm:flex"
                                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                            >
                                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleChat}
                                className="h-8 w-8 hover:bg-primary-foreground/10 text-primary-foreground"
                                aria-label="Close chat"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    {/* Chat Content */}
                    {!isMinimized && (
                        <>
                            <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground px-4">
                                        <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 mb-3 opacity-50" />
                                        <p className="text-sm font-medium">Welcome to your AI Assistant!</p>
                                        <p className="text-xs mt-1">Ask me anything about your finances or transactions.</p>
                                        <div className="mt-4 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-md">
                                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                                ⚠️ Experimental Feature: This AI agent is still in development and may provide inaccurate information or encounter bugs. Please
                                                verify important details.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {messages.map((message) => (
                                    <div key={message.id} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                        <div
                                            className={cn(
                                                'rounded-lg px-3 py-2 sm:px-4 max-w-[85%] sm:max-w-[80%]',
                                                message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                            )}
                                        >
                                            <div className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                                                {message.parts.map((part, i) => {
                                                    switch (part.type) {
                                                        case 'text':
                                                            return <MemoizedMarkdown key={`${message.id}-text`} id={message.id} content={part.text} />;
                                                        default:
                                                            return null;
                                                    }
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Loading Indicator */}
                                {(status === 'submitted' || status === 'streaming') && (
                                    <div className="flex justify-start">
                                        <div className="rounded-lg px-4 py-3 bg-muted">
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{status === 'submitted' && 'Thinking...'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Error State */}
                                {status === 'error' && (
                                    <div className="flex justify-center">
                                        <div className="rounded-lg px-4 py-2 bg-destructive/10 border border-destructive/20">
                                            <p className="text-sm text-destructive">Failed to send message. Please try again.</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                            {/* Input Form */}
                            <div className="p-3 sm:p-4 border-t bg-background">
                                <form onSubmit={handleSubmit} className="flex gap-2">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={status === 'ready' ? 'Type your message...' : 'Please wait...'}
                                        className="flex-1 text-sm sm:text-base h-10 sm:h-auto"
                                        disabled={status !== 'ready'}
                                    />
                                    <Button type="submit" disabled={!input.trim() || status !== 'ready'} size="icon">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-4 w-4"
                                        >
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                    </Button>
                                </form>
                            </div>
                        </>
                    )}
                </Card>
            )}
        </>
    );
}
