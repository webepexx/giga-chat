"use client";

import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { ArrowBigRight, ImageIcon, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
  connected: boolean;
  onSend: (text: string) => void;
  onTyping: () => void;
  onImageSend: (imageId: string, price?: number) => void;
}

export default function ChatInput({
  connected,
  onSend,
  onTyping,
  onImageSend
}: Props) {

  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [price, setPrice] = useState<number | "">("");
  const [isFree, setIsFree] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  const uploadImageToDB = async (file: File, isFree: boolean): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("isFree", String(isFree));

    const response = await fetch("/api/mod/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!data.success || !data.imageId) {
      throw new Error("Upload failed");
    }

    return data.imageId;
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notifications.show({
        title: "Invalid File",
        message: "Please select an image file.",
        color: "red",
        icon: <IconX size={16} />,
      });
      return;
    }

    setSelectedImage(file);
    setIsFree(false);
    setPrice("");
    setImageId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const IMAGE_PRICE_MARKER = " + imagePrice=";
  const handleImageSend = async () => {
    if (!selectedImage) return;

    if (!isFree && price === "") {
      notifications.show({
        title: "Missing price",
        message: "Set a price or mark image as free.",
        color: "red",
        icon: <IconX size={16} />,
      });
      return;
    }

    try {
      setIsUploading(true);

      const id = await uploadImageToDB(selectedImage, isFree);

      const finalPrice = isFree ? 0 : price;

      onImageSend(`${id} + imagePrice=${finalPrice}`);

      cleanup();
    } catch (error) {
      notifications.show({
        title: "Upload Failed",
        message: "Failed to upload image.",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // const handleFreeUpload = async () => {
  //   if (!selectedImage) return;

  //   try {
  //     setIsUploading(true);
  //     const id = await uploadImageToDB(selectedImage, true);
  //     setImageId(id);

  //     onImageSend(`${id} + imagePrice=0`);

  //     cleanup();
  //   } catch (err) {
  //     notifications.show({
  //       title: "Upload Failed",
  //       message: "Failed to upload free image.",
  //       color: "red",
  //       icon: <IconX size={16} />,
  //     });
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };



  // const sendImageWithPrice = async () => {
  //   if (!selectedImage || price === "") return;

  //   try {
  //     setIsUploading(true);
  //     const id = await uploadImageToDB(selectedImage, false);
  //     setImageId(id);

  //     onImageSend(`${id} + imagePrice=${price}`);

  //     cleanup();
  //   } catch (err) {
  //     notifications.show({
  //       title: "Upload Failed",
  //       message: "Failed to upload image.",
  //       color: "red",
  //       icon: <IconX size={16} />,
  //     });
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  const cleanup = () => {
    setSelectedImage(null);
    setImageId(null);
    setPrice("");
    setIsFree(false);
  };



  return (
    <div className="border-t border-white/5 p-4 bg-[#0e1326]">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            onTyping();
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={!connected}
          placeholder="Reply to user..."
          className="flex-1 bg-[#0b0f1a] border border-white/10 rounded-xl px-4 py-3 outline-none disabled:opacity-40"
        />

        <div className="relative">
          <button
            type="button"
            disabled={isUploading || !connected}
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl transition-all disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            ) : (
              <ImageIcon className="w-6 h-6 text-white/70" />
            )}
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {selectedImage && (
            <div className="absolute -top-32 -left-32 mt-2 w-40 rounded-lg bg-black/70 border border-white/20 px-3 py-3 text-sm text-white space-y-2">

              {/* Free checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="accent-indigo-500"
                />
                Free
              </label>

              {/* Price input (disabled if free) */}
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder={isFree ? "Free image" : "Price"}
                value={price}
                disabled={isFree}
                onChange={(e) =>
                  setPrice(e.target.value === "" ? "" : Number(e.target.value))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleImageSend();
                  }
                }}
                className="w-full rounded-md bg-black/60 border border-white/20 px-3 py-2 text-sm text-white disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (selectedImage) {
              handleImageSend();
            } else {
              handleSend();
            }
          }}
          disabled={!connected}
          className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40"
        >
          <ArrowBigRight />
        </button>

      </div>
    </div>
  );
}
