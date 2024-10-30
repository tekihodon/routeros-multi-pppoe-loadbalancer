import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DEFAULT_LAN_RANGES } from '@/lib/constants';

interface LANSelectorProps {
  selectedRanges: string[];
  onChange: (ranges: string[]) => void;
}

const LANSelector = ({ selectedRanges, onChange }: LANSelectorProps) => {
  const [newRange, setNewRange] = useState('');

  const addRange = () => {
    if (newRange && !selectedRanges.includes(newRange)) {
      onChange([...selectedRanges, newRange]);
      setNewRange('');
    }
  };

  const removeRange = (range: string) => {
    onChange(selectedRanges.filter(r => r !== range));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newRange}
          onChange={(e) => setNewRange(e.target.value)}
          placeholder="Nhập dải địa chỉ LAN (vd: 192.168.1.0/24)"
          className="flex-1"
        />
        <Button onClick={addRange} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {selectedRanges.map((range) => (
          <div
            key={range}
            className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full"
          >
            <span className="text-sm">{range}</span>
            <button
              onClick={() => removeRange(range)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LANSelector;