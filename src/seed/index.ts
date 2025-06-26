import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Iniciando el proceso de siembra...');

    // Limpiar datos existentes
    await prisma.estadistica.deleteMany();
    await prisma.trabajo.deleteMany();
    await prisma.periodoAcademico.deleteMany();
    await prisma.lineasDeInvestigacion.deleteMany();
    await prisma.bitacora.deleteMany();
    await prisma.usuario.deleteMany();

    console.log('🗑️  Datos existentes eliminados');

    // 1. Crear usuarios
    const usuarios = [];
    const usuariosData = [
      {
        name: 'Juan Carlos',
        lastName: 'Rodríguez García',
        email: 'juan.rodriguez@universidad.edu',
        cedula: '12345678',
        role: 'SUPER' as const,
        estado: true
      },
      {
        name: 'María Elena',
        lastName: 'Fernández López',
        email: 'maria.fernandez@universidad.edu',
        cedula: '23456789',
        role: 'EDITOR' as const,
        estado: true
      },
      {
        name: 'Carlos Alberto',
        lastName: 'Mendoza Silva',
        email: 'carlos.mendoza@universidad.edu',
        cedula: '34567890',
        role: 'EDITOR' as const,
        estado: true
      },
      {
        name: 'Ana Sofía',
        lastName: 'Torres Vargas',
        email: 'ana.torres@universidad.edu',
        cedula: '45678901',
        role: 'EDITOR' as const,
        estado: true
      },
      {
        name: 'Roberto',
        lastName: 'Gómez Herrera',
        email: 'roberto.gomez@universidad.edu',
        cedula: '56789012',
        role: 'EDITOR' as const,
        estado: false
      }
    ];

    for (const userData of usuariosData) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const usuario = await prisma.usuario.create({
        data: {
          ...userData,
          password: hashedPassword
        }
      });
      usuarios.push(usuario);
    }

    console.log('👥 5 usuarios creados');

    // 2. Crear períodos académicos
    const periodos = [];
    const periodosData = [
      '2020-1', '2020-2', '2021-1', '2021-2', '2022-1',
      '2022-2', '2023-1', '2023-2', '2024-1', '2024-2'
    ];

    for (const periodo of periodosData) {
      const periodoAcademico = await prisma.periodoAcademico.create({
        data: { periodo }
      });
      periodos.push(periodoAcademico);
    }

    console.log('📅 10 períodos académicos creados');

    // 3. Crear líneas de investigación
    const lineasInvestigacion = [];
    const lineasData = [
      'Inteligencia Artificial y Machine Learning',
      'Desarrollo de Software y Metodologías Ágiles',
      'Ciberseguridad y Protección de Datos',
      'Internet de las Cosas (IoT)',
      'Análisis de Datos y Big Data',
      'Realidad Virtual y Aumentada',
      'Computación en la Nube',
      'Blockchain y Criptomonedas',
      'Robótica y Automatización',
      'Sistemas Distribuidos y Microservicios'
    ];

    for (let i = 0; i < lineasData.length; i++) {
      const lineaInvestigacion = await prisma.lineasDeInvestigacion.create({
        data: {
          nombre: lineasData[i],
          estado: Math.random() > 0.1, // 90% activas
          usuarioId: usuarios[i % usuarios.length].id
        }
      });
      lineasInvestigacion.push(lineaInvestigacion);
    }

    console.log('🔬 10 líneas de investigación creadas');

    // 4. Crear trabajos
    const trabajos = [];
    const titulosBase = [
      'Implementación de algoritmos de aprendizaje automático',
      'Desarrollo de aplicaciones web responsivas',
      'Análisis de vulnerabilidades en sistemas',
      'Diseño de arquitecturas IoT escalables',
      'Procesamiento de grandes volúmenes de datos',
      'Aplicaciones inmersivas con realidad virtual',
      'Migración de aplicaciones a la nube',
      'Implementación de contratos inteligentes',
      'Control autónomo de sistemas robóticos',
      'Arquitecturas de microservicios distribuidos'
    ];

    const autores = [
      'García Martínez, Pedro',
      'López Hernández, Carmen',
      'Rodríguez Silva, Miguel',
      'Fernández Castro, Laura',
      'Martín González, Diego',
      'Sánchez Ruiz, Patricia',
      'Jiménez Moreno, Rafael',
      'Muñoz Delgado, Isabel',
      'Romero Vega, Alejandro',
      'Torres Navarro, Beatriz',
      'Vargas Ortega, Francisco',
      'Herrera Jiménez, Rosa',
      'Guerrero Pérez, Javier',
      'Morales Ramos, Lucía',
      'Castro Medina, Antonio'
    ];

    for (let i = 0; i < 50; i++) {
      const lineaAleatoria = lineasInvestigacion[Math.floor(Math.random() * lineasInvestigacion.length)];
      const periodoAleatorio = periodos[Math.floor(Math.random() * periodos.length)];
      const autorAleatorio = autores[Math.floor(Math.random() * autores.length)];
      const tituloBase = titulosBase[Math.floor(Math.random() * titulosBase.length)];
      
      const trabajo = await prisma.trabajo.create({
        data: {
          titulo: `${tituloBase} - Caso de estudio ${i + 1}`,
          autor: autorAleatorio,
          lineaDeInvestigacionId: lineaAleatoria.id,
          estado: Math.random() > 0.3 ? 'validado' as const : 'pendiente' as const, // 70% validados
          doc: `documento_${i + 1}.pdf`,
          periodoAcademicoId: periodoAleatorio.id
        }
      });
      trabajos.push(trabajo);
    }

    console.log('📝 50 trabajos creados');

    // 5. Crear estadísticas por línea de investigación
    for (const linea of lineasInvestigacion) {
      const trabajosDeLinea = trabajos.filter(t => t.lineaDeInvestigacionId === linea.id);
      const cantidadTrabajos = trabajosDeLinea.length;
      const porcentaje = (cantidadTrabajos / trabajos.length) * 100;

      await prisma.estadistica.create({
        data: {
          lineaDeInvestigacionId: linea.id,
          cantidadTrabajos,
          porcentaje: parseFloat(porcentaje.toFixed(2))
        }
      });
    }

    console.log('📊 Estadísticas generadas');

    // 6. Crear entradas de bitácora
    const acciones = [
      'LOGIN', 'LOGOUT', 'CREAR_TRABAJO', 'VALIDAR_TRABAJO', 
      'CREAR_LINEA', 'MODIFICAR_LINEA', 'GENERAR_REPORTE'
    ];

    const ips = [
      '192.168.1.100', '192.168.1.101', '10.0.0.50', 
      '172.16.0.25', '192.168.0.200'
    ];

    for (let i = 0; i < 25; i++) {
      const usuarioAleatorio = usuarios[Math.floor(Math.random() * usuarios.length)];
      const accionAleatoria = acciones[Math.floor(Math.random() * acciones.length)];
      const ipAleatoria = ips[Math.floor(Math.random() * ips.length)];
      
      // Fecha aleatoria en los últimos 30 días
      const fechaAleatoria = new Date();
      fechaAleatoria.setDate(fechaAleatoria.getDate() - Math.floor(Math.random() * 30));

      await prisma.bitacora.create({
        data: {
          usuarioId: usuarioAleatorio.id,
          accion: accionAleatoria,
          ip: ipAleatoria,
          hora: fechaAleatoria,
          mensaje: `${accionAleatoria} ejecutada por ${usuarioAleatorio.name}`
        }
      });
    }

    console.log('📋 25 entradas de bitácora creadas');

    // Mostrar resumen
    const resumen = await Promise.all([
      prisma.usuario.count(),
      prisma.lineasDeInvestigacion.count(),
      prisma.periodoAcademico.count(),
      prisma.trabajo.count(),
      prisma.estadistica.count(),
      prisma.bitacora.count()
    ]);

    console.log('\n🎉 ¡Siembra completada exitosamente!');
    console.log('📈 Resumen de datos creados:');
    console.log(`   👥 Usuarios: ${resumen[0]}`);
    console.log(`   🔬 Líneas de investigación: ${resumen[1]}`);
    console.log(`   📅 Períodos académicos: ${resumen[2]}`);
    console.log(`   📝 Trabajos: ${resumen[3]}`);
    console.log(`   📊 Estadísticas: ${resumen[4]}`);
    console.log(`   📋 Entradas de bitácora: ${resumen[5]}`);

  } catch (error) {
    console.error('❌ Error durante la siembra:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seed;