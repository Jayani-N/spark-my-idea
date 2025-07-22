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

interface ValidationResult {
  "1_Target_Market": string;
  "2_Realness_of_the_Problem": number;
  "3_Existing_Alternatives": string[];
  "4_Whats_Unique": string;
  "5_Feasibility_for_a_college_team": string;
  "6_Potential_Success_Score": number;
  "7_AI_Verdict": string;
  "8_One_Actionable_Suggestion": string;
}

const IdeaValidatorForm = () => {
  const [formData, setFormData] = useState<FormData>({
    appIdea: "",
    problemItSolves: "",
    targetAudience: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
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
        const data = await response.json();
        
        // Parse the output if it exists
        if (data.output) {
          try {
            const outputText = data.output.replace(/```json\n|\n```/g, '');
            const parsedResult = JSON.parse(outputText);
            setValidationResult(parsedResult);
          } catch (parseError) {
            console.error('Error parsing output:', parseError);
          }
        }
        
        toast({
          title: "Success!",
          description: "Your idea has been analyzed.",
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

  if (validationResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl p-8 bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Validation Results</h2>
              <p className="text-muted-foreground">Here's what we found about your app idea</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6 bg-background/50 border-border/30">
                <h3 className="text-lg font-semibold text-foreground mb-3">Target Market</h3>
                <p className="text-muted-foreground text-sm">{validationResult["1_Target_Market"]}</p>
              </Card>

              <Card className="p-6 bg-background/50 border-border/30">
                <h3 className="text-lg font-semibold text-foreground mb-3">Problem Reality Score</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">{validationResult["2_Realness_of_the_Problem"]}</span>
                  <span className="text-muted-foreground">/10</span>
                </div>
              </Card>

              <Card className="p-6 bg-background/50 border-border/30">
                <h3 className="text-lg font-semibold text-foreground mb-3">Success Score</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">{validationResult["6_Potential_Success_Score"]}</span>
                  <span className="text-muted-foreground">/10</span>
                </div>
              </Card>

              <Card className="p-6 bg-background/50 border-border/30">
                <h3 className="text-lg font-semibold text-foreground mb-3">AI Verdict</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  validationResult["7_AI_Verdict"] === "Refine" ? "bg-yellow-500/20 text-yellow-600" :
                  validationResult["7_AI_Verdict"] === "Proceed" ? "bg-green-500/20 text-green-600" :
                  "bg-red-500/20 text-red-600"
                }`}>
                  {validationResult["7_AI_Verdict"]}
                </span>
              </Card>
            </div>

            <Card className="p-6 bg-background/50 border-border/30">
              <h3 className="text-lg font-semibold text-foreground mb-3">What Makes It Unique</h3>
              <p className="text-muted-foreground text-sm">{validationResult["4_Whats_Unique"]}</p>
            </Card>

            <Card className="p-6 bg-background/50 border-border/30">
              <h3 className="text-lg font-semibold text-foreground mb-3">Feasibility Assessment</h3>
              <p className="text-muted-foreground text-sm">{validationResult["5_Feasibility_for_a_college_team"]}</p>
            </Card>

            <Card className="p-6 bg-background/50 border-border/30">
              <h3 className="text-lg font-semibold text-foreground mb-3">Actionable Suggestion</h3>
              <p className="text-muted-foreground text-sm">{validationResult["8_One_Actionable_Suggestion"]}</p>
            </Card>

            {validationResult["3_Existing_Alternatives"] && validationResult["3_Existing_Alternatives"].length > 0 && (
              <Card className="p-6 bg-background/50 border-border/30">
                <h3 className="text-lg font-semibold text-foreground mb-3">Existing Alternatives</h3>
                <ul className="space-y-2">
                  {validationResult["3_Existing_Alternatives"].map((alternative, index) => (
                    <li key={index} className="text-muted-foreground text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {alternative}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <div className="text-center">
              <Button 
                onClick={() => setValidationResult(null)} 
                className="bg-primary hover:bg-primary/90"
              >
                Validate Another Idea
              </Button>
            </div>
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