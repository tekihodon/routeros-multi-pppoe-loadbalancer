import ScriptGenerator from '@/components/ScriptGenerator';

const Index = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="container">
        <h1 className="text-3xl font-bold text-center mb-2">
          RouterOS Đa Phiên + Cân bằng tải
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Tác giả: Phạm Đình Đức {" "}
          <a 
            href="https://www.facebook.com/profile.php?id=100028137383510" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 underline"
          >
            Facebook
          </a>
        </p>
        <ScriptGenerator />
      </div>
    </div>
  );
};

export default Index;