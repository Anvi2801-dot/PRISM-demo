import { useState } from 'react';
import { useLocation } from 'wouter';
import { Shield, Globe, FileCheck, Brain, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { JURISDICTIONS, type Jurisdiction, createApplication } from '@/lib/store';

export default function Landing() {
  const [, navigate] = useLocation();
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Jurisdiction | null>(null);

  const handleStartKYC = () => {
    if (!selectedJurisdiction) return;
    const app = createApplication(selectedJurisdiction);
    navigate(`/onboarding/${app.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-foreground rounded flex items-center justify-center">
              <Shield className="w-5 h-5 text-background" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">PRISM</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Predictive Risk & Identity Screening
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
            data-testid="nav-admin"
          >
            Admin Portal
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-semibold tracking-tight mb-4">
            Regulator-Aware KYC Onboarding
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-powered identity verification with jurisdiction-specific compliance. 
            Five countries. One unified platform.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { icon: Globe, label: '5 Jurisdictions', desc: 'Region-specific flows' },
            { icon: FileCheck, label: 'Document OCR', desc: 'Automated extraction' },
            { icon: Brain, label: 'AI Risk Scoring', desc: 'Explainable assessments' },
            { icon: Shield, label: 'Audit Trail', desc: 'Immutable logging' },
          ].map(({ icon: Icon, label, desc }) => (
            <Card key={label} className="border-border bg-card">
              <CardContent className="p-4 text-center">
                <Icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold mb-6 text-center">Select Your Jurisdiction</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {Object.values(JURISDICTIONS).map((j) => (
              <button
                key={j.code}
                onClick={() => setSelectedJurisdiction(j.code)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  selectedJurisdiction === j.code
                    ? 'border-foreground bg-muted ring-2 ring-foreground/10'
                    : 'border-border hover:border-muted-foreground/50 hover:bg-muted/50'
                }`}
                data-testid={`jurisdiction-${j.code}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{j.flag}</span>
                  <div>
                    <p className="font-medium">{j.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {j.kycType === 'nbfc' ? 'NBFC Multi-Step Flow' : 'Minimal KYC'}
                    </p>
                  </div>
                </div>
                {j.kycType === 'nbfc' && (
                  <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded inline-block">
                    {j.steps.length} Steps Required
                  </div>
                )}
              </button>
            ))}
          </div>

          {selectedJurisdiction && (
            <div className="animate-slide-up">
              <Card className="border-foreground/20 bg-muted/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Selected</p>
                      <p className="text-xl font-semibold flex items-center gap-2">
                        {JURISDICTIONS[selectedJurisdiction].flag}
                        {JURISDICTIONS[selectedJurisdiction].name}
                      </p>
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Flow:</span>{' '}
                          {JURISDICTIONS[selectedJurisdiction].steps.join(' → ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Required:</span>{' '}
                          {JURISDICTIONS[selectedJurisdiction].requiredDocs.join(', ')}
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleStartKYC} data-testid="start-kyc-btn">
                      Start KYC
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-xs text-muted-foreground">
          PRISM Demo • Predictive Risk & Identity Screening Module
        </div>
      </footer>
    </div>
  );
}