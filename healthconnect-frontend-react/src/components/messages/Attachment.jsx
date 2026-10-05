import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Download, FileText, FileSpreadsheet, FileImage, File, Loader, X, Presentation } from "lucide-react";

// Les fichiers sont privés : on les récupère avec le jeton de connexion, puis on crée une URL locale
const blobCache = new Map();

const fetchBlobUrl = async (url) => {
  if (blobCache.has(url)) return blobCache.get(url);
  const res = await api.get(url, { responseType: "blob" });
  const objectUrl = URL.createObjectURL(res.data);
  blobCache.set(url, objectUrl);
  return objectUrl;
};

export const formatFileSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
};

export const FileIcon = ({ mime = "", name = "", size = 20, className = "" }) => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (mime.startsWith("image/")) return <FileImage size={size} className={className} />;
  if (["xls", "xlsx", "csv"].includes(ext)) return <FileSpreadsheet size={size} className={className} />;
  if (["ppt", "pptx"].includes(ext)) return <Presentation size={size} className={className} />;
  if (mime === "application/pdf" || ["doc", "docx", "txt"].includes(ext)) return <FileText size={size} className={className} />;
  return <File size={size} className={className} />;
};

const triggerDownload = (href, name) => {
  const link = document.createElement("a");
  link.href = href;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/**
 * Pièce jointe d'un message.
 * - attachment : { name, mime, size, url } renvoyé par l'API
 * - localUrl : aperçu local pendant l'envoi (image pas encore sur le serveur)
 */
const Attachment = ({ attachment, localUrl, isMe }) => {
  const isImage = attachment.mime?.startsWith("image/");
  const [imageUrl, setImageUrl] = useState(localUrl || null);
  const [failed, setFailed] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!isImage || localUrl || !attachment.url) return;
    let cancelled = false;
    fetchBlobUrl(attachment.url)
      .then((objectUrl) => !cancelled && setImageUrl(objectUrl))
      .catch(() => !cancelled && setFailed(true));
    return () => { cancelled = true; };
  }, [attachment.url, isImage, localUrl]);

  const download = async () => {
    if (!attachment.url) return;
    try {
      setDownloading(true);
      const objectUrl = isImage && imageUrl ? imageUrl : await fetchBlobUrl(attachment.url);
      triggerDownload(objectUrl, attachment.name);
    } catch {
      setFailed(true);
    } finally {
      setDownloading(false);
    }
  };

  if (isImage && !failed) {
    return (
      <>
        <button
          type="button"
          onClick={() => imageUrl && setLightbox(true)}
          className="block overflow-hidden rounded-xl bg-black/5 mb-1"
          aria-label={`Agrandir ${attachment.name}`}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={attachment.name} className="max-h-64 w-auto max-w-full object-cover" />
          ) : (
            <div className="w-56 h-40 flex items-center justify-center">
              <Loader size={20} className="animate-spin opacity-60" />
            </div>
          )}
        </button>

        {lightbox && (
          <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4" onClick={() => setLightbox(false)}>
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); download(); }}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Télécharger"
              >
                <Download size={20} />
              </button>
              <button className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Fermer">
                <X size={20} />
              </button>
            </div>
            <img src={imageUrl} alt={attachment.name} className="max-h-[85vh] max-w-full rounded-lg" onClick={(e) => e.stopPropagation()} />
            <p className="text-white/80 text-sm mt-3">{attachment.name}</p>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={!attachment.url || downloading}
      className={`w-full min-w-[14rem] flex items-center gap-3 p-2.5 rounded-xl mb-1 text-left transition ${
        isMe ? "bg-white/15 hover:bg-white/25" : "bg-gray-50 border border-gray-100 hover:bg-gray-100"
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isMe ? "bg-white/20" : "bg-teal-50 text-teal-600"}`}>
        <FileIcon mime={attachment.mime} name={attachment.name} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.name}</p>
        <p className={`text-[11px] ${isMe ? "text-teal-100" : "text-gray-400"}`}>
          {failed ? "Fichier indisponible" : formatFileSize(attachment.size)}
        </p>
      </div>
      {attachment.url && (downloading
        ? <Loader size={16} className="animate-spin flex-shrink-0" />
        : <Download size={16} className="flex-shrink-0 opacity-80" />)}
    </button>
  );
};

export default Attachment;
