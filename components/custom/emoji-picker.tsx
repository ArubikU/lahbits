"use client";

import { cn } from "@/lib/utils";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useCallback, useEffect, useState } from "react";

export interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  presetEmojis?: string[];
  className?: string;
  containerClassName?: string;
  pickerClassName?: string;
  presetsClassName?: string;
  buttonClassName?: string;
  showPresets?: boolean;
  showSearch?: boolean;
  showCategories?: boolean;
  showSkinTones?: boolean;
  theme?: "light" | "dark" | "auto";
  locale?: string;
  perLine?: number;
  emojiSize?: number;
  emojiButtonSize?: number;
  maxFrequentRows?: number;
  disabled?: boolean;
  style?: "native" | "twitter" | "facebook" | "apple" | "google";
}

export const EmojiPicker = ({
  value,
  onChange,
  presetEmojis = ["💼", "📚", "🗣️", "💪", "🎨", "🧠", "🌍", "🎯", "🎮", "🎵", "🍳", "🏠"],
  className,
  containerClassName,
  pickerClassName,
  presetsClassName,
  buttonClassName,
  showPresets = true,
  showSearch = true,
  showCategories = true,
  showSkinTones = true,
  theme = "dark",
  locale = "es",
  perLine = 8,
  emojiSize = 24,
  emojiButtonSize = 36,
  maxFrequentRows = 4,
  disabled = false,
  style = "native",
}: EmojiPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(value || presetEmojis[0]);

  useEffect(() => {
    if (value) {
      setSelectedEmoji(value);
    }
  }, [value]);

  const handleEmojiSelect = useCallback(
    (emoji: any) => {
      const native = emoji.native || emoji;
      setSelectedEmoji(native);
      onChange(native);
      setIsOpen(false);
    },
    [onChange]
  );

  const handlePresetClick = useCallback(
    (emoji: string) => {
      setSelectedEmoji(emoji);
      onChange(emoji);
      setIsOpen(false);
    },
    [onChange]
  );

  const togglePicker = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Cerramos el picker si se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest(".emoji-picker-container") && !target.closest(".emoji-trigger-button")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={togglePicker}
        className={cn(
          "emoji-trigger-button flex items-center justify-center p-2 gap-4 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors text-2xl",
          buttonClassName,
          disabled && "opacity-50 cursor-not-allowed"
        )}
        disabled={disabled}
      >
        {selectedEmoji}
      </button>

      {showPresets && !isOpen && (
        <div
          className={cn(
            "grid grid-cols-8 sm:grid-cols-10 gap-4 mt-2 transition-opacity duration-300 space-x-2",
            presetsClassName
          )}
          style={{ opacity: isOpen ? 0 : 1 }}
        >
          {presetEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handlePresetClick(emoji)}
              className={cn(
            "w-10 h-10 flex items-center justify-center text-xl rounded-md transition-transform hover:scale-150",
            selectedEmoji === emoji
              ? "bg-gray-700 ring-2 ring-green-500"
              : "bg-gray-800 hover:bg-gray-700",
            buttonClassName
              )}
              disabled={disabled}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          className={cn(
            "emoji-picker-container absolute z-50 mt-2 transition-transform duration-300 transform scale-95",
            containerClassName
          )}
          style={{ transform: isOpen ? "scale(1)" : "scale(0.95)" }}
        >
          <div
            className={cn(
              "p-1 rounded-lg bg-gray-900 shadow-lg transition-opacity duration-300",
              pickerClassName
            )}
            style={{ opacity: isOpen ? 1 : 0 }}
          >
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme={theme}
              locale={locale}
              previewPosition="none"
              perLine={perLine}
              emojiSize={emojiSize}
              emojiButtonSize={emojiButtonSize}
              maxFrequentRows={maxFrequentRows}
              searchPosition={showSearch ? "top" : "none"}
              navPosition={showCategories ? "top" : "none"}
              skinTonePosition={showSkinTones ? "search" : "none"}
              set={style}
            ></Picker>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
