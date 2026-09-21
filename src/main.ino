/**
 * ============================================================================
 * MAIN.INO — STARTER KIT SEMANA 03: OJOS ROBÓTICOS OLED SSD1306
 * Soporte Técnico (3° BGU Técnico) — Unidad Educativa Técnico Salesiano
 * ============================================================================
 * Instrucciones:
 * 1. Completa cada uno de los bloques marcados con '// TODO:'
 * 2. Compila con PlatformIO (botón Build ✔)
 * 3. Simula en Wokwi Simulator abriendo diagram.json
 * 4. Valida tu entrega ejecutando en terminal: pnpm test
 * ============================================================================
 */

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#include "logboot.h"
#include "eyes.h"

// Instancia global del display OLED SSD1306 (128x64)
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ============================================================================
// DEFINICIÓN DE ESTADOS Y CONTROL DE ANIMACIÓN
// ============================================================================
enum EyeState {
  STATE_NORMAL,
  STATE_HAPPY,
  STATE_ALERT,
  STATE_SLEEPY,
  STATE_BLINK,
  STATE_LOOK_LEFT,
  STATE_LOOK_RIGHT,
  STATE_EXCITED
};

EyeState currentState = STATE_NORMAL;
bool modoAutonomo = true; // Permite alternar entre animación autónoma y control serial
unsigned long previousMillis = 0;
const unsigned long INTERVALO_ANIMACION = 2500;
int pasoSecuencia = 0;

// ============================================================================
// RETO 04: FUNCIÓN SERIAL DEBUG (Control manual y enlace con IA)
// ============================================================================
void debugEyesSerial() {
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    if (cmd == '\r' || cmd == '\n' || cmd == ' ') return;

    // Al recibir un comando, se pausa temporalmente la FSM autónoma
    modoAutonomo = false;

    switch (cmd) {
      case '1':
      case 'N':
      case 'n':
        currentState = STATE_NORMAL;
        drawEyeExpression(display, eye_normal);
        Serial.println(F("[SERIAL DEBUG] Expresión cambiada a: NORMAL"));
        break;

      case '2':
      case 'H':
      case 'h':
        // TODO 4.2: Conmuta el estado a STATE_HAPPY y renderiza eye_happy con drawEyeExpression():
        currentState = STATE_HAPPY; drawEyeExpression(display, eye_happy); Serial.println(F("[SERIAL DEBUG] Expresión cambiada a: FELIZ"));
        break;

      case '3':
      case 'A':
      case 'a':
        // TODO 4.3: Conmuta el estado a STATE_ALERT y renderiza eye_alert con drawEyeExpression():
        // currentState = ...;
        // drawEyeExpression(display, ...);
        // Serial.println(F("[SERIAL DEBUG] Expresión cambiada a: ALERTA"));
        break;

      case '4':
      case 'S':
      case 's':
        currentState = STATE_SLEEPY;
        drawEyeExpression(display, eye_sleepy);
        Serial.println(F("[SERIAL DEBUG] Expresión cambiada a: REPOSO (Sleepy)"));
        break;

      case '5':
      case 'B':
      case 'b':
        currentState = STATE_BLINK;
        drawEyeExpression(display, eye_blink);
        Serial.println(F("[SERIAL DEBUG] Expresión cambiada a: PARPADEO (Blink)"));
        break;

      case '6':
      case 'L':
      case 'l':
        // TODO 4.4: Conmuta el estado a STATE_LOOK_LEFT y renderiza eye_look_left:
        // currentState = ...;
        // drawEyeExpression(display, ...);
        break;

      case '7':
      case 'R':
      case 'r':
        currentState = STATE_LOOK_RIGHT;
        drawEyeExpression(display, eye_look_right);
        Serial.println(F("[SERIAL DEBUG] Expresión cambiada a: MIRADA DERECHA"));
        break;

      case '8':
      case 'E':
      case 'e':
        currentState = STATE_EXCITED;
        drawEyeExpression(display, eye_excited);
        Serial.println(F("[SERIAL DEBUG] Expresión cambiada a: EMOCIONADO (Excited)"));
        break;

      case '0':
      case 'M':
      case 'm':
        modoAutonomo = true;
        previousMillis = millis();
        Serial.println(F("[SERIAL DEBUG] Modo Autónomo reactivado (Animación FSM activa)"));
        break;

      default:
        Serial.print(F("[SERIAL DEBUG] Comando desconocido: "));
        Serial.println(cmd);
        break;
    }
  }
}

