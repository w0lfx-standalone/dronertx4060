"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { realTimeDroneDetection } from "@/ai/flows/real-time-drone-detection";
import type { DetectionEvent } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { VideoOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type WebcamFeedProps = {
  onDetection: (event: Omit<DetectionEvent, "id" | "timestamp">) => void;
  sensitivity: number;
  isActive: boolean;
  onCameraStatusChange: (hasPermission: boolean) => void;
};

export default function WebcamFeed({
  onDetection,
  sensitivity,
  isActive,
  onCameraStatusChange,
}: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const isProcessingRef = useRef(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const { toast } = useToast();

  const processFrame = useCallback(async () => {
    if (
      isProcessingRef.current ||
      !videoRef.current ||
      !canvasRef.current ||
      videoRef.current.paused ||
      videoRef.current.ended ||
      videoRef.current.readyState < 3 // Wait for enough data
    ) {
      return;
    }

    isProcessingRef.current = true;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frameDataUri = canvas.toDataURL("image/jpeg");

        const result = await realTimeDroneDetection({ frameDataUri });

        if (result.objectType.toLowerCase().includes('drone') && result.explanation) {
            onDetection({
                explanation: result.explanation,
                frameDataUri,
                objectType: 'drone',
            });
        }
      }
    } catch (error) {
      console.error("Error during detection:", error);
    } finally {
      isProcessingRef.current = false;
    }
  }, [onDetection]);

  useEffect(() => {
    async function setupWebcam() {
      if (isActive) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error("Video play failed", e));
          }
          setHasCameraPermission(true);
          onCameraStatusChange(true);
        } catch (error) {
          console.error("Error accessing webcam:", error);
          setHasCameraPermission(false);
          onCameraStatusChange(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions to start detection.',
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
  }, [isActive, toast, onCameraStatusChange]);

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
  }, [isActive, hasCameraPermission, sensitivity, processFrame]);

  return (
    <Card className="overflow-hidden relative shadow-lg">
      <CardContent className="p-0">
        <div className="aspect-video bg-card flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isActive && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm text-muted-foreground text-center p-4">
                     <VideoOff className="w-16 h-16" />
                     <p className="font-semibold mt-4">Webcam is off</p>
                     <p className="text-sm">Press "Start Detection" to begin surveillance.</p>
                 </div>
            )}
            {!hasCameraPermission && isActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm text-center p-4">
                    <Alert variant="destructive" className="max-w-sm">
                        <AlertTitle>Camera Access Denied</AlertTitle>
                        <AlertDescription>
                            Please allow camera access in your browser settings and try again.
                        </AlertDescription>
                    </Alert>
                </div>
            )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-white/20">
          <span
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              isActive && hasCameraPermission ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          ></span>
          {isActive && hasCameraSudo
? "LIVE" : "OFFLINE"}
        </div>
      </CardContent>
    </Card>
  );
}
