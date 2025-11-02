import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import * as blazeface from "@tensorflow-models/blazeface";
import "@tensorflow/tfjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Camera, UserPlus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const FaceRegistration = ({ userId }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelSource, setModelSource] = useState(null);
  const [blazeLoaded, setBlazeLoaded] = useState(false);
  const [blazeModel, setBlazeModel] = useState(null);
  const [name, setName] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registeredFaces, setRegisteredFaces] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadModels = async () => {
      const candidates = [
        "/models",
        "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights",
        "https://unpkg.com/face-api.js@0.22.2/weights",
        "https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master"
      ];

      for (const base of candidates) {
        try {
          // quick probe for manifest
          const manifestUrl = `${base}/tiny_face_detector_model-weights_manifest.json`;
          const res = await fetch(manifestUrl, { method: "GET" });
          if (!res.ok) throw new Error(`manifest ${res.status}`);

          await faceapi.nets.tinyFaceDetector.loadFromUri(base);
          await faceapi.nets.faceLandmark68Net.loadFromUri(base);
          await faceapi.nets.faceRecognitionNet.loadFromUri(base);
          await faceapi.nets.ssdMobilenetv1.loadFromUri(base);

          setModelSource(base);
          setModelsLoaded(true);
          toast({ title: "Models loaded", description: `Face recognition ready (models from ${base})` });
          return;
        } catch (err) {
          // try next
        }
      }

      // fallback to BlazeFace detection-only
      try {
        const model = await blazeface.load();
        setBlazeModel(model);
        setBlazeLoaded(true);
        toast({ title: "BlazeFace loaded", description: "Using BlazeFace for face detection (detection-only)." });
      } catch (err) {
        console.error("FaceRegistration: no models available", err);
        toast({ title: "Error", description: "No face models available. Registration will be limited.", variant: "destructive" });
      }
    };
    loadModels();
  }, [toast]);

  useEffect(() => {
    loadRegisteredFaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadRegisteredFaces = async () => {
    try {
      const { data, error } = await supabase.from("faces").select("*").eq("user_id", userId);
      if (!error && data) setRegisteredFaces(data);
    } catch (err) {
      console.error("Error loading faces:", err);
    }
  };

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCapturing(true);
        if (!modelsLoaded && !blazeLoaded) {
          toast({ title: "Camera started", description: "Camera streaming. Face detection will start when a model is ready." });
        }
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({ title: "Camera Error", description: "Unable to access camera.", variant: "destructive" });
    }
  };

  const stopCapture = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCapturing(false);
    }
  };

  const captureAndRegister = async () => {
    if (!name.trim()) {
      toast({ title: "Name Required", description: "Please enter a name for the person.", variant: "destructive" });
      return;
    }
    if (!videoRef.current) return;

    try {
      if (!userId) {
        console.error("FaceRegistration: missing userId prop");
        toast({ title: "Not signed in", description: "User not authenticated. Please sign in and try again.", variant: "destructive" });
        return;
      }
      if (registering) return; // prevent double submits
      setRegistering(true);
      // Use face-api if available (provides descriptors)
      if (modelsLoaded) {
        const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
        if (!detection) {
          toast({ title: "No Face Detected", description: "Please position your face in the camera view.", variant: "destructive" });
          return;
        }
        const descriptorArray = Array.from(detection.descriptor);

        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          const imageData = canvas.toDataURL("image/jpeg");
          const payload = { user_id: userId, name: name.trim(), descriptors: [descriptorArray], image_url: imageData };
          console.log("FaceRegistration: inserting face (descriptor)", payload);
          const { data, error } = await supabase.from("faces").insert(payload);
          console.log("FaceRegistration: insert result", { data, error });
          if (error) throw error;
          toast({ title: "Success", description: `${name} has been registered successfully!` });
          setName("");
          stopCapture();
          loadRegisteredFaces();
        }
        return;
      }

      // If face-api not available, use BlazeFace detection-only fallback
      if (blazeLoaded && blazeModel) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          const img = canvas;
          const predictions = await blazeModel.estimateFaces(img, false);
          if (!predictions || predictions.length === 0) {
            toast({ title: "No Face Detected", description: "Please position your face in the camera view.", variant: "destructive" });
            return;
          }

          const imageData = canvas.toDataURL("image/jpeg");
          const payload = { user_id: userId, name: name.trim(), descriptors: [], image_url: imageData };
          console.log("FaceRegistration: inserting face (detection-only)", payload);
          const { data, error } = await supabase.from("faces").insert(payload);
          console.log("FaceRegistration: insert result", { data, error });
          if (error) throw error;
          toast({ title: "Captured (detection-only)", description: `${name} image captured and stored. Descriptor will be empty until models are available.` });
          setName("");
          stopCapture();
          loadRegisteredFaces();
          return;
        }
      }

      // Final fallback: capture image without detection
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg");
        const payload = { user_id: userId, name: name.trim(), descriptors: [], image_url: imageData };
        console.log("FaceRegistration: inserting face (no detection)", payload);
        const { data, error } = await supabase.from("faces").insert(payload);
        console.log("FaceRegistration: insert result", { data, error });
        if (error) throw error;
        toast({ title: "Captured", description: `${name} image captured (no detection).` });
        setName("");
        stopCapture();
        loadRegisteredFaces();
      }
    } catch (error) {
      console.error("Error registering face:", error);
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    }
    finally {
      setRegistering(false);
    }
  };

  const deleteFace = async (faceId) => {
    const { error } = await supabase.from("faces").delete().eq("id", faceId);
    if (error) {
      toast({ title: "Error", description: "Failed to delete face.", variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Face removed successfully." });
      loadRegisteredFaces();
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-[var(--shadow-elevation)] border-primary/20">
        <CardHeader>
          <CardTitle>Register New Face</CardTitle>
          <CardDescription>Capture and register a new person's face</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personName">Person's Name</Label>
            <Input id="personName" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" onLoadedMetadata={() => {
              if (canvasRef.current && videoRef.current) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
              }
            }} />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
            {!capturing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">Camera is off</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!capturing ? (
              <Button onClick={startCapture} disabled={!modelsLoaded && !blazeLoaded} className="flex-1 bg-gradient-to-r from-primary to-accent">
                <Camera className="mr-2 h-4 w-4" /> Start Camera
              </Button>
            ) : (
              <>
                <Button onClick={captureAndRegister} disabled={registering || !name.trim()} className="flex-1 bg-gradient-to-r from-primary to-accent">
                  <UserPlus className="mr-2 h-4 w-4" /> {registering ? "Registering..." : "Register Face"}
                </Button>
                
                <Button onClick={stopCapture} variant="outline" className="border-primary/20">Stop</Button>
              </>
            )}
          </div>

          {!modelsLoaded && (
            <Badge variant="secondary" className="w-full flex items-center justify-center gap-2 py-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading Models...
            </Badge>
          )}

          {modelsLoaded && modelSource && (
            <Badge variant="outline" className="mt-2">Models: {modelSource}</Badge>
          )}

          {!modelsLoaded && blazeLoaded && (
            <Badge variant="outline" className="mt-2">Using BlazeFace (detection-only)</Badge>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-elevation)] border-primary/20">
        <CardHeader>
          <CardTitle>Registered Faces ({registeredFaces.length})</CardTitle>
          <CardDescription>Manage registered people</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {registeredFaces.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No faces registered yet</p>
            ) : (
              registeredFaces.map((face) => (
                <div key={face.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border hover:bg-secondary transition-colors">
                  {face.image_url && <img src={face.image_url} alt={face.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary" />}
                  <div className="flex-1">
                    <p className="font-medium">{face.name}</p>
                    <p className="text-xs text-muted-foreground">Registered {new Date(face.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button onClick={() => deleteFace(face.id)} variant="ghost" size="icon" className="hover:bg-destructive/20 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceRegistration;