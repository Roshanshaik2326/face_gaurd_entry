import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Camera, Upload, UserPlus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FaceRegistrationProps {
  userId: string;
}

const FaceRegistration = ({ userId }: FaceRegistrationProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [name, setName] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [registeredFaces, setRegisteredFaces] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    loadRegisteredFaces();
  }, [userId]);

  const loadRegisteredFaces = async () => {
    const { data, error } = await supabase.from("faces").select("*").eq("user_id", userId);
    if (!error && data) {
      setRegisteredFaces(data);
    }
  };

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCapturing(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera.",
        variant: "destructive",
      });
    }
  };

  const stopCapture = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCapturing(false);
    }
  };

  const captureAndRegister = async () => {
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for the person.",
        variant: "destructive",
      });
      return;
    }

    if (!videoRef.current || !modelsLoaded) return;

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        toast({
          title: "No Face Detected",
          description: "Please position your face in the camera view.",
          variant: "destructive",
        });
        return;
      }

      // Convert Float32Array to regular array for JSON storage
      const descriptorArray = Array.from(detection.descriptor);

      // Create canvas to capture image
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg");

        // Save to database
        const { error } = await supabase.from("faces").insert({
          user_id: userId,
          name: name.trim(),
          descriptors: [descriptorArray], // Wrap in array as we may add more samples later
          image_url: imageData,
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: `${name} has been registered successfully!`,
        });

        setName("");
        stopCapture();
        loadRegisteredFaces();
      }
    } catch (error: any) {
      console.error("Error registering face:", error);
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteFace = async (faceId: string) => {
    const { error } = await supabase.from("faces").delete().eq("id", faceId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete face.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Face removed successfully.",
      });
      loadRegisteredFaces();
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Registration Card */}
      <Card className="shadow-[var(--shadow-elevation)] border-primary/20">
        <CardHeader>
          <CardTitle>Register New Face</CardTitle>
          <CardDescription>Capture and register a new person's face</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personName">Person's Name</Label>
            <Input
              id="personName"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
            {!capturing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">Camera is off</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!capturing ? (
              <Button
                onClick={startCapture}
                disabled={!modelsLoaded}
                className="flex-1 bg-gradient-to-r from-primary to-accent"
              >
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
            ) : (
              <>
                <Button
                  onClick={captureAndRegister}
                  className="flex-1 bg-gradient-to-r from-primary to-accent"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register Face
                </Button>
                <Button onClick={stopCapture} variant="outline" className="border-primary/20">
                  Stop
                </Button>
              </>
            )}
          </div>

          {!modelsLoaded && (
            <Badge variant="secondary" className="w-full flex items-center justify-center gap-2 py-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading Models...
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Registered Faces Card */}
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
                <div
                  key={face.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border hover:bg-secondary transition-colors"
                >
                  {face.image_url && (
                    <img
                      src={face.image_url}
                      alt={face.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{face.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Registered {new Date(face.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => deleteFace(face.id)}
                    variant="ghost"
                    size="icon"
                    className="hover:bg-destructive/20 hover:text-destructive"
                  >
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