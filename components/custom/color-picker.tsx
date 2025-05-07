"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { HexColorInput, HexColorPicker, HslColorPicker, RgbColorPicker, RgbStringColorPicker } from "react-colorful";

type ColorFormat = "hex" | "rgb" | "rgb-string" | "hsl";
type PickerLayout = "wheel" | "square" | "circle" | "slider" | "compact";

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presetColors?: string[];
  format?: ColorFormat;
  layout?: PickerLayout;
  className?: string;
  containerClassName?: string;
  presetsClassName?: string;
  inputClassName?: string;
  pickerClassName?: string;
  showInput?: boolean;
  showPresets?: boolean;
  disabled?: boolean;
}

export const ColorPicker = ({
  value,
  onChange,
  presetColors = ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6", "#f43f5e", "#8b5cf6", "#22c55e", "#f97316"],
  format = "hex",
  layout = "square",
  className,
  containerClassName,
  presetsClassName,
  inputClassName,
  pickerClassName,
  showInput = true,
  showPresets = true,
  disabled = false,
}: ColorPickerProps) => {
  const [internalColor, setInternalColor] = useState(value);

  useEffect(() => {
    setInternalColor(value);
  }, [value]);
  const handleChange = useCallback(
    (newColor: any) => {
      setInternalColor(typeof newColor === "string" ? newColor : newColor);
      // Para formatos no string, convertimos a string para el onChange
      if (typeof newColor !== "string") {
        if (format === "rgb") {
          const { r, g, b } = newColor;
          onChange(`rgb(${r}, ${g}, ${b})`);
        } else if (format === "hsl") {
          const { h, s, l } = newColor;
          onChange(`hsl(${h}, ${s}%, ${l}%)`);
        }
      } else {
        onChange(newColor);
      }
    },
    [onChange, format]
  );
  
  // Referencias para los contenedores de color picker
  const pickerContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Función para manejar clics en el picker en lugar de arrastrar
  const handleColorClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (!pickerContainerRef.current) return;

      // Obtener las coordenadas del clic relativas al contenedor
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left; // x posición dentro del elemento
      const y = e.clientY - rect.top;  // y posición dentro del elemento
      
      // Calcular los porcentajes de posición (0 a 1)
      const xPercent = Math.max(0, Math.min(1, x / rect.width));
      const yPercent = Math.max(0, Math.min(1, y / rect.height));
      
      // Convertir a los respectivos valores de color según el formato
      if (format === "rgb" || format === "rgb-string") {
        // Mapeo simple: x -> R (0-255), y inverso -> combinación de G y B
        const r = Math.round(xPercent * 255);
        const g = Math.round((1 - yPercent) * 255);
        const b = Math.round(yPercent * 255);
        handleChange({ r, g, b });
      } else if (format === "hsl") {
        // x -> hue (0-360), y -> saturation inverso (0-100) y lightness (0-100)
        const h = Math.round(xPercent * 360);
        const s = Math.round((1 - yPercent) * 100);
        const l = Math.round(50); // Fijamos el lightness a 50% para clics simples
        handleChange({ h, s, l });
      } else { // hex
        // Convertimos a HSL primero y luego a hex para mantener la saturación visual
        const h = Math.round(xPercent * 360);
        const s = Math.round((1 - yPercent) * 100);
        const l = 50;
        
        // Función simple para convertir HSL a RGB
        const hslToRgb = (h: number, s: number, l: number) => {
          s /= 100;
          l /= 100;
          const a = s * Math.min(l, 1 - l);
          const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color);
          };
          return { r: f(0), g: f(8), b: f(4) };
        };
        
        // Convertir a RGB
        const { r, g, b } = hslToRgb(h, s, l);
        
        // Convertir a hex
        const componentToHex = (c: number) => {
          const hex = c.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        };
        
        const rgbToHex = (r: number, g: number, b: number) => {
          return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        };
        
        handleChange(rgbToHex(r, g, b));
      }
    },
    [format, handleChange, disabled]
  );

  const handlePresetClick = useCallback(
    (preset: string) => {
      setInternalColor(preset);
      onChange(preset);
    },
    [onChange]
  );
  const renderColorPicker = () => {
    // Definir las clases base según el layout seleccionado
    const layoutClasses = {
      wheel: "rounded-full overflow-hidden",
      circle: "rounded-full overflow-hidden",
      square: "", // Default square layout sin clases adicionales
      slider: "max-h-[200px]", // Layout más alto que ancho para los sliders
      compact: "max-h-[150px] max-w-[250px]" // Layout compacto
    };

    const currentLayoutClass = layoutClasses[layout] || "";

    switch (format) {
      case "rgb":
        return (
          <div className={cn("color-picker-wrapper", currentLayoutClass)}>
            <RgbColorPicker 
              color={typeof internalColor === "string" ? { r: 0, g: 0, b: 0 } : internalColor} 
              onChange={handleChange} 
              className={cn("w-full", pickerClassName)} 
            />
            {layout === "slider" && renderColorSliders()}
          </div>
        );
      case "rgb-string":
        return (
          <div className={cn("color-picker-wrapper", currentLayoutClass)}>
            <RgbStringColorPicker 
              color={internalColor as string} 
              onChange={handleChange} 
              className={cn("w-full", pickerClassName)} 
            />
            {layout === "slider" && renderColorSliders()}
          </div>
        );
      case "hsl":
        return (
          <div className={cn("color-picker-wrapper", currentLayoutClass)}>
            <HslColorPicker 
              color={typeof internalColor === "string" ? { h: 0, s: 0, l: 0 } : internalColor} 
              onChange={handleChange} 
              className={cn("w-full", pickerClassName)} 
            />
            {layout === "slider" && renderColorSliders()}
          </div>
        );
      case "hex":
      default:
        return (
          <div className={cn("color-picker-wrapper", currentLayoutClass)}>
            <HexColorPicker 
              color={internalColor as string} 
              onChange={handleChange} 
              className={cn("w-full", pickerClassName)} 
            />
            {layout === "slider" && renderColorSliders()}
          </div>
        );
    }
  };
  
  // Función para renderizar los sliders de color cuando el layout es "slider"
  const renderColorSliders = () => {
    // Si el formato es RGB, renderizamos sliders para R, G, B
    if (format === "rgb" || format === "rgb-string") {
      const rgbValue = typeof internalColor === "string" 
        ? { r: 0, g: 0, b: 0 } 
        : internalColor;
        
      return (
        <div className="mt-3 space-y-2">
          <div className="flex items-center">
            <span className="text-xs text-gray-400 w-12">R</span>
            <input 
              type="range" 
              min="0" 
              max="255" 
              value={rgbValue.r} 
              onChange={(e) => {
                const r = parseInt(e.target.value);
                handleChange({ ...rgbValue, r });
              }}
              className="flex-1 accent-red-500"
              disabled={disabled}
            />
            <span className="text-xs text-gray-400 w-10 text-right">{rgbValue.r}</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-400 w-12">G</span>
            <input 
              type="range" 
              min="0" 
              max="255" 
              value={rgbValue.g} 
              onChange={(e) => {
                const g = parseInt(e.target.value);
                handleChange({ ...rgbValue, g });
              }}
              className="flex-1 accent-green-500"
              disabled={disabled}
            />
            <span className="text-xs text-gray-400 w-10 text-right">{rgbValue.g}</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-400 w-12">B</span>
            <input 
              type="range" 
              min="0" 
              max="255" 
              value={rgbValue.b} 
              onChange={(e) => {
                const b = parseInt(e.target.value);
                handleChange({ ...rgbValue, b });
              }}
              className="flex-1 accent-blue-500"
              disabled={disabled}
            />
            <span className="text-xs text-gray-400 w-10 text-right">{rgbValue.b}</span>
          </div>
        </div>
      );
    }
    
    // Si el formato es HSL, renderizamos sliders para H, S, L
    if (format === "hsl") {
      const hslValue = typeof internalColor === "string" 
        ? { h: 0, s: 0, l: 0 } 
        : internalColor;
        
      return (
        <div className="mt-3 space-y-2">
          <div className="flex items-center">
            <span className="text-xs text-gray-400 w-12">H</span>
            <input 
              type="range" 
              min="0" 
              max="360" 
              value={hslValue.h} 
              onChange={(e) => {
                const h = parseInt(e.target.value);
                handleChange({ ...hslValue, h });
              }}
              className="flex-1"
              style={{ accentColor: `hsl(${hslValue.h}, 100%, 50%)` }}
              disabled={disabled}
            />
            <span className="text-xs text-gray-400 w-10 text-right">{hslValue.h}°</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-400 w-12">S</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={hslValue.s} 
              onChange={(e) => {
                const s = parseInt(e.target.value);
                handleChange({ ...hslValue, s });
              }}
              className="flex-1"
              style={{ accentColor: `hsl(${hslValue.h}, ${hslValue.s}%, 50%)` }}
              disabled={disabled}
            />
            <span className="text-xs text-gray-400 w-10 text-right">{hslValue.s}%</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-400 w-12">L</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={hslValue.l} 
              onChange={(e) => {
                const l = parseInt(e.target.value);
                handleChange({ ...hslValue, l });
              }}
              className="flex-1"
              style={{ accentColor: `hsl(${hslValue.h}, ${hslValue.s}%, ${hslValue.l}%)` }}
              disabled={disabled}
            />
            <span className="text-xs text-gray-400 w-10 text-right">{hslValue.l}%</span>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className={cn("color-picker-container", containerClassName)}>
        {renderColorPicker()}
      </div>

      {showInput && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md" style={{ backgroundColor: internalColor as string }} />
          {format === "hex" ? (
            <HexColorInput
              color={internalColor as string}
              onChange={handleChange}
              prefixed
              className={cn(
                "px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-green-500",
                inputClassName
              )}
              disabled={disabled}
            />
          ) : (
            <input
              type="text"
              value={internalColor as string}
              onChange={(e) => handleChange(e.target.value)}
              className={cn(
                "px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-green-500",
                inputClassName
              )}
              disabled={disabled}
            />
          )}
        </div>
      )}

      {showPresets && (
        <div className={cn("grid grid-cols-8 sm:grid-cols-10 gap-4 mt-2", presetsClassName)}>
          {presetColors.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className={cn(
            "w-6 h-6 rounded-md transition-transform hover:scale-150",
            "",
            internalColor === preset && "ring-2 ring-white",
              )}
              style={{ backgroundColor: preset }}
              disabled={disabled}
              aria-label={`Color ${preset}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
