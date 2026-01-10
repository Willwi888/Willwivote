<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1hxjiQspirYLY0JNF6XmW_pzJdQOyZZKR

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## ComfyUI Integration

This application supports integration with local ComfyUI instances for AI image generation. See [COMFYUI_INTEGRATION.md](./COMFYUI_INTEGRATION.md) for detailed setup instructions.

### Quick Setup

1. Install and run ComfyUI with network access: `python main.py --listen 0.0.0.0 --port 8188`
2. Open the Admin panel (password: `8888`)
3. Navigate to the **ComfyUI** tab
4. Enter your server URL (e.g., `http://localhost:8188`)
5. Test connection and enable integration
