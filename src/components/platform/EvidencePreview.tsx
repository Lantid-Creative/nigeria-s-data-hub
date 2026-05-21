import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ExternalLink, Download } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  path: string;
  name: string;
};

export function EvidencePreview({ open, onOpenChange, path, name }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setUrl(null);
    supabase.storage
      .from("evidence")
      .createSignedUrl(path, 300)
      .then(({ data }) => setUrl(data?.signedUrl ?? null))
      .finally(() => setLoading(false));
  }, [open, path]);

  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const isImage = ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext);
  const isPdf = ext === "pdf";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="truncate font-display">{name}</DialogTitle>
        </DialogHeader>
        <div className="min-h-[60vh]">
          {loading && (
            <div className="grid h-[60vh] place-items-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loading && url && isImage && (
            <img src={url} alt={name} className="mx-auto max-h-[70vh] rounded-md object-contain" />
          )}
          {!loading && url && isPdf && (
            <iframe src={url} title={name} className="h-[70vh] w-full rounded-md border" />
          )}
          {!loading && url && !isImage && !isPdf && (
            <div className="grid h-[40vh] place-items-center text-sm text-muted-foreground">
              Preview not available for .{ext} files.
            </div>
          )}
        </div>
        {url && (
          <div className="flex justify-end gap-2 border-t pt-3">
            <Button variant="outline" size="sm" onClick={() => window.open(url, "_blank")}>
              <ExternalLink className="mr-1 h-3.5 w-3.5" />Open in new tab
            </Button>
            <a href={url} download={name}>
              <Button size="sm" className="bg-primary">
                <Download className="mr-1 h-3.5 w-3.5" />Download
              </Button>
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
