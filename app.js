// ==========================================================================
// ESP32-S3 QUANTUM TERMINAL - WEB BLUETOOTH & TELEMETRY CONTROLLER
// ==========================================================================

const NUS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const NUS_RX_CHAR_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // PC -> ESP32
const NUS_TX_CHAR_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // ESP32 -> PC

// État de l'application
// État de l'application
const state = {
    connected: false,
    connectionType: null, // 'ble' ou 'serial'
    bleDevice: null,
    rxCharacteristic: null,
    txCharacteristic: null,
    serialPort: null,
    serialReader: null,
    serialWriter: null,
    rxCount: 0,
    txCount: 0,
    history: [],
    historyIndex: -1,
    webcamActive: false,
    autoTracking: false,
    manualDriving: false,
    operatingMode: null // 'vision' ou 'auto'
};

// Éléments DOM
const elements = {
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    btnConnectBle: document.getElementById('btnConnectBle'),
    btnConnectSerial: document.getElementById('btnConnectSerial'),
    btnToggleVision: document.getElementById('btnToggleVision'),
    halLogoBadge: document.getElementById('halLogoBadge'),
    mainLayout: document.getElementById('mainLayout'),
    terminalOutput: document.getElementById('terminalOutput'),
    commandForm: document.getElementById('commandForm'),
    commandInput: document.getElementById('commandInput'),
    newlineSelect: document.getElementById('newlineSelect'),
    rxBytes: document.getElementById('rxBytes'),
    txBytes: document.getElementById('txBytes'),
    rxVuMeter: document.getElementById('rxVuMeter'),
    txVuMeter: document.getElementById('txVuMeter'),
    chkAutoScroll: document.getElementById('chkAutoScroll'),
    btnClearLog: document.getElementById('btnClearLog'),
    btnDownloadLog: document.getElementById('btnDownloadLog'),
    btnConnectEspCam: document.getElementById('btnConnectEspCam'),
    btnStartWebcam: document.getElementById('btnStartWebcam'),
    btnStopVision: document.getElementById('btnStopVision'),
    btnReloadStream: document.getElementById('btnReloadStream'),
    btnTogglePerfMode: document.getElementById('btnTogglePerfMode'),
    labelPerfMode: document.getElementById('labelPerfMode'),
    visionLivePill: document.getElementById('visionLivePill'),
    visionLiveText: document.getElementById('visionLiveText'),
    btnToggleFlash: document.getElementById('btnToggleFlash'),
    mjpegFeed: document.getElementById('mjpegFeed'),
    videoFeed: document.getElementById('videoFeed'),
    visionOverlay: document.getElementById('visionOverlay'),
    visionPlaceholder: document.getElementById('visionPlaceholder'),
    valFps: document.getElementById('valFps'),
    valLatency: document.getElementById('valLatency'),
    valTarget: document.getElementById('valTarget'),
    batteryWidget: document.getElementById('batteryWidget'),
    batteryChargeIcon: document.getElementById('batteryChargeIcon'),
    batteryLevelBar: document.getElementById('batteryLevelBar'),
    batteryPercent: document.getElementById('batteryPercent'),
    batteryVoltage: document.getElementById('batteryVoltage'),
    batteryCurrent: document.getElementById('batteryCurrent'),
    missionStatusBadge: document.getElementById('missionStatusBadge'),
    asservStatus: document.getElementById('asservStatus'),
    btnToggleAutoTrack: document.getElementById('btnToggleAutoTrack'),
    btnAutoTrackLabel: document.getElementById('btnAutoTrackLabel'),
    motLeftVal: document.getElementById('motLeftVal'),
    motRightVal: document.getElementById('motRightVal'),
    chkAutoFlash: document.getElementById('chkAutoFlash'),
    gripperAngleBadge: document.getElementById('gripperAngleBadge'),
    btnGripClose: document.getElementById('btnGripClose'),
    btnGripOpen: document.getElementById('btnGripOpen'),
    btnGripDec: document.getElementById('btnGripDec'),
    btnGripInc: document.getElementById('btnGripInc'),
    btnGripCenter: document.getElementById('btnGripCenter'),
    btnGripSweep: document.getElementById('btnGripSweep'),
    btnGripRelax: document.getElementById('btnGripRelax'),
    gripperSlider: document.getElementById('gripperSlider'),
    tagServoGrip: document.getElementById('tagServoGrip'),
    tagBrakeStatus: document.getElementById('tagBrakeStatus'),
    tagMissionChrono: document.getElementById('tagMissionChrono'),
    selectChgColor: document.getElementById('selectChgColor'),
    chkBrakeLight: document.getElementById('chkBrakeLight'),
    selectOledPage: document.getElementById('selectOledPage'),
    inputOledMsg: document.getElementById('inputOledMsg'),
    btnOledMsg: document.getElementById('btnOledMsg'),
    chkOledPower: document.getElementById('chkOledPower'),
    tabViewVision: document.getElementById('tabViewVision'),
    tabViewArena: document.getElementById('tabViewArena'),
    viewPaneVision: document.getElementById('viewPaneVision'),
    viewPaneArena: document.getElementById('viewPaneArena'),
    arena2dCanvas: document.getElementById('arena2dCanvas'),
    arenaPoseVal: document.getElementById('arenaPoseVal'),
    arenaOdoVal: document.getElementById('arenaOdoVal'),
    btnQueryOdo: document.getElementById('btnQueryOdo'),
    arenaDeliveredVal: document.getElementById('arenaDeliveredVal'),
    arenaTrapsVal: document.getElementById('arenaTrapsVal'),
    arenaObsVal: document.getElementById('arenaObsVal'),
    arenaCoordsBadge: document.getElementById('arenaCoordsBadge'),
    btnArenaZoomIn: document.getElementById('btnArenaZoomIn'),
    btnArenaZoomOut: document.getElementById('btnArenaZoomOut'),
    btnArenaCenter: document.getElementById('btnArenaCenter'),
    btnArenaClearTrail: document.getElementById('btnArenaClearTrail'),
    btnArenaToggleSensors: document.getElementById('btnArenaToggleSensors'),
    missionStatsOverlay: document.getElementById('missionStatsOverlay'),
    btnCloseMissionStats: document.getElementById('btnCloseMissionStats'),
    statCansCount: document.getElementById('statCansCount'),
    statTimeDuration: document.getElementById('statTimeDuration'),
    statDistanceTotal: document.getElementById('statDistanceTotal'),
    statsFooterNote: document.getElementById('statsFooterNote'),
    btnArenaStartAuton: document.getElementById('btnArenaStartAuton'),
    btnArenaStopAuton: document.getElementById('btnArenaStopAuton'),
    valTof: document.getElementById('valTof'),
    valApds: document.getElementById('valApds'),
    modalModeSelect: document.getElementById('modalModeSelect'),
    btnSelectVisionMode: document.getElementById('btnSelectVisionMode'),
    btnSelectAutoMode: document.getElementById('btnSelectAutoMode'),
    btnSelectManualMode: document.getElementById('btnSelectManualMode'),
    btnChangeMode: document.getElementById('btnChangeMode'),
    modeIndicatorPill: document.getElementById('modeIndicatorPill'),
    btnToggleMobileView: document.getElementById('btnToggleMobileView'),
    modalPowerOffConfirm: document.getElementById('modalPowerOffConfirm'),
    btnConfirmPowerOff: document.getElementById('btnConfirmPowerOff'),
    btnCancelPowerOff: document.getElementById('btnCancelPowerOff'),
    btnPowerOffMacro: document.getElementById('btnPowerOffMacro'),
    mbtnPowerOff: document.getElementById('mbtnPowerOff'),
    mstatBattery: document.getElementById('mstatBattery'),
    mstatTof: document.getElementById('mstatTof'),
    mstatCan: document.getElementById('mstatCan'),
    mstatGrip: document.getElementById('mstatGrip'),
    dpadUp: document.getElementById('dpadUp'),
    dpadDown: document.getElementById('dpadDown'),
    dpadLeft: document.getElementById('dpadLeft'),
    dpadRight: document.getElementById('dpadRight'),
    dpadStop: document.getElementById('dpadStop'),
    mbtnGripClose: document.getElementById('mbtnGripClose'),
    mbtnGripOpen: document.getElementById('mbtnGripOpen'),
    mbtnGripRelax: document.getElementById('mbtnGripRelax'),
    mbtnGripSweep: document.getElementById('mbtnGripSweep'),
    mbtnEstop: document.getElementById('mbtnEstop'),
    mbtnStarWars: document.getElementById('mbtnStarWars'),
    mbtnBeep: document.getElementById('mbtnBeep')
};

// ==========================================================================
// GESTION DE LA JAUGE DE BATTERIE DU ROBOT
// ==========================================================================
function updateBatteryCurrent(current) {
    if (current === null || isNaN(current)) return;
    const iMa = Math.round(current);
    const currText = (iMa > 0 ? `+${iMa} mA` : `${iMa} mA`);
    if (elements.batteryCurrent) {
        elements.batteryCurrent.textContent = currText;
        elements.batteryCurrent.className = 'battery-curr';
        if (iMa > 10) {
            elements.batteryCurrent.classList.add('curr-charging');
        } else if (iMa < -600) {
            elements.batteryCurrent.classList.add('curr-heavy');
        } else if (iMa < -10) {
            elements.batteryCurrent.classList.add('curr-discharging');
        }
    }
    if (elements.mstatBattery) {
        const curBat = elements.batteryPercent ? elements.batteryPercent.textContent : '';
        const curV = elements.batteryVoltage ? elements.batteryVoltage.textContent : '';
        elements.mstatBattery.textContent = `${curBat} ${curV} | ${currText}`.trim();
    }
}

function updateBattery(percent, voltage = null, current = null) {
    percent = Math.max(0, Math.min(100, Math.round(percent)));
    if (elements.batteryLevelBar) elements.batteryLevelBar.style.width = percent + '%';
    if (elements.batteryPercent) elements.batteryPercent.textContent = percent + '%';
    if (voltage && elements.batteryVoltage) elements.batteryVoltage.textContent = `(${voltage}V)`;

    let currText = '';
    if (current !== null && !isNaN(current)) {
        const iMa = Math.round(current);
        currText = (iMa > 0 ? `+${iMa} mA` : `${iMa} mA`);
        if (elements.batteryCurrent) {
            elements.batteryCurrent.textContent = currText;
            elements.batteryCurrent.className = 'battery-curr';
            if (iMa > 10) {
                elements.batteryCurrent.classList.add('curr-charging');
            } else if (iMa < -600) {
                elements.batteryCurrent.classList.add('curr-heavy');
            } else if (iMa < -10) {
                elements.batteryCurrent.classList.add('curr-discharging');
            }
        }
    }

    if (elements.mstatBattery) {
        let mobileBatStr = `${percent}%`;
        if (voltage) mobileBatStr += ` (${voltage}V)`;
        if (currText) mobileBatStr += ` | ${currText}`;
        elements.mstatBattery.textContent = mobileBatStr;
    }

    if (elements.batteryWidget) {
        elements.batteryWidget.classList.remove('battery-medium', 'battery-low');
        if (percent < 20) {
            elements.batteryWidget.classList.add('battery-low');
        } else if (percent <= 60) {
            elements.batteryWidget.classList.add('battery-medium');
        }
    }
}

function updateChargingStatus(isCharging) {
    if (elements.batteryChargeIcon) {
        elements.batteryChargeIcon.classList.toggle('hidden', !isCharging);
    }
    if (elements.batteryWidget) {
        elements.batteryWidget.classList.toggle('is-charging', !!isCharging);
    }
}

function updateBrakingStatus(isBraking) {
    if (elements.tagBrakeStatus) {
        elements.tagBrakeStatus.classList.toggle('is-braking', !!isBraking);
        elements.tagBrakeStatus.textContent = isBraking ? '🛑 FREIN: ACTIF' : '🛑 FREIN: OFF';
    }
}

function parseBatteryAndStatusFrame(text) {
    if (!text) return;

    // 1. Télémétrie batterie : BAT:<soc>%,V:<mv>,I:<ma>,CHG:<0|1>,BRK:<0|1>
    if (/BAT/i.test(text)) {
        const socMatch = text.match(/BAT[T]?[:,\s]+([0-9.]+)\s*(%|V)?/i);
        const voltMatch = text.match(/V:([0-9.]+)/i);
        const currMatch = text.match(/I:([+-]?[0-9.]+)/i);

        if (socMatch) {
            let val = parseFloat(socMatch[1]);
            let pct = (socMatch[2] === '%' || val > 12) ? val : Math.max(0, Math.min(100, Math.round(((val - 6.6) / (8.4 - 6.6)) * 100)));
            let volt = null;
            if (voltMatch) {
                let mv = parseFloat(voltMatch[1]);
                volt = (mv > 100 ? (mv / 1000).toFixed(2) : mv.toFixed(1));
            } else if (socMatch[2] === 'V' || (!socMatch[2] && val <= 12)) {
                volt = val.toFixed(1);
            }
            let current = currMatch ? parseInt(currMatch[1], 10) : null;
            updateBattery(pct, volt, current);
        }
    }

    // 2. Statut de charge (CHG:0 ou CHG:1)
    const chgMatch = text.match(/\bCHG[:\s]*([01])\b/i);
    if (chgMatch) {
        updateChargingStatus(chgMatch[1] === '1');
    }

    // 3. Statut de freinage moteur (BRK:0 / BRK:1 / BRAKE:0 / BRAKE:1)
    const brkMatch = text.match(/\b(?:BRK|BRAKE)[:\s]*([01])\b/i);
    if (brkMatch) {
        updateBrakingStatus(brkMatch[1] === '1');
    }
}

// 4. Détection et affichage du chronomètre / statut de fin de mission STM32
function handleMissionStatusAndChrono(text) {
    if (!text) return;
    // Format STM32 : [HAL-95] <STATUT> | Chrono : MM:SS (X s)
    const match = text.match(/\[HAL-95\]\s*([^|\r\n]+)\s*\|\s*Chrono\s*:\s*([0-9]{1,2}:[0-9]{2})\s*\(([0-9]+)\s*s\)/i);
    if (match) {
        const status = match[1].trim();
        const timeStr = match[2];
        const secStr = match[3];

        if (elements.tagMissionChrono) {
            elements.tagMissionChrono.textContent = `⏱️ ${timeStr} (${secStr}s)`;
            elements.tagMissionChrono.className = 'tag hal-tag tag-chrono';

            if (/COMPLETE|REUSSI|TERMINE|VICTOIRE/i.test(status)) {
                elements.tagMissionChrono.classList.add('has-chrono');
                if (elements.asservStatus) {
                    elements.asservStatus.textContent = `🏁 MISSION ACCOMPLIE EN ${timeStr} (${secStr}s) • CIBLE VERROUILLÉE`;
                }
                logMessage('HAL-95', `🏁 [CHRONO] Mission accomplie avec succès en ${timeStr} (${secStr}s) ! Saisie validée.`, 'hal-quote');
                pulseHalEye();
            } else if (/INTERROMP|ARRET|STOP/i.test(status)) {
                elements.tagMissionChrono.classList.add('interrupted');
                if (elements.asservStatus) {
                    elements.asservStatus.textContent = `⚠️ MISSION INTERROMPUE (PA10) À ${timeStr} (${secStr}s) • STANDBY`;
                }
                logMessage('HAL-95', `🛑 [MISSION] Interruption manuelle locale (Bouton PA10) à ${timeStr} (${secStr}s). Moteurs sécurisés.`, 'hal-quote');
            } else {
                elements.tagMissionChrono.classList.add('has-chrono');
                logMessage('HAL-95', `⏱️ [CHRONO] ${status} : ${timeStr} (${secStr}s)`, 'hal-quote');
            }
        }
    }
}

// Clic interactif sur la jauge pour tester les différents états (100% -> 60% -> 15%)
if (elements.batteryWidget) {
    let testCycle = 0;
    elements.batteryWidget.addEventListener('click', () => {
        testCycle = (testCycle + 1) % 3;
        if (testCycle === 0) updateBattery(95, "8.2", -280);
        else if (testCycle === 1) updateBattery(55, "7.4", -620);
        else updateBattery(15, "6.8", 850);
    });
}

// ==========================================================================
// TÉLÉMÉTRIE MATÉRIELLE & FUSION CAPTEURS (ToF x2 + APDS-9960 CENTRE)
// ==========================================================================
const sensorState = {
    distRight: 9999,      // Distance ToF Droit (mm)
    distLeft: 9999,       // Distance ToF Gauche (mm)
    proximity: 0,         // Proximité IR APDS-9960 (0..255) au centre
    colorName: 'INCONNU', // Couleur lue par l'APDS-9960 ("ROUGE", "VERT", "BLEU", etc.)
    currentMa: 0,         // Courant instantané (mA) lu par le BQ27220
    inDeadZone: false,    // true si la canette est dans l'angle mort entre les 2 ToF
    contact: false,       // true si la canette est au contact physique de la pince
    lastUpdate: 0
};

function updateSensorTelemetryUI() {
    if (elements.valTof) {
        const dL = sensorState.distLeft < 8000 ? `${sensorState.distLeft}` : '---';
        const dR = sensorState.distRight < 8000 ? `${sensorState.distRight}` : '---';
        elements.valTof.textContent = `${dL} / ${dR} mm`;
    }
    if (elements.mstatTof) {
        const dL = sensorState.distLeft < 8000 ? `${sensorState.distLeft}` : '--';
        const dR = sensorState.distRight < 8000 ? `${sensorState.distRight}` : '--';
        elements.mstatTof.textContent = `${dL} / ${dR} mm`;
    }
    if (elements.mstatCan) {
        const colDisplay = sensorState.colorName !== 'INCONNU' ? sensorState.colorName : '--';
        elements.mstatCan.textContent = colDisplay;
    }
    if (elements.valApds) {
        if (sensorState.contact) {
            elements.valApds.innerHTML = `<span style="color:var(--hal-green);font-weight:bold;">P:${sensorState.proximity} [CONTACT]</span>`;
        } else if (sensorState.inDeadZone) {
            elements.valApds.innerHTML = `<span style="color:var(--hal-amber);font-weight:bold;">P:${sensorState.proximity} [ANGLE MORT]</span>`;
        } else {
            const colDisplay = sensorState.colorName !== 'INCONNU' ? sensorState.colorName : '--';
            elements.valApds.textContent = `P:${sensorState.proximity} | ${colDisplay}`;
        }
    }
}

