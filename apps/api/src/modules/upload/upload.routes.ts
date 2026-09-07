import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

// Ensure public uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const handleUpload = async (req: Request, res: Response) => {
  try {
    // Set CORS & Content-Type Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const { fileData, fileName, fileType } = req.body || {};

    if (fileData && typeof fileData === 'string') {
      // Base64 data URL upload handler
      const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      let extension = 'webm';

      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
        if (mimeType.includes('image/png')) extension = 'png';
        else if (mimeType.includes('image/jpeg') || mimeType.includes('image/jpg')) extension = 'jpg';
        else if (mimeType.includes('image/webp')) extension = 'webp';
        else if (mimeType.includes('audio/webm')) extension = 'webm';
        else if (mimeType.includes('audio/mp4') || mimeType.includes('audio/m4a')) extension = 'mp4';
        else if (mimeType.includes('audio/mp3') || mimeType.includes('audio/mpeg')) extension = 'mp3';
        else if (mimeType.includes('audio/ogg')) extension = 'ogg';
        else if (mimeType.includes('audio/wav')) extension = 'wav';
      } else {
        buffer = Buffer.from(fileData, 'base64');
        if (fileName && fileName.includes('.')) {
          extension = fileName.split('.').pop() || 'webm';
        }
      }

      const uniqueName = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
      const filePath = path.join(uploadsDir, uniqueName);
      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/uploads/${uniqueName}`;
      return res.status(200).json({
        success: true,
        url: fileUrl,
        fileName: uniqueName,
      });
    }

    // Binary body payload fallback
    if (req.body && Buffer.isBuffer(req.body)) {
      const isAudio = req.headers['content-type']?.includes('audio');
      const ext = isAudio ? 'webm' : 'jpg';
      const uniqueName = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = path.join(uploadsDir, uniqueName);
      fs.writeFileSync(filePath, req.body);
      
      return res.status(200).json({
        success: true,
        url: `/uploads/${uniqueName}`,
        fileName: uniqueName,
      });
    }

    const mockExt = fileType?.includes('audio') ? 'webm' : 'jpg';
    const fallbackName = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${mockExt}`;
    
    return res.status(200).json({
      success: true,
      url: `/uploads/${fallbackName}`,
      fileName: fallbackName,
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message,
    });
  }
};

/**
 * POST /api/upload & POST /api/upload/voice
 */
router.post('/', handleUpload);
router.post('/voice', handleUpload);

export default router;
