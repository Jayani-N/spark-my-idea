import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  appIdea: string;
  problemItSolves: string;
  targetAudience: string;
}

const IdeaValidatorForm = () => {
  const [formData, setFormData] = useState<FormData>({
    appIdea: "",
    problemItSolves: "",
    targetAudience: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.appIdea.trim()) {
      toast({
        title: "App idea is required",
        description: "Please enter your app idea before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('https://automation8080.app.n8n.cloud/webhook-test/validator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appIdea: formData.appIdea,
          problemItSolves: formData.problemItSolves,
          targetAudience: formData.targetAudience,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "Success!",
          description: "Your idea has been submitted for validation.",
        });
        
        // Reset form after successful submission
        setFormData({
          appIdea: "",
          problemItSolves: "",
          targetAudience: "",
        });
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "There was an error submitting your idea. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-8 bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Idea Submitted!</h2>
            <p className="text-muted-foreground">
              Thank you for sharing your app idea. We'll analyze it and get back to you with valuable insights.
            </p>
            <Button 
              onClick={() => setIsSubmitted(false)} 
              className="mt-6 bg-primary hover:bg-primary/90"
            >
              Submit Another Idea
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Idea Validator</h1>
            <p className="text-muted-foreground">
              Share your app idea and get valuable insights to validate your concept
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="appIdea" className="text-foreground font-medium">
                App Idea *
              </Label>
              <Input
                id="appIdea"
                type="text"
                placeholder="Describe your app idea..."
                value={formData.appIdea}
                onChange={handleInputChange('appIdea')}
                className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="problemItSolves" className="text-foreground font-medium">
                Problem it Solves (Optional)
              </Label>
              <Input
                id="problemItSolves"
                type="text"
                placeholder="What problem does your app solve?"
                value={formData.problemItSolves}
                onChange={handleInputChange('problemItSolves')}
                className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="text-foreground font-medium">
                Target Audience (Optional)
              </Label>
              <Input
                id="targetAudience"
                type="text"
                placeholder="Who is your target audience?"
                value={formData.targetAudience}
                onChange={handleInputChange('targetAudience')}
                className="bg-input/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 transition-all duration-200 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
            >
              {isSubmitting ? "Submitting..." : "Validate My Idea"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default IdeaValidatorForm;