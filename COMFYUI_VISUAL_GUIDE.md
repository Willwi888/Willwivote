# ComfyUI Integration - Visual Guide

## Admin Panel - ComfyUI Tab

The ComfyUI integration is accessible from the Admin panel:

1. **Login**: Navigate to the admin panel and login with password `8888`
2. **ComfyUI Tab**: Click on the "ComfyUI" tab in the navigation
3. **Configuration Panel**: You'll see the following options:

### Configuration Interface

```
┌─────────────────────────────────────────────────────────┐
│  ComfyUI Integration                                     │
│  Connect to a local ComfyUI instance for AI generation   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  [ Enable ComfyUI Integration ]          [Toggle Switch] │
│                                                           │
│  Server URL:                                              │
│  [http://localhost:8188                               ]   │
│  Examples: http://localhost:8188 or                      │
│           http://192.168.1.100:8188                      │
│                                                           │
│  [Test Connection]  [Save Settings]                      │
│                                                           │
│  ✓ Connected successfully                                │
│    ComfyUI Version: 0.x.x                                │
│                                                           │
│  Available Models (12):                                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │ • model_checkpoint_v1.safetensors                │    │
│  │ • sd_xl_base_1.0.safetensors                     │    │
│  │ • ...                                             │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  📖 Setup Instructions                                    │
│  1. Install and run ComfyUI                              │
│  2. Enable LAN access with --listen flag                 │
│  3. Enter server URL above                               │
│  4. Test connection and save                             │
│                                                           │
│  Example Launch Command:                                  │
│  python main.py --listen 0.0.0.0 --port 8188            │
└─────────────────────────────────────────────────────────┘
```

## Features

### Connection Testing
- Real-time connection validation
- Version detection
- Error messages with troubleshooting hints

### Model Discovery
- Lists all available Stable Diffusion models
- Automatically detected from ComfyUI server

### Security Features
- Enable/disable toggle for safety
- Configuration stored locally only
- Clear setup instructions

## Usage Flow

1. **Install ComfyUI** on your local machine
2. **Start with network access**: `python main.py --listen 0.0.0.0 --port 8188`
3. **Open Admin Panel** in the voting app
4. **Configure ComfyUI** in the ComfyUI tab
5. **Test Connection** to verify setup
6. **Enable Integration** and save

## API Integration Points

The integration provides these capabilities:
- Image generation from prompts
- Job status monitoring
- Model listing and selection
- Direct connection to local ComfyUI instance

## Security Considerations

⚠️ **Important**: When running ComfyUI with `--listen 0.0.0.0`, it's accessible to all devices on your local network. Ensure your network is secure.

## Troubleshooting

Common issues and solutions:
- **Connection Failed**: Ensure ComfyUI is running and accessible
- **CORS Errors**: Make sure ComfyUI was started with `--listen` flag
- **Port Issues**: Verify ComfyUI is running on the correct port (default: 8188)
- **Firewall**: Check firewall settings if connection fails

## Future Enhancements

Potential features:
- Album cover generation from song metadata
- Batch processing for multiple tracks
- Custom workflow templates
- Integration with song management
