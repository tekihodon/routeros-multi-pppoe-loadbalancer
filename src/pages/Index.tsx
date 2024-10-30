import ScriptGenerator from '@/components/ScriptGenerator';

const Index = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="container">
        <h1 className="text-3xl font-bold text-center mb-8">
          RouterOS Đa Phiên + Cân bằng tải
        </h1>
        <ScriptGenerator />
      </div>
    </div>
  );
};

export default Index;