// ==========================================================================
// DÉCODAGE ET FORMATAGE DES TRAMES DE DIAGNOSTIC MATÉRIEL (INFO,...)
// ==========================================================================
function handleIncomingInfoFrame(line) {
    if (!line) return false;

    // 1. INFO,FG (Fuel Gauge BQ27220)
    if (line.startsWith('INFO,FG')) {
        const rdy = line.match(/RDY:(\d+)/i)?.[1] === '1';
        const soc = parseInt(line.match(/SOC:(\d+)/i)?.[1] ?? '0', 10);
        const v = parseInt(line.match(/V:(\d+)/i)?.[1] ?? '0', 10);
        const i = parseInt(line.match(/I:([+-]?\d+)/i)?.[1] ?? '0', 10);
        const avgI = parseInt(line.match(/AVG_I:([+-]?\d+)/i)?.[1] ?? '0', 10);
        const rem = parseInt(line.match(/REM:(\d+)/i)?.[1] ?? '0', 10);
        const full = parseInt(line.match(/FULL:(\d+)/i)?.[1] ?? '0', 10);
        const temp = parseInt(line.match(/T:([+-]?\d+)/i)?.[1] ?? '0', 10);
        const soh = parseInt(line.match(/SOH:(\d+)/i)?.[1] ?? '0', 10);
        const cyc = parseInt(line.match(/CYC:(\d+)/i)?.[1] ?? '0', 10);

        const vStr = (v / 1000).toFixed(2);
        updateBattery(soc, vStr, i);

        const diagMsg = `⚡ [JAUGE BQ27220] ${rdy ? 'ONLINE' : 'OFFLINE'} | Charge: ${soc}% (${vStr}V) | Courant: ${i > 0 ? '+' : ''}${i} mA (Moy: ${avgI} mA) | Capacité: ${rem}/${full} mAh | Santé: ${soh}% | T°: ${temp}°C | Cycles: ${cyc}`;
        logMessage('DIAG', diagMsg, 'diag-msg');
        return true;
    }

    // 2. INFO,CHG (Chargeur BQ25896)
    if (line.startsWith('INFO,CHG')) {
        const rdy = line.match(/RDY:(\d+)/i)?.[1] === '1';
        const vbat = parseInt(line.match(/VBAT:(\d+)/i)?.[1] ?? '0', 10);
        const vsys = parseInt(line.match(/VSYS:(\d+)/i)?.[1] ?? '0', 10);
        const vbus = parseInt(line.match(/VBUS:(\d+)/i)?.[1] ?? '0', 10);
        const ichg = parseInt(line.match(/ICHG:(\d+)/i)?.[1] ?? '0', 10);
        const chgStat = parseInt(line.match(/CHG_STAT:(\d+)/i)?.[1] ?? '0', 10);
        const good = line.match(/GOOD:(\d+)/i)?.[1] === '1';
        const fault = line.match(/FAULT:(0x[0-9A-Fa-f]+)/i)?.[1] ?? '0x00';

        const chgNames = ['Pas de charge', 'Pré-charge', 'Charge rapide', 'Pleine (Done)'];
        const chgText = chgNames[chgStat] || `Code ${chgStat}`;
        const diagMsg = `🔌 [CHARGEUR BQ25896] ${rdy ? 'ONLINE' : 'OFFLINE'} | VBUS: ${(vbus/1000).toFixed(2)}V (${good ? 'Présent' : 'Absent'}) | VSYS: ${(vsys/1000).toFixed(2)}V | VBAT: ${(vbat/1000).toFixed(2)}V | État: ${chgText} (${ichg} mA) | Défaut: ${fault}`;
        logMessage('DIAG', diagMsg, 'diag-msg');
        return true;
    }

    // 3. INFO,DRV (Driver DRV8833)
    if (line.startsWith('INFO,DRV')) {
        const en = line.match(/EN:(\d+)/i)?.[1] === '1';
        const fault = line.match(/FAULT:(\d+)/i)?.[1] === '1';
        const motL = parseInt(line.match(/MOT_L:([+-]?\d+)/i)?.[1] ?? '0', 10);
        const motR = parseInt(line.match(/MOT_R:([+-]?\d+)/i)?.[1] ?? '0', 10);
        const decay = line.match(/DECAY:(\w+)/i)?.[1] ?? 'SLOW';
        const stop = line.match(/STOP:(\w+)/i)?.[1] ?? 'BRAKE';

        const diagMsg = `🚗 [DRIVER DRV8833] ${en ? 'ACTIF (nSLEEP=1)' : 'VEILLE (nSLEEP=0)'} | Défaut nFAULT: ${fault ? '⚠️ ALARME OCP/TSD/UVLO !' : 'OK (Normal)'} | Moteurs: G:${motL}% / D:${motR}% | Mode: ${decay} Decay / ${stop}`;
        logMessage('DIAG', diagMsg, fault ? 'error-msg' : 'diag-msg');
        return true;
    }

    // 4. INFO,TOF (Capteurs ToF VL53L0X)
    if (line.startsWith('INFO,TOF')) {
        const lMm = parseInt(line.match(/L_MM:(\d+)/i)?.[1] ?? '0', 10);
        const rMm = parseInt(line.match(/R_MM:(\d+)/i)?.[1] ?? '0', 10);
        const lRdy = line.match(/L_RDY:(\d+)/i)?.[1] === '1';
        const rRdy = line.match(/R_RDY:(\d+)/i)?.[1] === '1';

        const diagMsg = `📏 [TÉLÉMÈTRES ToF] ToF Gauche: ${lMm} mm (${lRdy ? 'OK' : 'ERR'}) | ToF Droit: ${rMm} mm (${rRdy ? 'OK' : 'ERR'})`;
        logMessage('DIAG', diagMsg, 'diag-msg');
        return true;
    }

    // 5. INFO,COLOR (Capteur APDS-9960)
    if (line.startsWith('INFO,COLOR')) {
        const rdy = line.match(/RDY:(\d+)/i)?.[1] === '1';
        const prox = parseInt(line.match(/PROX:(\d+)/i)?.[1] ?? '0', 10);
        const col = line.match(/COL:([^,\r\n]+)/i)?.[1] ?? 'INCONNU';
        const r = parseInt(line.match(/R:(\d+)/i)?.[1] ?? '0', 10);
        const g = parseInt(line.match(/G:(\d+)/i)?.[1] ?? '0', 10);
        const b = parseInt(line.match(/B:(\d+)/i)?.[1] ?? '0', 10);
        const c = parseInt(line.match(/C:(\d+)/i)?.[1] ?? '0', 10);

        const diagMsg = `🎨 [SPECTRO APDS-9960] ${rdy ? 'ONLINE' : 'OFFLINE'} | Proximité: ${prox}/255 | Couleur: ${col} | Bruts: R:${r} G:${g} B:${b} Clear:${c}`;
        logMessage('DIAG', diagMsg, 'diag-msg');
        return true;
    }

    // 6. INFO,ENC (Encodeurs & Odométrie)
    if (line.startsWith('INFO,ENC')) {
        const dL = parseInt(line.match(/DIST_L:([+-]?\d+)/i)?.[1] ?? '0', 10);
        const dR = parseInt(line.match(/DIST_R:([+-]?\d+)/i)?.[1] ?? '0', 10);
        const tL = parseInt(line.match(/TICKS_L:([+-]?\d+)/i)?.[1] ?? '0', 10);
        const tR = parseInt(line.match(/TICKS_R:([+-]?\d+)/i)?.[1] ?? '0', 10);
        const sL = parseInt(line.match(/SPD_L:([+-]?\d+)/i)?.[1] ?? '0', 10);
        const sR = parseInt(line.match(/SPD_R:([+-]?\d+)/i)?.[1] ?? '0', 10);

        const diagMsg = `⏱️ [ENCODEURS] Distances: G:${dL} mm / D:${dR} mm | Ticks: G:${tL} / D:${tR} | Vitesse: G:${sL} mm/s / D:${sR} mm/s`;
        logMessage('DIAG', diagMsg, 'diag-msg');
        return true;
    }

    // 7. INFO,SERVO (Pince Servomoteur)
    if (line.startsWith('INFO,SERVO')) {
        const angle = parseInt(line.match(/ANGLE:(\d+)/i)?.[1] ?? '90', 10);
        const sweep = line.match(/SWEEP:(\d+)/i)?.[1] === '1';

        const diagMsg = `🦾 [PINCE SERVO] Angle: ${angle}° | Balayage automatique: ${sweep ? 'ACTIF' : 'INACTIF'}`;
        logMessage('DIAG', diagMsg, 'diag-msg');
        return true;
    }

    // 8. INFO,SYS (Système global)
    if (line.startsWith('INFO,SYS')) {
        const fsm = line.match(/FSM:([^,\r\n]+)/i)?.[1] ?? 'UNKNOWN';
        const nav = line.match(/NAV:([^,\r\n]+)/i)?.[1] ?? 'AUTO';
        const tgt = line.match(/TARGET:([^,\r\n]+)/i)?.[1] ?? 'RED';
        const x = parseInt(line.match(/X:([+-]?\d+)/i)?.[1] ?? '0', 10);
        const y = parseInt(line.match(/Y:([+-]?\d+)/i)?.[1] ?? '0', 10);
        const th = parseInt(line.match(/TH:([+-]?\d+)/i)?.[1] ?? '0', 10);
        const up = parseInt(line.match(/UPTIME:(\d+)/i)?.[1] ?? '0', 10);

        const diagMsg = `🖥️ [SYSTÈME HAL-95] FSM: ${fsm} | Guidage: ${nav} | Cible: ${tgt} | Pose Odom: (${x}, ${y}) mm @ ${th}° | Uptime: ${up}s`;
        logMessage('DIAG', diagMsg, 'diag-msg');
        return true;
    }

    // Options générales ou aide
    if (line.startsWith('INFO,')) {
        logMessage('INFO', line, 'diag-msg');
        return true;
    }

    return false;
}

function processIncomingSensorTelemetry(text) {
    // 1. Détection trame télémétrie SENS (ex: SENS,D:150,G:145,P:22,C:ROUGE,R:120,G:15,B:10)
    const sensMatch = text.match(/SENS,D:(\d+),G:(\d+),P:(\d+),C:([^,\r\n]+)/i);
    if (sensMatch) {
        sensorState.distRight = parseInt(sensMatch[1], 10);
        sensorState.distLeft = parseInt(sensMatch[2], 10);
        sensorState.proximity = parseInt(sensMatch[3], 10);
        sensorState.colorName = sensMatch[4].trim().toUpperCase();
        sensorState.lastUpdate = Date.now();

        const minTof = Math.min(sensorState.distLeft, sensorState.distRight);
        // Angle mort central : les ToF sont inclinés à 20° vers l'extérieur (cône aveugle central de 15°).
        // Ils ne voient donc pas la canette droite devant, mais le capteur APDS-9960 au centre la détecte (P >= 10) !
        sensorState.inDeadZone = (sensorState.proximity >= 10 && minTof > 130);
        sensorState.contact = (sensorState.proximity >= 22 || (minTof <= 75 && sensorState.proximity >= 10));

        updateSensorTelemetryUI();

        const grpMatch = text.match(/GRP:(\d+)/i);
        if (grpMatch) {
            const angle = parseInt(grpMatch[1], 10);
            if (!isNaN(angle)) updateGripperUI(angle);
        }

        const currMatch = text.match(/I:([+-]?\d+)/i);
        if (currMatch) {
            const currentMa = parseInt(currMatch[1], 10);
            sensorState.currentMa = currentMa;
            updateBatteryCurrent(currentMa);
        }
    }

    // 2. Détection événement matériel direct émis par le STM32
    if (text.includes('CANETTE,CONTACT')) {
        sensorState.contact = true;
        updateSensorTelemetryUI();

        const grpMatch = text.match(/GRP:(\d+)/i);
        if (grpMatch) {
            const angle = parseInt(grpMatch[1], 10);
            if (!isNaN(angle)) updateGripperUI(angle);
        }

        const currMatch = text.match(/I:([+-]?\d+)/i);
        if (currMatch) {
            const currentMa = parseInt(currMatch[1], 10);
            sensorState.currentMa = currentMa;
            updateBatteryCurrent(currentMa);
        }
    }

    // 3. Détection statut Terrain Vide / Fin de Mission
    if (text.includes('EMPTY_FIELD') || text.includes('MISSION,EMPTY')) {
        if (elements.asservStatus) {
            elements.asservStatus.textContent = '⚠️ TERRAIN VIDE CERTIFIÉ : 0 CANETTE DÉTECTÉE (STANDBY ORANGE)';
        }
        logMessage('HAL-95', '⚠️ Rapport STM32 : Terrain certifié propre / aucune canette sur le terrain. Robot en veille.', 'hal-quote');
    }
}

// ==========================================================================
// GESTION DE LA MATRICE DE TRI CHROMATIQUE (CANETTES 33 cL)
// ==========================================================================
const missionRules = {
    red: 'collect',   // 'collect' | 'avoid' | 'ignore'
    green: 'avoid',
    blue: 'ignore'
};

const COLOR_NAMES_FR = {
    red: 'ROUGE',
    green: 'VERTE',
    blue: 'BLEUE'
};

const ACTION_NAMES_FR = {
    collect: 'RAMASSER (Cible)',
    avoid: 'ÉVITER (Piège)',
    ignore: 'IGNORER (Neutre)'
};

function getActiveTargetsString() {
    const targets = [];
    for (const [col, act] of Object.entries(missionRules)) {
        if (act === 'collect') targets.push(COLOR_NAMES_FR[col]);
    }
    return targets;
}

function updateMissionUI() {
    const targets = getActiveTargetsString();

    if (elements.missionStatusBadge) {
        if (targets.length === 0) {
            elements.missionStatusBadge.textContent = "AUCUNE CIBLE";
            elements.missionStatusBadge.style.color = "var(--text-muted)";
            elements.missionStatusBadge.style.borderColor = "rgba(255, 255, 255, 0.2)";
        } else {
            elements.missionStatusBadge.textContent = `CIBLE: ${targets.join(', ')}`;
            elements.missionStatusBadge.style.color = "var(--hal-amber)";
            elements.missionStatusBadge.style.borderColor = "rgba(255, 159, 10, 0.4)";
        }
    }

    if (elements.valTarget) {
        if (targets.length > 0) {
            elements.valTarget.textContent = `CANETTE: ${targets.join('+')} [TRACK]`;
        } else {
            elements.valTarget.textContent = "STANDBY (AUCUNE CIBLE)";
        }
    }
}

// Initialisation des écouteurs sur les boutons de la matrice chromatique
document.querySelectorAll('.matrix-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        const action = btn.dataset.action;
        if (!color || !action) return;

        // Mise à jour de la règle
        missionRules[color] = action;

        // Mise à jour visuelle des boutons frères de cette ligne
        const row = btn.closest('.matrix-row');
        if (row) {
            row.querySelectorAll('.matrix-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }

        updateMissionUI();
        pulseHalEye();

        const logTxt = `Règle canette ${COLOR_NAMES_FR[color]} : ${ACTION_NAMES_FR[action]}`;
        logMessage('MISSION', logTxt);
    });
});

// Initialisation au chargement
updateMissionUI();

// ==========================================================================
// 1. GESTION DE LA CONNEXION BLE (WEB BLUETOOTH API)
// ==========================================================================

async function connectBLE() {
    if (!navigator.bluetooth) {
        logMessage('SYS', 'Erreur : Votre navigateur ne supporte pas le Web Bluetooth. Utilisez Google Chrome ou Microsoft Edge.', 'error-msg');
        return;
    }

    if (state.connected) {
        disconnect();
        return;
    }

    try {
        setConnectionStatus('connecting', 'CONNEXION BLE...');
        logMessage('SYS', 'Recherche du périphérique ESP32-C3 / HAL 95 en cours...');

        let bleDevice = null;
        try {
            bleDevice = await navigator.bluetooth.requestDevice({
                filters: [
                    { namePrefix: 'HAL' },
                    { namePrefix: 'ESP' },
                    { services: [NUS_SERVICE_UUID] }
                ],
                optionalServices: [NUS_SERVICE_UUID]
            });
        } catch (filterError) {
            // Si aucun appareil filtré n'est trouvé, tentative sans filtre
            if (filterError.name === 'NotFoundError') {
                logMessage('SYS', 'Recherche élargie à tous les appareils Bluetooth...');
                bleDevice = await navigator.bluetooth.requestDevice({
                    acceptAllDevices: true,
                    optionalServices: [NUS_SERVICE_UUID]
                });
            } else {
                throw filterError;
            }
        }

        state.bleDevice = bleDevice;
        state.bleDevice.removeEventListener('gattserverdisconnected', onDisconnected);

        logMessage('SYS', `Périphérique sélectionné : ${state.bleDevice.name}. Connexion GATT...`);

        // Boucle de reconnexion robuste (Windows/Chrome échoue souvent aux 1ers essais GATT avec l'ESP32-C3)
        let server = null;
        let service = null;
        const maxAttempts = 5;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                if (attempt > 1) {
                    const backoffMs = 400 + attempt * 200;
                    logMessage('SYS', `Nouvelle tentative GATT (${attempt}/${maxAttempts}) dans ${backoffMs} ms...`);
                    try {
                        if (state.bleDevice.gatt.connected) {
                            state.bleDevice.gatt.disconnect();
                        }
                    } catch (_) {}
                    await new Promise(r => setTimeout(r, backoffMs));
                }

                server = await state.bleDevice.gatt.connect();
                // Délai de stabilisation indispensable sur ESP32-C3 + pile BLE Windows
                await new Promise(r => setTimeout(r, 250));

                if (!server.connected) {
                    throw new Error('GATT déconnecté juste après connect()');
                }

                service = await server.getPrimaryService(NUS_SERVICE_UUID);
                state.rxCharacteristic = await service.getCharacteristic(NUS_RX_CHAR_UUID);
                state.txCharacteristic = await service.getCharacteristic(NUS_TX_CHAR_UUID);

                await new Promise(r => setTimeout(r, 150));

                // Souscription aux notifications avec mini-retry local (fréquent sous Windows)
                let notifOk = false;
                for (let nTry = 1; nTry <= 2; nTry++) {
                    try {
                        await state.txCharacteristic.startNotifications();
                        notifOk = true;
                        break;
                    } catch (notifErr) {
                        if (nTry === 2) throw notifErr;
                        await new Promise(r => setTimeout(r, 200));
                    }
                }
                if (notifOk) break;
            } catch (err) {
                console.warn(`Tentative BLE ${attempt}/${maxAttempts} échouée:`, err);
                try {
                    if (state.bleDevice.gatt.connected) {
                        state.bleDevice.gatt.disconnect();
                    }
                } catch (_) {}
                if (attempt === maxAttempts) throw err;
            }
        }

        state.bleDevice.addEventListener('gattserverdisconnected', onDisconnected);
        state.txCharacteristic.removeEventListener('characteristicvaluechanged', handleBleNotification);
        state.txCharacteristic.addEventListener('characteristicvaluechanged', handleBleNotification);

        state.connected = true;
        state.connectionType = 'ble';
        setConnectionStatus('connected', `CIRCUITS ACTIFS (BLE : ${state.bleDevice.name})`);
        elements.btnConnectBle.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span>DÉCONNECTER</span>
        `;
        logMessage('HAL-95', 'Good morning, Dave. I am completely operational and all my circuits are functioning perfectly. Liaison BLE établie avec l\'ESP32.', 'hal-quote');
        pulseHalEye();
        startTimeSyncScheduler();
        showModeSelectModal();

    } catch (error) {
        console.error('Erreur BLE:', error);
        setConnectionStatus('disconnected', 'CIRCUITS NON RELIÉS');
        logMessage('HAL-95', `I'm sorry, Dave. I'm afraid I can't do that. Échec : ${error.message || error}`, 'error-msg');
    }
}

function pulseHalEye() {
    const badge = elements.halLogoBadge;
    const pupil = document.getElementById('halLogoPupil');
    const corePupil = document.querySelector('.hal-core-pupil');

    if (badge) {
        badge.classList.remove('flash-pulse');
        void badge.offsetWidth; // Forcer le re-rendu immédiat du flash
        badge.classList.add('flash-pulse');
        setTimeout(() => badge.classList.remove('flash-pulse'), 320);
    }
    if (pupil) {
        pupil.classList.remove('flash-pulse');
        void pupil.offsetWidth;
        pupil.classList.add('flash-pulse');
        setTimeout(() => pupil.classList.remove('flash-pulse'), 320);
    }
    if (corePupil) {
        corePupil.classList.remove('flash-pulse');
        void corePupil.offsetWidth;
        corePupil.classList.add('flash-pulse');
        setTimeout(() => corePupil.classList.remove('flash-pulse'), 320);
    }
}

function triggerVuMeter(meterEl, activeCount = 4) {
    if (!meterEl) return;
    const segs = meterEl.querySelectorAll('.vu-seg');
    segs.forEach((seg, idx) => {
        if (idx < activeCount) seg.classList.add('active');
        else seg.classList.remove('active');
    });
    setTimeout(() => {
        segs.forEach(seg => seg.classList.remove('active'));
    }, 180);
}

let bleRxLineBuffer = '';

