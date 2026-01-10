import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft, ArrowRight, Check, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StepIndicator } from '@/components/StepIndicator';
import { DocumentUpload } from '@/components/DocumentUpload';
import {
  JURISDICTIONS,
  getApplication,
  updateApplication,
  uploadDocument,
  submitForReview,
  useStore
} from '@/lib/store';

export default function Onboarding() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { applications } = useStore();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const app = getApplication(id || '');

  useEffect(() => {
    if (app) {
      setFormData(app.formData);
    }
  }, [app?.id]);

  if (!app) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">Application Not Found</h2>
            <p className="text-sm text-muted-foreground mb-4">
              This application may have expired or doesn't exist.
            </p>
            <Button onClick={() => navigate('/')} data-testid="back-home">
              Start New Application
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const jurisdiction = JURISDICTIONS[app.jurisdiction];
  const isNBFC = jurisdiction.kycType === 'nbfc';
  const totalSteps = jurisdiction.steps.length;

  const handleInputChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    updateApplication(app.id, { formData: updated });
  };

  const handleNextStep = () => {
    if (app.currentStep < totalSteps - 1) {
      updateApplication(app.id, { currentStep: app.currentStep + 1 });
    }
  };

  const handlePrevStep = () => {
    if (app.currentStep > 0 && !isNBFC) {
      updateApplication(app.id, { currentStep: app.currentStep - 1 });
    }
  };

  const handleDocUpload = (fileName: string, fileType: string) => {
    uploadDocument(app.id, fileName, fileType);
  };

  const handleSubmit = () => {
    submitForReview(app.id);
    setSubmitted(true);
  };

  if (submitted || app.status !== 'pending') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-lg w-full animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-foreground rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-background" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Application Submitted</h2>
            <p className="text-muted-foreground mb-6">
              Your KYC application for {jurisdiction.name} has been submitted for review.
              You will be notified once the verification is complete.
            </p>
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-xs text-muted-foreground mb-1">Application ID</p>
              <p className="font-mono text-sm">{app.id.toUpperCase()}</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/')} data-testid="new-application">
                New Application
              </Button>
              <Button onClick={() => navigate('/admin')} data-testid="view-admin">
                View in Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStepContent = () => {
    const stepName = jurisdiction.steps[app.currentStep];
    
    if (stepName.toLowerCase().includes('personal') || stepName.toLowerCase().includes('basic')) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Legal Name</Label>
              <Input
                id="fullName"
                value={formData.fullName || ''}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                data-testid="input-fullName"
              />
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob || ''}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                data-testid="input-dob"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="you@example.com"
              data-testid="input-email"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 234 567 8900"
              data-testid="input-phone"
            />
          </div>
        </div>
      );
    }

    if (stepName.toLowerCase().includes('address')) {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="address1">Address Line 1</Label>
            <Input
              id="address1"
              value={formData.address1 || ''}
              onChange={(e) => handleInputChange('address1', e.target.value)}
              placeholder="Street address"
              data-testid="input-address1"
            />
          </div>
          <div>
            <Label htmlFor="address2">Address Line 2</Label>
            <Input
              id="address2"
              value={formData.address2 || ''}
              onChange={(e) => handleInputChange('address2', e.target.value)}
              placeholder="Apartment, suite, etc."
              data-testid="input-address2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                data-testid="input-city"
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode || ''}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                data-testid="input-postalCode"
              />
            </div>
          </div>
        </div>
      );
    }

    if (stepName.toLowerCase().includes('pan') || stepName.toLowerCase().includes('aadhaar')) {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="pan">PAN Number</Label>
            <Input
              id="pan"
              value={formData.pan || ''}
              onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
              placeholder="ABCDE1234F"
              maxLength={10}
              data-testid="input-pan"
            />
          </div>
          <div>
            <Label htmlFor="aadhaar">Aadhaar Number</Label>
            <Input
              id="aadhaar"
              value={formData.aadhaar || ''}
              onChange={(e) => handleInputChange('aadhaar', e.target.value.replace(/\D/g, ''))}
              placeholder="1234 5678 9012"
              maxLength={12}
              data-testid="input-aadhaar"
            />
          </div>
          <DocumentUpload
            requiredDocs={['PAN Card', 'Aadhaar Card']}
            uploadedDocs={app.documents}
            onUpload={handleDocUpload}
          />
        </div>
      );
    }

    if (stepName.toLowerCase().includes('bank')) {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              value={formData.bankName || ''}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
              placeholder="Enter bank name"
              data-testid="input-bankName"
            />
          </div>
          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={formData.accountNumber || ''}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              placeholder="Enter account number"
              data-testid="input-accountNumber"
            />
          </div>
          <div>
            <Label htmlFor="ifsc">IFSC Code</Label>
            <Input
              id="ifsc"
              value={formData.ifsc || ''}
              onChange={(e) => handleInputChange('ifsc', e.target.value.toUpperCase())}
              placeholder="SBIN0001234"
              data-testid="input-ifsc"
            />
          </div>
        </div>
      );
    }

    if (stepName.toLowerCase().includes('video')) {
      return (
        <div className="space-y-4 text-center py-8">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-12 h-12 text-muted-foreground" />
          </div>
          <h4 className="text-lg font-medium">Video KYC Verification</h4>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            In a production environment, this step would initiate a live video call
            for identity verification. For this demo, click Complete to proceed.
          </p>
          <Button
            variant="outline"
            onClick={() => handleInputChange('videoKycCompleted', 'true')}
            data-testid="complete-video-kyc"
          >
            {formData.videoKycCompleted ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Video KYC Complete
              </>
            ) : (
              'Simulate Video KYC'
            )}
          </Button>
        </div>
      );
    }

    // ID Verification / SSN / NRIC step
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="idNumber">
            {app.jurisdiction === 'US' ? 'SSN (Last 4 digits)' :
             app.jurisdiction === 'SG' ? 'NRIC/FIN Number' :
             'ID Number'}
          </Label>
          <Input
            id="idNumber"
            value={formData.idNumber || ''}
            onChange={(e) => handleInputChange('idNumber', e.target.value)}
            placeholder={
              app.jurisdiction === 'US' ? 'XXXX' :
              app.jurisdiction === 'SG' ? 'S1234567D' :
              'Enter your ID number'
            }
            data-testid="input-idNumber"
          />
        </div>
        <DocumentUpload
          requiredDocs={jurisdiction.requiredDocs}
          uploadedDocs={app.documents}
          onUpload={handleDocUpload}
        />
      </div>
    );
  };

  const isLastStep = app.currentStep === totalSteps - 1;
  const canProceed = Object.keys(formData).length > 0 || app.documents.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              data-testid="back-home-btn"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Home
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-2xl">{jurisdiction.flag}</span>
            <span className="font-medium">{jurisdiction.name}</span>
            {isNBFC && (
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded uppercase tracking-wider">
                NBFC Flow
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <StepIndicator
            steps={jurisdiction.steps}
            currentStep={app.currentStep}
            locked={isNBFC}
          />
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{jurisdiction.steps[app.currentStep]}</span>
              <span className="text-sm font-normal text-muted-foreground">
                Step {app.currentStep + 1} of {totalSteps}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={app.currentStep === 0 || isNBFC}
                data-testid="prev-step-btn"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {isLastStep ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed}
                  data-testid="submit-btn"
                >
                  Submit Application
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleNextStep}
                  disabled={!canProceed}
                  data-testid="next-step-btn"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            {isNBFC && app.currentStep > 0 && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                ⚠️ NBFC compliance requires sequential completion. Previous steps are locked.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}