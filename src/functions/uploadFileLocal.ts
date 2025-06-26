import { createWriteStream, mkdirSync, existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

interface Upload {
  file: {
    filename: string;
    createReadStream: () => any;
  };
}

/**
 * Guarda un archivo subido en el directorio de uploads con un nombre único
 * @param file - Objeto Upload con la información del archivo
 * @param uploadDir - Directorio donde guardar el archivo (opcional, por defecto usa uploads)
 * @returns Promise<string> - Nombre del archivo guardado con hash único
 */
 const guardarArchivo = async (
  file: Upload,
  uploadDir?: string
): Promise<string> => {
  const { createReadStream, filename } = file.file;

  // Directorio por defecto si no se especifica
  const defaultUploadDir = path.join(process.cwd(), 'public/uploads');
  const finalUploadDir = uploadDir || defaultUploadDir;

  // Crear directorio si no existe
  if (!existsSync(finalUploadDir)) {
    mkdirSync(finalUploadDir, { recursive: true });
  }

  // Generar un hash único para el nombre del archivo
  const hash = crypto.createHash('md5').update(filename + Date.now().toString()).digest('hex');
  const ext = path.extname(filename);
  const hashedFilename = `${hash}${ext}`;
  const filePath = path.join(finalUploadDir, hashedFilename);
  const stream = createReadStream();

  return new Promise((resolve, reject) => {
    const writeStream = createWriteStream(filePath);
    stream.pipe(writeStream);
    writeStream.on('finish', () => resolve(hashedFilename));
    writeStream.on('error', reject);
  });
};

export default guardarArchivo;