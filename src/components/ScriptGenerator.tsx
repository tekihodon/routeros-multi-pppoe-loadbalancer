import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { BALANCE_METHOD_HINTS, DEFAULT_LAN_RANGES, type BalanceMethod } from '@/lib/constants';
import { generateScripts } from '@/lib/generateScript';
import LANSelector from './LANSelector';
import LoadingSpinner from './LoadingSpinner';
import ScriptOutput from './ScriptOutput';

const ScriptGenerator = () => {
  const [balanceMethod, setBalanceMethod] = useState<BalanceMethod>('per-connection');
  const [pppoeCount, setPPPoECount] = useState('2');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ethernetId, setEthernetId] = useState('');
  const [lanRanges, setLanRanges] = useState(DEFAULT_LAN_RANGES);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScripts, setGeneratedScripts] = useState<{
    macvlanScript: string;
    lanScript: string;
    loadBalanceScript: string;
  } | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const scripts = generateScripts({
        balanceMethod,
        pppoeCount: parseInt(pppoeCount),
        username,
        password,
        lanRanges,
        ethernetId,
      });
      
      setGeneratedScripts(scripts);
      setIsGenerating(false);
      
      // Scroll to results
      const outputElement = document.getElementById('script-output');
      if (outputElement) {
        outputElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Phương thức cân bằng tải</Label>
            <Select value={balanceMethod} onValueChange={(value: BalanceMethod) => setBalanceMethod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per-connection">Per Connection</SelectItem>
                <SelectItem value="src-address">Source Address</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{BALANCE_METHOD_HINTS[balanceMethod]}</p>
          </div>

          <div className="space-y-2">
            <Label>Số lượng PPPoE</Label>
            <Input
              type="number"
              min="2"
              value={pppoeCount}
              onChange={(e) => setPPPoECount(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Username PPPoE</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập username"
              />
            </div>
            <div className="space-y-2">
              <Label>Password PPPoE</Label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập password"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ethernet Interface</Label>
            <Input
              value={ethernetId}
              onChange={(e) => setEthernetId(e.target.value)}
              placeholder="Nhập tên interface (vd: ether1)"
            />
          </div>

          <div className="space-y-2">
            <Label>Dải địa chỉ LAN</Label>
            <LANSelector
              selectedRanges={lanRanges}
              onChange={setLanRanges}
            />
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleGenerate}
          disabled={isGenerating || !username || !password || !ethernetId}
        >
          {isGenerating ? <LoadingSpinner /> : 'Tạo Script'}
        </Button>
      </Card>

      {generatedScripts && (
        <div id="script-output">
          <ScriptOutput {...generatedScripts} />
        </div>
      )}
    </div>
  );
};

export default ScriptGenerator;