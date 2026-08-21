"use client";

import { useState } from "react";
import type { MediaAsset } from "../../../db/media";
import type { MediaVariant } from "../../media/cloudinary";
import MediaPickerField from "./MediaPickerField";

export default function MediaUrlField({
  label,
  name,
  initialValue = "",
  media,
  mode = "original",
  placeholder,
}: {
  label: string;
  name: string;
  initialValue?: string;
  media: MediaAsset[];
  mode?: MediaVariant | "original";
  placeholder?: string;
}) {
  const [value, setValue] = useState(initialValue);
  return <MediaPickerField
    label={label}
    name={name}
    value={value}
    onChange={setValue}
    media={media}
    mode={mode}
    placeholder={placeholder}
  />;
}
