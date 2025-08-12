"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { explainDroneDetection } from "@/ai/flows/explain-drone-detection";
import type { DetectionEvent } from "@/types";
import { Loader2, Zap, HelpCircle } from "lucide-react";

type DetectionLogProps = {
  events: DetectionEvent[];
};

function ExplainButton({ event }: { event: DetectionEvent }) {
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleExplain = async () => {
    if (explanation || isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await explainDroneDetection({
        photoDataUri: event.frameDataUri,
        objectSize: "Varies",
        motionPatterns: "Varies based on real-time feed analysis",
      });
      setExplanation(result.explanation);
    } catch (error) {
      console.error("Error getting explanation:", error);
      setExplanation("Could not retrieve explanation at this time.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleExplain}>
          <HelpCircle className="mr-2 h-4 w-4" /> Explain
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detection Explanation</DialogTitle>
          <DialogDescription>
            AI-powered analysis of why this object was flagged as a drone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Image
            src={event.frameDataUri}
            alt="Detected drone frame"
            width={400}
            height={225}
            className="rounded-md mb-4"
            data-ai-hint="drone surveillance"
          />
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[100px]">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="ml-4">Analyzing...</p>
            </div>
          ) : (
            <p className="text-sm text-foreground/90">{explanation}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DetectionLog({ events }: DetectionLogProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="text-accent" />
          Detection Log
        </CardTitle>
        <CardDescription>A log of all detected drone events.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow min-h-0">
        <ScrollArea className="h-full pr-4 -mr-4">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
                <Zap className="w-16 h-16 mb-4" />
                <p className="font-semibold">No detections yet</p>
                <p className="text-sm">Events will appear here when a drone is detected.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="grid grid-cols-3">
                    <div className="col-span-1">
                      <Image
                        src={event.frameDataUri}
                        alt="Detected drone frame"
                        width={150}
                        height={100}
                        className="object-cover h-full w-full"
                        data-ai-hint="drone technology"
                      />
                    </div>
                    <div className="col-span-2 p-3">
                      <p className="font-semibold text-sm">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {event.explanation}
                      </p>
                      <div className="mt-3">
                        <ExplainButton event={event} />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