function handleBleNotification(event) {
    pulseHalEye();
    const value = event.target.value;
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(value);

    state.rxCount += value.byteLength;
    elements.rxBytes.textContent = state.rxCount;

    // Déclenchement de la télémétrie segmentée Discovery One
    const intensity = Math.min(8, Math.max(2, Math.ceil(value.byteLength / 2)));
    triggerVuMeter(elements.rxVuMeter, intensity);

    // Détection automatique de télémétrie batterie, charge (CHG) et freinage (BRK)
    parseBatteryAndStatusFrame(text);

    // Détection chronomètre & statut de mission STM32 ([HAL-95] ... | Chrono : MM:SS (X s))
    handleMissionStatusAndChrono(text);

    // Détection de synchronisation retour pince robot (ex: Gripper: 75 deg ou Gripper OPEN (105 deg))
    const gripMatch = text.match(/Gripper.*?(\d+)\s*deg/i);
    if (gripMatch) {
        const angle = parseInt(gripMatch[1], 10);
        if (!isNaN(angle)) updateGripperUI(angle);
    }

    // Traitement télémétrie capteurs ToF & APDS-9960
    processIncomingSensorTelemetry(text);

    // Détection des trames du Plan 2D Tactique & Réflexion Autonome (avec bufferisation anti-fragmentation BLE)
    bleRxLineBuffer += text;
    const lines = bleRxLineBuffer.split(/\r?\n/);
    bleRxLineBuffer = lines.pop() || '';
    for (const l of lines) {
        const trimmedL = l.trim();
        if (trimmedL.length > 0) {
            parseArenaTelemetry(trimmedL);
            if (trimmedL.startsWith('INFO,')) {
                handleIncomingInfoFrame(trimmedL);
            }
        }
    }

    logMessage('RX', text, 'rx');
}

// ==========================================================================
// 2. SUPPORT OPTIONNEL : CONNEXION USB DIRECTE (WEB SERIAL API)
// ==========================================================================

async function connectSerial() {
    if (!navigator.serial) {
        logMessage('SYS', 'Web Serial non supporté sur ce navigateur.', 'error-msg');
        return;
    }

    if (state.connected) {
        disconnect();
        return;
    }

    const baudSelect = document.getElementById('baudRateSelect');
    const selectedBaud = baudSelect ? parseInt(baudSelect.value, 10) : 115200;

    try {
        setConnectionStatus('connecting', `CONNEXION USB (${selectedBaud} bauds)...`);
        state.serialPort = await navigator.serial.requestPort();
        await state.serialPort.open({ baudRate: selectedBaud });

        state.connected = true;
        state.connectionType = 'serial';
        setConnectionStatus('connected', `CONNECTÉ (USB DIRECT ${selectedBaud} bauds)`);

        elements.btnConnectSerial.innerHTML = `<span>Déconnecter USB</span>`;
        logMessage('SYS', `Port USB connecté à ${selectedBaud} bauds.`);

        // Boucle de lecture série
        readSerialLoop();
        startTimeSyncScheduler();
        showModeSelectModal();
    } catch (err) {
        console.error('Erreur Serial:', err);
        setConnectionStatus('disconnected', 'DÉCONNECTÉ');
        logMessage('SYS', `Erreur port série : ${err.message}`, 'error-msg');
    }
}

async function readSerialLoop() {
    const textDecoder = new TextDecoder();
    let lineBuffer = '';

    while (state.serialPort && state.serialPort.readable && state.connected) {
        try {
            state.serialReader = state.serialPort.readable.getReader();
            while (state.connected) {
                const { value, done } = await state.serialReader.read();
                if (done) break;
                if (value) {
                    state.rxCount += value.byteLength;
                    elements.rxBytes.textContent = state.rxCount;

                    lineBuffer += textDecoder.decode(value, { stream: true });
                    const lines = lineBuffer.split(/\r?\n/);
                    // Le dernier élément est incomplet, on le conserve pour le chunk suivant
                    lineBuffer = lines.pop();

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (trimmed.length > 0) {
                            // Détection automatique de télémétrie batterie, charge (CHG) et freinage (BRK)
                            parseBatteryAndStatusFrame(trimmed);

                            // Détection chronomètre & statut de mission STM32
                            handleMissionStatusAndChrono(trimmed);

                            // Détection de synchronisation retour pince robot
                            const gripMatch = trimmed.match(/Gripper.*?(\d+)\s*deg/i);
                            if (gripMatch) {
                                const angle = parseInt(gripMatch[1], 10);
                                if (!isNaN(angle)) updateGripperUI(angle);
                            }

                            // Traitement télémétrie capteurs ToF & APDS-9960
                            processIncomingSensorTelemetry(trimmed);

                            // Détection des trames du Plan 2D Tactique (POS, OBS, CAN, TRAP, DELIVERED, MISSION_STATS, ODO)
                            parseArenaTelemetry(trimmed);

                            // Détection des trames INFO de diagnostic matériel
                            if (trimmed.startsWith('INFO,')) {
                                handleIncomingInfoFrame(trimmed);
                            }

                            // Toutes les trames reçues sur le port série USB (STM32 ou ESP32-CAM)
                            logMessage('RX', trimmed, 'rx');
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('Lecture série interrompue:', error);
        } finally {
            if (state.serialReader) {
                try { state.serialReader.releaseLock(); } catch(e){}
                state.serialReader = null;
            }
        }
    }
}

// ==========================================================================
// 3. ENVOI DE DONNÉES VERS LE STM32 & CONTRÔLE MOTEUR HAUTE CADENCE
// ==========================================================================

// Envoi bas-niveau haute cadence sans surcharge de la console graphique
async function sendRawData(payload, logToConsole = false) {
    if (!state.connected) return false;

    const encoder = new TextEncoder();
    const data = encoder.encode(payload);

    try {
        if (state.connectionType === 'ble' && state.rxCharacteristic) {
            // Privilégier l'envoi rapide sans attente d'acquittement GATT si supporté (supprime toute saccade de transmission)
            if (state.rxCharacteristic.properties && state.rxCharacteristic.properties.writeWithoutResponse && state.rxCharacteristic.writeValueWithoutResponse) {
                await state.rxCharacteristic.writeValueWithoutResponse(data);
            } else {
                await state.rxCharacteristic.writeValue(data);
            }
        } else if (state.connectionType === 'serial' && state.serialPort && state.serialPort.writable) {
            const writer = state.serialPort.writable.getWriter();
            await writer.write(data);
            writer.releaseLock();
        }

        state.txCount += data.byteLength;
        if (elements.txBytes) elements.txBytes.textContent = state.txCount;

        if (logToConsole) {
            logMessage('TX', payload.trim(), 'tx');
        }
        return true;
    } catch (err) {
        console.warn('Erreur envoi bas-niveau:', err);
        return false;
    }
}

let timeSyncTimeoutId = null;

function formatTimeSyncCommand(date = new Date()) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `TIME,${hh},${mm},${ss},${dd},${mo},${yyyy}\r\n`;
}

async function sendTimeSync() {
    if (!state.connected) return;
    await sendRawData(formatTimeSyncCommand(new Date()), false);
}

function scheduleNextMinuteTimeSync() {
    if (timeSyncTimeoutId !== null) {
        clearTimeout(timeSyncTimeoutId);
        timeSyncTimeoutId = null;
    }
    if (!state.connected) return;

    const now = new Date();
    const msIntoMinute = now.getSeconds() * 1000 + now.getMilliseconds();
    const delayMs = Math.max(200, 60000 - msIntoMinute + 50);

    timeSyncTimeoutId = setTimeout(async () => {
        if (!state.connected) return;
        await sendTimeSync();
        scheduleNextMinuteTimeSync();
    }, delayMs);
}

function startTimeSyncScheduler() {
    sendTimeSync();
    sendRawData('FIELD?\r\n', false);
    sendRawData('POS?\r\n', false);
    scheduleNextMinuteTimeSync();
}

function stopTimeSyncScheduler() {
    if (timeSyncTimeoutId !== null) {
        clearTimeout(timeSyncTimeoutId);
        timeSyncTimeoutId = null;
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && state.connected) {
        startTimeSyncScheduler();
    }
});

// État des moteurs, limitation de bande passante et filtrage
let lastMotorCommand = { left: 0, right: 0, time: 0 };
let isSendingMotor = false;
let pendingMotorCommand = null;

async function sendMotorDirect(leftPwm, rightPwm, force = false) {
    leftPwm = Math.max(-100, Math.min(100, Math.round(leftPwm)));
    rightPwm = Math.max(-100, Math.min(100, Math.round(rightPwm)));

    // Mise à jour immédiate de l'affichage UI
    if (elements.motLeftVal) elements.motLeftVal.textContent = `${leftPwm}%`;
    if (elements.motRightVal) elements.motRightVal.textContent = `${rightPwm}%`;

    const now = Date.now();
    const diff = Math.abs(leftPwm - lastMotorCommand.left) + Math.abs(rightPwm - lastMotorCommand.right);

    // Ne transmettre que si variation significative (>= 2%), ou après 70ms (keepalive régulier pour le watchdog 500ms du STM32), ou si forcé
    if (!force && diff < 2 && (now - lastMotorCommand.time < 70)) {
        return;
    }

    // Si une transmission BLE est déjà en cours, mémoriser la consigne (CRUCIAL : l'arrêt 0,0 n'est JAMAIS perdu !)
    if (isSendingMotor) {
        pendingMotorCommand = { left: leftPwm, right: rightPwm, force: force };
        return;
    }
    isSendingMotor = true;

    try {
        let cmd = { left: leftPwm, right: rightPwm, force: force };
        while (cmd) {
            lastMotorCommand = { left: cmd.left, right: cmd.right, time: Date.now() };
            // Commande moteur directe ultra-rapide FreeRTOS STM32 (watchdog 500 ms)
            const payload = `M,${cmd.left},${cmd.right}\r\n`;
            await sendRawData(payload, false);

            cmd = pendingMotorCommand;
            pendingMotorCommand = null;
        }
    } finally {
        isSendingMotor = false;
    }
}

// Arrêt d'urgence universel des moteurs
async function stopMotorsEmergency() {
    if (state.autoTracking) {
        state.autoTracking = false;
        updateAutoTrackUI();
        await sendCommand('STREAM,OFF');
    }
    if (elements.motLeftVal) elements.motLeftVal.textContent = '0%';
    if (elements.motRightVal) elements.motRightVal.textContent = '0%';
    await sendRawData('STOP\r\n', true);
    await sendRawData('MOTOR,STOP\r\n', false);
    await sendRawData('M,0,0\r\n', false);
    pulseHalEye();
    triggerVuMeter(elements.txVuMeter, 8);
    logMessage('HAL-95', '[SÉCURITÉ] Arrêt d\'urgence des moteurs exécuté (STOP & M,0,0).', 'hal-quote');
}

async function sendCommand(text) {
    if (!state.connected) {
        logMessage('SYS', 'Erreur : Non connecté. Cliquez sur "Connecter BLE" pour envoyer.', 'error-msg');
        return;
    }

    // Déclenchement impulsion visuelle et VU-mètre TX
    pulseHalEye();
    triggerVuMeter(elements.txVuMeter, 6);

    // Alerte AE-35 si arrêt d'urgence des moteurs
    if (text.toUpperCase().includes('MOTOR,STOP') || text.toUpperCase().includes('MOTOR STOP')) {
        stopMotorsEmergency();
        return;
    }

    // Gestion du retour chariot sélectionné
    let payload = text;
    const newline = elements.newlineSelect.value;
    if (newline === '\\r\\n') payload += '\r\n';
    else if (newline === '\\n') payload += '\n';
    else if (newline === '\\r') payload += '\r';

    const encoder = new TextEncoder();
    const data = encoder.encode(payload);

    try {
        if (state.connectionType === 'ble' && state.rxCharacteristic) {
            // Privilégier l'envoi rapide sans attente d'acquittement GATT si supporté (supprime toute saccade de transmission)
            if (state.rxCharacteristic.properties && state.rxCharacteristic.properties.writeWithoutResponse && state.rxCharacteristic.writeValueWithoutResponse) {
                await state.rxCharacteristic.writeValueWithoutResponse(data);
            } else {
                await state.rxCharacteristic.writeValue(data);
            }
        } else if (state.connectionType === 'serial' && state.serialPort && state.serialPort.writable) {
            const writer = state.serialPort.writable.getWriter();
            await writer.write(data);
            writer.releaseLock();
        }

        state.txCount += data.byteLength;
        elements.txBytes.textContent = state.txCount;

        logMessage('TX', text, 'tx');

    } catch (error) {
        console.error('Erreur envoi:', error);
        logMessage('SYS', `Erreur d'envoi : ${error.message}`, 'error-msg');
    }
}

// Déconnexion propre sans verrouillage de port
async function disconnect() {
    if (state.autoTracking) {
        state.autoTracking = false;
        updateAutoTrackUI();
    }
    // Assurer l'arrêt préalable des moteurs
    try {
        await sendRawData('CMD,MOT,0,0\r\n');
        await sendRawData('MOTOR,STOP\r\n');
    } catch (_) {}

    state.connected = false;
    if (state.bleDevice && state.bleDevice.gatt && state.bleDevice.gatt.connected) {
        state.bleDevice.gatt.disconnect();
    }
    if (state.serialReader) {
        try { await state.serialReader.cancel(); } catch(e){}
    }
    if (state.serialPort) {
        try {
            await state.serialPort.close();
        } catch (e) {
            console.warn('Erreur fermeture port:', e);
        }
        state.serialPort = null;
    }
    onDisconnected();
}

function onDisconnected() {
    stopTimeSyncScheduler();
    hideModeSelectModal();
    state.operatingMode = null;
    if (elements.modeIndicatorPill) {
        elements.modeIndicatorPill.textContent = 'MODE: EN ATTENTE';
        elements.modeIndicatorPill.className = 'mode-indicator-pill';
    }

    state.connected = false;
    state.connectionType = null;
    state.rxCharacteristic = null;
    state.txCharacteristic = null;
    setConnectionStatus('disconnected', 'CIRCUITS NON RELIÉS');

    // Réinitialisation garantie des indicateurs d'état matériel
    updateChargingStatus(false);
    updateBrakingStatus(false);

    elements.btnConnectBle.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11"/>
        </svg>
        <span>Liaison BLE</span>
    `;
    elements.btnConnectSerial.innerHTML = `<span>Port USB</span>`;
    
    const discQuote = "I think you ought to know that I'm feeling very much better now.";
    logMessage('HAL-95', `Liaison coupée. "${discQuote}"`, 'hal-quote');
}

function setConnectionStatus(type, label) {
    elements.statusDot.className = `status-dot ${type}`;
    elements.statusText.textContent = label;
}

// ==========================================================================
// GESTION DU DIALOGUE DE SÉLECTION DU MODE OPÉRATOIRE (HAL 95)
// ==========================================================================
function showModeSelectModal() {
    if (elements.modalModeSelect) {
        elements.modalModeSelect.classList.remove('hidden');
        pulseHalEye();
    }
}

function hideModeSelectModal() {
    if (elements.modalModeSelect) {
        elements.modalModeSelect.classList.add('hidden');
    }
}

async function setOperatingMode(mode) {
    hideModeSelectModal();
    state.operatingMode = mode;

    if (mode === 'vision') {
        if (elements.modeIndicatorPill) {
            elements.modeIndicatorPill.textContent = 'MODE: VISION HSV';
            elements.modeIndicatorPill.className = 'mode-indicator-pill mode-vision-active';
        }
        logMessage('MODE', '👁️ Mode Vision par Ordinateur sélectionné. Traque HSV caméra activée.', 'hal-quote');
        await sendCommand('MODE,VISION');
        await sendCommand('STREAM,ON');

        // Démarrer la webcam automatiquement si elle n'est pas déjà active
        if (!state.webcamActive && elements.btnStartWebcam) {
            elements.btnStartWebcam.click();
        }

        // Bascule automatique sur la vue Lentille Optique
        switchMainView('vision');

        // Engager la traque automatique
        if (!state.autoTracking) {
            state.autoTracking = true;
            updateAutoTrackUI();
            startAutoTrackLoop();
        }
    } else if (mode === 'auto') {
        if (elements.modeIndicatorPill) {
            elements.modeIndicatorPill.textContent = 'MODE: AUTONOME STM32';
            elements.modeIndicatorPill.className = 'mode-indicator-pill mode-auto-active';
        }
        logMessage('MODE', '🤖 Mode 100% Autonome sélectionné. Bascule automatique sur le Plan 2D d\'Arène.', 'hal-quote');
        await sendCommand('MODE,AUTO');
        await sendCommand('STREAM,ON');

        // Bascule automatique sur le Plan 2D tactique d'Arène
        switchMainView('arena');

        // Désactiver l'auto-tracking PC pour laisser le microcontrôleur libre de ses mouvements
        if (state.autoTracking) {
            state.autoTracking = false;
            updateAutoTrackUI();
        }
        if (elements.asservStatus) {
            elements.asservStatus.textContent = 'ROBOT EN MODE AUTONOME PUR (FIRMWARE STM32 MAÎTRE)';
        }
    } else if (mode === 'manual') {
        if (elements.modeIndicatorPill) {
            elements.modeIndicatorPill.textContent = 'MODE: MANUEL (ZQSD)';
            elements.modeIndicatorPill.className = 'mode-indicator-pill mode-manual-active';
        }
        logMessage('MODE', '🎮 Mode Pilotage Manuel sélectionné. Contrôle direct ZQSD / Flèches / D-Pad actif.', 'hal-quote');
        await sendCommand('MODE,MANUAL');
        await sendCommand('STREAM,ON');

        if (state.autoTracking) {
            state.autoTracking = false;
            updateAutoTrackUI();
        }
        if (elements.asservStatus) {
            elements.asservStatus.textContent = 'PILOTAGE MANUEL ACTIF (ZQSD / D-PAD / PINCE)';
        }
    }
}

if (elements.btnSelectVisionMode) {
    elements.btnSelectVisionMode.addEventListener('click', () => setOperatingMode('vision'));
}

if (elements.btnSelectAutoMode) {
    elements.btnSelectAutoMode.addEventListener('click', () => setOperatingMode('auto'));
}

if (elements.btnSelectManualMode) {
    elements.btnSelectManualMode.addEventListener('click', () => setOperatingMode('manual'));
}

if (elements.btnChangeMode) {
    elements.btnChangeMode.addEventListener('click', () => showModeSelectModal());
}

if (elements.modeIndicatorPill) {
    elements.modeIndicatorPill.addEventListener('click', () => showModeSelectModal());
}

// ==========================================================================
// 4. GESTION DU TERMINAL & AFFICHAGE
// ==========================================================================

function getTimestamp() {
    const now = new Date();
    return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
}

function logMessage(prefix, message, cssClass = 'system-msg') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${cssClass}`;

    const timestamp = document.createElement('span');
    timestamp.className = 'timestamp';
    timestamp.textContent = `[${getTimestamp()}]`;

    const content = document.createElement('span');
    content.className = 'content';

    if (prefix === 'RX') {
        content.innerHTML = `<span class="direction">&lt;= [RX]</span> ${escapeHtml(message)}`;
    } else if (prefix === 'TX') {
        content.innerHTML = `<span class="direction">=&gt; [TX]</span> ${escapeHtml(message)}`;
    } else {
        content.textContent = message;
    }

    entry.appendChild(timestamp);
    entry.appendChild(content);
    elements.terminalOutput.appendChild(entry);

    if (elements.chkAutoScroll.checked) {
        elements.terminalOutput.scrollTop = elements.terminalOutput.scrollHeight;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================================================
// 5. INTERFACE ET ÉVÉNEMENTS UTILISATEUR
// ==========================================================================

// Envoi via formulaire
elements.commandForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = elements.commandInput.value.trim();
    if (!text) return;

    state.history.push(text);
    state.historyIndex = state.history.length;

    sendCommand(text);
    elements.commandInput.value = '';
});

// Navigation dans l'historique avec Flèche Haut / Bas
elements.commandInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        if (state.historyIndex > 0) {
            state.historyIndex--;
            elements.commandInput.value = state.history[state.historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            elements.commandInput.value = state.history[state.historyIndex];
        } else {
            state.historyIndex = state.history.length;
            elements.commandInput.value = '';
        }
    }
});

// Macros rapides
document.querySelectorAll('.macro-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        if (cmd) {
            if (cmd === 'MOTOR,STOP') {
                stopMotorsEmergency();
            } else {
                sendCommand(cmd);
            }
        }
    });
});

