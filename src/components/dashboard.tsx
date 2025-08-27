"use client";

import React, { useState, useCallback } from "react";
import dynamic from 'next/dynamic';
import DetectionLog from "./detection-log";
import Controls from "./controls";
import Header from "./header";
import { useToast } from "@/hooks/use-toast";
import type { DetectionEvent } from "@/types";
import DebugLog from "./debug-log";

const WebcamFeed = dynamic(() => import('./webcam-feed'), { ssr: false });

export default function Dashboard() {
  const [detectionEvents, setDetectionEvents] = useState<DetectionEvent[]>([]);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  const [sensitivity, setSensitivity] = useState(5); // 1-10
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const { toast } = useToast();

  const addDebugMessage = useCallback((message: string) => {
    setDebugMessages(prev => [message, ...prev].slice(0, 100));
  }, []);

  const handleDetection = useCallback(
    (event: Omit<DetectionEvent, "id" | "timestamp">, debugInfo?: string) => {
      if (debugInfo) {
        addDebugMessage(`AI: ${debugInfo}`);
      }

      if (event.objectType === 'error' || event.objectType === 'none') {
        return;
      }
      
      const newEvent: DetectionEvent = {
        ...event,
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };

      setDetectionEvents((prevEvents) => [newEvent, ...prevEvents].slice(0, 50));

      if (event.objectType === 'drone') {
        toast({
            title: "🚨 Drone Detected!",
            description: newEvent.explanation,
            duration: 5000,
            variant: 'destructive'
        });
      }
    },
    [toast, addDebugMessage]
  );
  
  const handleToggleWebcam = () => {
    setIsWebcamActive((prev) => !prev);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-screen-2xl mx-auto h-full">
          <div className="xl:col-span-2 flex flex-col gap-6">
            <WebcamFeed
              onDetection={handleDetection}
              sensitivity={sensitivity}
              isActive={isWebcamActive}
              addDebugMessage={addDebugMessage}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controls
                  sensitivity={sensitivity}
                  onSensitivityChange={setSensitivity}
                  isWebcamActive={isWebcamActive}
                  onToggleWebcam={handleToggleWebcam}
                />
                <DebugLog messages={debugMessages} />
            </div>
          </div>
          <div className="xl:col-span-1 flex flex-col">
            <DetectionLog events={detectionEvents} />
          </div>
        </div>
      </main>
    </div>
  );
}
