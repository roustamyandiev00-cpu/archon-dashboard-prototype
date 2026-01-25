/**
 * Step 4: Media Upload
 * Upload photos/documents with labels
 */

import { useState, useRef, useCallback } from "react";
import { Camera, X, Upload, Image as ImageIcon, FileText, Trash2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useWizardDraft } from "../WizardContainer";
import type { MediaAsset, MediaLabel } from "@/types/field-to-invoice";

const MEDIA_LABELS: { id: MediaLabel; label: string; icon: string }[] = [
  { id: 'binnen', label: 'Binnen', icon: '🏠' },
  { id: 'buiten', label: 'Buiten', icon: '🌤' },
  { id: 'detail', label: 'Detail', icon: '🔍' },
  { id: 'schade', label: 'Schade', icon: '⚠️' },
  { id: 'overzicht', label: 'Overzicht', icon: '📷' },
] as const;

const MINIMUM_MEDIA = 3; // Minimum photos required

export function Step4Media() {
  const { draft, updateDraft, markDirty } = useWizardDraft('new');
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<MediaLabel>('binnen');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    // Process each file
    Promise.all(
      files.map(file => {
        return new Promise<MediaAsset>((resolve, reject) => {
          // Check file type
          const mimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
          if (!mimeTypes.includes(file.type)) {
            reject(new Error('Alleen afbeeldingen en PDF bestanden zijn toegestaan'));
            return;
          }

          // Get dimensions for images
          if (file.type.startsWith('image/')) {
            const img = new Image();
            img.onload = () => {
              const asset: MediaAsset = {
                id: `new_${Date.now()}_${Math.random()}`,
                user_id: 'current_user', // Would come from auth
                site_id: 'current_site', // Would come from draft
                label: selectedLabel,
                mime_type: file.type,
                file_name: file.name,
                storage_path: `/uploads/${Date.now()}_${file.name}`,
                file_size: file.size,
                width: img.width || 0,
                height: img.height || 0,
                created_at: new Date().toISOString(),
              };
              resolve(asset);
            };
            img.onerror = () => reject(new Error('Kon afbeelding niet laden'));
            img.src = URL.createObjectURL(file);
          } else {
            // For PDF files
            const asset: MediaAsset = {
              id: `new_${Date.now()}_${Math.random()}`,
              user_id: 'current_user',
              site_id: 'current_site',
              label: selectedLabel,
              mime_type: file.type,
              file_name: file.name,
              storage_path: `/uploads/${Date.now()}_${file.name}`,
              file_size: file.size,
              created_at: new Date().toISOString(),
            };
            resolve(asset);
          }
        });
      })
    ).then(assets => {
      const validAssets = assets.filter(a => a !== null) as MediaAsset[];
      setMediaAssets(prev => [...prev, ...validAssets]);
      updateDraft({ mediaAssets: [...mediaAssets, ...validAssets] });
      markDirty();
      setIsUploading(false);
    });
  }, [selectedLabel, updateDraft, markDirty]);

  const handleRemoveMedia = (id: string) => {
    setMediaAssets(prev => prev.filter(m => m.id !== id));
    updateDraft({ mediaAssets: mediaAssets.filter(m => m.id !== id) });
    markDirty();
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const getMissingCount = () => {
    return Math.max(0, MINIMUM_MEDIA - mediaAssets.length);
  };

  const isMinimumMet = mediaAssets.length >= MINIMUM_MEDIA;

  return (
    <Card className="bg-[#0F1520] border border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <ImageIcon className="w-5 h-5 text-cyan-400" />
          Media
          <Badge variant="outline" className="ml-auto border-cyan-500/30 text-cyan-400">
            {mediaAssets.length} bestanden
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Label Selection */}
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Label voor nieuwe upload</h3>
          <div className="flex flex-wrap gap-2">
            {MEDIA_LABELS.map((label) => (
              <button
                key={label.id}
                type="button"
                onClick={() => setSelectedLabel(label.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                  selectedLabel === label.id
                    ? "bg-cyan-500/20 border-cyan-500/50"
                    : "bg-white/5 hover:bg-white/10 border-white/10"
                )}
              >
                <span className="text-2xl">{label.icon}</span>
                <span className="text-sm font-medium">{label.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Button */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCameraClick}
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            Foto maken
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bestand uploaden
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Media Grid */}
        {mediaAssets.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {mediaAssets.map((asset) => (
              <div
                key={asset.id}
                className="relative group rounded-lg overflow-hidden bg-white/5 border border-white/10"
              >
                {/* Media Preview */}
                {asset.mime_type.startsWith('image/') ? (
                  <div className="aspect-square bg-zinc-100 flex items-center justify-center">
                    <img
                      src={`data:${asset.mime_type};base64,${asset.storage_path}`}
                      alt={asset.file_name}
                      className="max-w-full max-h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-zinc-100 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-zinc-400" />
                  </div>
                )}

                {/* Label Badge */}
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                    {MEDIA_LABELS.find(l => l.id === asset.label)?.label}
                  </Badge>
                </div>

                {/* File Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-zinc-800 truncate">
                    {asset.file_name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {asset.mime_type.startsWith('image/') && (
                      <>
                        {asset.width && asset.height && (
                          <span>{asset.width} × {asset.height}px</span>
                        )}
                        • {(asset.file_size / 1024).toFixed(1)} KB
                      </>
                    )}
                  </p>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveMedia(asset.id)}
                  className="absolute top-2 left-2 p-1.5 rounded-full bg-red-500/90 hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {mediaAssets.length === 0 && !isUploading && (
          <div className="text-center py-12">
            <Upload className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">Nog geen media geüpload</p>
            <p className="text-sm text-zinc-500 mt-2">
              Upload minimaal {MINIMUM_MEDIA} foto's of documenten
            </p>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Bestanden uploaden...</p>
          </div>
        )}

        {/* Validation Message */}
        {!isMinimumMet && !isUploading && mediaAssets.length > 0 && (
          <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">Nog {getMissingCount()} foto's nodig</p>
                <p className="text-sm text-orange-200">
                  Upload minimaal {MINIMUM_MEDIA} foto's om door te gaan naar de volgende stap
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {isMinimumMet && !isUploading && (
          <div className="pt-4">
            <Button
              onClick={() => {/* Will be handled by parent */}}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              Volgende stap
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