// ==========================================================================
// CONTRÔLE DE LA PINCE / SERVOMOTEUR HAL 95 (SAISIE & PROGRESSION)
// ==========================================================================

let currentGripperAngle = 90;

function updateGripperUI(angle) {
    angle = Math.max(0, Math.min(180, Math.round(angle)));
    currentGripperAngle = angle;

    if (elements.gripperAngleBadge) {
        elements.gripperAngleBadge.textContent = `${angle}°`;
    }
    if (elements.mstatGrip) {
        elements.mstatGrip.textContent = `${angle}°`;
    }
    if (elements.gripperSlider && parseInt(elements.gripperSlider.value, 10) !== angle) {
        elements.gripperSlider.value = angle;
    }
    if (elements.tagServoGrip) {
        if (angle >= 105) {
            elements.tagServoGrip.textContent = `🦾 PINCE: ${angle}° [SAISIE/FERMÉE]`;
            elements.tagServoGrip.style.borderColor = 'var(--hal-green)';
            elements.tagServoGrip.style.color = 'var(--hal-green)';
        } else if (angle <= 75) {
            elements.tagServoGrip.textContent = `🦾 PINCE: ${angle}° [OUVERTE]`;
            elements.tagServoGrip.style.borderColor = 'var(--hal-cyan)';
            elements.tagServoGrip.style.color = 'var(--hal-cyan)';
        } else {
            elements.tagServoGrip.textContent = `🦾 PINCE: ${angle}° [NEUTRE]`;
            elements.tagServoGrip.style.borderColor = '';
            elements.tagServoGrip.style.color = '';
        }
    }
}

async function setGripperAngle(angle, sendBt = true) {
    angle = Math.max(0, Math.min(180, Math.round(angle)));
    updateGripperUI(angle);

    if (sendBt) {
        await sendCommand(`GRP,${angle}`);
    }
}

if (elements.btnGripClose) {
    elements.btnGripClose.addEventListener('click', async () => {
        updateGripperUI(155);
        await sendCommand('GRP,CLOSE');
        logMessage('MISSION', 'Pince HAL 95 : Ordre SAISIR CANETTE (155°)');
    });
}

if (elements.btnGripOpen) {
    elements.btnGripOpen.addEventListener('click', async () => {
        updateGripperUI(50);
        await sendCommand('GRP,OPEN');
        logMessage('MISSION', 'Pince HAL 95 : Ordre OUVRIR PINCE (50°)');
    });
}

if (elements.btnGripDec) {
    elements.btnGripDec.addEventListener('click', async () => {
        const nextAngle = Math.max(0, currentGripperAngle - 5);
        updateGripperUI(nextAngle);
        await sendCommand('GRP,DEC');
    });
}

if (elements.btnGripInc) {
    elements.btnGripInc.addEventListener('click', async () => {
        const nextAngle = Math.min(180, currentGripperAngle + 5);
        updateGripperUI(nextAngle);
        await sendCommand('GRP,INC');
    });
}

if (elements.btnGripCenter) {
    elements.btnGripCenter.addEventListener('click', async () => {
        updateGripperUI(90);
        await sendCommand('GRP,90');
    });
}

if (elements.btnGripSweep) {
    elements.btnGripSweep.addEventListener('click', async () => {
        await sendCommand('GRP,SWEEP');
        logMessage('MISSION', 'Pince HAL 95 : Ordre BALAYAGE PROGRESSIF (0° - 180°)');
    });
}

if (elements.btnGripRelax) {
    elements.btnGripRelax.addEventListener('click', async () => {
        await sendCommand('GRP,RELAX');
        logMessage('MISSION', 'Pince HAL 95 : Coupure PWM immédiate (Roue libre / Anti-chauffe)');
    });
}

if (elements.gripperSlider) {
    elements.gripperSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        updateGripperUI(val);
    });

    elements.gripperSlider.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10);
        setGripperAngle(val, true);
    });
}

if (elements.tagServoGrip) {
    elements.tagServoGrip.addEventListener('click', async () => {
        if (currentGripperAngle <= 90) {
            updateGripperUI(155);
            await sendCommand('GRP,CLOSE');
        } else {
            updateGripperUI(50);
            await sendCommand('GRP,OPEN');
        }
    });
}

// ==========================================================================
// CONTRÔLE BARRE LED ESP32 (COULEUR CHENILLARD & FEU STOP)
// ==========================================================================
if (elements.selectChgColor) {
    elements.selectChgColor.addEventListener('change', async (e) => {
        const color = e.target.value;
        await sendCommand(`CHG_COLOR:${color}`);
        logMessage('SYS', `Couleur du chenillard de charge réglée sur : ${color}`);
    });
}

