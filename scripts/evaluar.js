#!/usr/bin/env node
/**
 * ============================================================================
 * EVALUADOR PEDAGÓGICO DE CÓDIGO — SOPORTE TÉCNICO UETS (2026–2027)
 * Validador Modular y Auto-Sincronizable para Semana 03 (Ojos OLED & FSM)
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const REPO_RAW_BASE = 'https://raw.githubusercontent.com/UETS-Soporte-Tecnico/03-ojos-oled/main/scripts/evaluar.js';
const rootDir = path.resolve(__dirname, '..');

// Colores ANSI
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m'
};

async function syncEvaluator() {
  const localPath = __filename;
  try {
    await new Promise((resolve) => {
      const req = https.get(REPO_RAW_BASE, { timeout: 3000 }, (res) => {
        if (res.statusCode === 200) {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            const currentData = fs.readFileSync(localPath, 'utf8');
            if (data && data.length > 200 && data !== currentData) {
              console.log(`${c.cyan}🔄 Actualizando script de evaluación con la última versión de GitHub...${c.reset}\n`);
              fs.writeFileSync(localPath, data, 'utf8');
            }
            resolve();
          });
        } else {
          resolve();
        }
      });
      req.on('error', () => resolve());
      req.on('timeout', () => { req.destroy(); resolve(); });
    });
  } catch {
    // Si no hay red o da timeout, continúa normalmente con el script local
  }
}

function leerArchivo(relPath) {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf8');
}

let violaciones = [];
function checkForbidden(content, file) {
  if (/c\+\+/i.test(content)) {
    violaciones.push(`Archivo '${file}' contiene 'C++'. Usar siempre 'código de Arduino'.`);
  }
  if (/baymax/i.test(content)) {
    violaciones.push(`Archivo '${file}' contiene 'Baymax'. Usar nomenclatura neutral 'Sistema Embebido ESP32'.`);
  }
  if (/socr[aá]t/i.test(content)) {
    violaciones.push(`Archivo '${file}' contiene jerga 'socrática'. Usar 'Preguntas Guía' o 'Preguntas de Pizarra'.`);
  }
}

async function run() {
  await syncEvaluator();

  console.log(`\n${c.bold}${c.cyan}======================================================================${c.reset}`);
  console.log(`${c.bold}${c.cyan} 🤖 REPORTE PEDAGÓGICO DE ENTREGA — SOPORTE TÉCNICO UETS (3° BGU)    ${c.reset}`);
  console.log(`${c.bold}${c.cyan}    Semana 03: Expresiones Oculares OLED SSD1306 con FSM y Serial Debug${c.reset}`);
  console.log(`${c.bold}${c.cyan}======================================================================${c.reset}\n`);

  let puntaje = 0;
  const retos = [];

  // 1. Auditoría de Reglas Institucionales
  const filesToAudit = ['src/logboot.h', 'src/eyes.h', 'src/main.ino', 'README.md', 'CHEATSHEET_ESTUDIANTE.md'];
  for (const f of filesToAudit) {
    const cont = leerArchivo(f);
    if (cont) checkForbidden(cont, f);
  }

  // 2. Verificación de Estructura de Archivos
  const logbootCont = leerArchivo('src/logboot.h');
  const eyesCont = leerArchivo('src/eyes.h');
  const mainCont = leerArchivo('src/main.ino');

  function stripComments(code) {
    if (!code) return '';
    return code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  }

  const activeCode = stripComments(mainCont);

  // RETO 01: Inicialización, POST y Expresión Normal (1.00 pt)
  let r1Pass = false;
  let r1Msg = '';
  if (!logbootCont || !eyesCont || !mainCont) {
    r1Msg = 'Faltan archivos esenciales en src/ (logboot.h, eyes.h, main.ino).';
  } else if (!/runSystemPOST\s*\(/.test(activeCode)) {
    r1Msg = 'main.ino no ejecuta el auto-diagnóstico POST durante el arranque. Completa el TODO 1.1.';
  } else if (!/eye_normal/.test(activeCode)) {
    r1Msg = 'main.ino no renderiza activamente el mapa de bits de la mirada base. Completa el TODO 1.2.';
  } else {
    r1Pass = true;
    puntaje += 1.0;
  }
  retos.push({ id: 'RETO 01', name: 'POST de Arranque & Mirada Base (eye_normal)', ok: r1Pass, msg: r1Msg, pts: 1.0 });

  // RETO 02: Expresiones Reactivas (1.00 pt)
  let r2Pass = false;
  let r2Msg = '';
  if (!mainCont) {
    r2Msg = 'No se encontró main.ino.';
  } else if (!/eye_happy/.test(activeCode) || !/eye_alert/.test(activeCode)) {
    r2Msg = 'Faltan llamadas activas a las expresiones de felicidad o de alerta. Completa el TODO 2.1 y TODO 4.2.';
  } else {
    r2Pass = true;
    puntaje += 1.0;
  }
  retos.push({ id: 'RETO 02', name: 'Modularización de Expresiones Reactivas (Happy / Alert)', ok: r2Pass, msg: r2Msg, pts: 1.0 });

  // RETO 03: Parpadeo y Miradas Direccionales (1.50 pts)
  let r3Pass = false;
  let r3Msg = '';
  if (!mainCont) {
    r3Msg = 'No se encontró main.ino.';
  } else if (!/eye_blink/.test(activeCode) || (!/eye_look_left/.test(activeCode) && !/eye_look_right/.test(activeCode))) {
    r3Msg = 'Faltan llamadas activas al parpadeo o a las miradas direccionales (izquierda / derecha). Completa los TODOs del Reto 03.';
  } else {
    r3Pass = true;
    puntaje += 1.5;
  }
  retos.push({ id: 'RETO 03', name: 'Secuencia de Parpadeo y Miradas Direccionales', ok: r3Pass, msg: r3Msg, pts: 1.5 });

  // RETO 04: FSM No Bloqueante con millis() y Serial Debug (1.50 pts)
  let r4Pass = false;
  let r4Msg = '';
  if (!mainCont) {
    r4Msg = 'No se encontró main.ino.';
  } else if (!/millis\s*\(\)/.test(activeCode)) {
    r4Msg = 'main.ino no utiliza temporización no bloqueante por tiempo transcurrido.';
  } else if (!/debugEyesSerial|Serial\.read/.test(activeCode)) {
    r4Msg = 'main.ino no implementa la función de depuración interactiva por el puerto serie.';
  } else {
    r4Pass = true;
    puntaje += 1.5;
  }
  retos.push({ id: 'RETO 04', name: 'Máquina de Estados con millis() & Debug Serial para IA', ok: r4Pass, msg: r4Msg, pts: 1.5 });

  // Despliegue de resultados
  for (const r of retos) {
    const badge = r.ok ? `${c.green}✅ APROBADO${c.reset}` : `${c.red}❌ PENDIENTE${c.reset}`;
    console.log(`[${r.id}] ${badge} - ${r.name}`);
    if (!r.ok && r.msg) {
      console.log(`        ${c.yellow}⚠️ Pista: ${r.msg}${c.reset}`);
    }
  }

  console.log(`\n${c.bold}----------------------------------------------------------------------${c.reset}`);
  console.log(`🏆 ${c.bold}PUNTAJE EN CÓDIGO (BLOQUE A):${c.reset} ${puntaje.toFixed(2)} / 5.00 PUNTOS`);
  console.log(`📹 ${c.bold}BLOQUE B (VIDEO SCREENCAST):${c.reset}  5.00 PUNTOS (Sustentación oral de 4 min)`);
  console.log(`${c.bold}----------------------------------------------------------------------${c.reset}`);

  if (violaciones.length > 0) {
    console.log(`\n${c.red}${c.bold}🚨 AUDITORÍA INSTITUCIONAL: Se detectaron términos no conformes:${c.reset}`);
    for (const v of violaciones) {
      console.log(`  - ${c.yellow}${v}${c.reset}`);
    }
    console.log(`${c.gray}Corrige estos términos para asegurar la máxima nota en tu entrega.${c.reset}\n`);
    process.exit(1);
  }

  if (puntaje >= 5.0) {
    console.log(`\n${c.green}${c.bold}🎉 ¡EXCELENTE! Has completado todos los retos de la Semana 03.${c.reset}`);
    console.log(`💡 Siguiente paso: Graba tu video demostrativo explicando el conexionado, el monitor serie y abre tu Pull Request.\n`);
    process.exit(0);
  } else {
    console.log(`\n${c.yellow}💡 Completa los TODOs pendientes en src/main.ino y vuelve a ejecutar: pnpm test\n${c.reset}`);
    process.exit(0);
  }
}

run();
