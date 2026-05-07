import { useState, useRef } from 'react';
import { Upload, FileText, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Document } from '@/lib/store';

interface DocumentUploadProps {
  requiredDocs: string[];
  uploadedDocs: Document[];
  onUpload: (fileName: string, fileType: string) => void;
}

export function DocumentUpload({ requiredDocs, uploadedDocs, onUpload }: DocumentUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onUpload(file.name, file.type);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file.name, file.type);
    }
  };

  return (
    <div className="space-y-6" data-testid="document-upload">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-3">Required Documents</h4>
          <ul className="space-y-2">
            {requiredDocs.map((doc, idx) => {
              const isUploaded = uploadedDocs.some(d => 
                d.name.toLowerCase().includes(doc.toLowerCase().split(' ')[0].toLowerCase())
              );
              return (
                <li
                  key={idx}
                  className={cn(
                    "flex items-center gap-2 text-sm p-2 rounded border",
                    isUploaded ? "border-foreground/20 bg-muted/50" : "border-dashed border-muted-foreground/30"
                  )}
                  data-testid={`required-doc-${idx}`}
                >
                  {isUploaded ? (
                    <Check className="w-4 h-4 text-foreground" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-muted-foreground/50" />
                  )}
                  <span className={isUploaded ? "text-foreground" : "text-muted-foreground"}>
                    {doc}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            dragOver ? "border-foreground bg-muted" : "border-muted-foreground/30 hover:border-muted-foreground/50"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          data-testid="drop-zone"
        >
          <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">Drop files here or click to upload</p>
          <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            data-testid="file-input"
          />
        </div>
      </div>

      {uploadedDocs.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Uploaded Documents</h4>
          <div className="space-y-2">
            {uploadedDocs.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded border cursor-pointer transition-colors",
                  selectedDoc?.id === doc.id ? "border-foreground bg-muted" : "border-border hover:bg-muted/50"
                )}
                onClick={() => setSelectedDoc(selectedDoc?.id === doc.id ? null : doc)}
                data-testid={`uploaded-doc-${doc.id}`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded {doc.uploadedAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Check className="w-4 h-4 text-foreground" />
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDoc && (
        <div className="border rounded-lg p-4 bg-muted/30" data-testid="extracted-text">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Extracted Text</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDoc(null)}
              data-testid="close-extracted"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <pre className="text-xs font-mono bg-background p-3 rounded border whitespace-pre-wrap">
            {selectedDoc.extractedText}
          </pre>
        </div>
      )}
    </div>
  );
}