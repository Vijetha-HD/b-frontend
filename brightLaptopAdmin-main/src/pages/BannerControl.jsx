import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  RefreshCw,
  ImagePlus,
  AlertCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "../components/common/SimpleToast";
import * as bannerService from "../api/services/banner.service";
import { uploadSingleImage } from "../api/services/upload.service";

const MAX_BANNERS = 5;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MIN_WIDTH_PX = 800;
// Target ratio: 16/5 = 3.2, allow ±5%
const TARGET_RATIO = 16 / 5;
const RATIO_TOLERANCE = 0.05;

/**
 * Returns a human-friendly ratio name for a given width/height.
 * e.g. 1920x1080 → "16:9", 800x800 → "square", 1920x600 → "16:5"
 */
const guessRatioName = (w, h) => {
  const r = w / h;
  if (Math.abs(r - 1) < 0.05) return "square";
  if (Math.abs(r - 16 / 9) < 0.07) return "16:9";
  if (Math.abs(r - 4 / 3) < 0.07) return "4:3";
  if (Math.abs(r - 3 / 2) < 0.07) return "3:2";
  if (Math.abs(r - 16 / 5) < 0.07) return "16:5";
  if (Math.abs(r - 21 / 9) < 0.07) return "21:9";
  // Portrait
  if (r < 1) return "portrait";
  return `${w}:${h}`;
};

/**
 * Validates a banner image file before upload.
 * Returns { valid: true } or { valid: false, message: string }
 */
const validateBannerImage = (file) =>
  new Promise((resolve) => {
    // ── Check 1: File size ─────────────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      resolve({
        valid: false,
        message: `File too large (${sizeMB} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB. Please compress the image and try again.`,
      });
      return;
    }

    // ── Check 2 & 3: Ratio + minimum width (need to load the image) ────────
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      const { naturalWidth: w, naturalHeight: h } = img;
      const ratio = w / h;

      // Check aspect ratio
      if (
        ratio < TARGET_RATIO * (1 - RATIO_TOLERANCE) ||
        ratio > TARGET_RATIO * (1 + RATIO_TOLERANCE)
      ) {
        const ratioName = guessRatioName(w, h);
        const tallShort = ratio < TARGET_RATIO ? "too tall" : "too wide";
        resolve({
          valid: false,
          message: `Wrong image ratio (your image is ${ratioName} — ${tallShort}). Banners must be wide and short: use a 16:5 ratio. Recommended size: 1920 × 600 px or 1280 × 400 px.`,
        });
        return;
      }

      // Check minimum width
      if (w < MIN_WIDTH_PX) {
        resolve({
          valid: false,
          message: `Image too small (${w} × ${h} px). Minimum width is ${MIN_WIDTH_PX} px. Please use a higher-resolution image — recommended: 1920 × 600 px.`,
        });
        return;
      }

      resolve({ valid: true });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        message: "Could not read image file. Please try a different file.",
      });
    };

    img.src = url;
  });

