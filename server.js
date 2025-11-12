import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { toFile } from 'openai/uploads';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.static('public'));

let openaiClient;
if (process.env.OPENAI_API_KEY) {
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const STYLES = {
  anime: 'anime cel shaded style with vibrant colors and bold outlines',
  cartoon: 'playful cartoon style with thick outlines and bright colors',
  'line-art': 'clean monochrome line art with minimal shading and crisp outlines'
};

app.post('/api/stickers', async (req, res) => {
  try {
    const { image, style } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image payload is required.' });
    }

    const normalizedStyle = STYLES[style] ? style : 'cartoon';
    const styleDescription = STYLES[normalizedStyle];

    if (!openaiClient) {
      return res.status(200).json({
        placeholder: true,
        message: 'OPENAI_API_KEY not configured. Returning mock sticker preview.',
        image: image
      });
    }

    const dataUrlMatch = /^data:(image\/(png|jpeg|webp));base64,(.+)$/.exec(image);

    if (!dataUrlMatch) {
      return res.status(400).json({
        error:
          "Unsupported image format. Please upload a PNG, JPEG, or WEBP image that doesn't exceed 5 MB."
      });
    }

    const [, mimeType, extension, base64Payload] = dataUrlMatch;
    const imageBuffer = Buffer.from(base64Payload, 'base64');
    const imageBlob = new Blob([imageBuffer], { type: mimeType });

    const prompt = `Transform the subject from the uploaded photo into a ${styleDescription}. Remove the background, add a white contour stroke and prepare it as a sticker-ready design.`;

    const stickerResponse = await openaiClient.images.edit({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
      image: await toFile(imageBlob, `upload.${extension}`)
    });

    const stickerImage = stickerResponse?.data?.[0]?.b64_json;

    if (!stickerImage) {
      return res.status(502).json({ error: 'Sticker generation failed.' });
    }

    res.json({ image: `data:image/png;base64,${stickerImage}` });
  } catch (error) {
    console.error('Sticker generation error:', error);
    res.status(500).json({ error: 'An unexpected error occurred while generating the sticker.' });
  }
});

app.listen(port, () => {
  console.log(`Sticker Dream server running on port ${port}`);
});