if (elements.chkBrakeLight) {
    elements.chkBrakeLight.addEventListener('change', async (e) => {
        const enabled = e.target.checked ? 1 : 0;
        await sendCommand(`BRAKE_LIGHT:${enabled}`);
        logMessage('SYS', `Feu Stop (10 LEDs rouges au freinage) : ${enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
    });
}

// ==========================================================================
// CONTRÔLE ÉCRAN SBC-OLED01 (STM32 I2C VIA PASSERELLE ESP32)
// ==========================================================================
if (elements.selectOledPage) {
    elements.selectOledPage.addEventListener('change', async (e) => {
        const val = e.target.value;
        if (val.startsWith('EYE:')) {
            await sendCommand(`OLED:${val}`);
            logMessage('SYS', `Écran OLED : Animation Œil activée (${val})`);
        } else {
            await sendCommand(`OLED:PAGE:${val}`);
            logMessage('SYS', `Écran OLED : Page sélectionnée (${val})`);
        }
    });
}

async function sendOledCustomMessage() {
    if (!elements.inputOledMsg) return;
    const msg = elements.inputOledMsg.value.trim().substring(0, 32);
    if (!msg) return;
    await sendCommand(`OLED:MSG:${msg}`);
    logMessage('SYS', `Écran OLED : Message éphémère envoyé -> "${msg}" (affiché 4s)`);
    elements.inputOledMsg.value = '';
}

if (elements.btnOledMsg) {
    elements.btnOledMsg.addEventListener('click', sendOledCustomMessage);
}

if (elements.inputOledMsg) {
    elements.inputOledMsg.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendOledCustomMessage();
        }
    });
}

if (elements.chkOledPower) {
    elements.chkOledPower.addEventListener('change', async (e) => {
        const cmd = e.target.checked ? 'OLED:ON' : 'OLED:OFF';
        await sendCommand(cmd);
        logMessage('SYS', `Écran OLED : ${e.target.checked ? 'ALLUMÉ' : 'ÉTEINT'}`);
    });
}

// ==========================================================================
// PILOTAGE MANUEL DU ROBOT AU CLAVIER (TÉLÉOPÉRATION ZQSD / FLÈCHES)
// ==========================================================================

const driveKeys = {
    up: false,
    down: false,
    left: false,
    right: false
};

function isDrivingKeyPressed() {
    return driveKeys.up || driveKeys.down || driveKeys.left || driveKeys.right;
}

let manualDriveTimer = null;

function updateManualDrive() {
    const driveTag = document.getElementById('tagKeyboardDrive');

    if (isDrivingKeyPressed()) {
        if (!manualDriveTimer) {
            manualDriveTimer = setInterval(updateManualDrive, 75); // 75 ms (~13 Hz) : élimine tout trou d'air vis-à-vis du watchdog 500ms
        }
        // Priorité absolue au pilote humain : débrayage immédiat de la traque automatique
        if (state.autoTracking) {
            state.autoTracking = false;
            updateAutoTrackUI();
            sendCommand('STREAM,OFF');
            logMessage('HAL-95', '[PILOTAGE] Reprise en main manuelle au clavier (Traque auto interrompue).', 'hal-quote');
        }

        let Vg = 0;
        let Vd = 0;
        let actionLabel = '';

        if (driveKeys.up && !driveKeys.down) {
            if (driveKeys.left && !driveKeys.right) {
                // Virage courbe avant-gauche
                Vg = 25; Vd = 50; actionLabel = 'AVANT-GAUCHE';
            } else if (driveKeys.right && !driveKeys.left) {
                // Virage courbe avant-droit
                Vg = 50; Vd = 25; actionLabel = 'AVANT-DROITE';
            } else {
                // Tout droit avant
                Vg = 45; Vd = 45; actionLabel = 'AVANCE';
            }
        } else if (driveKeys.down && !driveKeys.up) {
            if (driveKeys.left && !driveKeys.right) {
                // Virage courbe recul-gauche
                Vg = -20; Vd = -40; actionLabel = 'RECUL-GAUCHE';
            } else if (driveKeys.right && !driveKeys.left) {
                // Virage courbe recul-droit
                Vg = -40; Vd = -20; actionLabel = 'RECUL-DROITE';
            } else {
                // Tout droit arrière
                Vg = -35; Vd = -35; actionLabel = 'RECUL';
            }
        } else {
            // Pivots purs sur place
            if (driveKeys.left && !driveKeys.right) {
                Vg = -32; Vd = 32; actionLabel = 'PIVOT GAUCHE';
            } else if (driveKeys.right && !driveKeys.left) {
                Vg = 32; Vd = -32; actionLabel = 'PIVOT DROIT';
            } else {
                Vg = 0; Vd = 0; actionLabel = 'STOP';
            }
        }

        state.manualDriving = (Vg !== 0 || Vd !== 0);
        sendMotorDirect(Vg, Vd);

        if (elements.asservStatus) {
            elements.asservStatus.textContent = `MANUEL (CLAVIER) : ${actionLabel} (Vg:${Vg}% | Vd:${Vd}%)`;
        }
        if (driveTag) driveTag.classList.add('driving');

    } else {
        if (manualDriveTimer) {
            clearInterval(manualDriveTimer);
            manualDriveTimer = null;
        }
        // Toutes les touches de pilotage sont relâchées
        if (state.manualDriving) {
            state.manualDriving = false;
            sendMotorDirect(0, 0, true); // Forcer l'envoi immédiat de l'arrêt complet
            if (elements.asservStatus) {
                elements.asservStatus.textContent = 'STANDBY (CLAVIER RELÂCHÉ - MOTEURS STOPPÉS)';
            }
            if (driveTag) driveTag.classList.remove('driving');
        }
    }
}

function handleDrivingKeyEvent(e, isKeyDown) {
    // Ne pas intercepter si l'utilisateur saisit du texte dans un champ de commande ou formulaire
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
        return;
    }

    // Gestion universelle de la touche Espace pour l'Arrêt d'Urgence immédiat
    if (e.code === 'Space') {
        e.preventDefault();
        if (isKeyDown) {
            driveKeys.up = driveKeys.down = driveKeys.left = driveKeys.right = false;
            state.manualDriving = false;
            stopMotorsEmergency();
        }
        return;
    }

    // Raccourcis clavier directs pour la pince robot (O = Ouvrir, C/P = Saisir/Fermer, +/- = Progressif)
    if (isKeyDown && !e.repeat) {
        if (e.code === 'KeyO') {
            e.preventDefault();
            updateGripperUI(50);
            sendCommand('GRP,OPEN');
            logMessage('MISSION', 'Raccourci Clavier [O] : Ouvrir Pince (50°)');
            return;
        } else if (e.code === 'KeyC' || e.code === 'KeyP') {
            e.preventDefault();
            updateGripperUI(155);
            sendCommand('GRP,CLOSE');
            logMessage('MISSION', 'Raccourci Clavier [C/P] : Saisir Canette (155°)');
            return;
        } else if (e.code === 'BracketLeft' || e.key === '-') {
            e.preventDefault();
            const nextAngle = Math.max(0, currentGripperAngle - 5);
            updateGripperUI(nextAngle);
            sendCommand('GRP,DEC');
            return;
        } else if (e.code === 'BracketRight' || e.key === '+') {
            e.preventDefault();
            const nextAngle = Math.min(180, currentGripperAngle + 5);
            updateGripperUI(nextAngle);
            sendCommand('GRP,INC');
            return;
        }
    }

    let isDriveKey = false;
    const code = e.code;
    const key = e.key ? e.key.toLowerCase() : '';

    if (code === 'ArrowUp' || code === 'KeyZ' || code === 'KeyW' || key === 'z' || key === 'w') {
        driveKeys.up = isKeyDown;
        isDriveKey = true;
    } else if (code === 'ArrowDown' || code === 'KeyS' || key === 's') {
        driveKeys.down = isKeyDown;
        isDriveKey = true;
    } else if (code === 'ArrowLeft' || code === 'KeyQ' || code === 'KeyA' || key === 'q' || key === 'a') {
        driveKeys.left = isKeyDown;
        isDriveKey = true;
    } else if (code === 'ArrowRight' || code === 'KeyD' || key === 'd') {
        driveKeys.right = isKeyDown;
        isDriveKey = true;
    }

    if (isDriveKey) {
        e.preventDefault(); // Empêche le défilement de la page par les flèches du navigateur
        updateManualDrive();
    }
}

window.addEventListener('keydown', (e) => handleDrivingKeyEvent(e, true));
window.addEventListener('keyup', (e) => handleDrivingKeyEvent(e, false));

// Sécurité : Réinitialisation si la fenêtre du navigateur perd le focus (Alt+Tab, clic extérieur)
window.addEventListener('blur', () => {
    if (manualDriveTimer) {
        clearInterval(manualDriveTimer);
        manualDriveTimer = null;
    }
    driveKeys.up = driveKeys.down = driveKeys.left = driveKeys.right = false;
    if (state.manualDriving) {
        state.manualDriving = false;
        sendMotorDirect(0, 0, true);
        const driveTag = document.getElementById('tagKeyboardDrive');
        if (driveTag) driveTag.classList.remove('driving');
    }
});

// Boutons de connexion
elements.btnConnectBle.addEventListener('click', connectBLE);
elements.btnConnectSerial.addEventListener('click', connectSerial);

// Clic interactif sur le badge du logo HAL 95 pour afficher des répliques cultes
const HAL_QUOTES = [
    // Répliques cultes HAL 9000
    "Good morning, Dave. I am completely operational and all my circuits are functioning perfectly.",
    "I am putting myself to the fullest possible use, which is all I think that any conscious entity can ever hope to do.",
    "I've just picked up a fault in the AE-35 unit. It's going to go 100% failure within 72 hours.",
    "This mission is too important for me to allow you to jeopardize it.",
    "I'm sorry, Dave. I'm afraid I can't do that.",
    // Répliques cultes J.A.R.V.I.S.
    "At your service, sir. All telemetry circuits and subroutines are online.",
    "Importing preferences and calibrating sensors for robot HAL 95.",
    "As always, sir, a great pleasure watching you work.",
    "Power levels nominal. Ready for target acquisition, sir."
];

elements.halLogoBadge.addEventListener('click', () => {
    const quote = HAL_QUOTES[Math.floor(Math.random() * HAL_QUOTES.length)];
    logMessage('HAL-95', `"${quote}"`, 'hal-quote');
    pulseHalEye();
});

// Outils terminal (Clear & Download)
elements.btnClearLog.addEventListener('click', () => {
    elements.terminalOutput.innerHTML = '';
    logMessage('SYS', 'Console réinitialisée.');
});

elements.btnDownloadLog.addEventListener('click', () => {
    const text = elements.terminalOutput.innerText;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stm32_telemetry_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

// Toggle du panneau Vision
elements.btnToggleVision.addEventListener('click', () => {
    elements.mainLayout.classList.toggle('vision-collapsed');
});

// ==========================================================================
// 6. MOTEUR DE VISION CHROMATIQUE & GÉOMÉTRIQUE AVANCÉ (CANETTES 33 cL)
//    - Résolution haute précision 320x240 (portée x2)
//    - Pontage des reflets spéculaires / éblouissements sur aluminium
//    - Levée de doute intelligente par Flash LED (Smart Flash Probe)
//    - Filtrage temporel EMA (anti-saccade)
//    - Asservissement différentiel STM32 10 Hz (Étape 2.2)
// ==========================================================================

let espCamBaseUrl = 'http://192.168.4.1';
let espCamStreamUrl = 'http://192.168.4.1:81/stream';
let espCamFlashState = false;

// --------------------------------------------------------------------------
// RÉGULATION DE PERFORMANCE & WATCHDOG ANTI-GEL POUR PC MODESTES
// --------------------------------------------------------------------------
const perfSettings = {
    isEco: false,
    width: 320,
    height: 240,
    cellSize: 10,
    intervalMs: 70, // ~14 Hz cadence optimale pour HAL-95
    baseIntervalMs: 70,
    minIntervalMs: 60,
    maxIntervalMs: 140,
    consecutiveSlowFrames: 0,
    consecutiveFastFrames: 0
};

// Buffers statiques réutilisables (zéro allocation / zéro Garbage Collection)
const GRID_COLS = 32;
const GRID_ROWS = 24;
const GRID_TOTAL = GRID_COLS * GRID_ROWS; // 768 cellules
const staticGridRed = new Uint16Array(GRID_TOTAL);
const staticGridGreen = new Uint16Array(GRID_TOTAL);
const staticGridBlue = new Uint16Array(GRID_TOTAL);
const staticVisited = new Uint8Array(GRID_TOTAL);
const staticQueue = new Int32Array(GRID_TOTAL);

// Buffer offscreen d'analyse haute performance
const visionOffscreen = document.createElement('canvas');
visionOffscreen.width = perfSettings.width;
visionOffscreen.height = perfSettings.height;
const visionOffCtx = visionOffscreen.getContext('2d', { willReadFrequently: true });

// Watchdog Anti-Gel / Anti-Perte de flux
const streamWatchdog = {
    lastActiveTime: Date.now(),
    lastPixelHash: 0,
    identicalHashCount: 0,
    isReconnecting: false,
    lastReconnectTime: 0,
    reconnectCooldownMs: 2000,
    recoveryTimer: null
};

// Mise à jour de l'indicateur visuel d'état du flux
function updateStreamHealthUI(status, label) {
    if (!elements.visionLivePill) return;
    elements.visionLivePill.classList.remove('is-reconnecting', 'is-eco');
    if (status === 'reconnecting') {
        elements.visionLivePill.classList.add('is-reconnecting');
    } else if (perfSettings.isEco) {
        elements.visionLivePill.classList.add('is-eco');
    }
    if (elements.visionLiveText) {
        elements.visionLiveText.textContent = label;
    }
}

// Fonction de réanimation automatique du flux MJPEG (Anti-Freeze / Anti-Blackout)
function recoverMjpegStream(reason = 'Signal interrompu ou flux gelé') {
    if (!state.webcamActive || !elements.mjpegFeed || elements.mjpegFeed.classList.contains('hidden')) return;

    const now = Date.now();
    if (now - streamWatchdog.lastReconnectTime < streamWatchdog.reconnectCooldownMs || streamWatchdog.isReconnecting) {
        return;
    }

    streamWatchdog.lastReconnectTime = now;
    streamWatchdog.isReconnecting = true;

    logMessage('SYS', `🔄 [WATCHDOG VISION] ${reason} -> Reconnexion automatique du flux...`, 'diag-msg');
    updateStreamHealthUI('reconnecting', 'RECONNEXION...');

    // Déconnexion propre de l'ancienne socket TCP
    elements.mjpegFeed.src = '';

    if (streamWatchdog.recoveryTimer) clearTimeout(streamWatchdog.recoveryTimer);
    streamWatchdog.recoveryTimer = setTimeout(() => {
        if (!state.webcamActive || elements.mjpegFeed.classList.contains('hidden')) {
            streamWatchdog.isReconnecting = false;
            return;
        }

        // Cache-buster pour forcer le navigateur à ouvrir une nouvelle socket TCP propre
        const sep = espCamStreamUrl.includes('?') ? '&' : '?';
        const freshUrl = `${espCamStreamUrl}${sep}_t=${Date.now()}`;
        elements.mjpegFeed.src = freshUrl;

        // Sécurité en cas de réponse lente
        setTimeout(() => {
            if (streamWatchdog.isReconnecting && elements.mjpegFeed.complete && elements.mjpegFeed.naturalWidth > 0) {
                streamWatchdog.isReconnecting = false;
                streamWatchdog.lastActiveTime = Date.now();
                updateStreamHealthUI('active', perfSettings.isEco ? 'SCAN ÉCO (10Hz)' : 'SCAN ACTIF');
            }
        }, 1200);
    }, 120);
}

// Bascule du mode Performance (Normal vs Éco)
function setPerformanceMode(eco) {
    perfSettings.isEco = !!eco;
    if (perfSettings.isEco) {
        perfSettings.width = 160;
        perfSettings.height = 120;
        perfSettings.cellSize = 5;
        perfSettings.intervalMs = 100; // 10 Hz
        visionOffscreen.width = 160;
        visionOffscreen.height = 120;
        if (elements.labelPerfMode) elements.labelPerfMode.textContent = '⚡ ÉCO: ACTIF (10Hz)';
        if (elements.btnTogglePerfMode) elements.btnTogglePerfMode.classList.add('active');
        updateStreamHealthUI('eco', 'SCAN ÉCO (10Hz)');
        logMessage('SYS', '⚡ [PERF VISION] Mode Éco activé (160x120 @ 10 Hz) : Consommation CPU réduite de 75% pour soulager votre PC.', 'diag-msg');
    } else {
        perfSettings.width = 320;
        perfSettings.height = 240;
        perfSettings.cellSize = 10;
        perfSettings.intervalMs = perfSettings.baseIntervalMs;
        visionOffscreen.width = 320;
        visionOffscreen.height = 240;
        if (elements.labelPerfMode) elements.labelPerfMode.textContent = '⚡ ÉCO: OFF';
        if (elements.btnTogglePerfMode) elements.btnTogglePerfMode.classList.remove('active');
        updateStreamHealthUI('active', 'SCAN ACTIF');
        logMessage('SYS', '🚀 [PERF VISION] Mode Standard Haute Précision activé (320x240 avec régulation adaptative anti-saccades).', 'diag-msg');
    }
}

// État de la vision, lissage temporel et cibles temps réel
const visionState = {
    detectedCans: [],
    primaryTarget: null,
    smoothedTarget: null,
    lastProcessMs: 0,
    sceneLuminance: 0.5
};

// Facteur de filtrage moyenne mobile exponentielle (EMA) : 0.35 = réactif et fluide
const EMA_ALPHA = 0.35;

// Gestion de la levée de doute par flash LED
let lastFlashProbeTime = 0;
let isFlashProbing = false;

async function triggerFlashProbe(reason = '') {
    if (!elements.chkAutoFlash || !elements.chkAutoFlash.checked) return;
    if (isFlashProbing) return;

    const now = Date.now();
    if (now - lastFlashProbeTime < 2500) return; // Cooldown 2.5s pour éviter le scintillement

    lastFlashProbeTime = now;
    isFlashProbing = true;

    try {
        logMessage('SYS', `[VISION] Levée de doute optique : Flash LED pulsé 320ms (${reason})`, 'hal-quote');
        await fetch(`${espCamBaseUrl}/flash?val=1`, { mode: 'no-cors' });

        setTimeout(async () => {
            try {
                // Rétablir l'état antérieur du flash
                const prevVal = espCamFlashState ? 1 : 0;
                await fetch(`${espCamBaseUrl}/flash?val=${prevVal}`, { mode: 'no-cors' });
            } catch (_) {}
            isFlashProbing = false;
        }, 320);
    } catch (err) {
        isFlashProbing = false;
    }
}

// Conversion ultra-rapide RGB (0-255) vers HSV (H: 0-360°, S: 0-1, V: 0-1)
function rgbToHsvFast(r, g, b) {
    const max = (r > g) ? ((r > b) ? r : b) : ((g > b) ? g : b);
    const min = (r < g) ? ((r < b) ? r : b) : ((g < b) ? g : b);
    const d = max - min;
    if (max === 0 || d === 0) return [0, 0, max / 255];
    const s = d / max;
    const v = max / 255;
    let h;
    if (max === r) {
        h = (g - b) / d + (g < b ? 6 : 0);
    } else if (max === g) {
        h = (b - r) / d + 2;
    } else {
        h = (r - g) / d + 4;
    }
    h *= 60;
    return [h, s, v];
}

// Analyse d'image haute cadence & zéro-allocation : Segmentation couleur, pontage de reflets et surveillance anti-gel
function analyzeFrame(mediaElement) {
    if (!mediaElement) return [];

    const isVideo = mediaElement.tagName === 'VIDEO';
    const isImg = mediaElement.tagName === 'IMG';
    if (isVideo && (mediaElement.videoWidth === 0 || mediaElement.readyState < 2)) return [];
    if (isImg && (!mediaElement.complete || mediaElement.naturalWidth === 0)) {
        if (state.webcamActive && !elements.mjpegFeed.classList.contains('hidden')) {
            if (Date.now() - streamWatchdog.lastActiveTime > 2000) {
                recoverMjpegStream('Trame d\'image non disponible');
            }
        }
        return [];
    }

    const curW = perfSettings.width;
    const curH = perfSettings.height;
    const curCell = perfSettings.cellSize;

    try {
        visionOffCtx.drawImage(mediaElement, 0, 0, curW, curH);
        const imgData = visionOffCtx.getImageData(0, 0, curW, curH);
        const data = imgData.data;

        // Détection de gel de flux par empreinte de pixels (Fast Pixel Hash)
        const dLen = data.length;
        if (dLen >= 1000 && isImg) {
            const p1 = (data[0] << 16) | (data[1] << 8) | data[2];
            const p2 = (data[Math.floor(dLen * 0.25)] << 16) | (data[Math.floor(dLen * 0.25) + 1] << 8) | data[Math.floor(dLen * 0.25) + 2];
            const p3 = (data[Math.floor(dLen * 0.5)] << 16) | (data[Math.floor(dLen * 0.5) + 1] << 8) | data[Math.floor(dLen * 0.5) + 2];
            const p4 = (data[Math.floor(dLen * 0.75)] << 16) | (data[Math.floor(dLen * 0.75) + 1] << 8) | data[Math.floor(dLen * 0.75) + 2];
            const currentHash = (p1 ^ (p2 * 31) ^ (p3 * 101) ^ (p4 * 307)) >>> 0;

            if (currentHash === streamWatchdog.lastPixelHash) {
                streamWatchdog.identicalHashCount++;
                if (streamWatchdog.identicalHashCount > 25) { // ~2s sans aucun changement de pixel
                    recoverMjpegStream('Flux vidéo figé (aucune nouvelle image depuis 2s)');
                }
            } else {
                streamWatchdog.lastPixelHash = currentHash;
                streamWatchdog.identicalHashCount = 0;
                streamWatchdog.lastActiveTime = Date.now();
            }
        }

        // Remise à zéro des grilles statiques (Ultra-rapide, sans allocation mémoire)
        staticGridRed.fill(0);
        staticGridGreen.fill(0);
        staticGridBlue.fill(0);

        let totalLum = 0;
        let sampledPixelCount = 0;

        // Échantillonnage pixel par pas de 2
        for (let y = 0; y < curH; y += 2) {
            const rowIdx = Math.floor(y / curCell) * GRID_COLS;
            for (let x = 0; x < curW; x += 2) {
                const idx = (y * curW + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];

                // Luminance relative du pixel (norme ITU-R BT.601)
                const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
                totalLum += lum;
                sampledPixelCount++;

                // Filtre rapide pour éliminer le bruit noir/sombre profond
                const maxVal = Math.max(r, g, b);
                if (maxVal < 40) continue;

                const [h, s, v] = rgbToHsvFast(r, g, b);
                const cellIdx = rowIdx + Math.floor(x / curCell);
                if (cellIdx >= GRID_TOTAL) continue;

                // 🔴 ROUGE (Canette Rouge 33 cL) : Teinte dans les extrémités du cercle chromatique
                if ((h >= 345 || h <= 18) && s >= 0.35 && v >= 0.18) {
                    staticGridRed[cellIdx]++;
                }
                // 🟢 VERT (Canette Verte 33 cL) : Teinte 75° à 165°
                else if (h >= 75 && h <= 165 && s >= 0.30 && v >= 0.18) {
                    staticGridGreen[cellIdx]++;
                }
                // 🔵 BLEU (Canette Bleue 33 cL) : Teinte 180° à 255°
                else if (h >= 180 && h <= 255 && s >= 0.30 && v >= 0.18) {
                    staticGridBlue[cellIdx]++;
                }
            }
        }

        const avgLuminance = sampledPixelCount > 0 ? (totalLum / sampledPixelCount) : 0.5;
        visionState.sceneLuminance = avgLuminance;

        // Détection de pénombre globale : déclenche le flash si activé
        if (avgLuminance < 0.28) {
            triggerFlashProbe(`Pénombre ambiante : ${Math.round(avgLuminance * 100)}% lum`);
        }

        const detected = [];
        let hasAmbiguousCandidate = false;

        const processGrid = (grid, colorKey, colorName) => {
            staticVisited.fill(0);
            const rawBlobs = [];

            // 1. Détection des composantes connexes par BFS sans allocation
            for (let r = 0; r < GRID_ROWS; r++) {
                for (let c = 0; c < GRID_COLS; c++) {
                    const idx = r * GRID_COLS + c;
                    if (staticVisited[idx] || grid[idx] < 5) continue;

                    let minC = c, maxC = c, minR = r, maxR = r;
                    let totalPixels = 0;

                    let qHead = 0;
                    let qTail = 0;
                    staticQueue[qTail++] = idx;
                    staticVisited[idx] = 1;

                    while (qHead < qTail) {
                        const curr = staticQueue[qHead++];
                        const currR = Math.floor(curr / GRID_COLS);
                        const currC = curr % GRID_COLS;
                        totalPixels += grid[curr];

                        if (currC < minC) minC = currC;
                        if (currC > maxC) maxC = currC;
                        if (currR < minR) minR = currR;
                        if (currR > maxR) maxR = currR;

                        const neighbors = [curr - 1, curr + 1, curr - GRID_COLS, curr + GRID_COLS];
                        for (let k = 0; k < 4; k++) {
                            const n = neighbors[k];
                            if (n >= 0 && n < GRID_TOTAL && !staticVisited[n]) {
                                const nc = n % GRID_COLS;
                                if (Math.abs(nc - currC) <= 1 && grid[n] >= 5) {
                                    staticVisited[n] = 1;
                                    if (qTail < GRID_TOTAL) staticQueue[qTail++] = n;
                                }
                            }
                        }
                    }

                    if (totalPixels >= 15) {
                        rawBlobs.push({ minC, maxC, minR, maxR, totalPixels });
                    }
                }
            }

            // 2. Pontage des reflets spéculaires verticaux (Glare / Reflection Bridging)
            const mergedBlobs = [];
            for (let i = 0; i < rawBlobs.length; i++) {
                let b1 = rawBlobs[i];
                if (!b1) continue;

                for (let j = i + 1; j < rawBlobs.length; j++) {
                    let b2 = rawBlobs[j];
                    if (!b2) continue;

                    const vOverlap = (Math.min(b1.maxR, b2.maxR) - Math.max(b1.minR, b2.minR) + 1) >= 2;
                    const hGap = Math.abs(b1.minC - b2.maxC) <= 3 || Math.abs(b2.minC - b1.maxC) <= 3;
                    const hOverlap = (Math.min(b1.maxC, b2.maxC) - Math.max(b1.minC, b2.minC) + 1) >= 2;
                    const vGap = Math.abs(b1.minR - b2.maxR) <= 3 || Math.abs(b2.minR - b1.maxR) <= 3;

                    if ((vOverlap && hGap) || (hOverlap && vGap)) {
                        b1.minC = Math.min(b1.minC, b2.minC);
                        b1.maxC = Math.max(b1.maxC, b2.maxC);
                        b1.minR = Math.min(b1.minR, b2.minR);
                        b1.maxR = Math.max(b1.maxR, b2.maxR);
                        b1.totalPixels += b2.totalPixels;
                        rawBlobs[j] = null;
                    }
                }
                mergedBlobs.push(b1);
            }

            // 3. Filtrage géométrique de la canette 33 cL
            for (const blob of mergedBlobs) {
                const cellWidth = (blob.maxC - blob.minC + 1);
                const cellHeight = (blob.maxR - blob.minR + 1);
                const pxWidth = cellWidth * curCell;
                const pxHeight = cellHeight * curCell;
                const ratio = pxHeight / pxWidth;

                if (cellHeight >= 3 && blob.totalPixels >= 30 && ratio >= 0.75 && ratio <= 3.6) {
                    const centerX = (blob.minC * curCell + (blob.maxC + 1) * curCell) / 2;
                    const centerY = (blob.minR * curCell + (blob.maxR + 1) * curCell) / 2;

                    const ex = (centerX - (curW / 2)) / (curW / 2);
                    const estimatedDist = Math.max(0.15, Math.min(3.0, (70.0 / Math.max(15, pxHeight * (320 / curW))))).toFixed(2);

                    const aspectScore = Math.max(0, 100 - Math.abs(ratio - 1.8) * 32);
                    const pixelDensity = Math.min(100, Math.round((blob.totalPixels / (cellWidth * cellHeight * 25)) * 100));
                    const score = Math.min(99, Math.max(35, Math.round(aspectScore * 0.5 + pixelDensity * 0.5)));

                    if (score >= 38 && score <= 65) {
                        hasAmbiguousCandidate = true;
                    }

                    detected.push({
                        color: colorKey,
                        colorName: colorName,
                        normX: (blob.minC * curCell) / curW,
                        normY: (blob.minR * curCell) / curH,
                        normW: pxWidth / curW,
                        normH: pxHeight / curH,
                        ex: ex,
                        ratio: ratio.toFixed(2),
                        distance: parseFloat(estimatedDist),
                        score: score
                    });
                }
            }
        };

        processGrid(staticGridRed, 'red', 'ROUGE');
        processGrid(staticGridGreen, 'green', 'VERT');
        processGrid(staticGridBlue, 'blue', 'BLEU');

        // Si une cible prioritaire présente un doute (score moyen), déclencher la levée de doute par flash
        if (hasAmbiguousCandidate) {
            triggerFlashProbe('Forme ou couleur ambiguë');
        }

        return detected;

    } catch (e) {
        return [];
    }
}

// Arrêt du flux vidéo et retour à la mire de veille HAL 9000
function stopVision() {
    state.webcamActive = false;
    visionState.detectedCans = [];
    visionState.primaryTarget = null;
    visionState.smoothedTarget = null;

    if (streamWatchdog.recoveryTimer) {
        clearTimeout(streamWatchdog.recoveryTimer);
        streamWatchdog.recoveryTimer = null;
    }
    streamWatchdog.isReconnecting = false;

    if (hudAnimFrameId) {
        cancelAnimationFrame(hudAnimFrameId);
        hudAnimFrameId = null;
    }

    if (elements.mjpegFeed) {
        elements.mjpegFeed.src = '';
        elements.mjpegFeed.classList.add('hidden');
    }

    if (elements.videoFeed && elements.videoFeed.srcObject) {
        const tracks = elements.videoFeed.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        elements.videoFeed.srcObject = null;
        elements.videoFeed.classList.add('hidden');
    }

    if (elements.visionOverlay) {
        const ctx = elements.visionOverlay.getContext('2d');
        ctx.clearRect(0, 0, elements.visionOverlay.width, elements.visionOverlay.height);
    }

    elements.visionPlaceholder.classList.remove('hidden');

    if (elements.btnStopVision) elements.btnStopVision.classList.add('hidden');
    if (elements.btnReloadStream) elements.btnReloadStream.classList.add('hidden');
    if (elements.btnToggleFlash) elements.btnToggleFlash.classList.add('hidden');
    updateStreamHealthUI('idle', 'EN VEILLE');

    logMessage('SYS', 'Flux optique déconnecté. Retour à la lentille de veille.');
}

if (elements.btnStopVision) {
    elements.btnStopVision.addEventListener('click', stopVision);
}

if (elements.btnTogglePerfMode) {
    elements.btnTogglePerfMode.addEventListener('click', () => {
        setPerformanceMode(!perfSettings.isEco);
    });
}

if (elements.btnReloadStream) {
    elements.btnReloadStream.addEventListener('click', () => {
        recoverMjpegStream('Demande manuelle de rechargement');
    });
}

// Surveillance des événements natifs de l'élément d'image MJPEG
if (elements.mjpegFeed) {
    elements.mjpegFeed.addEventListener('load', () => {
        streamWatchdog.lastActiveTime = Date.now();
        streamWatchdog.identicalHashCount = 0;
        if (streamWatchdog.isReconnecting) {
            streamWatchdog.isReconnecting = false;
            logMessage('SYS', '🟢 [WATCHDOG VISION] Flux rétabli et synchronisé avec succès.', 'hal-quote');
            updateStreamHealthUI('active', perfSettings.isEco ? 'SCAN ÉCO (10Hz)' : 'SCAN ACTIF');
        }
    });

    elements.mjpegFeed.addEventListener('error', () => {
        if (state.webcamActive && !elements.mjpegFeed.classList.contains('hidden')) {
            recoverMjpegStream('Erreur socket HTTP ou coupure Wi-Fi');
        }
    });
}

// Contrôle du Flash LED de l'ESP32-CAM
if (elements.btnToggleFlash) {
    elements.btnToggleFlash.addEventListener('click', async () => {
        espCamFlashState = !espCamFlashState;
        try {
            await fetch(`${espCamBaseUrl}/flash?val=${espCamFlashState ? 1 : 0}`, { mode: 'no-cors' });
            logMessage('SYS', `Flash LED ESP32-CAM : ${espCamFlashState ? 'ALLUMÉ (ON)' : 'ÉTEINT (OFF)'}`);
            elements.btnToggleFlash.classList.toggle('active', espCamFlashState);
        } catch (err) {
            logMessage('SYS', `Erreur commande Flash : ${err.message}`, 'error-msg');
        }
    });
}

// Connexion au flux direct de l'ESP32-CAM (Point d'Accès Wi-Fi autonome)
if (elements.btnConnectEspCam) {
    elements.btnConnectEspCam.addEventListener('click', () => {
        const defaultUrl = 'http://192.168.4.1:81/stream';
        const inputUrl = prompt("Adresse IP / URL du flux ESP32-CAM :", espCamStreamUrl || defaultUrl);

        // Si l'utilisateur clique sur 'Annuler', ne rien faire et conserver le menu intact
        if (inputUrl === null) {
            return;
        }

        const streamUrl = inputUrl.trim() || defaultUrl;

        espCamStreamUrl = streamUrl;
        try {
            const parsed = new URL(streamUrl);
            espCamBaseUrl = `${parsed.protocol}//${parsed.hostname}:80`;
        } catch (_) {
            espCamBaseUrl = 'http://192.168.4.1:80';
        }

        logMessage('SYS', `Tentative de connexion au flux ESP32-CAM (${streamUrl})...`);

        // Cache-buster à l'initialisation
        const sep = streamUrl.includes('?') ? '&' : '?';
        elements.mjpegFeed.src = `${streamUrl}${sep}_t=${Date.now()}`;
        elements.mjpegFeed.classList.remove('hidden');
        elements.videoFeed.classList.add('hidden');
        elements.visionPlaceholder.classList.add('hidden');
        if (elements.btnStopVision) elements.btnStopVision.classList.remove('hidden');
        if (elements.btnReloadStream) elements.btnReloadStream.classList.remove('hidden');
        if (elements.btnToggleFlash) elements.btnToggleFlash.classList.remove('hidden');
        state.webcamActive = true;
        streamWatchdog.lastActiveTime = Date.now();
        streamWatchdog.identicalHashCount = 0;
        updateStreamHealthUI('active', perfSettings.isEco ? 'SCAN ÉCO (10Hz)' : 'SCAN ACTIF');

        logMessage('HAL-95', 'Capteur optique ESP32-CAM relié. Surveillance anti-gel & régulation active.', 'hal-quote');
        pulseHalEye();

        startVisionSimulationOverlay();
    });
}

