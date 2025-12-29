
import React, { useState, useEffect } from 'react';
import { 
  getComfyUIConfig, 
  saveComfyUIConfig, 
  testComfyUIConnection,
  getAvailableModels,
  ComfyUIConfig 
} from '../services/comfyuiClient';
import { CheckIcon, XIcon, SpinnerIcon } from './Icons';

export const ComfyUISettings: React.FC = () => {
  const [config, setConfig] = useState<ComfyUIConfig>({ serverUrl: 'http://localhost:8188', enabled: false });
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; version?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadedConfig = getComfyUIConfig();
    setConfig(loadedConfig);
  }, []);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    const result = await testComfyUIConnection(config.serverUrl);
    setTestResult(result);
    setIsTesting(false);

    // If successful, try to load models
    if (result.success) {
      setIsLoadingModels(true);
      // Temporarily save config so getAvailableModels can use it
      const tempConfig = { ...config, enabled: true };
      saveComfyUIConfig(tempConfig);
      const modelsResult = await getAvailableModels();
      if (modelsResult.success && modelsResult.models) {
        setModels(modelsResult.models);
      }
      // Restore original config state
      saveComfyUIConfig(config);
      setIsLoadingModels(false);
    }
  };

  const handleSave = () => {
    saveComfyUIConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gold/20 pb-4">
        <h3 className="text-xl font-serif text-metallic mb-2">ComfyUI Integration</h3>
        <p className="text-gray-400 text-sm">
          Connect to a local ComfyUI instance for AI image generation
        </p>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between bg-black/40 backdrop-blur p-4 rounded border border-white/10">
        <div>
          <label className="text-sm font-medium text-white">Enable ComfyUI Integration</label>
          <p className="text-xs text-gray-500 mt-1">
            Allow this app to communicate with ComfyUI server
          </p>
        </div>
        <button
          onClick={() => setConfig({ ...config, enabled: !config.enabled })}
          className={`relative w-14 h-7 rounded-full transition-colors ${
            config.enabled ? 'bg-gold' : 'bg-gray-600'
          }`}
        >
          <div
            className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
              config.enabled ? 'translate-x-8' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Server URL Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Server URL</label>
        <input
          type="text"
          value={config.serverUrl}
          onChange={(e) => setConfig({ ...config, serverUrl: e.target.value })}
          placeholder="http://localhost:8188"
          className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white focus:border-gold outline-none rounded"
        />
        <p className="text-xs text-gray-500">
          Examples: <code className="text-gold">http://localhost:8188</code> or{' '}
          <code className="text-gold">http://192.168.1.100:8188</code>
        </p>
      </div>

      {/* Test Connection Button */}
      <div className="flex gap-3">
        <button
          onClick={handleTest}
          disabled={isTesting || !config.serverUrl}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTesting ? (
            <>
              <SpinnerIcon className="w-4 h-4" />
              <span className="text-sm">Testing...</span>
            </>
          ) : (
            <>
              <span className="text-sm">Test Connection</span>
            </>
          )}
        </button>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-black rounded hover:bg-white transition-colors"
        >
          {saved ? (
            <>
              <CheckIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Saved!</span>
            </>
          ) : (
            <span className="text-sm font-medium">Save Settings</span>
          )}
        </button>
      </div>

      {/* Test Result */}
      {testResult && (
        <div
          className={`flex items-start gap-3 p-4 rounded border ${
            testResult.success
              ? 'bg-green-900/20 border-green-500/30'
              : 'bg-red-900/20 border-red-500/30'
          }`}
        >
          {testResult.success ? (
            <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <XIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
              {testResult.message}
            </p>
            {testResult.version && (
              <p className="text-xs text-gray-400 mt-1">ComfyUI Version: {testResult.version}</p>
            )}
          </div>
        </div>
      )}

      {/* Available Models */}
      {models.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white">Available Models ({models.length})</label>
            {isLoadingModels && <SpinnerIcon className="w-4 h-4 text-gold" />}
          </div>
          <div className="max-h-40 overflow-y-auto bg-black/40 border border-white/10 rounded p-3 space-y-1">
            {models.map((model, idx) => (
              <div key={idx} className="text-xs text-gray-300 font-mono">
                • {model}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-black/20 border border-white/10 rounded p-4 space-y-2">
        <h4 className="text-sm font-medium text-gold">📖 Setup Instructions</h4>
        <ol className="text-xs text-gray-400 space-y-2 list-decimal list-inside">
          <li>Install and run ComfyUI on your local machine or server</li>
          <li>
            Enable LAN access by starting ComfyUI with <code className="text-gold">--listen</code> flag
          </li>
          <li>Enter the server URL above (use your local IP for LAN access)</li>
          <li>Click "Test Connection" to verify the connection</li>
          <li>Save settings to enable AI image generation features</li>
        </ol>
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-xs text-gray-500">
            <strong>Example Launch Command:</strong>
          </p>
          <code className="block mt-1 text-xs text-gold bg-black/40 p-2 rounded">
            python main.py --listen 0.0.0.0 --port 8188
          </code>
          <p className="text-xs text-gray-500 mt-2">
            Note: You may need to use <code className="text-gold">python3</code> or activate your virtual environment first.
          </p>
        </div>
      </div>
    </div>
  );
};
