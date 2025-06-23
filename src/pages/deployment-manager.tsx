import DetailedDeploymentManager from "@/components/DetailedDeploymentManager";

export default function DeploymentManagerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Deployment Manager</h1>
          <p className="text-gray-400">
            Профессиональное управление деплоем с детальными логами, AI анализом и модульной архитектурой
          </p>
        </div>
        
        <DetailedDeploymentManager />
      </div>
    </div>
  );
}