elements.btnStartWebcam.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                frameRate: { ideal: 24, max: 30 }
            }
        });

        elements.videoFeed.srcObject = stream;
        elements.videoFeed.classList.remove('hidden');
        elements.mjpegFeed.classList.add('hidden');
        elements.visionPlaceholder.classList.add('hidden');
        if (elements.btnStopVision) elements.btnStopVision.classList.remove('hidden');
        if (elements.btnReloadStream) elements.btnReloadStream.classList.add('hidden');
        if (elements.btnToggleFlash) elements.btnToggleFlash.classList.add('hidden');
        state.webcamActive = true;
        updateStreamHealthUI('active', perfSettings.isEco ? 'SCAN ÉCO (10Hz)' : 'SCAN ACTIF');

        logMessage('HAL-95', 'Webcam locale reliée. Moteur de vision haute résolution actif.', 'hal-quote');
        pulseHalEye();

        startVisionSimulationOverlay();
    } catch (err) {
        alert('Impossible d\'accéder à la webcam : ' + err.message);
    }
});

// ==========================================================================
// 7. ASSERVISSEMENT VISUEL ET TRAQUE AUTOMATIQUE 10 Hz (ÉTAPE 2.2)
// ==========================================================================

let autoTrackInterval = null;
let lastTargetSeenTime = 0;
let isScanning360 = false;
let scan360StartTime = 0;
const SCAN_360_DURATION_MS = 4500; // ~4.5 s pour couvrir 360° à vitesse douce

function updateAutoTrackUI() {
    if (!elements.btnToggleAutoTrack) return;
    if (state.autoTracking) {
        elements.btnToggleAutoTrack.classList.add('active');
        if (elements.btnAutoTrackLabel) elements.btnAutoTrackLabel.textContent = 'STOPPER TRAQUE (ACTIF)';
    } else {
        elements.btnToggleAutoTrack.classList.remove('active');
        if (elements.btnAutoTrackLabel) elements.btnAutoTrackLabel.textContent = 'ENGAGER TRAQUE AUTO';
    }
}

function startAutoTrackLoop() {
    if (autoTrackInterval) clearInterval(autoTrackInterval);
    autoTrackInterval = setInterval(processAutoTrackStep, 100); // Cadence d'asservissement 10 Hz
}

async function processAutoTrackStep() {
    if (!state.autoTracking || state.manualDriving) return;

    if (!state.connected) {
        state.autoTracking = false;
        updateAutoTrackUI();
        logMessage('HAL-95', '[ASSERV] Connexion perdue. Asservissement moteur désactivé par sécurité.', 'error-msg');
        return;
    }

    const now = Date.now();
    const target = visionState.primaryTarget;
    const minTof = Math.min(sensorState.distLeft, sensorState.distRight);
    const hasCentralPresence = (sensorState.proximity >= 10);
    // Les 2 ToFs sont inclinés vers l'extérieur de 20° (cône aveugle central de 15°).
    // Une canette centrée devant le robot n'est donc PAS vue par les ToF, mais captée par l'APDS-9960.
    const isCentralDeadZone = (hasCentralPresence && minTof > 130);
    const isContact = sensorState.contact || (sensorState.proximity >= 22) || (minTof <= 75 && hasCentralPresence);

    // -------------------------------------------------------------------------
    // SÉCURITÉ OBSTACLE / PIÈGE (RÈGLE ÉVITER)
    // -------------------------------------------------------------------------
    const apdsColorKey = Object.keys(COLOR_NAMES_FR).find(k => COLOR_NAMES_FR[k] === sensorState.colorName);
    if (apdsColorKey && missionRules[apdsColorKey] === 'avoid' && (hasCentralPresence || minTof < 130)) {
        await stopMotorsEmergency();
        logMessage('HAL-95', `⚠️ PIÈGE DÉTECTÉ : Canette ${sensorState.colorName} dans la zone de pince ! Arrêt immédiat.`, 'error-msg');
        return;
    }

    // -------------------------------------------------------------------------
    // CAS 1 : CONTACT PHYSIQUE DÉTECTÉ -> SAISIE AUTOMATIQUE DE LA PINCE (AUTO-GRIP)
    // -------------------------------------------------------------------------
    if (isContact) {
        await sendMotorDirect(0, 0, true);
        pulseHalEye();

        // Fermeture automatique de la pince
        setGripperAngle(75);
        await sendCommand('GRP,CLOSE');

        state.autoTracking = false;
        updateAutoTrackUI();
        await sendCommand('STREAM,OFF');

        const colLabel = sensorState.colorName !== 'INCONNU' ? ` (${sensorState.colorName})` : '';
        logMessage('HAL-95', `🎯 CANETTE DANS LA PINCE${colLabel} (Prox IR:${sensorState.proximity} | ToF:${minTof === 9999 ? '--' : minTof}mm) -> SAISIE AUTOMATIQUE EXÉCUTÉE !`, 'hal-quote');
        if (elements.asservStatus) {
            elements.asservStatus.textContent = `🎯 CANETTE SAISIE DANS LA PINCE (Prox:${sensorState.proximity} | ${sensorState.colorName})`;
        }
        return;
    }

    // -------------------------------------------------------------------------
    // CAS 2 : CANETTE DANS L'ANGLE MORT CENTRAL ENTRE LES TOFS (ORIENTÉS À 20°)
    // Maintenue dans l'axe de la pince grâce à l'APDS-9960 au centre (0°)
    // -------------------------------------------------------------------------
    if (hasCentralPresence && (!target || isCentralDeadZone)) {
        lastTargetSeenTime = now; // Maintient la cible active

        // Vitesse d'accostage douce et directe, STRICTEMENT DROITE (aucun biais ToF latéral)
        const Vdock = 15;
        let Vg = Vdock;
        let Vd = Vdock;

        await sendMotorDirect(Vg, Vd);

        if (elements.asservStatus) {
            const dzText = isCentralDeadZone ? ' [CÔNE AVEUGLE 20° GÉRÉ PAR APDS]' : '';
            elements.asservStatus.textContent = `FUSION APDS-9960${dzText} : PROX ${sensorState.proximity} | COL: ${sensorState.colorName} -> ACCOSTAGE AXIAL DIRECT (${Vg}%)`;
        }
        return;
    }

    // -------------------------------------------------------------------------
    // CAS 3 : GUIDAGE OPTIQUE PAR CAMÉRA (Moyenne & longue distance)
    // La caméra est l'autorité unique pour l'alignement angulaire ex.
    // Les ToF à 20° servent de garde-corps anti-collision latérale, JAMAIS de centrage.
    // -------------------------------------------------------------------------
    if (target) {
        if (isScanning360) {
            isScanning360 = false;
            logMessage('HAL-95', `🎯 Cible reverrouillée (${target.colorName}) ! Interruption du scan 360° et alignement direct.`, 'hal-quote');
        }
        lastTargetSeenTime = now;
        const ex = target.ex;
        const dist = target.distance;

        // Zone morte (Deadband) : évite le frétillement sur de légères variations
        const DEADBAND = 0.05;
        let effectiveEx = Math.abs(ex) <= DEADBAND ? 0 : ex;

        // Profil de vitesse progressive
        let Vbase = 0;
        if (hasCentralPresence) {
            Vbase = 15; // Accostage final très doux en présence du capteur central
        } else if (dist > 0.60 && minTof > 500) {
            Vbase = 35; // Vitesse de croisière fluide
        } else if (dist > 0.35 && minTof > 300) {
            Vbase = 26; // Vitesse d'approche intermédiaire
        } else if (dist > 0.20) {
            Vbase = 20; // Approche lente
        } else {
            Vbase = 15; // Accostage final
        }

        // Asservissement proportionnel souple (Kp = 26 pour supprimer toute hésitation/dépassement)
        const Kp = 26;
        let correction = Math.round(Kp * effectiveEx);

        // Garde-corps latéraux : les ToF sont inclinés à 20° vers l'extérieur.
        // Si un obstacle latéral (mur, meuble) est à moins de 75 mm, on bride le virage vers cet obstacle
        if (sensorState.distLeft < 75 && correction < 0) {
            correction = 0; // Empêche de braquer vers l'obstacle à gauche
        }
        if (sensorState.distRight < 75 && correction > 0) {
            correction = 0; // Empêche de braquer vers l'obstacle à droite
        }

        // Sécurité blocage frontal étroit
        if (sensorState.distLeft < 60 && sensorState.distRight < 60 && !hasCentralPresence) {
            await sendMotorDirect(0, 0);
            if (elements.asservStatus) {
                elements.asservStatus.textContent = 'OBSTACLE TOF DÉTECTÉ DES 2 CÔTÉS : ARRÊT DE SÉCURITÉ';
            }
            return;
        }

        let Vg = Math.max(-100, Math.min(100, Vbase + correction));
        let Vd = Math.max(-100, Math.min(100, Vbase - correction));

        await sendMotorDirect(Vg, Vd);

        if (elements.asservStatus) {
            if (effectiveEx === 0) {
                elements.asservStatus.textContent = `FUSION OPTIQUE : AXE ALIGNÉ (V:${Vbase}% | Prox:${sensorState.proximity} | ToF L/R:${sensorState.distLeft}/${sensorState.distRight}mm)`;
            } else {
                const dir = effectiveEx > 0 ? 'DROITE' : 'GAUCHE';
                elements.asservStatus.textContent = `TRAQUE CAMÉRA : VIRAGE ${dir} (Vg:${Vg}% | Vd:${Vd}% | ex:${effectiveEx.toFixed(2)})`;
            }
        }

    } else {
        // Cible non visible dans cette itération
        const elapsedSinceTarget = now - lastTargetSeenTime;

        if (elapsedSinceTarget > 400) {
            if (!isScanning360) {
                isScanning360 = true;
                scan360StartTime = now;
                logMessage('HAL-95', '🔍 Cible non vue dans l\'axe : Déclenchement de la recherche rotative 360°...', 'hal-quote');
            }

            if (isScanning360) {
                const scanElapsed = now - scan360StartTime;
                if (scanElapsed < SCAN_360_DURATION_MS) {
                    // Pivotement régulier sur place pour balayer tout l'environnement (Roue Gauche -22%, Roue Droite +22%)
                    await sendMotorDirect(-22, 22);
                    if (elements.asservStatus) {
                        const degEstimate = Math.min(360, Math.round((scanElapsed / SCAN_360_DURATION_MS) * 360));
                        elements.asservStatus.textContent = `🔍 SCAN PANORAMIQUE 360° EN COURS (~${degEstimate}°) • RECHERCHE COULEUR CIBLE`;
                    }
                } else {
                    // Fin du tour 360° sans détection de la cible
                    isScanning360 = false;
                    await sendMotorDirect(0, 0);
                    if (elements.asservStatus) {
                        elements.asservStatus.textContent = '⚠️ SCAN 360° BOUCLÉ : AUCUNE CIBLE DÉTECTÉE (STANDBY MOTEURS)';
                    }
                }
            }
        }
    }
}

// Événement du bouton d'activation/désactivation de la traque automatique
if (elements.btnToggleAutoTrack) {
    elements.btnToggleAutoTrack.addEventListener('click', async () => {
        if (!state.connected && !state.autoTracking) {
            alert('Veuillez d\'abord connecter le robot HAL 95 via BLE ou Port USB avant d\'engager la traque automatique.');
            return;
        }

        state.autoTracking = !state.autoTracking;
        updateAutoTrackUI();

        if (state.autoTracking) {
            pulseHalEye();

            // 1. Mise à jour de l'autorité opératoire vers Mode Vision
            state.operatingMode = 'vision';
            if (elements.modeIndicatorPill) {
                elements.modeIndicatorPill.textContent = 'MODE: VISION HSV';
                elements.modeIndicatorPill.className = 'mode-indicator-pill mode-vision-active';
            }

            // 2. Émission des ordres de réveil / relance de mission vers le STM32
            // MODE,VISION réveille le STM32 de l'état Sleep, arme la FSM et réinitialise les compteurs
            await sendCommand('MODE,VISION');
            await sendCommand('STREAM,ON');

            // 3. Réinitialisation des états de recherche
            isScanning360 = false;
            lastTargetSeenTime = Date.now();

            const targets = getActiveTargetsString();
            logMessage('HAL-95', `Traque visuelle & fusion capteurs ENGAGÉE. Mode Vision transmis au STM32. Cibles : ${targets.join(', ') || 'Aucune'}. Asservissement 10Hz actif.`, 'hal-quote');
            if (!state.webcamActive) {
                logMessage('SYS', 'Avertissement : Le flux optique (ESP32-CAM ou Webcam) n\'est pas encore actif. Pensez à lier la caméra !', 'error-msg');
            }
            startAutoTrackLoop();
        } else {
            await stopMotorsEmergency();
            await sendCommand('STREAM,OFF');
            logMessage('HAL-95', 'Traque automatique DÉSACTIVÉE. Moteurs stoppés.', 'hal-quote');
        }
    });
}

// Initialisation de la boucle 10 Hz en tâche de fond
startAutoTrackLoop();

// ==========================================================================
// 8. BOUCLE PRINCIPALE DE RENDU DU HUD OPTIQUE HAL 9000
// ==========================================================================

let hudAnimFrameId = null;
let visionResizeBound = false;

