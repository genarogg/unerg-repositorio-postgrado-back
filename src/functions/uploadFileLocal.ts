import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

interface GuardarPDFOptions {
  pdfBase64: string;
  filename?: string;
  uploadDir?: string;
}

/**
 * Guarda un archivo PDF desde contenido base64 con un nombre único
 * @param options - Objeto con el contenido base64, nombre del archivo y directorio
 * @returns Promise<string> - Nombre del archivo guardado con hash único
 */
const guardarArchivoPDF = async (options: GuardarPDFOptions): Promise<string> => {
  const { pdfBase64, filename = 'documento.pdf', uploadDir } = options;

  // Directorio por defecto si no se especifica
  const defaultUploadDir = path.join(process.cwd(), 'public/uploads');
  const finalUploadDir = uploadDir || defaultUploadDir;

  // Crear directorio si no existe
  if (!existsSync(finalUploadDir)) {
    mkdirSync(finalUploadDir, { recursive: true });
  }

  try {
    // Validar que el contenido base64 no esté vacío
    if (!pdfBase64 || pdfBase64.trim() === '') {
      throw new Error('El contenido base64 está vacío');
    }

    // Limpiar el contenido base64 (remover posibles prefijos como "data:application/pdf;base64,")
    let cleanBase64 = pdfBase64;
    if (pdfBase64.includes(',')) {
      cleanBase64 = pdfBase64.split(',')[1];
    }

    // Validar que es base64 válido
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
      throw new Error('El contenido base64 no es válido');
    }

    // Generar un hash único para el nombre del archivo
    const timestamp = Date.now().toString();
    const hash = crypto.createHash('md5')
      .update(filename + timestamp)
      .digest('hex');
    
    const ext = path.extname(filename) || '.pdf';
    const hashedFilename = `${hash}${ext}`;
    const filePath = path.join(finalUploadDir, hashedFilename);

    // Convertir base64 a buffer
    const buffer = Buffer.from(cleanBase64, 'base64');

    // Validar que el buffer no está vacío
    if (buffer.length === 0) {
      throw new Error('El archivo decodificado está vacío');
    }

    // Validar que es un PDF (verificar header)
    const pdfHeader = buffer.subarray(0, 4);
    if (pdfHeader.toString() !== '%PDF') {
      console.warn('⚠️ Advertencia: El archivo puede no ser un PDF válido');
    }

    // Guardar el archivo de forma síncrona
    writeFileSync(filePath, buffer);

    console.log(`✅ Archivo PDF guardado exitosamente: ${hashedFilename}`);
    console.log(`📁 Ruta completa: ${filePath}`);
    console.log(`📊 Tamaño del archivo: ${buffer.length} bytes`);

    return hashedFilename;

  } catch (error) {
    console.error('❌ Error al guardar archivo PDF:', error);
    throw new Error(`Error al guardar el archivo PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

/**
 * Versión alternativa que devuelve tanto el nombre del archivo como la ruta completa
 */
const guardarArchivoPDFConRuta = async (options: GuardarPDFOptions): Promise<{
  filename: string;
  fullPath: string;
  relativePath: string;
}> => {
  const { pdfBase64, filename = 'documento.pdf', uploadDir } = options;

  const defaultUploadDir = path.join(process.cwd(), 'public/uploads');
  const finalUploadDir = uploadDir || defaultUploadDir;

  if (!existsSync(finalUploadDir)) {
    mkdirSync(finalUploadDir, { recursive: true });
  }

  try {
    if (!pdfBase64 || pdfBase64.trim() === '') {
      throw new Error('El contenido base64 está vacío');
    }

    let cleanBase64 = pdfBase64;
    if (pdfBase64.includes(',')) {
      cleanBase64 = pdfBase64.split(',')[1];
    }

    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
      throw new Error('El contenido base64 no es válido');
    }

    const timestamp = Date.now().toString();
    const hash = crypto.createHash('md5')
      .update(filename + timestamp)
      .digest('hex');
    
    const ext = path.extname(filename) || '.pdf';
    const hashedFilename = `${hash}${ext}`;
    const fullPath = path.join(finalUploadDir, hashedFilename);

    const buffer = Buffer.from(cleanBase64, 'base64');

    if (buffer.length === 0) {
      throw new Error('El archivo decodificado está vacío');
    }

    const pdfHeader = buffer.subarray(0, 4);
    if (pdfHeader.toString() !== '%PDF') {
      console.warn('⚠️ Advertencia: El archivo puede no ser un PDF válido');
    }

    writeFileSync(fullPath, buffer);

    // Calcular ruta relativa desde public
    const relativePath = path.relative(path.join(process.cwd(), 'public'), fullPath);

    console.log(`✅ Archivo PDF guardado exitosamente: ${hashedFilename}`);
    console.log(`📁 Ruta completa: ${fullPath}`);
    console.log(`🔗 Ruta relativa: ${relativePath}`);
    console.log(`📊 Tamaño del archivo: ${buffer.length} bytes`);

    return {
      filename: hashedFilename,
      fullPath: fullPath,
      relativePath: relativePath.replace(/\\/g, '/') // Normalizar para URLs
    };

  } catch (error) {
    console.error('❌ Error al guardar archivo PDF:', error);
    throw new Error(`Error al guardar el archivo PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

// Ejemplo de uso en tu endpoint
const ejemploDeUso = async () => {
  try {
    // Usando la función básica
    const filename = await guardarArchivoPDF({
      pdfBase64: 'JVBERi0xLjQKJdPr6eE...', // Tu contenido base64
      filename: 'mi-documento.pdf',
      uploadDir: './uploads/pdfs' // Opcional
    });
    console.log('Archivo guardado:', filename);

    // Usando la función con ruta completa
    const result = await guardarArchivoPDFConRuta({
      pdfBase64: 'JVBERi0xLjQKJdPr6eE...',
      filename: 'mi-documento.pdf'
    });
    console.log('Resultado completo:', result);
    // Output: { filename: 'abc123.pdf', fullPath: '/path/to/file', relativePath: 'uploads/abc123.pdf' }

  } catch (error) {
    console.error('Error:', error);
  }
};

export { guardarArchivoPDF, guardarArchivoPDFConRuta };
export default guardarArchivoPDF;