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
  "Target Market": string;
  "Realness of the Problem": number;
  "Existing Alternatives": string[];
  "What's Unique?": string;
  "Feasibility for a college team": string;
  "Potential Success Score": number;
  "AI Verdict": string;
  "One actionable suggestion to improve it": string;
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
    const response = await fetch('http://localhost:5678/webhook-test/validator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) throw new Error("Submission failed");

    const data = await response.json();
    console.log("Raw data received:", data);

    if (!data.output) {
      toast({
        title: "No Results",
        description: "The validation completed but no results were returned.",
        variant: "destructive",
      });
      return;
    }

    const outputText = data.output.replace(/```json\n?|\n?```/g, '');
    const rawResultOriginal = JSON.parse(outputText);

    // Normalize key names
    const normalizeKeys = (obj: Record<string, any>) => {
      const result: Record<string, any> = {};
      for (const key in obj) {
        const cleanedKey = key
          .replace(/^\d+\.\s*/, "")           // Remove "1. " style prefixes
          .replace(/\s*\(.*?\)/g, "")         // Remove anything in parentheses
          .trim();
        result[cleanedKey] = obj[key];
      }
      return result;
    };

    const rawResult = normalizeKeys(rawResultOriginal);

    // Normalize Existing Alternatives
    const existingAlternativesRaw = rawResult["Existing Alternatives"];
    const existingAlternatives = Array.isArray(existingAlternativesRaw)
      ? existingAlternativesRaw
      : typeof existingAlternativesRaw === "string"
        ? [existingAlternativesRaw]
        : [];

    const parsedResult: ValidationResult = {
      "Target Market": rawResult["Target Market"] ?? "",
      "Realness of the Problem": Number(rawResult["Realness of the Problem"] ?? 0),
      "Existing Alternatives": existingAlternatives,
      "What's Unique?": rawResult["What’s Unique?"] ?? rawResult["What's Unique?"] ?? "",
      "Feasibility for a college team": rawResult["Feasibility for a college team"] ?? "",
      "Potential Success Score": Number(rawResult["Potential Success Score"] ?? 0),
      "AI Verdict": rawResult["AI Verdict"] ?? "Rethink",
      "One actionable suggestion to improve it": rawResult["One actionable suggestion to improve it"] ?? "",
    };

    setValidationResult(parsedResult);
    toast({ title: "Success!", description: "Your idea has been analyzed." });

    setFormData({
      appIdea: "",
      problemItSolves: "",
      targetAudience: "",
    });

  } catch (error) {
    console.error("Validation error:", error);
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
                <p className="text-muted-foreground text-sm">{validationResult["Target Market"]}</p>
              </Card>

              <Card className="p-6 bg-background/50 border-border/30">
                <h3 className="text-lg font-semibold text-foreground mb-3">Problem Reality Score</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">{validationResult["Realness of the Problem"]}</span>
                  <span className="text-muted-foreground">/10</span>
                </div>
              </Card>

              <Card className="p-6 bg-background/50 border-border/30">
                <h3 className="text-lg font-semibold text-foreground mb-3">Success Score</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">{validationResult["Potential Success Score"]}</span>
                  <span className="text-muted-foreground">/10</span>
                </div>
              </Card>

              <Card className="p-6 bg-background/50 border-border/30">
                <h3 className="text-lg font-semibold text-foreground mb-3">AI Verdict</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  validationResult["AI Verdict"] === "Refine" ? "bg-yellow-500/20 text-yellow-600" :
                  validationResult["AI Verdict"] === "Proceed" ? "bg-green-500/20 text-green-600" :
                  "bg-red-500/20 text-red-600"
                }`}>
                  {validationResult["AI Verdict"]}
                </span>
              </Card>
            </div>

            <Card className="p-6 bg-background/50 border-border/30">
              <h3 className="text-lg font-semibold text-foreground mb-3">What Makes It Unique</h3>
              <p className="text-muted-foreground text-sm">{validationResult["What's Unique?"]}</p>
            </Card>

            <Card className="p-6 bg-background/50 border-border/30">
              <h3 className="text-lg font-semibold text-foreground mb-3">Feasibility Assessment</h3>
              <p className="text-muted-foreground text-sm">{validationResult["Feasibility for a college team"]}</p>
            </Card>

            <Card className="p-6 bg-background/50 border-border/30">
              <h3 className="text-lg font-semibold text-foreground mb-3">Actionable Suggestion</h3>
              <p className="text-muted-foreground text-sm">{validationResult["One actionable suggestion to improve it"]}</p>
            </Card>

            {validationResult["Existing Alternatives"]?.length > 0 && (
              <Card className="p-6 bg-background/50 border-border/30">
                <h3 className="text-lg font-semibold text-foreground mb-3">Existing Alternatives</h3>
                <ul className="space-y-2">
                  {validationResult["Existing Alternatives"].map((alternative, index) => (
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
                onChange={handleInputChange("appIdea")}
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
                onChange={handleInputChange("problemItSolves")}
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
                onChange={handleInputChange("targetAudience")}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3"
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
