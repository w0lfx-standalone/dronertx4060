"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal } from "lucide-react";

type DebugLogProps = {
  messages: string[];
};

export default function DebugLog({ messages }: DebugLogProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Terminal className="text-accent" />
          AI Debug Log
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow min-h-0 text-xs">
        <ScrollArea className="h-full pr-4 -mr-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>AI responses will appear here...</p>
            </div>
          ) : (
            <div className="space-y-2 font-mono">
              {messages.map((msg, index) => (
                <p key={index} className="whitespace-pre-wrap break-all">
                  <span className="text-accent mr-2">{`[${messages.length - index}]`}</span>
                  {msg}
                </p>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
