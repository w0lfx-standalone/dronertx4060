"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

type ControlsProps = {
  sensitivity: number;
  onSensitivityChange: (value: number) => void;
  isWebcamActive: boolean;
  onToggleWebcam: () => void;
};

export default function Controls({
  sensitivity,
  onSensitivityChange,
  isWebcamActive,
  onToggleWebcam,
}: ControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={onToggleWebcam} size="lg" className="w-full">
            {isWebcamActive ? (
              <Pause className="mr-2 h-5 w-5" />
            ) : (
              <Play className="mr-2 h-5 w-5" />
            )}
            {isWebcamActive ? "Stop Detection" : "Start Detection"}
          </Button>
        </div>
        <div className="space-y-3">
          <Label htmlFor="sensitivity">Alert Sensitivity</Label>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-muted-foreground">Low</span>
            <Slider
              id="sensitivity"
              min={1}
              max={10}
              step={1}
              value={[sensitivity]}
              onValueChange={(value) => onSensitivityChange(value[0])}
              disabled={isWebcamActive}
            />
            <span className="text-sm text-muted-foreground">High</span>
            <span className="font-bold w-10 text-center text-accent">{sensitivity}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
