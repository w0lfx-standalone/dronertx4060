"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { realTimeDroneDetection } from "@/ai/flows/real-time-drone-detection";
import type { DetectionEvent } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type WebcamFeedProps = {
  onDetection: (event: Omit<DetectionEvent, "id" | "timestamp">) => void;
  sensitivity: number;
  isActive: boolean;
};

export default function WebcamFeed({
  onDetection,
  sensitivity,
  isActive,
}: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const isProcessingRef = useRef(false);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function setupWebcam() {
      if (isActive && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error("Video play failed", e));
          }
          setHasCameraPermission(true);
        } catch (error) {
          console.error("Error accessing webcam:", error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this app.',
          });
        }
      } else {
        if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
      }
    }
    setupWebcam();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isActive, toast]);
  
  const processFrame = useCallback(async () => {
    if (isProcessingRef.current || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    if (video.readyState < 2) { // Ensure video has enough data to play
        return;
    }

    isProcessingRef.current = true;

    try {
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frameDataUri = canvas.toDataURL("image/jpeg");
            
            const result = await realTimeDroneDetection({ frameDataUri });
            if (result.objectType !== 'none' && result.explanation) {
              onDetection({
                  explanation: result.explanation,
                  frameDataUri: frameDataUri,
                  objectType: result.objectType,
              });
            }
        }
    } catch (error) {
      console.error("Error detecting drone:", error);
    } finally {
      isProcessingRef.current = false;
    }
  }, [onDetection]);

  useEffect(() => {
    if (isActive && hasCameraPermission) {
      const intervalDuration = Math.max(11000 - (sensitivity * 1000), 1000);
      intervalRef.current = setInterval(processFrame, intervalDuration);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, sensitivity, processFrame, hasCameraPermission]);

  return (
    <Card className="overflow-hidden relative shadow-lg">
      <CardContent className="p-0">
        <div className="aspect-video bg-card flex items-center justify-center">
          {isActive ? (
            <div className="w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
               {hasCameraPermission === false && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <Alert variant="destructive" className="max-w-md">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please allow camera access in your browser to use this feature. You may need to restart detection.
                        </AlertDescription>
                    </Alert>
                </div>
               )}
            </div>
          ) : (
            <div className="text-muted-foreground text-center p-4 flex flex-col items-center gap-4">
                <Video className="w-16 h-16" />
                <p className="font-semibold">Webcam is off</p>
                <p className="text-sm">Press "Start Detection" to begin surveillance.</p>
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-white/20">
          <span
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              isActive ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          ></span>
          {isActive ? "LIVE" : "OFFLINE"}
        </div>
      </CardContent>
    </Card>
  );
}
