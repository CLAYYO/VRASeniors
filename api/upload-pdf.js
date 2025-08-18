import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import formidable from 'formidable';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      filter: ({ mimetype }) => mimetype && mimetype.includes('pdf'),
    });

    const [fields, files] = await form.parse(req);
    const pdfFile = files.pdf?.[0];

    if (!pdfFile) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    // Ensure the pdfs directory exists
    const pdfsDir = path.join(process.cwd(), 'public', 'pdfs');
    if (!existsSync(pdfsDir)) {
      await mkdir(pdfsDir, { recursive: true });
    }

    // Generate a safe filename
    const originalName = pdfFile.originalFilename || 'document.pdf';
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const filename = `${timestamp}_${sanitizedName}`;
    const filepath = path.join(pdfsDir, filename);

    // Read the file and write it to the destination
    const fileBuffer = await readFile(pdfFile.filepath);
    await writeFile(filepath, fileBuffer);

    res.status(200).json({
      success: true,
      filename: filename,
      originalName: originalName,
      size: pdfFile.size
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
}

// Helper function to read file
async function readFile(filepath) {
  const { readFile } = await import('fs/promises');
  return readFile(filepath);
}