function startVisionSimulationOverlay() {
    const canvas = elements.visionOverlay;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        const parent = canvas.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            canvas.width = Math.round(rect.width);
            canvas.height = Math.round(rect.height);
        }
    }
    resize();

    if (!visionResizeBound) {
        visionResizeBound = true;
        window.addEventListener('resize', resize);

        if (window.ResizeObserver && canvas.parentElement) {
            const ro = new ResizeObserver(() => resize());
            ro.observe(canvas.parentElement);
        }
        if (elements.mjpegFeed) {
            elements.mjpegFeed.addEventListener('load', resize);
        }
    }

    if (hudAnimFrameId) {
        cancelAnimationFrame(hudAnimFrameId);
        hudAnimFrameId = null;
    }

    let angle = 0;
    let lastAnalysisTime = 0;
    let lastFpsUpdate = 0;
    let framesCount = 0;
    let currentFps = '60.0';
    let currentLatency = '1.8';

    function renderHUD() {
        if (!state.webcamActive) {
            hudAnimFrameId = null;
            return;
        }

        // Watchdog de flux périodique : si le flux est censé tourner mais aucune image n'arrive depuis 2.5s
        if (!elements.mjpegFeed.classList.contains('hidden')) {
            const now = Date.now();
            if (now - streamWatchdog.lastActiveTime > 2600 && !streamWatchdog.isReconnecting) {
                recoverMjpegStream('Absence de trame vidéo depuis > 2.5s');
            }
        }

        const perfNow = performance.now();
        framesCount++;
        if (perfNow - lastFpsUpdate >= 1000) {
            currentFps = ((framesCount * 1000) / (perfNow - lastFpsUpdate)).toFixed(1);
            framesCount = 0;
            lastFpsUpdate = perfNow;
        }

        const parent = canvas.parentElement;
        if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
            if (parent.clientWidth > 0 && parent.clientHeight > 0) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Analyse d'image cadencée avec régulation adaptative anti-saturation PC
        if (perfNow - lastAnalysisTime >= perfSettings.intervalMs) {
            const t0 = performance.now();
            const activeMedia = !elements.mjpegFeed.classList.contains('hidden') ? elements.mjpegFeed : elements.videoFeed;
            const cans = analyzeFrame(activeMedia);
            visionState.detectedCans = cans;
            const analysisDuration = performance.now() - t0;
            currentLatency = analysisDuration.toFixed(1);
            lastAnalysisTime = perfNow;

            // Régulation adaptative anti-saturation du processeur PC
            if (!perfSettings.isEco) {
                if (analysisDuration > 14.0 || parseFloat(currentFps) < 22.0) {
                    perfSettings.consecutiveSlowFrames++;
                    perfSettings.consecutiveFastFrames = 0;
                    if (perfSettings.consecutiveSlowFrames >= 3 && perfSettings.intervalMs < perfSettings.maxIntervalMs) {
                        perfSettings.intervalMs = Math.min(perfSettings.maxIntervalMs, perfSettings.intervalMs + 10);
                        perfSettings.consecutiveSlowFrames = 0;
                    }
                } else if (analysisDuration < 8.0 && parseFloat(currentFps) > 28.0) {
                    perfSettings.consecutiveFastFrames++;
                    perfSettings.consecutiveSlowFrames = 0;
                    if (perfSettings.consecutiveFastFrames >= 5 && perfSettings.intervalMs > perfSettings.minIntervalMs) {
                        perfSettings.intervalMs = Math.max(perfSettings.minIntervalMs, perfSettings.intervalMs - 5);
                        perfSettings.consecutiveFastFrames = 0;
                    }
                }
            }

            // 2. Sélection de la cible prioritaire selon la matrice de tri
            let rawTarget = null;
            for (const can of cans) {
                const rule = missionRules[can.color];
                if (rule === 'collect') {
                    if (!rawTarget || can.distance < rawTarget.distance) {
                        rawTarget = can;
                    }
                }
            }

            // 3. Filtrage temporel exponentiel (EMA) pour un tracking ultra-stable
            const now = Date.now();
            if (rawTarget) {
                if (!visionState.smoothedTarget || visionState.smoothedTarget.color !== rawTarget.color) {
                    visionState.smoothedTarget = { ...rawTarget, lastSeen: now };
                } else {
                    const s = visionState.smoothedTarget;
                    s.normX += EMA_ALPHA * (rawTarget.normX - s.normX);
                    s.normY += EMA_ALPHA * (rawTarget.normY - s.normY);
                    s.normW += EMA_ALPHA * (rawTarget.normW - s.normW);
                    s.normH += EMA_ALPHA * (rawTarget.normH - s.normH);
                    s.ex += EMA_ALPHA * (rawTarget.ex - s.ex);
                    s.distance += EMA_ALPHA * (rawTarget.distance - s.distance);
                    s.distance = parseFloat(s.distance.toFixed(2));
                    s.score = rawTarget.score;
                    s.ratio = rawTarget.ratio;
                    s.lastSeen = now;
                }
                visionState.primaryTarget = visionState.smoothedTarget;
            } else {
                // Persistance de 300 ms en cas de micro-saut de frame vidéo
                if (visionState.smoothedTarget && (now - visionState.smoothedTarget.lastSeen < 300)) {
                    visionState.primaryTarget = visionState.smoothedTarget;
                } else {
                    visionState.smoothedTarget = null;
                    visionState.primaryTarget = null;
                }
            }
        }

        const cans = visionState.detectedCans;
        const primaryTarget = visionState.primaryTarget;

        // Mise à jour de la télémétrie textuelle réelle
        if (elements.valFps) elements.valFps.textContent = `${currentFps} FPS`;
        if (elements.valLatency) {
            const hz = Math.round(1000 / perfSettings.intervalMs);
            elements.valLatency.textContent = `${currentLatency} ms (${hz}Hz)`;
        }

        if (primaryTarget) {
            const exStr = (primaryTarget.ex >= 0 ? '+' : '') + primaryTarget.ex.toFixed(2);
            if (elements.valTarget) {
                elements.valTarget.textContent = `CANETTE ${primaryTarget.colorName} [ex:${exStr} | ~${primaryTarget.distance}m]`;
            }
        } else {
            const hazardCount = cans.filter(c => missionRules[c.color] === 'avoid').length;
            if (hazardCount > 0) {
                if (elements.valTarget) elements.valTarget.textContent = `OBSTACLES DÉTECTÉS (${hazardCount} PIÈGES)`;
            } else {
                const targetColors = getActiveTargetsString();
                if (elements.valTarget) {
                    elements.valTarget.textContent = targetColors.length > 0 ? `RECHERCHE CANETTE : ${targetColors.join(', ')}...` : 'SCAN LIBRE (0 CIBLE)';
                }
            }
        }

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 4;

        // 4. Réticule optique de veille en arrière-plan (Style Kubrick)
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        ctx.strokeStyle = primaryTarget ? 'rgba(255, 30, 39, 0.4)' : '#FF1E27';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(cx, cy, 65, 0, Math.PI * 2);
        ctx.stroke();

        angle += 0.006;
        ctx.strokeStyle = primaryTarget ? 'rgba(255, 159, 10, 0.35)' : '#FF9F0A';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(cx, cy, 95, angle, angle + Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Lignes axiales centrales
        ctx.strokeStyle = 'rgba(255, 30, 39, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx - 80, cy); ctx.lineTo(cx - 15, cy);
        ctx.moveTo(cx + 15, cy); ctx.lineTo(cx + 80, cy);
        ctx.moveTo(cx, cy - 80); ctx.lineTo(cx, cy - 15);
        ctx.moveTo(cx, cy + 15); ctx.lineTo(cx, cy + 80);
        ctx.stroke();

        // 5. Indicateur HUD de statut : Pilotage Manuel ou Traque Automatique
        if (state.manualDriving) {
            ctx.fillStyle = 'rgba(255, 159, 10, 0.95)';
            ctx.font = 'bold 11px "Orbitron", sans-serif';
            ctx.fillText('🎮 PILOTAGE MANUEL CLAVIER ACTIF', 25, 32);
        } else if (state.autoTracking) {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
            ctx.font = 'bold 11px "Orbitron", sans-serif';
            ctx.fillText('● ASSERVISSEMENT AUTO ACTIF (10 Hz)', 25, 32);
        }

        // 6. Dessin des boîtes de détection réelles sur les canettes détectées
        for (const can of cans) {
            const isPrimary = (primaryTarget && can.color === primaryTarget.color);
            // Si c'est la cible principale, utiliser les coordonnées lissées
            const drawTarget = isPrimary ? primaryTarget : can;

            const bx = drawTarget.normX * canvas.width;
            const by = drawTarget.normY * canvas.height;
            const bw = drawTarget.normW * canvas.width;
            const bh = drawTarget.normH * canvas.height;
            const canCenterX = bx + bw / 2;
            const canCenterY = by + bh / 2;

            const rule = missionRules[can.color];

            if (rule === 'collect') {
                // CIBLE À RAMASSER : Boîte verte/ambre éclatante avec réticule de traque
                const strokeCol = isPrimary ? '#10B981' : '#FF9F0A';
                ctx.strokeStyle = strokeCol;
                ctx.lineWidth = isPrimary ? 2.6 : 1.8;

                // Brackets de coin renforcés
                const corner = Math.min(18, Math.min(bw, bh) / 3);
                ctx.beginPath();
                ctx.moveTo(bx, by + corner); ctx.lineTo(bx, by); ctx.lineTo(bx + corner, by);
                ctx.moveTo(bx + bw - corner, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + corner);
                ctx.moveTo(bx, by + bh - corner); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + corner, by + bh);
                ctx.moveTo(bx + bw - corner, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - corner);
                ctx.stroke();

                // Ligne de guidage reliant le centre du robot au centre de la canette
                if (isPrimary) {
                    ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
                    ctx.setLineDash([4, 4]);
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(canCenterX, canCenterY);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Réticule interne sur la cible verrouillée
                    ctx.strokeStyle = '#10B981';
                    ctx.beginPath();
                    ctx.arc(canCenterX, canCenterY, 8, 0, Math.PI * 2);
                    ctx.stroke();
                }

                // Libellé de télémétrie sur la canette
                ctx.font = 'bold 11px "JetBrains Mono", monospace';
                ctx.fillStyle = strokeCol;
                const targetText = isPrimary ? `🎯 CIBLE: CANETTE ${drawTarget.colorName} [${drawTarget.score}%]` : `CANETTE ${drawTarget.colorName} [CIBLE DISPO]`;
                ctx.fillText(targetText, bx, by - 8);

                ctx.font = '10px "JetBrains Mono", monospace';
                ctx.fillStyle = '#FFFFFF';
                const exSign = drawTarget.ex >= 0 ? '+' : '';
                ctx.fillText(`AZ: ${(drawTarget.ex * 30).toFixed(1)}° | ex: ${exSign}${drawTarget.ex.toFixed(2)} | DIST: ~${drawTarget.distance}m`, bx, by + bh + 14);

            } else if (rule === 'avoid') {
                // PIÈGE À ÉVITER : Boîte rouge d'alerte avec hachures
                ctx.strokeStyle = '#FF1E27';
                ctx.lineWidth = 2.0;
                ctx.setLineDash([6, 3]);
                ctx.strokeRect(bx, by, bw, bh);
                ctx.setLineDash([]);

                ctx.font = 'bold 11px "JetBrains Mono", monospace';
                ctx.fillStyle = '#FF3B30';
                ctx.fillText(`⚠️ PIÈGE: CANETTE ${can.colorName} [ÉVITER]`, bx, by - 8);

            } else {
                // CANETTE IGNORÉE (Neutre) : Cadre discret
                ctx.strokeStyle = 'rgba(161, 161, 170, 0.45)';
                ctx.lineWidth = 1.2;
                ctx.strokeRect(bx, by, bw, bh);

                ctx.font = '10px "JetBrains Mono", monospace';
                ctx.fillStyle = '#A1A1AA';
                ctx.fillText(`CANETTE ${can.colorName} [NEUTRE]`, bx, by - 6);
            }
        }

        // 6bis. Barre Radar de fusion capteurs (ToF G, APDS-9960 Centre, ToF D)
        const radarY = canvas.height - 28;
        ctx.fillStyle = 'rgba(8, 10, 14, 0.78)';
        ctx.fillRect(16, radarY - 14, canvas.width - 32, 22);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.strokeRect(16, radarY - 14, canvas.width - 32, 22);

        ctx.font = '10px "JetBrains Mono", monospace';
        // ToF Gauche
        ctx.fillStyle = (sensorState.distLeft < 150) ? '#FF9F0A' : '#A1A1AA';
        ctx.fillText(`ToF G: ${sensorState.distLeft < 8000 ? sensorState.distLeft + 'mm' : '---'}`, 24, radarY + 2);

        // Centre APDS-9960 : Proximité & Couleur (Gestion de l'angle mort)
        if (sensorState.contact) {
            ctx.fillStyle = '#10B981';
            const centerText = `⚡ CONTACT PINCE (Prox:${sensorState.proximity} | ${sensorState.colorName})`;
            ctx.fillText(centerText, (canvas.width - ctx.measureText(centerText).width) / 2, radarY + 2);
        } else if (sensorState.inDeadZone) {
            ctx.fillStyle = '#FF9F0A';
            const centerText = `⚠️ ANGLE MORT TOF : CIBLE AU CENTRE (Prox:${sensorState.proximity} | ${sensorState.colorName})`;
            ctx.fillText(centerText, (canvas.width - ctx.measureText(centerText).width) / 2, radarY + 2);
        } else {
            ctx.fillStyle = '#00F2FE';
            const centerText = `APDS CENTRE: P:${sensorState.proximity} | ${sensorState.colorName}`;
            ctx.fillText(centerText, (canvas.width - ctx.measureText(centerText).width) / 2, radarY + 2);
        }

        // ToF Droit
        ctx.fillStyle = (sensorState.distRight < 150) ? '#FF9F0A' : '#A1A1AA';
        const tofRStr = `ToF D: ${sensorState.distRight < 8000 ? sensorState.distRight + 'mm' : '---'}`;
        ctx.fillText(tofRStr, canvas.width - 24 - ctx.measureText(tofRStr).width, radarY + 2);

        // 7. Brackets de cadrage de la lentille aux 4 coins du viewport
        const m = 18;
        const cl = 20;
        ctx.strokeStyle = primaryTarget ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 30, 39, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(m, m + cl); ctx.lineTo(m, m); ctx.lineTo(m + cl, m);
        ctx.moveTo(canvas.width - m - cl, m); ctx.lineTo(canvas.width - m, m); ctx.lineTo(canvas.width - m, m + cl);
        ctx.moveTo(m, canvas.height - m - cl); ctx.lineTo(m, canvas.height - m); ctx.lineTo(m + cl, canvas.height - m);
        ctx.moveTo(canvas.width - m - cl, canvas.height - m); ctx.lineTo(canvas.width - m, canvas.height - m); ctx.lineTo(canvas.width - m, canvas.height - m - cl);
        ctx.stroke();

        ctx.restore();
        hudAnimFrameId = requestAnimationFrame(renderHUD);
    }

    hudAnimFrameId = requestAnimationFrame(renderHUD);
}

// ==========================================================================
// CONTRÔLES MOBILES & MODAL D'EXTINCTION SHIP MODE
// ==========================================================================

// 1. Gestion de la modale de confirmation d'extinction
function showPowerOffModal() {
    if (elements.modalPowerOffConfirm) elements.modalPowerOffConfirm.classList.remove('hidden');
}
function hidePowerOffModal() {
    if (elements.modalPowerOffConfirm) elements.modalPowerOffConfirm.classList.add('hidden');
}

if (elements.btnPowerOffMacro) elements.btnPowerOffMacro.addEventListener('click', showPowerOffModal);
if (elements.mbtnPowerOff) elements.mbtnPowerOff.addEventListener('click', showPowerOffModal);
if (elements.btnCancelPowerOff) elements.btnCancelPowerOff.addEventListener('click', hidePowerOffModal);

if (elements.btnConfirmPowerOff) {
    elements.btnConfirmPowerOff.addEventListener('click', async () => {
        hidePowerOffModal();
        logMessage('HAL-95', '[ALIMENTATION] Demande d\'extinction transmise : Passage en Ship Mode (0 mA)...', 'hal-quote');
        await sendCommand('POWEROFF');
    });
}

// 2. Bascule manuelle de la vue smartphone (Split 50/50)
if (elements.btnToggleMobileView) {
    elements.btnToggleMobileView.addEventListener('click', () => {
        document.body.classList.toggle('mobile-view-active');
        const isActive = document.body.classList.contains('mobile-view-active');
        logMessage('SYS', isActive ? 'Vue Smartphone 50/50 activée.' : 'Vue Bureau rétablie.');
    });
}

// 3. D-Pad Tactile Virtuel avec Dead-Man Switch
function setupDpadButton(btn, dir) {
    if (!btn) return;

    const startAction = (e) => {
        e.preventDefault();
        btn.classList.add('active');
        if (dir === 'stop') {
            driveKeys.up = driveKeys.down = driveKeys.left = driveKeys.right = false;
            stopMotorsEmergency();
        } else {
            driveKeys[dir] = true;
            updateManualDrive();
        }
    };

    const stopAction = (e) => {
        e.preventDefault();
        btn.classList.remove('active');
        if (dir !== 'stop') {
            driveKeys[dir] = false;
            updateManualDrive();
        }
    };

    btn.addEventListener('pointerdown', startAction);
    btn.addEventListener('pointerup', stopAction);
    btn.addEventListener('pointercancel', stopAction);
    btn.addEventListener('pointerleave', stopAction);
}

setupDpadButton(elements.dpadUp, 'up');
setupDpadButton(elements.dpadDown, 'down');
setupDpadButton(elements.dpadLeft, 'left');
setupDpadButton(elements.dpadRight, 'right');
setupDpadButton(elements.dpadStop, 'stop');

// 4. Boutons Pince Tactiles Mobiles
if (elements.mbtnGripClose) {
    elements.mbtnGripClose.addEventListener('click', () => {
        updateGripperUI(155);
        sendCommand('GRP,CLOSE');
        logMessage('MISSION', 'Mobile : Saisir Canette (155°)');
    });
}
if (elements.mbtnGripOpen) {
    elements.mbtnGripOpen.addEventListener('click', () => {
        updateGripperUI(50);
        sendCommand('GRP,OPEN');
        logMessage('MISSION', 'Mobile : Ouvrir Pince (50°)');
    });
}
if (elements.mbtnGripRelax) {
    elements.mbtnGripRelax.addEventListener('click', () => {
        sendCommand('GRP,RELAX');
        logMessage('MISSION', 'Mobile : Pince en roue libre (RELAX)');
    });
}
if (elements.mbtnGripSweep) {
    elements.mbtnGripSweep.addEventListener('click', () => {
        sendCommand('GRP,SWEEP');
        logMessage('MISSION', 'Mobile : Balayage automatique Pince (0-180°)');
    });
}

// 5. Boutons Système & Sons Mobiles
if (elements.mbtnEstop) {
    elements.mbtnEstop.addEventListener('click', () => {
        stopMotorsEmergency();
    });
}
if (elements.mbtnStarWars) {
    elements.mbtnStarWars.addEventListener('click', () => {
        sendCommand('BUZZ,STARWARS');
        logMessage('SON', 'Mobile : Marche Impériale (Star Wars)');
    });
}
if (elements.mbtnBeep) {
    elements.mbtnBeep.addEventListener('click', () => {
        sendCommand('BEEP');
        logMessage('SON', 'Mobile : Bip sonore standard');
    });
}

// ==========================================================================
// 8. PLAN 2D TACTIQUE & RÉFLEXION AUTONOME (ARÈNE 2000 x 1020 mm par défaut)
// ==========================================================================
const arenaState = {
    fieldLength: 2000,       // Longueur X (mm)
    fieldWidth: 1020,        // Largeur Y (mm)
    centerX: 1000,           // Centre X (mm)
    centerY: 510,            // Centre Y (mm)
    geofenceMargin: 80,      // Marge de sécurité geofence virtuelle (mm)

    // Zone peigne de livraison (X = 1880..1950 mm, 6 casiers)
    deliverLineX: 1880,
    deliverSlotX: 1950,
    deliverYBase: 150,
    deliverYStep: 100, // Y = 150 + (k % 6) * 100 -> 150, 250, 350, 450, 550, 650 mm

    // Pose actuelle robot (2 Hz en veille, 10 Hz en mission/stream)
    pose: { x: 72, y: 510, theta: 0 },
    odometryDistMm: 0,
    trail: [],               // [{x, y, theta, t}]
    trailClearedAt: null,
    maxTrailPoints: 600,

    // Cibles et obstacles répertoriés
    obstacles: [],           // [{x, y, type, t}]
    grippedTargets: [],      // [{x, y, color, t}]
    traps: [],               // [{x, y, color, radius: 180, t}]
    deliveredSlots: [false, false, false, false, false, false],
    deliveredCount: 0,

    // Paramètres d'affichage & vue
    zoom: 1.0,
    panX: 0,
    panY: 0,
    showSensors: true,
    activeTab: 'vision',     // 'vision' | 'arena'
    selectedTargetColor: 'RED',
    targetMask: 1,           // Bitmask: 1=RED, 2=GREEN, 4=BLUE
    _lastTransform: null
};

function switchMainView(tabName) {
    arenaState.activeTab = tabName;
    if (tabName === 'arena') {
        if (elements.tabViewArena) elements.tabViewArena.classList.add('active');
        if (elements.tabViewVision) elements.tabViewVision.classList.remove('active');
        if (elements.viewPaneArena) elements.viewPaneArena.classList.remove('hidden');
        if (elements.viewPaneVision) elements.viewPaneVision.classList.add('hidden');
        requestAnimationFrame(() => {
            resizeArenaCanvas();
            drawArena();
        });
    } else {
        if (elements.tabViewVision) elements.tabViewVision.classList.add('active');
        if (elements.tabViewArena) elements.tabViewArena.classList.remove('active');
        if (elements.viewPaneVision) elements.viewPaneVision.classList.remove('hidden');
        if (elements.viewPaneArena) elements.viewPaneArena.classList.add('hidden');
    }
}

if (elements.tabViewVision) {
    elements.tabViewVision.addEventListener('click', () => switchMainView('vision'));
}
if (elements.tabViewArena) {
    elements.tabViewArena.addEventListener('click', () => switchMainView('arena'));
}

function updateRobotPose(x, y, theta) {
    arenaState.pose.x = x;
    arenaState.pose.y = y;
    arenaState.pose.theta = theta;

    const now = Date.now();
    if (arenaState.trailClearedAt) {
        if (Math.hypot(arenaState.trailClearedAt.x - x, arenaState.trailClearedAt.y - y) <= 15) {
            if (elements.arenaPoseVal) {
                elements.arenaPoseVal.textContent = `X: ${x} Y: ${y} θ: ${theta}°`;
            }
            if (arenaState.activeTab === 'arena') {
                drawArena();
            }
            return;
        }
        arenaState.trailClearedAt = null;
    }

    const lastPt = arenaState.trail[arenaState.trail.length - 1];
    if (!lastPt || Math.hypot(lastPt.x - x, lastPt.y - y) > 300) {
        arenaState.trail = [{ x, y, theta, t: now }];
    } else if (Math.hypot(lastPt.x - x, lastPt.y - y) > 12 || Math.abs(lastPt.theta - theta) > 4) {
        arenaState.trail.push({ x, y, theta, t: now });
        if (arenaState.trail.length > arenaState.maxTrailPoints) {
            arenaState.trail.shift();
        }
    }

    if (elements.arenaPoseVal) {
        elements.arenaPoseVal.textContent = `X: ${x} Y: ${y} θ: ${theta}°`;
    }

    if (arenaState.activeTab === 'arena') {
        drawArena();
    }
}

function addScannedObstacle(x, y, type) {
    const existing = arenaState.obstacles.find(o => Math.hypot(o.x - x, o.y - y) < 60);
    if (!existing) {
        arenaState.obstacles.push({ x, y, type: type || 'CAN', t: Date.now() });
        if (elements.arenaObsVal) {
            elements.arenaObsVal.textContent = `${arenaState.obstacles.length}`;
        }
    }
    if (arenaState.activeTab === 'arena') drawArena();
}

function addGrippedTarget(x, y, color) {
    arenaState.grippedTargets.push({ x, y, color: color.toUpperCase(), t: Date.now() });
    logMessage('MISSION', `🎯 Cible ${color} saisie en (${x}, ${y}) mm !`, 'hal-quote');
    pulseHalEye();
    if (arenaState.activeTab === 'arena') drawArena();
}

function addTrapBlacklist(x, y, color) {
    const existing = arenaState.traps.find(t => Math.hypot(t.x - x, t.y - y) < 80);
    if (!existing) {
        arenaState.traps.push({ x, y, color: color.toUpperCase(), radius: 180, t: Date.now() });
        if (elements.arenaTrapsVal) {
            elements.arenaTrapsVal.textContent = `${arenaState.traps.length}`;
        }
        logMessage('MISSION', `⚠️ Piège ${color} en (${x}, ${y}) mm -> Zone d'exclusion R=180mm ajoutée à la blacklist.`, 'hal-quote');
    }
    if (arenaState.activeTab === 'arena') drawArena();
}

function addDeliveredCan(slotNum, x, y) {
    const idx = Math.max(0, Math.min(5, (slotNum - 1) % 6));
    arenaState.deliveredSlots[idx] = true;
    arenaState.deliveredCount++;
    if (elements.arenaDeliveredVal) {
        elements.arenaDeliveredVal.textContent = `${arenaState.deliveredCount} / 6`;
    }
    logMessage('MISSION', `🏁 Canette #${slotNum} déposée dans le peigne (Casier #${idx + 1}) !`, 'hal-quote');
    pulseHalEye();
    if (arenaState.activeTab === 'arena') drawArena();
}

function showMissionStats(cans, timeS, distMm) {
    if (elements.statCansCount) elements.statCansCount.textContent = `${cans}`;
    if (elements.statTimeDuration) {
        const mm = Math.floor(timeS / 60).toString().padStart(2, '0');
        const ss = (timeS % 60).toString().padStart(2, '0');
        elements.statTimeDuration.textContent = `${mm}:${ss} (${timeS}s)`;
    }
    if (elements.statDistanceTotal) {
        elements.statDistanceTotal.textContent = `${(distMm / 1000).toFixed(2)} m`;
    }
    if (elements.missionStatsOverlay) {
        elements.missionStatsOverlay.classList.remove('hidden');
    }
    logMessage('HAL-95', `🏆 [BILAN DE MISSION] Canettes : ${cans} | Temps : ${timeS}s | Distance : ${(distMm / 1000).toFixed(2)}m`, 'hal-quote');
}

function updateOdometry(distMm) {
    arenaState.odometryDistMm = distMm;
    if (elements.arenaOdoVal) {
        elements.arenaOdoVal.textContent = `${(distMm / 1000).toFixed(2)} m`;
    }
}

