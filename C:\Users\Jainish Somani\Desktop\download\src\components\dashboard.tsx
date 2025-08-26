"use client";

import React, { useState, useCallback } from "react";
import WebcamFeed from "./webcam-feed";
import DetectionLog from "./detection-log";
import Controls from "./controls";
import Header from "./header";
import { useToast } from "@/hooks/use-toast";
import type { DetectionEvent } from "@/types";

export default function Dashboard() {
  const [detectionEvents, setDetectionEvents] = useState<DetectionEvent[]>([]);
  const [sensitivity, setSensitivity] = useState(5); // 1-10
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const { toast } = useToast();

  const handleDetection = useCallback(
    (event: Omit<DetectionEvent, "id" | "timestamp">) => {
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
    [toast]
  );

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
            />
            <Controls
              sensitivity={sensitivity}
              onSensitivityChange={setSensitivity}
              isWebcamActive={isWebcamActive}
              onToggleWebcam={() => setIsWebcamActive((prev) => !prev)}
            />
          </div>
          <div className="xl:col-span-1 flex flex-col">
            <DetectionLog events={detectionEvents} />
          </div>
        </div>
      </main>
    </div>
  );
}
