"use client";

import { useState } from "react";
import { MEDIA_ALLOWED_MIME, MEDIA_UPLOAD_MAX_BYTES } from "../../media/cloudinary";

function mb(bytes: number) { return `${(bytes / 1024 / 1024).toFixed(1)} MB`; }

export default function MediaUploadPanel({ csrf }: { csrf: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function upload() {
    if (!file || altText.trim().length < 2) {
      setStatus("error"); setMessage("Choose an image and write useful alt text first."); return;
    }
    if (!MEDIA_ALLOWED_MIME.includes(file.type as (typeof MEDIA_ALLOWED_MIME)[number]) || file.size > MEDIA_UPLOAD_MAX_BYTES) {
      setStatus("error"); setMessage("Use JPEG, PNG, WebP or AVIF up to 10 MB."); return;
    }
    setStatus("uploading"); setMessage("Authorizing secure direct upload…");
    try {
      const signatureResponse = await fetch("/api/admin/media/signature", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ csrf, filename: file.name, mime: file.type, bytes: file.size }),
      });
      const authorization = await signatureResponse.json();
      if (!signatureResponse.ok) throw new Error(authorization.error || "Upload authorization failed.");

      setMessage("Uploading directly to the image CDN…");
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", authorization.apiKey);
      form.append("signature", authorization.signature);
      for (const [key, value] of Object.entries(authorization.params as Record<string, string | number | boolean>)) form.append(key, String(value));
      const uploadResponse = await fetch(authorization.uploadUrl, { method: "POST", body: form });
      const uploaded = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploaded?.error?.message || "Cloud upload failed.");

      setMessage("Verifying the provider response and registering the asset…");
      const completionResponse = await fetch("/api/admin/media/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          csrf,
          publicId: uploaded.public_id,
          version: uploaded.version,
          signature: uploaded.signature,
          secureUrl: uploaded.secure_url,
          format: uploaded.format,
          bytes: uploaded.bytes,
          width: uploaded.width,
          height: uploaded.height,
          altText: altText.trim(),
        }),
      });
      const completed = await completionResponse.json();
      if (!completionResponse.ok) throw new Error(completed.error || "Asset registration failed.");
      setStatus("success"); setMessage("Image uploaded, verified and optimized for delivery.");
      setFile(null); setAltText("");
      window.setTimeout(() => window.location.reload(), 650);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  return <section className="mediaUploadPanel">
    <div><small>SECURE DIRECT UPLOAD</small><h2>Add an editorial image</h2><p>The browser sends the image straight to Cloudinary after the server signs the request, so large binaries never pass through Netlify. Delivery variants are generated from one master asset.</p></div>
    <div className="mediaUploadForm">
      <label className="mediaFileDrop"><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setFile(event.target.files?.[0] ?? null)}/><span>{file ? <><b>{file.name}</b><small>{mb(file.size)} · {file.type}</small></> : <><b>Choose JPEG, PNG, WebP or AVIF</b><small>Maximum 10 MB · editorial images only</small></>}</span></label>
      <label><span>Alt text</span><input value={altText} onChange={(event) => setAltText(event.target.value)} maxLength={320} placeholder="Describe what is visibly shown; don't keyword-stuff."/></label>
      <button type="button" onClick={upload} disabled={status === "uploading"}>{status === "uploading" ? "Uploading…" : "Upload image"}</button>
      {message && <p className={`mediaUploadStatus ${status}`}>{message}</p>}
    </div>
  </section>;
}
