# ComfyUI Integration Guide

## Overview

This application now supports integration with local ComfyUI instances. ComfyUI is a powerful node-based interface for Stable Diffusion that can be used for AI image generation.

## What is ComfyUI_WanAIO?

ComfyUI is an AI image generation tool that runs locally on your computer. The "WanAIO" reference typically refers to running ComfyUI on your local network (LAN/WAN) so it can be accessed by other devices.

## Setup Instructions

### 1. Install ComfyUI

First, you need to have ComfyUI installed on your local machine or server. Visit [ComfyUI GitHub](https://github.com/comfyanonymous/ComfyUI) for installation instructions.

### 2. Enable Network Access

By default, ComfyUI only accepts connections from localhost (`127.0.0.1`). To allow this application to connect to ComfyUI, you need to start ComfyUI with network access enabled:

```bash
python main.py --listen 0.0.0.0 --port 8188
```

Or if you're using a portable version, edit your launch script (e.g., `run_nvidia_gpu.bat`) and add the `--listen` flag:

```bash
python main.py --listen
```

### 3. Configure in Admin Panel

1. Log in to the Admin panel (password: `8888`)
2. Navigate to the **ComfyUI** tab
3. Enter your ComfyUI server URL:
   - For local access: `http://localhost:8188`
   - For LAN access: `http://192.168.1.100:8188` (replace with your computer's IP)
4. Click "Test Connection" to verify the connection
5. Enable the integration using the toggle switch
6. Click "Save Settings"

## Features

### Connection Testing

The integration includes a connection test feature that:
- Verifies ComfyUI is running and accessible
- Displays the ComfyUI version
- Lists available AI models

### Available APIs

The ComfyUI integration provides the following capabilities:

1. **Image Generation**: Submit workflows to generate images
2. **Job Status Monitoring**: Track the progress of generation jobs
3. **Model Discovery**: List available Stable Diffusion models

## Security Notes

- **Network Security**: When running ComfyUI with `--listen 0.0.0.0`, any device on your network can access it. Ensure you trust your network and its users.
- **Firewall**: Consider adding firewall rules to restrict access if needed.
- **Local Storage**: ComfyUI configuration is stored in browser local storage and is not synced to the cloud.

## Troubleshooting

### Connection Failed

If the connection test fails:

1. **Check ComfyUI is running**: Make sure ComfyUI is actively running on your machine
2. **Verify the URL**: Ensure you're using the correct IP address and port
3. **Check firewall**: Your firewall might be blocking the connection
4. **Try localhost first**: If accessing from the same machine, try `http://localhost:8188` first
5. **Check the port**: ComfyUI typically runs on port `8188`, but it might be different in your setup

### CORS Issues

If you encounter CORS (Cross-Origin Resource Sharing) errors:
- This usually means ComfyUI is not configured to accept connections from your web application's domain
- Make sure you started ComfyUI with the `--listen` flag

## API Reference

### Configuration

```typescript
interface ComfyUIConfig {
  serverUrl: string; // ComfyUI server URL
  enabled: boolean;  // Enable/disable integration
}
```

### Available Functions

- `testComfyUIConnection(serverUrl)`: Test connection to ComfyUI
- `getAvailableModels()`: List available AI models
- `generateImage(workflow)`: Submit an image generation workflow
- `getJobStatus(jobId)`: Check the status of a generation job

## Use Cases

This integration enables:
- AI-generated album artwork
- Custom profile pictures
- Promotional materials
- Music video thumbnails
- Social media content

## Future Enhancements

Potential future features:
- Direct album cover generation from song metadata
- Batch image generation for multiple tracks
- Custom workflow templates
- Image style transfer
- Automatic image optimization for web

## Support

For ComfyUI-specific issues, refer to:
- [ComfyUI GitHub](https://github.com/comfyanonymous/ComfyUI)
- [ComfyUI Wiki](https://comfyui-wiki.com/)

For integration issues with this application, contact the development team.
