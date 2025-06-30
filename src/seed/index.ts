import { PrismaClient } from '@prisma/client';
import { encriptarContrasena } from '../functions/encriptarContrasena';

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
        name: 'Administrador',
        lastName: 'del Sistema',
        email: 'admin@admin.com',
        cedula: '00000000',
        role: 'SUPER' as const,
        estado: true,
        password: 'admin'
      },
      {
        name: 'Juan Carlos',
        lastName: 'Rodríguez García',
        email: 'juan.rodriguez@universidad.edu',
        cedula: '12345678',
        role: 'SUPER' as const,
        estado: true,
        password: 'password123'
      },
      {
        name: 'María Elena',
        lastName: 'Fernández López',
        email: 'maria.fernandez@universidad.edu',
        cedula: '23456789',
        role: 'EDITOR' as const,
        estado: true,
        password: 'password123'
      },
      {
        name: 'Carlos Alberto',
        lastName: 'Mendoza Silva',
        email: 'carlos.mendoza@universidad.edu',
        cedula: '34567890',
        role: 'EDITOR' as const,
        estado: true,
        password: 'password123'
      },
      {
        name: 'Ana Sofía',
        lastName: 'Torres Vargas',
        email: 'ana.torres@universidad.edu',
        cedula: '45678901',
        role: 'EDITOR' as const,
        estado: true,
        password: 'password123'
      },
      {
        name: 'Roberto',
        lastName: 'Gómez Herrera',
        email: 'roberto.gomez@universidad.edu',
        cedula: '56789012',
        role: 'EDITOR' as const,
        estado: false,
        password: 'password123'
      }
    ];

    for (const userData of usuariosData) {
      const { password, ...userDataWithoutPassword } = userData;
      const hashedPassword = await encriptarContrasena({ password });
      const usuario = await prisma.usuario.create({
        data: {
          ...userDataWithoutPassword,
          password: hashedPassword
        }
      });
      usuarios.push(usuario);
    }

    console.log('👥 6 usuarios creados (incluyendo administrador)');

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

    // 4. Crear trabajos con resúmenes
    const trabajos = [];
    const trabajosData = [
      {
        titulo: 'Implementación de algoritmos de aprendizaje automático para predicción de demanda',
        resumen: 'Este trabajo presenta el desarrollo e implementación de diversos algoritmos de machine learning aplicados a la predicción de demanda en sistemas comerciales. Se analizaron técnicas de regresión lineal, árboles de decisión y redes neuronales artificiales para determinar su efectividad en diferentes escenarios de negocio.\n\nLos resultados obtenidos demuestran que la combinación de múltiples algoritmos mediante ensamblado mejora significativamente la precisión de las predicciones, alcanzando una reducción del error del 15% comparado con métodos tradicionales. La implementación se realizó utilizando Python y librerías especializadas como scikit-learn y TensorFlow.\n\nLas conclusiones indican que la aplicación de estos algoritmos puede optimizar los procesos de planificación empresarial y reducir costos operativos asociados a la gestión de inventarios, proporcionando una herramienta valiosa para la toma de decisiones estratégicas.'
      },
      {
        titulo: 'Desarrollo de aplicaciones web responsivas con tecnologías emergentes',
        resumen: 'La investigación se centra en el desarrollo de aplicaciones web que se adapten eficientemente a diferentes dispositivos y tamaños de pantalla. Se exploraron frameworks modernos como React, Vue.js y Angular, evaluando su rendimiento y capacidad de respuesta en diversos entornos.\n\nSe implementaron técnicas avanzadas de CSS Grid y Flexbox, junto con metodologías de diseño mobile-first para garantizar una experiencia de usuario óptima. Los tests de usabilidad realizados con usuarios reales mostraron una mejora del 40% en la satisfacción del usuario comparado con diseños tradicionales.\n\nEl estudio concluye que la adopción de tecnologías emergentes en el desarrollo web no solo mejora la experiencia del usuario, sino que también optimiza los tiempos de carga y reduce el consumo de recursos, estableciendo nuevos estándares para el desarrollo de aplicaciones web modernas.'
      },
      {
        titulo: 'Análisis de vulnerabilidades en sistemas de información empresariales',
        resumen: 'Esta investigación aborda la identificación y análisis de vulnerabilidades críticas en sistemas de información utilizados por organizaciones empresariales. Se desarrolló una metodología sistemática para evaluar la seguridad de aplicaciones web, bases de datos y sistemas de red, utilizando herramientas especializadas de pentesting.\n\nLos resultados revelan que el 78% de las organizaciones analizadas presentan vulnerabilidades de nivel medio a crítico, principalmente relacionadas con validación de entrada, gestión de sesiones y configuraciones inadecuadas de seguridad. Se identificaron patrones comunes de vulnerabilidades que podrían ser explotadas por atacantes malintencionados.\n\nLas recomendaciones incluyen la implementación de protocolos de seguridad más robustos, capacitación continua del personal de TI y la adopción de marcos de trabajo de seguridad como OWASP. Este estudio proporciona una guía práctica para mejorar la postura de seguridad organizacional.'
      },
      {
        titulo: 'Diseño de arquitecturas IoT escalables para ciudades inteligentes',
        resumen: 'El proyecto investiga el diseño e implementación de arquitecturas de Internet de las Cosas (IoT) que puedan escalar eficientemente para satisfacer las demandas de ciudades inteligentes. Se analizaron diferentes topologías de red, protocolos de comunicación y estrategias de gestión de datos para sistemas IoT a gran escala.\n\nLa propuesta incluye una arquitectura distribuida basada en edge computing que reduce la latencia y mejora la eficiencia energética del sistema. Se implementaron prototipos utilizando sensores ambientales, sistemas de monitoreo de tráfico y dispositivos de gestión energética, logrando una reducción del 30% en el consumo de ancho de banda.\n\nLos resultados demuestran que las arquitecturas IoT bien diseñadas pueden transformar significativamente la gestión urbana, mejorando la calidad de vida de los ciudadanos mientras optimizan el uso de recursos municipales. La escalabilidad propuesta permite la expansión gradual del sistema según las necesidades específicas de cada ciudad.'
      },
      {
        titulo: 'Procesamiento de grandes volúmenes de datos en tiempo real',
        resumen: 'Esta investigación se enfoca en el desarrollo de soluciones para el procesamiento eficiente de big data en tiempo real, utilizando tecnologías distribuidas como Apache Kafka, Apache Spark y Elasticsearch. Se diseñó una arquitectura de procesamiento de streams que puede manejar millones de eventos por segundo manteniendo baja latencia.\n\nLa implementación incluye algoritmos optimizados para el procesamiento paralelo y técnicas de particionamiento de datos que maximizan el rendimiento del sistema. Las pruebas realizadas con datasets de hasta 10TB mostraron una capacidad de procesamiento superior a las soluciones comerciales existentes, con tiempos de respuesta inferiores a 100 milisegundos.\n\nLas aplicaciones prácticas incluyen análisis de logs en tiempo real, detección de fraudes, y monitoreo de sistemas críticos. Los resultados establecen nuevos benchmarks para el procesamiento de big data y proporcionan una base sólida para futuras investigaciones en computación distribuida de alto rendimiento.'
      }
    ];

    const resumenesGenericos = [
      'Esta investigación aborda los desafíos contemporáneos en el campo de la tecnología, presentando soluciones innovadoras basadas en metodologías científicas rigurosas. El estudio incluye análisis comparativos, implementación de prototipos y evaluación de resultados en entornos controlados.\n\nLos hallazgos obtenidos demuestran mejoras significativas en términos de eficiencia, rendimiento y usabilidad comparado con enfoques tradicionales. La metodología aplicada combina técnicas cuantitativas y cualitativas para garantizar la validez de los resultados.\n\nLas conclusiones del trabajo proporcionan contribuciones valiosas al campo de estudio y establecen bases para futuras investigaciones, con potencial de aplicación en diversos sectores industriales y académicos.',
      
      'El presente trabajo desarrolla una propuesta integral para abordar problemáticas específicas del área tecnológica, utilizando enfoques multidisciplinarios que integran teoría y práctica. Se realizaron experimentos controlados y análisis estadísticos para validar las hipótesis planteadas.\n\nLos resultados experimentales muestran mejoras cuantificables en los parámetros evaluados, con reducciones significativas en costos operativos y tiempos de procesamiento. La solución propuesta demuestra escalabilidad y adaptabilidad a diferentes contextos de aplicación.\n\nEl impacto de esta investigación se extiende más allá del ámbito académico, ofreciendo soluciones prácticas que pueden ser implementadas en entornos reales para resolver problemas contemporáneos de manera eficiente.',
      
      'La investigación presenta un análisis exhaustivo de tecnologías emergentes y su aplicación en contextos específicos, evaluando su viabilidad técnica y económica. Se implementaron soluciones prototipo que fueron sometidas a pruebas rigurosas de rendimiento y funcionalidad.\n\nLos experimentos realizados confirman la efectividad de las técnicas propuestas, mostrando mejoras sustanciales en métricas clave de desempeño. El estudio incluye comparaciones con métodos existentes y análisis de casos de uso representativos.\n\nLas implicaciones de este trabajo trascienden el dominio técnico, proporcionando insights valiosos para la toma de decisiones estratégicas y el desarrollo de políticas tecnológicas en organizaciones modernas.'
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

    const titulosBase = [
      'Optimización de algoritmos de clasificación',
      'Arquitecturas de software distribuido',
      'Seguridad en aplicaciones móviles',
      'Sistemas de recomendación inteligentes',
      'Análisis predictivo con machine learning',
      'Interfaces de usuario adaptativos',
      'Integración de sistemas heterogéneos',
      'Automatización de procesos empresariales',
      'Visualización de datos complejos',
      'Desarrollo de APIs RESTful escalables'
    ];

    for (let i = 0; i < 50; i++) {
      const lineaAleatoria = lineasInvestigacion[Math.floor(Math.random() * lineasInvestigacion.length)];
      const periodoAleatorio = periodos[Math.floor(Math.random() * periodos.length)];
      const autorAleatorio = autores[Math.floor(Math.random() * autores.length)];
      
      let titulo, resumen;
      
      // Usar trabajos específicos para los primeros 5, luego generar automáticamente
      if (i < trabajosData.length) {
        titulo = trabajosData[i].titulo;
        resumen = trabajosData[i].resumen;
      } else {
        const tituloBase = titulosBase[Math.floor(Math.random() * titulosBase.length)];
        titulo = `${tituloBase} - Caso de estudio ${i + 1}`;
        resumen = resumenesGenericos[Math.floor(Math.random() * resumenesGenericos.length)];
      }
      
      const trabajo = await prisma.trabajo.create({
        data: {
          titulo,
          autor: autorAleatorio,
          resumen,
          lineaDeInvestigacionId: lineaAleatoria.id,
          estado: Math.random() > 0.3 ? 'validado' as const : 'pendiente' as const, // 70% validados
          doc: `documento_${i + 1}.pdf`,
          periodoAcademicoId: periodoAleatorio.id
        }
      });
      trabajos.push(trabajo);
    }

    console.log('📝 50 trabajos creados con resúmenes');

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