
/**
 * ComfyUI Client Service
 * Handles communication with local ComfyUI_WanAIO instance
 */

// --- TYPES FOR COMFYUI API RESPONSES ---
interface ComfyUIHistoryOutput {
  images?: Array<{ filename: string; subfolder?: string; type?: string }>;
}

interface ComfyUIHistoryData {
  status?: { completed?: boolean };
  outputs?: Record<string, ComfyUIHistoryOutput>;
}

interface ComfyUIHistoryResponse {
  [jobId: string]: ComfyUIHistoryData;
}

export interface ComfyUIConfig {
  serverUrl: string; // e.g., "http://localhost:8188" or "http://192.168.1.100:8188"
  enabled: boolean;
}

export interface ComfyUIWorkflow {
  prompt: string;
  workflow?: Record<string, unknown>; // ComfyUI workflow JSON structure
}

export interface ComfyUIJobStatus {
  job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  result?: string; // URL to generated image
  error?: string;
}

const COMFYUI_CONFIG_KEY = 'beloved_2026_comfyui_config';

// --- CONFIG MANAGEMENT ---
export const getComfyUIConfig = (): ComfyUIConfig => {
  if (typeof window === 'undefined') return { serverUrl: 'http://localhost:8188', enabled: false };
  try {
    const data = localStorage.getItem(COMFYUI_CONFIG_KEY);
    return data ? JSON.parse(data) : { serverUrl: 'http://localhost:8188', enabled: false };
  } catch (e) {
    return { serverUrl: 'http://localhost:8188', enabled: false };
  }
};

export const saveComfyUIConfig = (config: ComfyUIConfig) => {
  try {
    localStorage.setItem(COMFYUI_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save ComfyUI config:', e);
  }
};

// --- CONNECTION TEST ---
export const testComfyUIConnection = async (serverUrl: string): Promise<{ success: boolean; message: string; version?: string }> => {
  try {
    // Test basic connectivity
    const response = await fetch(`${serverUrl}/system_stats`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Server returned status ${response.status}`,
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      message: 'Connected successfully',
      version: data.system?.comfyui_version || 'Unknown',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Connection failed. Make sure ComfyUI is running and accessible.';
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// --- WORKFLOW EXECUTION ---
export const generateImage = async (workflow: ComfyUIWorkflow): Promise<{ success: boolean; jobId?: string; error?: string }> => {
  const config = getComfyUIConfig();
  
  if (!config.enabled) {
    return {
      success: false,
      error: 'ComfyUI integration is not enabled',
    };
  }

  try {
    const response = await fetch(`${config.serverUrl}/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: workflow.workflow || {},
        client_id: `beloved_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to submit workflow: ${response.status}`,
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      jobId: data.prompt_id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// --- JOB STATUS POLLING ---
export const getJobStatus = async (jobId: string): Promise<ComfyUIJobStatus | null> => {
  const config = getComfyUIConfig();
  
  if (!config.enabled) {
    return null;
  }

  try {
    const response = await fetch(`${config.serverUrl}/history/${jobId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        job_id: jobId,
        status: 'failed',
        error: `Failed to get status: ${response.status}`,
      };
    }

    const data: ComfyUIHistoryResponse = await response.json();
    const history = data[jobId];

    if (!history) {
      return {
        job_id: jobId,
        status: 'pending',
      };
    }

    if (history.status?.completed) {
      // Extract output images
      const outputs = history.outputs || {};
      const imageNodes = Object.values(outputs).find((node) => node.images && node.images.length > 0);
      const images = imageNodes?.images || [];
      
      return {
        job_id: jobId,
        status: 'completed',
        result: images.length > 0 ? `${config.serverUrl}/view?filename=${images[0].filename}` : undefined,
      };
    }

    return {
      job_id: jobId,
      status: 'running',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      job_id: jobId,
      status: 'failed',
      error: errorMessage,
    };
  }
};

// --- HELPER: Get available models ---
export const getAvailableModels = async (serverUrl?: string): Promise<{ success: boolean; models?: string[]; error?: string }> => {
  const config = getComfyUIConfig();
  const urlToUse = serverUrl || config.serverUrl;
  
  if (!serverUrl && !config.enabled) {
    return {
      success: false,
      error: 'ComfyUI integration is not enabled',
    };
  }

  try {
    const response = await fetch(`${urlToUse}/object_info`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to get models: ${response.status}`,
      };
    }

    const data = await response.json();
    
    // Extract checkpoint models
    const checkpointLoader = data.CheckpointLoaderSimple;
    const models = checkpointLoader?.input?.required?.ckpt_name?.[0] || [];
    
    return {
      success: true,
      models,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get models';
    return {
      success: false,
      error: errorMessage,
    };
  }
};
