"use client";
import { Search, Plus, Pencil, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import ImageForm from "../../components/ImageForm";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";

interface Image {
  id: string;
  title: string;
  url: string;
  information?: string;
  createdAt: string;
}

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [images, setImages] = useState<Image[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editImage, setEditImage] = useState<Image | null>(null);

  const openModal = () => {
    setEditImage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (image: Image) => {
    setEditImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      setEditImage(null);
    }, 300);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "images"),
      (snapshot) => {
        const imageData: Image[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Image[];
        console.log("Real-time images:", imageData);
        setImages(imageData);
      },
      (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error fetching images:", error);
        alert(`Failed to fetch images: ${errorMessage}`);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "images", id));
      console.log("Image deleted successfully:", id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error deleting image:", error);
      alert(`Failed to delete image: ${errorMessage}`);
    }
  };

  const filteredImages = images.filter((img) =>
    img.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Images</h1>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full shadow-md hover:bg-gray-800 transition cursor-pointer"
        >
          <Plus size={16} />
          Create New
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search images by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-full shadow-sm transition flex items-center gap-1">
            <Search size={16} />
            Search
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-2xl overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr className="text-gray-600 uppercase">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Information</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredImages.length > 0 ? (
              filteredImages.map((img) => (
                <tr key={img.id} className="hover:bg-gray-100 transition">
                  <td className="px-4 py-3">{img.title}</td>
                  <td className="px-4 py-3">
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3">{img.information || "N/A"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(img)}
                        className="flex items-center px-2 py-1 text-xs font-medium bg-black text-white rounded-full hover:bg-gray-800 transition shadow"
                      >
                        <Pencil size={14} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(img.id)}
                        className="flex items-center px-2 py-1 text-xs font-medium bg-black text-white rounded-full hover:bg-red-700 transition shadow"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-center">
                  No images found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div
            className={`relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md z-10 transition-all ${
              isClosing ? "animate-modal-out" : "animate-modal-pop"
            }`}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-black transition"
              onClick={closeModal}
            >
              <X />
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {editImage ? "Edit Image" : "Add New Image"}
            </h2>
            <ImageForm closeModal={closeModal} editImage={editImage} />
          </div>
        </div>
      )}
    </div>
  );
}