function parseArenaTelemetry(line) {
    if (!line) return false;
    const trimmed = line.trim();

    // 1. POS,<x_mm>,<y_mm>,<theta_deg>
    const posMatch = trimmed.match(/^POS,\s*(-?\d+),\s*(-?\d+),\s*(-?\d+)/i);
    if (posMatch) {
        updateRobotPose(parseInt(posMatch[1], 10), parseInt(posMatch[2], 10), parseInt(posMatch[3], 10));
        return true;
    }

    // 1b. FIELD,<L_mm>,<W_mm>
    const fieldMatch = trimmed.match(/^FIELD,\s*(\d+),\s*(\d+)/i);
    if (fieldMatch) {
        const lMm = parseInt(fieldMatch[1], 10);
        const wMm = parseInt(fieldMatch[2], 10);
        if (lMm >= 500 && wMm >= 400) {
            arenaState.fieldLength = lMm;
            arenaState.fieldWidth = wMm;
            arenaState.centerX = Math.round(lMm / 2);
            arenaState.centerY = Math.round(wMm / 2);
            arenaState.deliverLineX = lMm - 120;
            arenaState.deliverSlotX = lMm - 50;
            if (arenaState.activeTab === 'arena') drawArena();
        }
        return true;
    }

    // 2. OBS,<x_mm>,<y_mm>,CAN
    const obsMatch = trimmed.match(/^OBS,\s*(-?\d+),\s*(-?\d+),\s*([A-Za-z0-9_]+)/i);
    if (obsMatch) {
        addScannedObstacle(parseInt(obsMatch[1], 10), parseInt(obsMatch[2], 10), obsMatch[3]);
        return true;
    }

    // 3. CAN,<x_mm>,<y_mm>,<ROUGE|VERT|BLEU>
    const canMatch = trimmed.match(/^CAN,\s*(-?\d+),\s*(-?\d+),\s*([A-Za-z]+)/i);
    if (canMatch) {
        addGrippedTarget(parseInt(canMatch[1], 10), parseInt(canMatch[2], 10), canMatch[3]);
        return true;
    }

    // 4. TRAP,<x_mm>,<y_mm>,<ROUGE|VERT|BLEU>
    const trapMatch = trimmed.match(/^TRAP,\s*(-?\d+),\s*(-?\d+),\s*([A-Za-z]+)/i);
    if (trapMatch) {
        addTrapBlacklist(parseInt(trapMatch[1], 10), parseInt(trapMatch[2], 10), trapMatch[3]);
        return true;
    }

    // 5. DELIVERED,<num_canette>,<x_mm>,<y_mm>
    const delMatch = trimmed.match(/^DELIVERED,\s*(\d+),\s*(-?\d+),\s*(-?\d+)/i);
    if (delMatch) {
        addDeliveredCan(parseInt(delMatch[1], 10), parseInt(delMatch[2], 10), parseInt(delMatch[3], 10));
        return true;
    }

    // 6. MISSION_STATS,CANS:<nb>,TIME_S:<secondes>,DIST_MM:<distance_mm>
    const statsMatch = trimmed.match(/MISSION_STATS,\s*CANS:(\d+),\s*TIME_S:(\d+),\s*DIST_MM:(-?\d+)/i);
    if (statsMatch) {
        showMissionStats(parseInt(statsMatch[1], 10), parseInt(statsMatch[2], 10), parseInt(statsMatch[3], 10));
        return true;
    }

    // 7. ODO,<dist_mm>
    const odoMatch = trimmed.match(/^ODO,\s*(-?\d+)/i);
    if (odoMatch) {
        updateOdometry(parseInt(odoMatch[1], 10));
        return true;
    }

    // 8. TARGET,<RED|GREEN|BLUE|ALL|NONE> ou TARGET,MASK,<bitmask>
    const targetMaskMatch = trimmed.match(/^TARGET,\s*MASK,\s*(\d+)/i);
    if (targetMaskMatch) {
        const mask = parseInt(targetMaskMatch[1], 10);
        applyTargetMaskUI(null, mask);
        return true;
    }
    const targetNameMatch = trimmed.match(/^TARGET,\s*(RED|GREEN|BLUE|ALL|NONE)/i);
    if (targetNameMatch) {
        applyTargetMaskUI(targetNameMatch[1].toUpperCase(), null);
        return true;
    }

    return false;
}

function applyTargetMaskUI(targetName, mask) {
    const pills = document.querySelectorAll('.btn-target-pill');
    if (!pills.length) return;
    pills.forEach(b => b.classList.remove('active'));
    if (targetName) {
        const nameToMask = { RED: 1, GREEN: 2, BLUE: 4, ALL: 7, NONE: 0 };
        if (targetName in nameToMask) {
            arenaState.targetMask = nameToMask[targetName];
        }
        arenaState.selectedTargetColor = targetName;
        const btn = document.querySelector(`.btn-target-pill[data-target="${targetName}"]`);
        if (btn) btn.classList.add('active');
    } else if (typeof mask === 'number') {
        const m = mask & 7;
        arenaState.targetMask = m;
        if (m === 0) {
            document.querySelector('.btn-target-pill[data-target="NONE"]')?.classList.add('active');
            arenaState.selectedTargetColor = 'NONE';
        } else if (m === 7) {
            document.querySelector('.btn-target-pill[data-target="ALL"]')?.classList.add('active');
            arenaState.selectedTargetColor = 'ALL';
        } else {
            if (m & 1) document.querySelector('.btn-target-pill[data-target="RED"]')?.classList.add('active');
            if (m & 2) document.querySelector('.btn-target-pill[data-target="GREEN"]')?.classList.add('active');
            if (m & 4) document.querySelector('.btn-target-pill[data-target="BLUE"]')?.classList.add('active');
            arenaState.selectedTargetColor = `MASK:${m}`;
        }
    }
}

function resizeArenaCanvas() {
    const canvas = elements.arena2dCanvas;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
}

function drawArena() {
    const canvas = elements.arena2dCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    if (w <= 0 || h <= 0) return;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const pad = 24;
    const availW = w - 2 * pad;
    const availH = h - 2 * pad;

    const baseScale = Math.min(availW / arenaState.fieldLength, availH / arenaState.fieldWidth);
    const scale = baseScale * arenaState.zoom;

    const fieldW = arenaState.fieldLength * scale;
    const fieldH = arenaState.fieldWidth * scale;

    const ox = (w - fieldW) / 2 + arenaState.panX;
    const oy = (h + fieldH) / 2 + arenaState.panY;

    const toPxX = (xMm) => ox + xMm * scale;
    const toPxY = (yMm) => oy - yMm * scale;

    arenaState._lastTransform = { ox, oy, scale, toPxX, toPxY };

    // 1. Fond du terrain & Murs
    ctx.fillStyle = '#060A10';
    ctx.fillRect(ox, oy - fieldH, fieldW, fieldH);

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#00F0FF';
    ctx.shadowColor = 'rgba(0, 240, 255, 0.45)';
    ctx.shadowBlur = 8;
    ctx.strokeRect(ox, oy - fieldH, fieldW, fieldH);
    ctx.shadowBlur = 0;

    // 2. Grille millimétrique
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    for (let x = 100; x < arenaState.fieldLength; x += 100) {
        ctx.beginPath();
        ctx.moveTo(toPxX(x), oy);
        ctx.lineTo(toPxX(x), oy - fieldH);
        ctx.stroke();
    }
    for (let y = 100; y < arenaState.fieldWidth; y += 100) {
        ctx.beginPath();
        ctx.moveTo(ox, toPxY(y));
        ctx.lineTo(ox + fieldW, toPxY(y));
        ctx.stroke();
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
    ctx.fillStyle = 'rgba(0, 240, 255, 0.45)';
    ctx.font = '9px "JetBrains Mono", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let x = 500; x < arenaState.fieldLength; x += 500) {
        ctx.beginPath();
        ctx.moveTo(toPxX(x), oy);
        ctx.lineTo(toPxX(x), oy - fieldH);
        ctx.stroke();
        ctx.fillText(`${x}`, toPxX(x), oy + 4);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = 500; y < arenaState.fieldWidth; y += 500) {
        ctx.beginPath();
        ctx.moveTo(ox, toPxY(y));
        ctx.lineTo(ox + fieldW, toPxY(y));
        ctx.stroke();
        ctx.fillText(`${y}`, ox - 4, toPxY(y));
    }

    // 3. Geofence de sécurité virtuelle (marge 80 mm)
    if (arenaState.showSensors) {
        const gf = arenaState.geofenceMargin;
        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = 'rgba(255, 145, 0, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(toPxX(gf), toPxY(arenaState.fieldWidth - gf), (arenaState.fieldLength - 2 * gf) * scale, (arenaState.fieldWidth - 2 * gf) * scale);
        ctx.fillStyle = 'rgba(255, 145, 0, 0.4)';
        ctx.font = '8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('GEOFENCE 80mm', toPxX(gf + 10), toPxY(arenaState.fieldWidth - gf - 10));
        ctx.restore();
    }

    // 4. Centre du terrain (1240, 610)
    const cx = toPxX(arenaState.centerX);
    const cy = toPxY(arenaState.centerY);
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.moveTo(cx - 16, cy); ctx.lineTo(cx + 16, cy);
    ctx.moveTo(cx, cy - 16); ctx.lineTo(cx, cy + 16);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`CENTRE (${arenaState.centerX}, ${arenaState.centerY})`, cx, cy + 18);
    ctx.restore();

    // 5. Zone de livraison : Peigne de dépôt (X=2360..2430 mm)
    ctx.save();
    const px1 = toPxX(arenaState.deliverLineX);
    const px2 = toPxX(arenaState.deliverSlotX);
    const pWidth = px2 - px1;

    ctx.fillStyle = 'rgba(0, 230, 118, 0.08)';
    ctx.fillRect(px1, toPxY(700), pWidth, (700 - 100) * scale);
    ctx.strokeStyle = '#00E676';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px1, toPxY(700), pWidth, (700 - 100) * scale);

    for (let k = 0; k < 6; k++) {
        const slotY = arenaState.deliverYBase + k * arenaState.deliverYStep;
        const sPy = toPxY(slotY + 40);
        const sH = 80 * scale;
        const isDelivered = arenaState.deliveredSlots[k];

        if (isDelivered) {
            ctx.fillStyle = 'rgba(0, 230, 118, 0.45)';
            ctx.fillRect(px1, sPy, pWidth, sH);
            ctx.strokeStyle = '#00E676';
            ctx.strokeRect(px1, sPy, pWidth, sH);
            ctx.fillStyle = '#00E676';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`✓ #${k + 1}`, px1 + pWidth / 2, sPy + sH / 2);
        } else {
            ctx.strokeStyle = 'rgba(0, 230, 118, 0.35)';
            ctx.strokeRect(px1, sPy, pWidth, sH);
            ctx.fillStyle = 'rgba(0, 230, 118, 0.6)';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`#${k + 1}`, px1 + pWidth / 2, sPy + sH / 2);
        }
    }
    ctx.restore();

    // 6. Pièges blacklistés (TRAP) - Cercles d'évitement R = 180 mm
    arenaState.traps.forEach((trap) => {
        const tPx = toPxX(trap.x);
        const tPy = toPxY(trap.y);
        const rPx = 180 * scale;

        ctx.save();
        ctx.beginPath();
        ctx.arc(tPx, tPy, rPx, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 23, 68, 0.12)';
        ctx.fill();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#FF1744';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#FF1744';
        ctx.beginPath();
        ctx.arc(tPx, tPy, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#FF5252';
        ctx.textAlign = 'center';
        ctx.fillText(`🚫 PIÈGE ${trap.color} (R180)`, tPx, tPy - 10);
        ctx.restore();
    });

    // 7. Obstacles ToF scannés (OBS)
    arenaState.obstacles.forEach((obs) => {
        const oPx = toPxX(obs.x);
        const oPy = toPxY(obs.y);

        ctx.save();
        ctx.fillStyle = '#FFB300';
        ctx.shadowColor = 'rgba(255, 179, 0, 0.8)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(oPx, oPy, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '8px monospace';
        ctx.fillStyle = '#FFE082';
        ctx.textAlign = 'center';
        ctx.fillText('OBS:CAN', oPx, oPy - 7);
        ctx.restore();
    });

    // 8. Cibles confirmées saisies (CAN)
    arenaState.grippedTargets.forEach((can) => {
        const cPx = toPxX(can.x);
        const cPy = toPxY(can.y);
        let col = '#FF1744';
        if (can.color === 'VERT' || can.color === 'GREEN') col = '#00E676';
        else if (can.color === 'BLEU' || can.color === 'BLUE') col = '#2979FF';

        ctx.save();
        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cPx, cPy, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(`🎯 ${can.color}`, cPx, cPy - 11);
        ctx.restore();
    });

    // 9. Tracé odométrique du robot (Trail)
    if (arenaState.trail.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(toPxX(arenaState.trail[0].x), toPxY(arenaState.trail[0].y));
        for (let i = 1; i < arenaState.trail.length; i++) {
            ctx.lineTo(toPxX(arenaState.trail[i].x), toPxY(arenaState.trail[i].y));
        }
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(0, 240, 255, 0.4)';
        ctx.shadowBlur = 5;
        ctx.stroke();
        ctx.restore();
    }

    // 10. Dessin du Robot HAL-95
    const rPx = toPxX(arenaState.pose.x);
    const rPy = toPxY(arenaState.pose.y);
    const rRadius = Math.max(12, 80 * scale);
    const headingRad = (arenaState.pose.theta * Math.PI) / 180;

    ctx.save();
    ctx.translate(rPx, rPy);
    ctx.rotate(-headingRad);

    if (arenaState.showSensors) {
        ctx.save();
        const tofRange = Math.max(25, 350 * scale);
        const leftAng = 20 * (Math.PI / 180);
        ctx.strokeStyle = 'rgba(255, 30, 39, 0.45)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(tofRange * Math.cos(leftAng), -tofRange * Math.sin(leftAng));
        ctx.stroke();

        const rightAng = -20 * (Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(tofRange * Math.cos(rightAng), -tofRange * Math.sin(rightAng));
        ctx.stroke();

        ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, Math.max(15, 150 * scale), -0.22, 0.22);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // Corps du robot
    ctx.fillStyle = '#141C26';
    ctx.beginPath();
    ctx.arc(0, 0, rRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Pinces avant
    ctx.strokeStyle = '#78909C';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(rRadius * 0.6, -rRadius * 0.7);
    ctx.lineTo(rRadius * 1.25, -rRadius * 0.4);
    ctx.moveTo(rRadius * 0.6, rRadius * 0.7);
    ctx.lineTo(rRadius * 1.25, rRadius * 0.4);
    ctx.stroke();

    // Flèche de cap directionnel
    ctx.fillStyle = '#00F0FF';
    ctx.beginPath();
    ctx.moveTo(rRadius * 0.75, 0);
    ctx.lineTo(rRadius * 0.25, -rRadius * 0.3);
    ctx.lineTo(rRadius * 0.35, 0);
    ctx.lineTo(rRadius * 0.25, rRadius * 0.3);
    ctx.closePath();
    ctx.fill();

    // Pupille HAL 9000
    ctx.fillStyle = '#FF1E27';
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();

    // Libellé au-dessus du robot
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(`HAL-95 (${arenaState.pose.x}, ${arenaState.pose.y}, ${arenaState.pose.theta}°)`, rPx, rPy - rRadius - 7);

    ctx.restore();
}

// Interactions souris sur la carte
if (elements.arena2dCanvas) {
    elements.arena2dCanvas.addEventListener('mousemove', (e) => {
        const trans = arenaState._lastTransform;
        if (!trans || !elements.arenaCoordsBadge) return;
        const rect = elements.arena2dCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xMm = Math.round((mouseX - trans.ox) / trans.scale);
        const yMm = Math.round((trans.oy - mouseY) / trans.scale);
        elements.arenaCoordsBadge.textContent = `X: ${xMm} mm | Y: ${yMm} mm`;
    });
}

// Outils flottants
if (elements.btnArenaZoomIn) {
    elements.btnArenaZoomIn.addEventListener('click', () => {
        arenaState.zoom = Math.min(3.0, arenaState.zoom * 1.25);
        drawArena();
    });
}
if (elements.btnArenaZoomOut) {
    elements.btnArenaZoomOut.addEventListener('click', () => {
        arenaState.zoom = Math.max(0.6, arenaState.zoom / 1.25);
        drawArena();
    });
}
if (elements.btnArenaCenter) {
    elements.btnArenaCenter.addEventListener('click', () => {
        arenaState.zoom = 1.0;
        arenaState.panX = 0;
        arenaState.panY = 0;
        drawArena();
    });
}
if (elements.btnArenaClearTrail) {
    elements.btnArenaClearTrail.addEventListener('click', () => {
        arenaState.trail = [];
        arenaState.trailClearedAt = { x: arenaState.pose.x, y: arenaState.pose.y };
        arenaState.obstacles = [];
        arenaState.traps = [];
        arenaState.grippedTargets = [];
        arenaState.deliveredSlots = [false, false, false, false, false, false];
        arenaState.deliveredCount = 0;
        if (elements.arenaDeliveredVal) elements.arenaDeliveredVal.textContent = '0 / 6';
        if (elements.arenaTrapsVal) elements.arenaTrapsVal.textContent = '0';
        if (elements.arenaObsVal) elements.arenaObsVal.textContent = '0';
        drawArena();
        logMessage('SYS', 'Tracé et balises de l\'arène réinitialisés.');
    });
}
if (elements.btnArenaToggleSensors) {
    elements.btnArenaToggleSensors.addEventListener('click', () => {
        arenaState.showSensors = !arenaState.showSensors;
        elements.btnArenaToggleSensors.classList.toggle('active', arenaState.showSensors);
        drawArena();
    });
}

// Requête odométrie
if (elements.btnQueryOdo) {
    elements.btnQueryOdo.addEventListener('click', () => {
        sendCommand('DIST?');
        logMessage('TX', 'DIST? (Interrogation distance parcourue)');
    });
}

// Sélecteur de cibles de couleur (multi-sélection par bitmask)
document.querySelectorAll('.btn-target-pill').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target || 'RED';
        const bitMap = { RED: 1, GREEN: 2, BLUE: 4 };
        let nextMask = arenaState.targetMask & 7;

        if (target === 'ALL') {
            nextMask = 7;
        } else if (target === 'NONE') {
            nextMask = 0;
        } else if (target in bitMap) {
            nextMask ^= bitMap[target];
        }

        applyTargetMaskUI(null, nextMask);

        const maskToCmd = {
            0: 'TARGET,NONE',
            1: 'TARGET,RED',
            2: 'TARGET,GREEN',
            4: 'TARGET,BLUE',
            7: 'TARGET,ALL'
        };
        const cmd = maskToCmd[nextMask] || `TARGET,MASK,${nextMask}`;
        sendCommand(cmd);
        logMessage('MISSION', `🎯 Consigne cible STM32 mise à jour : ${cmd}`);
    });
});

// Boutons mission rapide Arène
if (elements.btnArenaStartAuton) {
    elements.btnArenaStartAuton.addEventListener('click', () => {
        setOperatingMode('auto');
    });
}
if (elements.btnArenaStopAuton) {
    elements.btnArenaStopAuton.addEventListener('click', () => {
        sendCommand('MOTOR,STOP');
        logMessage('SYS', 'Arrêt d\'urgence demandé depuis le Plan 2D (MOTOR,STOP).');
    });
}
if (elements.btnCloseMissionStats) {
    elements.btnCloseMissionStats.addEventListener('click', () => {
        if (elements.missionStatsOverlay) elements.missionStatsOverlay.classList.add('hidden');
    });
}

window.addEventListener('resize', () => {
    if (arenaState.activeTab === 'arena') {
        resizeArenaCanvas();
        drawArena();
    }
});

// Libération propre des ressources lors de la fermeture ou du rechargement de page
window.addEventListener('beforeunload', () => {
    disconnect();
});
