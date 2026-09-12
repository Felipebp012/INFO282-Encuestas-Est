"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FechaHoraPickerProps {
  value: string; // Formato YYYY-MM-DDTHH:mm
  onChange: (value: string) => void;
  id?: string;
}

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DIAS_SEMANA_CORTO = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

const DIAS_SEMANA_COMPLETO = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

// Formateador 100% determinista que evita discrepancias de locale entre SSR (Docker) y cliente
function formatearFechaEspanol(fechaStr: string): string {
  if (!fechaStr || !fechaStr.includes("-")) return "";
  const [y, m, d] = fechaStr.split("-").map(Number);
  const fechaObj = new Date(y, m - 1, d, 12, 0, 0);
  const diaSemana = DIAS_SEMANA_COMPLETO[fechaObj.getDay()];
  const nombreMes = MESES[m - 1];
  return `${diaSemana}, ${d} de ${nombreMes} de ${y}`;
}

export function FechaHoraPicker({ value, onChange, id }: FechaHoraPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Parsear valor actual o asignar fecha por defecto (+7 días a las 23:59)
  const { fecha, hora, minuto } = useMemo(() => {
    if (value && value.includes("T")) {
      const [f, h] = value.split("T");
      const [horasStr, minsStr] = (h || "23:59").split(":");
      const parsedH = parseInt(horasStr, 10);
      const parsedM = parseInt(minsStr, 10);
      return {
        fecha: f,
        hora: isNaN(parsedH) ? 23 : Math.min(23, Math.max(0, parsedH)),
        minuto: isNaN(parsedM) ? 59 : Math.min(59, Math.max(0, parsedM)),
      };
    }
    // Valor sugerido por defecto: 7 días en el futuro a las 23:59
    const defecto = new Date();
    defecto.setDate(defecto.getDate() + 7);
    const y = defecto.getFullYear();
    const m = String(defecto.getMonth() + 1).padStart(2, "0");
    const d = String(defecto.getDate()).padStart(2, "0");
    return {
      fecha: `${y}-${m}-${d}`,
      hora: 23,
      minuto: 59,
    };
  }, [value]);

  // Si no había valor inicial y ya montó en el cliente, propagar el valor sugerido
  useEffect(() => {
    if (mounted && !value) {
      const hStr = String(hora).padStart(2, "0");
      const mStr = String(minuto).padStart(2, "0");
      onChange(`${fecha}T${hStr}:${mStr}`);
    }
  }, [mounted, value, fecha, hora, minuto, onChange]);

  // Referencias para saber si el usuario está escribiendo en los inputs
  const horaFocused = useRef(false);
  const minutoFocused = useRef(false);

  // Estado local para inputs de texto de hora y minutos
  const [inputHora, setInputHora] = useState(() => String(hora).padStart(2, "0"));
  const [inputMinuto, setInputMinuto] = useState(() => String(minuto).padStart(2, "0"));

  useEffect(() => {
    if (!horaFocused.current) {
      setInputHora(String(hora).padStart(2, "0"));
    }
  }, [hora]);

  useEffect(() => {
    if (!minutoFocused.current) {
      setInputMinuto(String(minuto).padStart(2, "0"));
    }
  }, [minuto]);

  // Manejo de fecha de hoy (estable)
  const hoy = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Mes en visualización del calendario
  const [mesVisual, setMesVisual] = useState(() => {
    if (fecha) {
      const [y, m] = fecha.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });

  const anioVisual = mesVisual.getFullYear();
  const mesNumeroVisual = mesVisual.getMonth();

  // No permitir navegar a meses anteriores al actual
  const puedeRetrocederMes = useMemo(() => {
    const primerDiaMesVisual = new Date(anioVisual, mesNumeroVisual, 1);
    const primerDiaMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return primerDiaMesVisual > primerDiaMesActual;
  }, [anioVisual, mesNumeroVisual, hoy]);

  function cambiarMes(delta: number) {
    setMesVisual((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  // Generar cuadrícula de días para el mes actual
  const diasCalendario = useMemo(() => {
    const totalDias = new Date(anioVisual, mesNumeroVisual + 1, 0).getDate();
    let primerDiaSemana = new Date(anioVisual, mesNumeroVisual, 1).getDay() - 1;
    if (primerDiaSemana === -1) primerDiaSemana = 6;

    const dias: { dia: number; fechaStr: string; esPasado: boolean; esHoy: boolean }[] = [];

    for (let d = 1; d <= totalDias; d++) {
      const fechaObj = new Date(anioVisual, mesNumeroVisual, d);
      fechaObj.setHours(0, 0, 0, 0);

      const mStr = String(mesNumeroVisual + 1).padStart(2, "0");
      const dStr = String(d).padStart(2, "0");
      const fechaStr = `${anioVisual}-${mStr}-${dStr}`;

      dias.push({
        dia: d,
        fechaStr,
        esPasado: fechaObj < hoy,
        esHoy: fechaObj.getTime() === hoy.getTime(),
      });
    }

    return { primerDiaSemana, dias };
  }, [anioVisual, mesNumeroVisual, hoy]);

  function seleccionarFecha(fStr: string) {
    const hStr = String(hora).padStart(2, "0");
    const mStr = String(minuto).padStart(2, "0");
    onChange(`${fStr}T${hStr}:${mStr}`);
  }

  function actualizarHoraMinuto(h: number, m: number) {
    const validH = Math.min(23, Math.max(0, h));
    const validM = Math.min(59, Math.max(0, m));
    const hStr = String(validH).padStart(2, "0");
    const mStr = String(validM).padStart(2, "0");
    onChange(`${fecha}T${hStr}:${mStr}`);
  }

  // Validadores y manejadores de escritura de hora
  function handleHoraChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value.replace(/\D/g, "").slice(0, 2);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 23) {
      val = "23";
    }
    setInputHora(val);
    // Solo sincronizar con la hora padre cuando se ingresan 2 dígitos completos
    if (val.length === 2 && !isNaN(num)) {
      actualizarHoraMinuto(Math.min(23, num), minuto);
    }
  }

  function handleHoraBlur() {
    horaFocused.current = false;
    const num = parseInt(inputHora, 10);
    if (isNaN(num) || num < 0) {
      actualizarHoraMinuto(0, minuto);
      setInputHora("00");
    } else if (num > 23) {
      actualizarHoraMinuto(23, minuto);
      setInputHora("23");
    } else {
      actualizarHoraMinuto(num, minuto);
      setInputHora(String(num).padStart(2, "0"));
    }
  }

  // Validadores y manejadores de escritura de minutos
  function handleMinutoChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value.replace(/\D/g, "").slice(0, 2);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 59) {
      val = "59";
    }
    setInputMinuto(val);
    // Solo sincronizar con el minuto padre cuando se ingresan 2 dígitos completos
    if (val.length === 2 && !isNaN(num)) {
      actualizarHoraMinuto(hora, Math.min(59, num));
    }
  }

  function handleMinutoBlur() {
    minutoFocused.current = false;
    const num = parseInt(inputMinuto, 10);
    if (isNaN(num) || num < 0) {
      actualizarHoraMinuto(hora, 0);
      setInputMinuto("00");
    } else if (num > 59) {
      actualizarHoraMinuto(hora, 59);
      setInputMinuto("59");
    } else {
      actualizarHoraMinuto(hora, num);
      setInputMinuto(String(num).padStart(2, "0"));
    }
  }

  function sumarHora(delta: number) {
    let nueva = (hora + delta) % 24;
    if (nueva < 0) nueva += 24;
    actualizarHoraMinuto(nueva, minuto);
  }

  function sumarMinuto(delta: number) {
    let nuevo = (minuto + delta) % 60;
    if (nuevo < 0) nuevo += 60;
    actualizarHoraMinuto(hora, nuevo);
  }

  // Presets rápidos didácticos de fecha
  function aplicarAtajoFecha(diasExtra: number) {
    const objetivo = new Date();
    objetivo.setDate(objetivo.getDate() + diasExtra);
    const y = objetivo.getFullYear();
    const m = String(objetivo.getMonth() + 1).padStart(2, "0");
    const d = String(objetivo.getDate()).padStart(2, "0");
    const fStr = `${y}-${m}-${d}`;
    setMesVisual(new Date(y, objetivo.getMonth(), 1));
    seleccionarFecha(fStr);
  }

  function aplicarFinDeMes() {
    const objetivo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    const y = objetivo.getFullYear();
    const m = String(objetivo.getMonth() + 1).padStart(2, "0");
    const d = String(objetivo.getDate()).padStart(2, "0");
    const fStr = `${y}-${m}-${d}`;
    setMesVisual(new Date(y, objetivo.getMonth(), 1));
    seleccionarFecha(fStr);
  }

  // Ángulos para el reloj analógico visual interactivo
  const anguloHora = (hora % 12) * 30 + (minuto / 60) * 30;
  const anguloMinuto = minuto * 6;

  // Formato didáctico en lenguaje natural
  const textoResumen = useMemo(() => {
    if (!fecha) return { principal: "Selecciona fecha y hora", badge: "" };
    const nombreFecha = formatearFechaEspanol(fecha);
    const hStr = String(hora).padStart(2, "0");
    const mStr = String(minuto).padStart(2, "0");

    let mensajeTiempo = "";
    if (mounted) {
      const [y, m, d] = fecha.split("-").map(Number);
      const fechaObj = new Date(y, m - 1, d, 0, 0, 0);
      const diffTime = fechaObj.getTime() - hoy.getTime();
      const diffDias = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDias === 0) mensajeTiempo = "hoy";
      else if (diffDias === 1) mensajeTiempo = "mañana";
      else if (diffDias > 1) mensajeTiempo = `en ${diffDias} días`;
    }

    return {
      principal: `${nombreFecha} a las ${hStr}:${mStr} hrs`,
      badge: mensajeTiempo,
    };
  }, [fecha, hora, minuto, hoy, mounted]);

  // Si aún no monta en el cliente, renderizar un placeholder idéntico para evitar cualquier error de hidratación
  if (!mounted) {
    return (
      <div className="space-y-2">
        <div
          id={id}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-600">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-800" suppressHydrationWarning>
                Cargando fecha y hora de cierre...
              </div>
              <div className="text-xs text-slate-500">
                Haz clic para elegir fecha y hora
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Botón visual que muestra la fecha seleccionada y permite abrir/cerrar */}
      <div
        id={id}
        onClick={() => setAbierto((prev) => !prev)}
        className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-2.5 transition-all duration-150 ${
          abierto
            ? "border-blue-500 ring-2 ring-blue-100 bg-white shadow-sm"
            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-600">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-800" suppressHydrationWarning>
              {textoResumen.principal}
            </div>
            <div className="text-xs text-slate-500">
              Haz clic para {abierto ? "cerrar el selector" : "cambiar fecha y hora"}
            </div>
          </div>
        </div>

        {textoResumen.badge && (
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {textoResumen.badge}
          </span>
        )}
      </div>

      {/* Panel didáctico interactivo: Calendario + Reloj */}
      {abierto && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg transition-all animate-in fade-in-50 zoom-in-95">
          <div className="grid gap-6 md:grid-cols-2">
            {/* COLUMNA 1: CALENDARIO DIDÁCTICO */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <CalendarIcon className="h-3.5 w-3.5 text-blue-600" />
                  1. Elige la Fecha
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {MESES[mesNumeroVisual]} {anioVisual}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={!puedeRetrocederMes}
                    onClick={() => cambiarMes(-1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mes anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => cambiarMes(1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
                    title="Mes siguiente"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
                {DIAS_SEMANA_CORTO.map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Cuadrícula de días */}
              <div className="grid grid-cols-7 gap-1">
                {/* Espacios vacíos antes del primer día */}
                {Array.from({ length: diasCalendario.primerDiaSemana }).map((_, i) => (
                  <div key={`vacio-${i}`} className="h-8" />
                ))}

                {/* Días del mes */}
                {diasCalendario.dias.map((d) => {
                  const seleccionada = d.fechaStr === fecha;

                  return (
                    <button
                      key={d.fechaStr}
                      type="button"
                      disabled={d.esPasado}
                      onClick={() => seleccionarFecha(d.fechaStr)}
                      className={`relative flex h-8 w-full items-center justify-center rounded-md text-xs font-medium transition-all ${
                        seleccionada
                          ? "bg-blue-600 text-white font-bold shadow-sm"
                          : d.esPasado
                          ? "text-slate-300 cursor-not-allowed"
                          : d.esHoy
                          ? "border border-blue-400 font-bold text-blue-600 hover:bg-blue-50"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {d.dia}
                      {d.esHoy && !seleccionada && (
                        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Atajos rápidos didácticos */}
              <div className="pt-2">
                <div className="mb-1.5 flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  Atajos rápidos:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => aplicarAtajoFecha(3)}
                    className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    +3 días
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarAtajoFecha(7)}
                    className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    +1 semana
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarAtajoFecha(14)}
                    className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    +2 semanas
                  </button>
                  <button
                    type="button"
                    onClick={aplicarFinDeMes}
                    className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Fin de mes
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMNA 2: RELOJ DIDÁCTICO Y ENTRADA DE HORA */}
            <div className="space-y-3 md:border-l md:border-slate-100 md:pl-6">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                2. Elige o Escribe la Hora
              </span>

              {/* Reloj analógico visual interactivo */}
              <div className="flex items-center justify-center py-1">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-slate-200 bg-slate-50 shadow-inner">
                  {/* Marcas de 12, 3, 6, 9 */}
                  <span className="absolute top-1 text-[10px] font-bold text-slate-400">12</span>
                  <span className="absolute right-1.5 text-[10px] font-bold text-slate-400">3</span>
                  <span className="absolute bottom-1 text-[10px] font-bold text-slate-400">6</span>
                  <span className="absolute left-1.5 text-[10px] font-bold text-slate-400">9</span>

                  {/* Manecilla de hora */}
                  <div
                    style={{
                      transform: `rotate(${anguloHora}deg)`,
                      transformOrigin: "bottom center",
                    }}
                    className="absolute bottom-1/2 h-7 w-1 rounded-full bg-slate-800 transition-transform duration-300"
                  />

                  {/* Manecilla de minuto */}
                  <div
                    style={{
                      transform: `rotate(${anguloMinuto}deg)`,
                      transformOrigin: "bottom center",
                    }}
                    className="absolute bottom-1/2 h-10 w-0.5 rounded-full bg-blue-600 transition-transform duration-300"
                  />

                  {/* Centro del reloj */}
                  <div className="h-2 w-2 rounded-full bg-blue-700" />
                </div>
              </div>

              {/* Inputs editables para escribir hora y minutos directamente */}
              <div className="flex items-center justify-center gap-3">
                {/* HORA */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Hora (00-23)
                  </span>
                  <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={2}
                      value={inputHora}
                      onChange={handleHoraChange}
                      onBlur={handleHoraBlur}
                      onFocus={(e) => {
                        horaFocused.current = true;
                        e.target.select();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.currentTarget.blur();
                        }
                      }}
                      className="w-11 text-center text-lg font-bold text-slate-800 focus:outline-none"
                      aria-label="Hora"
                      placeholder="HH"
                    />
                    <div className="flex flex-col ml-0.5 border-l border-slate-200 pl-0.5">
                      <button
                        type="button"
                        onClick={() => sumarHora(1)}
                        className="rounded p-0.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                        title="Subir hora"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => sumarHora(-1)}
                        className="rounded p-0.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                        title="Bajar hora"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <span className="mt-4 text-2xl font-bold text-slate-300">:</span>

                {/* MINUTOS */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Minutos (00-59)
                  </span>
                  <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={2}
                      value={inputMinuto}
                      onChange={handleMinutoChange}
                      onBlur={handleMinutoBlur}
                      onFocus={(e) => {
                        minutoFocused.current = true;
                        e.target.select();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.currentTarget.blur();
                        }
                      }}
                      className="w-11 text-center text-lg font-bold text-slate-800 focus:outline-none"
                      aria-label="Minutos"
                      placeholder="MM"
                    />
                    <div className="flex flex-col ml-0.5 border-l border-slate-200 pl-0.5">
                      <button
                        type="button"
                        onClick={() => sumarMinuto(5)}
                        className="rounded p-0.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                        title="Sumar 5 minutos"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => sumarMinuto(-5)}
                        className="rounded p-0.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                        title="Restar 5 minutos"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sugerencias de hora solicitadas */}
              <div className="pt-2">
                <div className="mb-1.5 text-xs font-medium text-slate-500">
                  Sugerencias de hora:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => actualizarHoraMinuto(23, 59)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      hora === 23 && minuto === 59
                        ? "bg-blue-600 text-white font-semibold"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    23:59 (Fin del día)
                  </button>
                  <button
                    type="button"
                    onClick={() => actualizarHoraMinuto(19, 0)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      hora === 19 && minuto === 0
                        ? "bg-blue-600 text-white font-semibold"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    19:00 hrs
                  </button>
                  <button
                    type="button"
                    onClick={() => actualizarHoraMinuto(13, 0)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      hora === 13 && minuto === 0
                        ? "bg-blue-600 text-white font-semibold"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    13:00 hrs
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pie del panel con confirmación rápida */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-xs text-slate-500">
              Cierre: <strong className="text-slate-800">{textoResumen.principal}</strong>
            </span>
            <Button
              type="button"
              size="sm"
              onClick={() => setAbierto(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              Listo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
