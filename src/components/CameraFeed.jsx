import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Unlock, UserX, Video, VideoOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CameraFeed = ({ userId }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelSource, setModelSource] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [recognizedPerson, setRecognizedPerson] = useState(null);
  const [labeledDescriptors, setLabeledDescriptors] = useState([]);
  const { toast } = useToast();
  const detectionIntervalRef = useRef();

  // Load face-api models (try multiple candidate locations from the browser)
  useEffect(() => {
    const loadModels = async () => {
      const candidates = [
        "/models",
        "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights",
        "https://unpkg.com/face-api.js@0.22.2/weights",
        "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js-models@master",
        "https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master"
      ];

      for (const base of candidates) {
        try {
          console.log("[CameraFeed] checking manifest at", `${base}/tiny_face_detector_model-weights_manifest.json`);
          const res = await fetch(`${base}/tiny_face_detector_model-weights_manifest.json`, { method: "GET" });
          console.log("[CameraFeed] manifest status", res.status);
          if (!res.ok) throw new Error(`manifest ${res.status}`);

          console.log("[CameraFeed] attempting to load models from", base);
          await faceapi.nets.tinyFaceDetector.loadFromUri(base);
          await faceapi.nets.faceLandmark68Net.loadFromUri(base);
          await faceapi.nets.faceRecognitionNet.loadFromUri(base);
          await faceapi.nets.ssdMobilenetv1.loadFromUri(base);

          console.log("[CameraFeed] models loaded from", base);
          setModelSource(base);
          setModelsLoaded(true);
          toast({ title: "Models loaded", description: `Face recognition ready (models from ${base})` });
          return;
        } catch (err) {
          console.warn("[CameraFeed] failed to load from", base, err && err.message);
          // try next candidate
        }
      }

      console.error("[CameraFeed] Failed to load face-api models from all candidates");
      toast({ title: "Error", description: "Failed to load face recognition models. Camera will still work for streaming.", variant: "destructive" });
    };
    loadModels();
  }, [toast]);

  // Load registered faces from DB
  useEffect(() => {
    const loadRegisteredFaces = async () => {
      try {
        const { data: faces, error } = await supabase.from("faces").select("*").eq("user_id", userId);
        if (error) {
          console.error("Error loading faces:", error);
          return;
        }
        if (faces && faces.length > 0) {
          const descriptors = faces.map(face => {
            const descriptorArray = face.descriptors;
            const faceDescriptors = descriptorArray.map(desc => new Float32Array(desc));
            return new faceapi.LabeledFaceDescriptors(face.name, faceDescriptors);
          });
          setLabeledDescriptors(descriptors);
        }
      } catch (err) {
        console.error("Error loading registered faces:", err);
      }
    };
    if (userId) loadRegisteredFaces();
  }, [userId]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        if (!modelsLoaded) {
          toast({ title: "Camera started", description: "Camera streaming. Face recognition will start when models are ready." });
        }
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({ title: "Camera Error", description: "Unable to access camera. Please check permissions.", variant: "destructive" });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    }
  };

  // Detection loop
  useEffect(() => {
    if (!cameraActive || !modelsLoaded || !videoRef.current || !canvasRef.current) return;
    const detectFaces = async () => {
      if (!videoRef.current || !canvasRef.current) return;
      const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
      faceapi.matchDimensions(canvasRef.current, displaySize);
      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);

      if (labeledDescriptors.length > 0 && resizedDetections.length > 0) {
        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
        results.forEach((result, i) => {
          const box = resizedDetections[i].detection.box;
          const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
          drawBox.draw(canvasRef.current);
          if (result.label !== "unknown") {
            setRecognizedPerson(result.label);
            logRecognition(result.label, "recognized");
          } else setRecognizedPerson(null);
        });
      }
    };
    detectionIntervalRef.current = window.setInterval(detectFaces, 100);
    return () => { if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current); };
  }, [cameraActive, modelsLoaded, labeledDescriptors]);

  const logRecognition = async (personName, action) => {
    await supabase.from("logs").insert({ user_id: userId, recognized_person: personName, action });
  };

  const handleUnlock = async () => {
    if (recognizedPerson) {
      await logRecognition(recognizedPerson, "unlocked");
      toast({ title: "Door Unlocked", description: `Access granted for ${recognizedPerson}` });
    }
  };

  return (
    <Card className="shadow-[var(--shadow-elevation)] border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Live Camera Feed</span>
          {!modelsLoaded && (
            <Badge variant="secondary" className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading Models...
            </Badge>
          )}
          {modelsLoaded && modelSource && (
            <Badge variant="outline" className="ml-2">Models: {modelSource}</Badge>
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
            <Button onClick={startCamera} className="bg-gradient-to-r from-primary to-accent">
              <Video className="mr-2 h-4 w-4" /> Start Camera
            </Button>
          ) : (
            <Button onClick={stopCamera} variant="outline" className="border-primary/20">
              <VideoOff className="mr-2 h-4 w-4" /> Stop Camera
            </Button>
          )}

          {recognizedPerson && cameraActive && (
            <Button onClick={handleUnlock} className="bg-gradient-to-r from-primary to-accent">
              <Unlock className="mr-2 h-4 w-4" /> Unlock Door for {recognizedPerson}
            </Button>
          )}

          {!recognizedPerson && cameraActive && (
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
              <UserX className="h-4 w-4" /> No recognized person
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraFeed;