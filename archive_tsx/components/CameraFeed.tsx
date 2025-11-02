import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Unlock, UserX, Video, VideoOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CameraFeedProps {
  userId: string;
}

const CameraFeed = ({ userId }: CameraFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [recognizedPerson, setRecognizedPerson] = useState<string | null>(null);
  const [labeledDescriptors, setLabeledDescriptors] = useState<faceapi.LabeledFaceDescriptors[]>([]);
  const { toast } = useToast();
  const detectionIntervalRef = useRef<number>();

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
        toast({
          title: "Models loaded",
          description: "Face recognition is ready!",
        });
      } catch (error) {
        console.error("Error loading models:", error);
        toast({
          title: "Error",
          description: "Failed to load face recognition models. Please check the models folder.",
          variant: "destructive",
        });
      }
    };
    loadModels();
  }, [toast]);

  // Load registered faces from database
  useEffect(() => {
    const loadRegisteredFaces = async () => {
      const { data: faces, error } = await supabase
        .from("faces")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error loading faces:", error);
        return;
      }

      if (faces && faces.length > 0) {
        const descriptors = faces.map((face) => {
          const descriptorArray = face.descriptors as number[][];
          const faceDescriptors = descriptorArray.map((desc) => new Float32Array(desc));
          return new faceapi.LabeledFaceDescriptors(face.name, faceDescriptors);
        });
        setLabeledDescriptors(descriptors);
      }
    };

    if (userId) {
      loadRegisteredFaces();
    }
  }, [userId]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    }
  };

  useEffect(() => {
    if (!cameraActive || !modelsLoaded || !videoRef.current || !canvasRef.current) return;

    const detectFaces = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const displaySize = {
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      };
      faceapi.matchDimensions(canvasRef.current, displaySize);

      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      // Clear canvas
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }

      // Draw detections
      faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);

      // Recognize faces
      if (labeledDescriptors.length > 0 && resizedDetections.length > 0) {
        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
        const results = resizedDetections.map((d) => faceMatcher.findBestMatch(d.descriptor));

        results.forEach((result, i) => {
          const box = resizedDetections[i].detection.box;
          const drawBox = new faceapi.draw.DrawBox(box, {
            label: result.toString(),
          });
          drawBox.draw(canvasRef.current!);

          if (result.label !== "unknown") {
            setRecognizedPerson(result.label);
            // Log recognition
            logRecognition(result.label, "recognized");
          } else {
            setRecognizedPerson(null);
          }
        });
      }
    };

    detectionIntervalRef.current = window.setInterval(detectFaces, 100);

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [cameraActive, modelsLoaded, labeledDescriptors]);

  const logRecognition = async (personName: string, action: string) => {
    await supabase.from("logs").insert({
      user_id: userId,
      recognized_person: personName,
      action: action,
    });
  };

  const handleUnlock = async () => {
    if (recognizedPerson) {
      await logRecognition(recognizedPerson, "unlocked");
      toast({
        title: "Door Unlocked",
        description: `Access granted for ${recognizedPerson}`,
      });
    }
  };

  return (
    <Card className="shadow-[var(--shadow-elevation)] border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Live Camera Feed</span>
          {!modelsLoaded && (
            <Badge variant="secondary" className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading Models...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
            onLoadedMetadata={() => {
              if (canvasRef.current && videoRef.current) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
              }
            }}
          />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
          {!cameraActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">Camera is off</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {!cameraActive ? (
            <Button
              onClick={startCamera}
              disabled={!modelsLoaded}
              className="bg-gradient-to-r from-primary to-accent"
            >
              <Video className="mr-2 h-4 w-4" />
              Start Camera
            </Button>
          ) : (
            <Button onClick={stopCamera} variant="outline" className="border-primary/20">
              <VideoOff className="mr-2 h-4 w-4" />
              Stop Camera
            </Button>
          )}

          {recognizedPerson && cameraActive && (
            <Button
              onClick={handleUnlock}
              className="bg-gradient-to-r from-primary to-accent"
            >
              <Unlock className="mr-2 h-4 w-4" />
              Unlock Door for {recognizedPerson}
            </Button>
          )}

          {!recognizedPerson && cameraActive && (
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
              <UserX className="h-4 w-4" />
              No recognized person
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraFeed;