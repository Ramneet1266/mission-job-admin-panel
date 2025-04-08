// components/ImageForm.tsx
import { useState, FormEvent, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";

interface Image {
  id: string;
  title: string;
  url: string;
  information?: string;
  createdAt: string;
}

interface ImageFormProps {
  closeModal: () => void;
  editImage: Image | null;
}

export default function ImageForm({ closeModal, editImage }: ImageFormProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [info, setInfo] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    if (editImage) {
      setTitle(editImage.title);
      setImageUrl(editImage.url);
      setInfo(editImage.information || "");
    }
  }, [editImage]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editImage) {
        await setDoc(doc(db, "images", editImage.id), {
          title,
          url: imageUrl,
          information: info,
          createdAt: editImage.createdAt,
        });
        console.log("Image updated:", editImage.id);
      } else {
        const docRef = await addDoc(collection(db, "images"), {
          title,
          url: imageUrl,
          information: info,
          createdAt: new Date().toISOString(),
        });
        console.log("Image added with ID:", docRef.id);
      }
      setImageUrl("");
      setInfo("");
      setTitle("");
      closeModal();
    } catch (error: unknown) { // Explicitly type error as unknown
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error saving image:", error);
      alert(`Failed to save image: ${errorMessage}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Image Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Image URL</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Information</label>
        <textarea
          value={info}
          onChange={(e) => setInfo(e.target.value)}
          className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"
          rows={3}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
      >
        {editImage ? "Update" : "Submit"}
      </button>
    </form>
  );
}