// ============================================================================
// RETOS 02 Y 03: MÁQUINA DE ESTADOS FINITOS (FSM) NO BLOQUEANTE
// ============================================================================
void ejecutarSecuenciaAutonoma() {
  pasoSecuencia = (pasoSecuencia + 1) % 6;

  switch (pasoSecuencia) {
    case 0:
      // Reto 01: Expresión Normal
      currentState = STATE_NORMAL;
      drawEyeExpression(display, eye_normal);
      break;

    case 1:
      // Reto 03: Parpadeo
      // TODO 3.1: Actualiza currentState a STATE_BLINK y dibuja eye_blink:
      // currentState = ...;
      // drawEyeExpression(display, ...);
      break;

    case 2:
      // Reto 03: Mirada Izquierda
      // TODO 3.2: Actualiza currentState a STATE_LOOK_LEFT y dibuja eye_look_left:
      // currentState = ...;
      // drawEyeExpression(display, ...);
      break;

    case 3:
      // Retorno a Normal
      currentState = STATE_NORMAL;
      drawEyeExpression(display, eye_normal);
      break;

    case 4:
      // Reto 03: Mirada Derecha
      currentState = STATE_LOOK_RIGHT;
      drawEyeExpression(display, eye_look_right);
      break;

    case 5:
      // Reto 02: Expresión Feliz
      // TODO 2.1: Actualiza currentState a STATE_HAPPY y dibuja eye_happy:
      // currentState = ...;
      // drawEyeExpression(display, ...);
      break;
  }
}

// ============================================================================
// RETO 01: SETUP (Inicialización, POST y mirada base)
// ============================================================================
void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 1000);

  // Inicializar periféricos y pantalla
  if (!initDiagnostics(display)) {
    Serial.println(F("[FALLO CRÍTICO] Error al inicializar pantalla OLED."));
    while (true) delay(100);
  }

  // TODO 1.1: Invoca la función obligatoria de auto-diagnóstico (Power-On Self-Test):
  // runSystemPOST(display);

  // Menú de ayuda por Serial Monitor
  Serial.println(F("\n======================================================="));
  Serial.println(F("🤖 SISTEMA EMBEBIDO ESP32 — TELEMETRÍA Y CONTROL DE OJOS"));
  Serial.println(F("======================================================="));
  Serial.println(F("Comandos Serial interactivos (Debug / Control de IA):"));
  Serial.println(F("  '1' o 'N' -> Ojos Normales (Neutro)"));
  Serial.println(F("  '2' o 'H' -> Ojos Felices (Empatía)"));
  Serial.println(F("  '3' o 'A' -> Ojos Alerta (Atención/Peligro)"));
  Serial.println(F("  '4' o 'S' -> Ojos Reposo (Sleepy)"));
  Serial.println(F("  '5' o 'B' -> Parpadeo (Blink)"));
  Serial.println(F("  '6' o 'L' -> Mirar Izquierda"));
  Serial.println(F("  '7' o 'R' -> Mirar Derecha"));
  Serial.println(F("  '8' o 'E' -> Ojos Emocionados (Excited)"));
  Serial.println(F("  '0' o 'M' -> Alternar Modo Autónomo (FSM millis)"));
  Serial.println(F("=======================================================\n"));

  // TODO 1.2: Dibuja la expresión neutra base para arrancar (eye_normal):
  // drawEyeExpression(display, eye_normal);

  previousMillis = millis();
}

// ============================================================================
// LOOP: Procesamiento continuo sin delay()
// ============================================================================
void loop() {
  // Reto 04: Atender comandos de consola Serial (Debug y enlace con IA)
  debugEyesSerial();

  // Reto 04: Alternar animación con millis() cuando esté en modo autónomo
  if (modoAutonomo) {
    unsigned long currentMillis = millis();
    if (currentMillis - previousMillis >= INTERVALO_ANIMACION) {
      previousMillis = currentMillis;
      ejecutarSecuenciaAutonoma();
    }
  }
}
