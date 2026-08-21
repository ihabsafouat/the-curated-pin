import type { ImgHTMLAttributes } from "react";
import { cloudinarySrcSet, cloudinaryVariantUrl, isCloudinaryImageUrl, mediaVariantDimensions, type MediaVariant } from "../media/cloudinary";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  variant?: MediaVariant | "original";
};

export default function MediaImage({ src, variant = "content", sizes = "100vw", width, height, alt, ...props }: Props) {
  if (!src) return null;
  const cloudinary = isCloudinaryImageUrl(src);
  const selected = variant === "original" ? src : cloudinaryVariantUrl(src, variant);
  const srcSet = cloudinary ? cloudinarySrcSet(src, variant) : undefined;
  const intrinsic = cloudinary && variant !== "original" ? mediaVariantDimensions[variant] : undefined;
  return <img
    alt={alt ?? ""}
    src={selected}
    srcSet={srcSet}
    sizes={srcSet ? sizes : undefined}
    width={width ?? intrinsic?.width}
    height={height ?? intrinsic?.height}
    {...props}
  />;
}
