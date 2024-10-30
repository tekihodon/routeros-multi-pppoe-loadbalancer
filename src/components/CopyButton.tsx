import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface CopyButtonProps {
  text: string;
}

const CopyButton = ({ text }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        description: "Đã sao chép vào clipboard!",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Không thể sao chép. Vui lòng thử lại.",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={copyToClipboard}
      className="h-8 relative"
    >
      {copied ? (
        <Check className="h-4 w-4 animate-copy-check" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
};

export default CopyButton;