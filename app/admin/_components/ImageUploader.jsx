"use client";

import MediaPicker from "./MediaPicker";

export default function ImageUploader({ value, onChange, label, disabled, path }) {
  return (
    <MediaPicker
      value={value}
      onChange={onChange}
      label={label}
      disabled={disabled}
      aspect="auto"
    />
  );
}
