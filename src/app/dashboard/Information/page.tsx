"use client";
import { Search, Plus, Pencil, Trash2, X } from "lucide-react";
import { useState, useEffect, FormEvent } from "react";
import { db } from "../../lib/firebase"; // Adjust path as needed
import { collection, onSnapshot, addDoc, setDoc, deleteDoc, doc } from "firebase/firestore";

interface Info {
  id: string;
  title: string;
  url: string;
  information?: string;
  createdAt: string;
}

export default function InformationPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [infos, setInfos] = useState<Info[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editInfo, setEditInfo] = useState<Info | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [info, setInfo] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  const openModal = () => {
    setEditInfo(null);
    setImageUrl("");
    setInfo("");
    setTitle("");
    setIsModalOpen(true);
  };

  const openEditModal = (infoItem: Info) => {
    setEditInfo(infoItem);
    setTitle(infoItem.title);
    setImageUrl(infoItem.url);
    setInfo(infoItem.information || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      setEditInfo(null);
    }, 300);
  };

  // Fetch information in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "information"),
      (snapshot) => {
        const infoData: Info[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Info[];
        console.log("Real-time information:", infoData);
        setInfos(infoData);
      },
      (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error fetching information:", error);
        alert(`Failed to fetch information: ${errorMessage}`);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editInfo) {
        await setDoc(doc(db, "information", editInfo.id), {
          title,
          url: imageUrl,
          information: info,
          createdAt: editInfo.createdAt,
        });
        console.log("Information updated:", editInfo.id);
      } else {
        const docRef = await addDoc(collection(db, "information"), {
          title,
          url: imageUrl,
          information: info,
          createdAt: new Date().toISOString(),
        });
        console.log("Information added with ID:", docRef.id);
      }
      setImageUrl("");
      setInfo("");
      setTitle("");
      closeModal();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error saving information:", error);
      alert(`Failed to save information: ${errorMessage}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "information", id));
      console.log("Information deleted successfully:", id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error deleting information:", error);
      alert(`Failed to delete information: ${errorMessage}`);
    }
  };

  const filteredInfos = infos.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Information</h1>
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
            placeholder="Search information by title..."
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
            {filteredInfos.length > 0 ? (
              filteredInfos.map((item) => (
                <tr key={item.id} className="hover:bg-gray-100 transition">
                  <td className="px-4 py-3">{item.title}</td>
                  <td className="px-4 py-3">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3">{item.information || "N/A"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="flex items-center px-2 py-1 text-xs font-medium bg-black text-white rounded-full hover:bg-gray-800 transition shadow"
                      >
                        <Pencil size={14} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
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
                  No information found
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
              className="absolute top-3 right-3 text-gray-500 cursor-pointer hover:text-black"
              onClick={closeModal}
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {editInfo ? "Edit Information" : "Add New Information"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  required
                />
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
                {editInfo ? "Update" : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}