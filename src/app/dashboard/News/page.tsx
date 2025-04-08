"use client";
import { Search, Plus, Pencil, Trash2, X } from "lucide-react";
import { useState, useEffect, FormEvent } from "react";
import { db } from "../../lib/firebase"; // Adjust path as needed
import { collection, onSnapshot, addDoc, setDoc, deleteDoc, doc } from "firebase/firestore";

interface News {
  id: string;
  title: string;
  url: string;
  information?: string;
  createdAt: string;
}

export default function NewsPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [news, setNews] = useState<News[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editNews, setEditNews] = useState<News | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [info, setInfo] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  const openModal = () => {
    setEditNews(null);
    setImageUrl("");
    setInfo("");
    setTitle("");
    setIsModalOpen(true);
  };

  const openEditModal = (newsItem: News) => {
    setEditNews(newsItem);
    setTitle(newsItem.title);
    setImageUrl(newsItem.url);
    setInfo(newsItem.information || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      setEditNews(null);
    }, 300);
  };

  // Fetch news in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "news"),
      (snapshot) => {
        const newsData: News[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as News[];
        console.log("Real-time news:", newsData);
        setNews(newsData);
      },
      (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error fetching news:", error);
        alert(`Failed to fetch news: ${errorMessage}`);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editNews) {
        await setDoc(doc(db, "news", editNews.id), {
          title,
          url: imageUrl,
          information: info,
          createdAt: editNews.createdAt,
        });
        console.log("News updated:", editNews.id);
      } else {
        const docRef = await addDoc(collection(db, "news"), {
          title,
          url: imageUrl,
          information: info,
          createdAt: new Date().toISOString(),
        });
        console.log("News added with ID:", docRef.id);
      }
      setImageUrl("");
      setInfo("");
      setTitle("");
      closeModal();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error saving news:", error);
      alert(`Failed to save news: ${errorMessage}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "news", id));
      console.log("News deleted successfully:", id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error deleting news:", error);
      alert(`Failed to delete news: ${errorMessage}`);
    }
  };

  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">News</h1>
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
            placeholder="Search news by title..."
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
            {filteredNews.length > 0 ? (
              filteredNews.map((item) => (
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
                  No news found
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
              {editNews ? "Edit News" : "Add New News"}
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
                {editNews ? "Update" : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}