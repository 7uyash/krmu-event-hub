import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface QRCodeDisplayProps {
  eventId: string;
  eventTitle?: string;
}

export function QRCodeDisplay({ eventId, eventTitle }: QRCodeDisplayProps) {
  const [qrData, setQrData] = useState<string>('');
  const [eventData, setEventData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await api.eventsAdmin.getQRCode(eventId);
        setQrData(response.qrData);
        setEventData(response.event);
      } catch (error: any) {
        toast.error('Failed to generate QR code');
      }
    };

    if (eventId) {
      fetchQRCode();
    }
  }, [eventId]);

  const handleDownload = () => {
    if (!qrData) return;

    const svg = document.querySelector(`#qrcode-${eventId} svg`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `event-qrcode-${eventId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    toast.success('QR code downloaded');
  };

  const handleCopy = () => {
    if (!qrData) return;
    navigator.clipboard.writeText(qrData);
    setCopied(true);
    toast.success('QR code data copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!qrData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Generating QR code...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event QR Code</CardTitle>
        {eventTitle && <p className="text-sm text-muted-foreground">{eventTitle}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center p-4 bg-white rounded-lg" id={`qrcode-${eventId}`}>
          <QRCodeSVG value={qrData} size={256} level="H" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={handleCopy} className="flex-1">
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Data
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
