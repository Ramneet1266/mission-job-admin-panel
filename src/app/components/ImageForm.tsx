// components/ImageForm.tsx
import { useState, FormEvent, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Add Storage imports

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
  const [imageFile, setImageFile] = useState<File | null>(null); // New state for file upload
  const [info, setInfo] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  const storage = getStorage(); // Initialize Firebase Storage

  useEffect(() => {
    if (editImage) {
      setTitle(editImage.title);
      setInfo(editImage.information || "");
      setImageFile(null); // Reset file input for edits
    }
  }, [editImage]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let imageUrl = editImage?.url || ""; // Use existing URL for edits by default

      // If a new image is uploaded, override the URL
      if (imageFile) {
        const storageRef = ref(storage, `galleryImages/${imageFile.name}`); // Store in galleryImages folder
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
        console.log("Image uploaded, URL:", imageUrl);
      }

      if (editImage) {
        // Update existing image
        await setDoc(doc(db, "images", editImage.id), {
          title,
          url: imageUrl,
          information: info,
          createdAt: editImage.createdAt,
        });
        console.log("Image updated:", editImage.id);
      } else {
        // Add new image (requires an image upload)
        if (!imageUrl) throw new Error("No image uploaded");
        const docRef = await addDoc(collection(db, "images"), {
          title,
          url: imageUrl,
          information: info,
          createdAt: new Date().toISOString(),
        });
        console.log("Image added with ID:", docRef.id);
      }

      setImageFile(null);
      setInfo("");
      setTitle("");
      closeModal();
    } catch (error: unknown) {
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
          className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
          required={!editImage} // Required only for new entries
        />
        {editImage && (
          <p className="text-xs text-gray-500 mt-1">
            Current image: <a href={editImage.url} target="_blank">{editImage.url}</a>
          </p>
        )}
      </div>
      <div>
        <label className="text-sm font-medium">Information</label>
        <textarea
          value={info}
          onChange={(e) => setInfo(e.target.value)}
          className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
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