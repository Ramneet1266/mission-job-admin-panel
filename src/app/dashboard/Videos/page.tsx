"use client";
import { Search, Plus, Pencil, Trash2, X } from "lucide-react";
import { useState, useEffect, FormEvent } from "react";
import { db } from "../../lib/firebase"; // Adjust path as needed
import { collection, onSnapshot, addDoc, setDoc, deleteDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Add Storage imports

interface Video {
  id: string;
  title: string;
  url: string;
  information?: string;
  createdAt: string;
}

export default function VideosPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editVideo, setEditVideo] = useState<Video | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null); // New state for video file
  const [info, setInfo] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  const storage = getStorage(); // Initialize Firebase Storage

  const openModal = () => {
    setEditVideo(null);
    setVideoFile(null);
    setInfo("");
    setTitle("");
    setIsModalOpen(true);
  };

  const openEditModal = (video: Video) => {
    setEditVideo(video);
    setTitle(video.title);
    setVideoFile(null); // Reset file input for edits
    setInfo(video.information || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      setEditVideo(null);
    }, 300);
  };

  // Fetch videos in real-time (unchanged)
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "videos"),
      (snapshot) => {
        const videoData: Video[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Video[];
        console.log("Real-time videos:", videoData);
        setVideos(videoData);
      },
      (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error fetching videos:", error);
        alert(`Failed to fetch videos: ${errorMessage}`);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let videoUrl = editVideo?.url || ""; // Use existing URL for edits by default

      // If a new video file is uploaded, override the URL
      if (videoFile) {
        const storageRef = ref(storage, `videos/${videoFile.name}`); // Store in videos folder
        await uploadBytes(storageRef, videoFile);
        videoUrl = await getDownloadURL(storageRef);
        console.log("Video uploaded, URL:", videoUrl);
      }

      if (editVideo) {
        // Update existing video (original logic preserved)
        await setDoc(doc(db, "videos", editVideo.id), {
          title,
          url: videoUrl,
          information: info,
          createdAt: editVideo.createdAt,
        });
        console.log("Video updated:", editVideo.id);
      } else {
        // Add new video (requires a video upload)
        if (!videoUrl) throw new Error("No video uploaded");
        const docRef = await addDoc(collection(db, "videos"), {
          title,
          url: videoUrl,
          information: info,
          createdAt: new Date().toISOString(),
        });
        console.log("Video added with ID:", docRef.id);
      }

      setVideoFile(null);
      setInfo("");
      setTitle("");
      closeModal();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error saving video:", error);
      alert(`Failed to save video: ${errorMessage}`);
    }
  };

  // Delete functionality (unchanged)
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "videos", id));
      console.log("Video deleted successfully:", id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error deleting video:", error);
      alert(`Failed to delete video: ${errorMessage}`);
    }
  };

  const filteredVideos = videos.filter((vid) =>
    vid.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Videos</h1>
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
            placeholder="Search videos by title..."
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
              <th className="px-4 py-3">Video</th>
              <th className="px-4 py-3">Information</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVideos.length > 0 ? (
              filteredVideos.map((vid) => (
                <tr key={vid.id} className="hover:bg-gray-100 transition">
                  <td className="px-4 py-3">{vid.title}</td>
                  <td className="px-4 py-3">
                    <video
                      src={vid.url}
                      controls
                      className="w-40 h-24 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3">{vid.information || "N/A"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(vid)}
                        className="flex items-center px-2 py-1 text-xs font-medium bg-black text-white rounded-full hover:bg-gray-800 transition shadow"
                      >
                        <Pencil size={14} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(vid.id)}
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
                  No videos found
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
              {editVideo ? "Edit Video" : "Add New Video"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Video Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Upload Video</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  required={!editVideo} // Required only for new entries
                />
                {editVideo && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current video: <a href={editVideo.url} target="_blank">{editVideo.url}</a>
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
                {editVideo ? "Update" : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}