import { useRef, useState } from 'react';
import { Upload, Camera, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface VideoUploadProps {
  onFrameCapture: (imageData: string) => void;
  isAnalyzing: boolean;
}

export const VideoUpload = ({ onFrameCapture, isAnalyzing }: VideoUploadProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsWebcamActive(true);
        toast({
          title: "Webcam activated",
          description: "Ready to capture frames for analysis",
        });
      }
    } catch (error) {
      toast({
        title: "Webcam error",
        description: "Could not access webcam. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsWebcamActive(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          if (videoRef.current && e.target?.result) {
            const img = new Image();
            img.onload = () => {
              if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                  canvasRef.current.width = img.width;
                  canvasRef.current.height = img.height;
                  ctx.drawImage(img, 0, 0);
                  videoRef.current!.style.display = 'none';
                  canvasRef.current.style.display = 'block';
                }
              }
            };
            img.src = e.target.result as string;
          }
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        if (videoRef.current) {
          videoRef.current.src = URL.createObjectURL(file);
          videoRef.current.style.display = 'block';
          if (canvasRef.current) {
            canvasRef.current.style.display = 'none';
          }
        }
      }
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx && (video.readyState === video.HAVE_ENOUGH_DATA || video.paused)) {
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onFrameCapture(imageData);
      } else {
        toast({
          title: "Cannot capture frame",
          description: "Video is not ready. Please wait or upload an image.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            variant="secondary"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Image/Video
          </Button>
          
          {!isWebcamActive ? (
            <Button
              onClick={startWebcam}
              disabled={isAnalyzing}
              variant="secondary"
            >
              <Camera className="mr-2 h-4 w-4" />
              Start Webcam
            </Button>
          ) : (
            <Button
              onClick={stopWebcam}
              disabled={isAnalyzing}
              variant="secondary"
            >
              Stop Webcam
            </Button>
          )}

          <Button
            onClick={captureFrame}
            disabled={isAnalyzing || (!isWebcamActive && !selectedFile)}
            className="bg-gradient-primary text-primary-foreground shadow-glow"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Frame'}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="relative rounded-lg overflow-hidden bg-secondary/50 min-h-[400px] flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-auto max-h-[600px]"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-h-[600px] hidden"
          />
          {!isWebcamActive && !selectedFile && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
              <p>Upload a file or start webcam to begin</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
