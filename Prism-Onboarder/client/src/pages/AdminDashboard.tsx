import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Shield, ArrowLeft, Eye, Check, X, FileText, 
  AlertTriangle, Clock, CheckCircle, XCircle, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  JURISDICTIONS,
  useStore,
  approveApplication,
  rejectApplication,
  getAuditLog,
  type Application,
  type RiskLevel
} from '@/lib/store';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, className: 'bg-muted text-muted-foreground' },
  in_review: { label: 'In Review', icon: Eye, className: 'bg-foreground/10 text-foreground' },
  approved: { label: 'Approved', icon: CheckCircle, className: 'bg-foreground text-background' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
};

const riskConfig: Record<RiskLevel, { label: string; className: string }> = {
  low: { label: 'Low Risk', className: 'bg-muted text-foreground border-foreground/20' },
  medium: { label: 'Medium Risk', className: 'bg-muted text-foreground border-foreground/40' },
  high: { label: 'High Risk', className: 'bg-foreground text-background' },
};

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { applications, auditLog } = useStore();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const reviewableApps = applications.filter(a => a.status === 'in_review');
  const allApps = applications;

  const handleApprove = (app: Application) => {
    approveApplication(app.id);
    setSelectedApp(null);
  };

  const handleReject = () => {
    if (selectedApp && rejectReason) {
      rejectApplication(selectedApp.id, rejectReason);
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedApp(null);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              data-testid="back-home-btn"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Exit
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">PRISM Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {reviewableApps.length} pending review
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="review" className="space-y-4">
              <TabsList>
                <TabsTrigger value="review" data-testid="tab-review">
                  Pending Review ({reviewableApps.length})
                </TabsTrigger>
                <TabsTrigger value="all" data-testid="tab-all">
                  All Applications ({allApps.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="review" className="space-y-3">
                {reviewableApps.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No applications pending review</p>
                    </CardContent>
                  </Card>
                ) : (
                  reviewableApps.map(app => (
                    <ApplicationCard
                      key={app.id}
                      app={app}
                      onSelect={() => setSelectedApp(app)}
                      isSelected={selectedApp?.id === app.id}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="all" className="space-y-3">
                {allApps.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No applications yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  allApps.map(app => (
                    <ApplicationCard
                      key={app.id}
                      app={app}
                      onSelect={() => setSelectedApp(app)}
                      isSelected={selectedApp?.id === app.id}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            {selectedApp ? (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Application Details</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedApp(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Application ID</p>
                    <p className="font-mono text-sm">{selectedApp.id.toUpperCase()}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Jurisdiction</p>
                    <p className="flex items-center gap-2">
                      <span>{JURISDICTIONS[selectedApp.jurisdiction].flag}</span>
                      <span>{JURISDICTIONS[selectedApp.jurisdiction].name}</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Applicant</p>
                    <p>{selectedApp.formData.fullName || 'Not provided'}</p>
                    <p className="text-sm text-muted-foreground">{selectedApp.formData.email || ''}</p>
                  </div>

                  {selectedApp.riskAssessment && (
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-medium uppercase tracking-wider">AI Risk Assessment</p>
                        <Badge className={riskConfig[selectedApp.riskAssessment.level].className}>
                          {selectedApp.riskAssessment.level.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Risk Score</span>
                          <span className="font-mono font-medium">{selectedApp.riskAssessment.score}/100</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-foreground transition-all"
                            style={{ width: `${selectedApp.riskAssessment.score}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mb-3">
                        {selectedApp.riskAssessment.explanation}
                      </p>

                      <div className="space-y-1">
                        {selectedApp.riskAssessment.factors.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            {f.impact === 'positive' ? (
                              <Check className="w-3 h-3 text-foreground" />
                            ) : f.impact === 'negative' ? (
                              <AlertTriangle className="w-3 h-3 text-destructive" />
                            ) : (
                              <div className="w-3 h-3" />
                            )}
                            <span className={f.impact === 'negative' ? 'text-destructive' : ''}>
                              {f.factor}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedApp.documents.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Documents ({selectedApp.documents.length})</p>
                      <div className="space-y-2">
                        {selectedApp.documents.map(doc => (
                          <div key={doc.id} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate">{doc.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedApp.status === 'in_review' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        className="flex-1"
                        onClick={() => handleApprove(selectedApp)}
                        data-testid="approve-btn"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setRejectDialogOpen(true)}
                        data-testid="reject-btn"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Eye className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Select an application to view details
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Audit Log</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {auditLog.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No audit entries yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {auditLog.slice(0, 20).map(entry => (
                        <div
                          key={entry.id}
                          className="border-l-2 border-muted pl-3 py-1"
                          data-testid={`audit-${entry.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded",
                              entry.actor === 'admin' ? 'bg-foreground text-background' :
                              entry.actor === 'system' ? 'bg-muted text-muted-foreground' :
                              'bg-muted text-foreground'
                            )}>
                              {entry.actor}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatTime(entry.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs font-medium mt-1">{entry.action.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-muted-foreground">{entry.details}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Rejection Reason</Label>
            <Input
              id="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection"
              className="mt-2"
              data-testid="reject-reason-input"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectReason}
              data-testid="confirm-reject-btn"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ApplicationCard({
  app,
  onSelect,
  isSelected
}: {
  app: Application;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const status = statusConfig[app.status];
  const StatusIcon = status.icon;
  const jurisdiction = JURISDICTIONS[app.jurisdiction];

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:border-foreground/30",
        isSelected && "border-foreground ring-1 ring-foreground/10"
      )}
      onClick={onSelect}
      data-testid={`app-card-${app.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{jurisdiction.flag}</span>
            <div>
              <p className="font-medium">{app.formData.fullName || 'Unnamed Applicant'}</p>
              <p className="text-xs text-muted-foreground">
                {jurisdiction.name} • {jurisdiction.kycType.toUpperCase()}
              </p>
            </div>
          </div>
          <Badge className={status.className}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="font-mono">{app.id.toUpperCase()}</span>
          <span>•</span>
          <span>{app.documents.length} docs</span>
          {app.riskAssessment && (
            <>
              <span>•</span>
              <span className={cn(
                app.riskAssessment.level === 'high' && 'text-foreground font-medium'
              )}>
                Risk: {app.riskAssessment.score}
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}