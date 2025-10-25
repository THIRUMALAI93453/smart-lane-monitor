import { useState } from 'react';
import { VideoUpload } from '@/components/VideoUpload';
import { ViolationDisplay, Violation } from '@/components/ViolationDisplay';
import { Dashboard } from '@/components/Dashboard';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [totalViolations, setTotalViolations] = useState(0);
  const [recentViolations, setRecentViolations] = useState<Array<{ type: string; timestamp: Date }>>([]);
  const { toast } = useToast();

  const handleFrameCapture = async (imageData: string) => {
    setIsAnalyzing(true);
    
    try {
      console.log('Sending image for analysis...');
      
      const { data, error } = await supabase.functions.invoke('detect-violations', {
        body: { image: imageData }
      });

      if (error) {
        throw error;
      }

      console.log('Analysis complete:', data);
      
      const detectedViolations = data.violations || [];
      setViolations(detectedViolations);
      setTotalAnalyses(prev => prev + 1);
      
      if (detectedViolations.length > 0) {
        setTotalViolations(prev => prev + detectedViolations.length);
        const newViolations = detectedViolations.map((v: Violation) => ({
          type: v.type,
          timestamp: new Date()
        }));
        setRecentViolations(prev => [...newViolations, ...prev]);
        
        toast({
          title: "Violations detected!",
          description: `Found ${detectedViolations.length} violation(s)`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis complete",
          description: "No violations detected in this frame",
        });
      }
    } catch (error) {
      console.error('Error analyzing frame:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Could not analyze frame",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Traffic Violation Detection System
              </h1>
              <p className="text-muted-foreground mt-1">
                AI-powered real-time traffic monitoring
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Powered by Lovable AI
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Video/Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <VideoUpload 
              onFrameCapture={handleFrameCapture} 
              isAnalyzing={isAnalyzing}
            />
            
            {violations.length > 0 && (
              <ViolationDisplay violations={violations} />
            )}
            
            {violations.length === 0 && totalAnalyses > 0 && (
              <ViolationDisplay violations={[]} />
            )}
          </div>

          {/* Right Column - Dashboard */}
          <div className="lg:col-span-1">
            <Dashboard 
              totalAnalyses={totalAnalyses}
              totalViolations={totalViolations}
              recentViolations={recentViolations}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024. All rights reserved to THIRUMALAI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
