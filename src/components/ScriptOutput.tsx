
import { Card } from '@/components/ui/card';
import CopyButton from './CopyButton';

interface ScriptOutputProps {
  macvlanScript: string;
  lanScript: string;
  loadBalanceScript: string;
  addressListScript: string;
  mangleAddressListScript: string;
}

const ScriptOutput = ({ macvlanScript, lanScript, loadBalanceScript, addressListScript, mangleAddressListScript }: ScriptOutputProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Script tạo MACVLAN và PPPoE</h3>
          <CopyButton text={macvlanScript} />
        </div>
        <pre className="bg-secondary p-4 rounded-lg overflow-x-auto code-area whitespace-pre-wrap">
          {macvlanScript}
        </pre>
      </Card>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Script cấu hình LAN</h3>
          <CopyButton text={lanScript} />
        </div>
        <pre className="bg-secondary p-4 rounded-lg overflow-x-auto code-area whitespace-pre-wrap">
          {lanScript}
        </pre>
      </Card>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Script tạo address lists cho các PPPoE</h3>
          <CopyButton text={addressListScript} />
        </div>
        <pre className="bg-secondary p-4 rounded-lg overflow-x-auto code-area whitespace-pre-wrap">
          {addressListScript}
        </pre>
      </Card>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Script mangle cho address lists</h3>
          <CopyButton text={mangleAddressListScript} />
        </div>
        <pre className="bg-secondary p-4 rounded-lg overflow-x-auto code-area whitespace-pre-wrap">
          {mangleAddressListScript}
        </pre>
      </Card>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Script cân bằng tải</h3>
          <CopyButton text={loadBalanceScript} />
        </div>
        <pre className="bg-secondary p-4 rounded-lg overflow-x-auto code-area whitespace-pre-wrap">
          {loadBalanceScript}
        </pre>
      </Card>
    </div>
  );
};

export default ScriptOutput;