const BannerControl = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [replacingId, setReplacingId] = useState(null); // id of banner being replaced
  const [deletingId, setDeletingId] = useState(null);
  const addFileRef = useRef(null);
  const replaceFileRef = useRef(null);

  // ─── Fetch banners on mount ───────────────────────────────────────────────
  const fetchBanners = async () => {
    setLoading(true);
    const result = await bannerService.getBanners();
    if (result.success) {
      setBanners(result.data?.data?.banners || []);
    } else {
      toast.error(result.error || "Failed to load banners");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // ─── Upload new banner ────────────────────────────────────────────────────
  const handleAddBanner = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected if needed
    e.target.value = "";

    if (banners.length >= MAX_BANNERS) {
      toast.error(
        `Maximum ${MAX_BANNERS} banners allowed. Delete one before adding a new banner.`,
      );
      return;
    }

    // Validate image before uploading
    const validation = await validateBannerImage(file);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setUploading(true);
    try {
      // Step 1: Upload image to S3 via existing upload endpoint
      const uploadResult = await uploadSingleImage(file);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Image upload failed");
      }

      const imageData = uploadResult.data?.data?.image;
      if (!imageData?.secure_url || !imageData?.public_id) {
        throw new Error("Invalid upload response");
      }

      // Step 2: Save banner record in DB
      const addResult = await bannerService.addBanner({
        imageUrl: imageData.secure_url,
        publicId: imageData.public_id,
      });

      if (!addResult.success) {
        throw new Error(addResult.error || "Failed to save banner");
      }

      toast.success("Banner added successfully!");
      await fetchBanners();
    } catch (err) {
      toast.error(err.message || "Failed to add banner");
    } finally {
      setUploading(false);
    }
  };

  // ─── Replace a banner image ───────────────────────────────────────────────
  const handleReplace = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !replacingId) return;

    e.target.value = "";
    const id = replacingId;
    setReplacingId(null);

    // Validate image before uploading
    const validation = await validateBannerImage(file);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setUploading(true);
    try {
      // Step 1: Upload new image
      const uploadResult = await uploadSingleImage(file);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Image upload failed");
      }

      const imageData = uploadResult.data?.data?.image;
      if (!imageData?.secure_url || !imageData?.public_id) {
        throw new Error("Invalid upload response");
      }

      // Step 2: Replace banner in DB (old image deleted on backend)
      const replaceResult = await bannerService.replaceBanner(id, {
        imageUrl: imageData.secure_url,
        publicId: imageData.public_id,
      });

      if (!replaceResult.success) {
        throw new Error(replaceResult.error || "Failed to replace banner");
      }

      toast.success("Banner replaced successfully!");
      await fetchBanners();
    } catch (err) {
      toast.error(err.message || "Failed to replace banner");
    } finally {
      setUploading(false);
    }
  };

  // ─── Trigger replace file picker ─────────────────────────────────────────
  const triggerReplace = (id) => {
    setReplacingId(id);
    setTimeout(() => replaceFileRef.current?.click(), 50);
  };

  // ─── Delete a banner ──────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner? This action cannot be undone."))
      return;

    setDeletingId(id);
    const result = await bannerService.deleteBanner(id);
    if (result.success) {
      toast.success("Banner deleted");
      setBanners((prev) => prev.filter((b) => b._id !== id));
    } else {
      toast.error(result.error || "Failed to delete banner");
    }
    setDeletingId(null);
  };

  // ─── Move banner up/down ──────────────────────────────────────────────────
  const handleMove = async (index, direction) => {
    const newBanners = [...banners];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= newBanners.length) return;

    // Swap
    [newBanners[index], newBanners[swapIndex]] = [
      newBanners[swapIndex],
      newBanners[index],
    ];

    // Optimistic UI update
    setBanners(newBanners);

    // Persist reorder
    const reorderPayload = newBanners.map((b, idx) => ({
      id: b._id,
      order: idx,
    }));
    const result = await bannerService.reorderBanners(reorderPayload);
    if (!result.success) {
      toast.error("Failed to save order. Refreshing...");
      await fetchBanners();
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Hidden file inputs */}
      <input
        ref={addFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAddBanner}
      />
      <input
        ref={replaceFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplace}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-slate-800 leading-none">
            Banner Control
          </h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
            Home Page Carousel — {banners.length}/{MAX_BANNERS} Banners
          </p>
        </div>

        <button
          onClick={() => {
            if (banners.length >= MAX_BANNERS) {
              toast.error(
                `Maximum ${MAX_BANNERS} banners reached. Delete one before adding a new banner.`,
              );
              return;
            }
            addFileRef.current?.click();
          }}
          disabled={uploading}
          className={`px-6 py-3 rounded-2xl text-sm font-black shadow-lg transition-all flex items-center gap-2
            ${
              banners.length >= MAX_BANNERS
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
        >
          {uploading ? (
            <>
              <RefreshCw size={18} className="animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Plus size={18} />
              Add Banner
              {banners.length >= MAX_BANNERS && " (Limit Reached)"}
            </>
          )}
        </button>
      </div>

      {/* Max limit warning banner */}
      {banners.length >= MAX_BANNERS && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-700 px-5 py-4 rounded-2xl text-sm font-semibold">
          <AlertCircle size={18} className="shrink-0" />
          Maximum {MAX_BANNERS} banners reached. Delete an existing banner to
          add a new one.
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-[24px] border border-slate-100 p-4 space-y-3 animate-pulse"
            >
              <div className="w-full h-44 bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="flex gap-2">
                <div className="h-9 bg-slate-100 rounded-xl flex-1" />
                <div className="h-9 bg-slate-100 rounded-xl flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : banners.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-[32px] border border-dashed border-slate-200 p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ImagePlus size={28} className="text-blue-400" />
          </div>
          <h4 className="text-slate-700 font-black text-lg mb-2">
            No banners yet
          </h4>
          <p className="text-slate-400 text-sm mb-6">
            Click "Add Banner" to upload your first carousel image.
            <br />
            You can add up to {MAX_BANNERS} banners.
          </p>
          <button
            onClick={() => addFileRef.current?.click()}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all"
          >
            <Plus size={16} className="inline mr-2" />
            Upload First Banner
          </button>
        </div>
      ) : (
        /* Banner grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-sm hover:shadow-lg transition-all group"
            >
              {/* Image */}
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 mb-4">
                <img
                  src={banner.imageUrl}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Order badge */}
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-black px-2 py-1 rounded-lg">
                  #{index + 1}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Reorder arrows */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0}
                    className="p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move up"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => handleMove(index, 1)}
                    disabled={index === banners.length - 1}
                    className="p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move down"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Replace */}
                <button
                  onClick={() => triggerReplace(banner._id)}
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl text-xs font-bold transition-colors"
                >
                  <RefreshCw size={14} />
                  Replace
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(banner._id)}
                  disabled={deletingId === banner._id}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-xl text-xs font-bold transition-colors"
                >
                  <Trash2 size={14} />
                  {deletingId === banner._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info footer */}
      <div className="text-xs text-slate-400 font-medium text-center pb-2 space-y-1">
        <div>
          Banners auto-scroll every 4 seconds on the home page. Use the arrows
          above to change display order.
        </div>
        <div className="text-slate-300">
          📐 Upload requirements:{" "}
          <strong className="text-slate-400">16:5 ratio</strong> (e.g. 1920 ×
          600 px or 1280 × 400 px) &nbsp;·&nbsp; Max{" "}
          <strong className="text-slate-400">5 MB</strong> &nbsp;·&nbsp; Min
          width <strong className="text-slate-400">800 px</strong>
        </div>
      </div>
    </div>
  );
};

export default BannerControl;
