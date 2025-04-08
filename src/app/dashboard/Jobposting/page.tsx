"use client";
import { Search, Plus, Pencil, Trash2, X } from "lucide-react";
import { useState, useEffect, FormEvent } from "react";
import { db } from "../../lib/firebase"; // No auth needed
import { collection, onSnapshot, addDoc, setDoc, deleteDoc, doc } from "firebase/firestore";

interface JobPosting {
  id: string;
  jobTitle: string;
  jobDescription: string;
  salary: string;
  address: string;
  city: string;
  postalCode: string;
  state: string;
  contactNumber: string;
  category: string;
  contactEmail: string;
  jobCompany: string;
  imageUrl: string;
  createdAt: string;
}

export default function JobPostingsPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editJob, setEditJob] = useState<JobPosting | null>(null);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [salary, setSalary] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [jobCompany, setJobCompany] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");

  const openModal = () => {
    setEditJob(null);
    setJobTitle("");
    setJobDescription("");
    setSalary("");
    setAddress("");
    setCity("");
    setPostalCode("");
    setState("");
    setContactNumber("");
    setCategory("");
    setContactEmail("");
    setJobCompany("");
    setImageUrl("");
    setIsModalOpen(true);
  };

  const openEditModal = (job: JobPosting) => {
    setEditJob(job);
    setJobTitle(job.jobTitle);
    setJobDescription(job.jobDescription);
    setSalary(job.salary);
    setAddress(job.address);
    setCity(job.city);
    setPostalCode(job.postalCode);
    setState(job.state);
    setContactNumber(job.contactNumber);
    setCategory(job.category);
    setContactEmail(job.contactEmail);
    setJobCompany(job.jobCompany);
    setImageUrl(job.imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      setEditJob(null);
    }, 300);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "jobPostings"),
      (snapshot) => {
        const jobData: JobPosting[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as JobPosting[];
        console.log("Real-time job postings:", jobData);
        setJobPostings(jobData);
      },
      (error: any) => {
        console.error("Fetch Error:", error.code, error.message);
        alert(`Failed to fetch job postings: ${error.message}`);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editJob) {
        await setDoc(doc(db, "jobPostings", editJob.id), {
          jobTitle,
          jobDescription,
          salary,
          address,
          city,
          postalCode,
          state,
          contactNumber,
          category,
          contactEmail,
          jobCompany,
          imageUrl,
          createdAt: editJob.createdAt,
        });
        console.log("Job posting updated:", editJob.id);
      } else {
        const docRef = await addDoc(collection(db, "jobPostings"), {
          jobTitle,
          jobDescription,
          salary,
          address,
          city,
          postalCode,
          state,
          contactNumber,
          category,
          contactEmail,
          jobCompany,
          imageUrl,
          createdAt: new Date().toISOString(),
        });
        console.log("Job posting added with ID:", docRef.id);
      }
      setJobTitle("");
      setJobDescription("");
      setSalary("");
      setAddress("");
      setCity("");
      setPostalCode("");
      setState("");
      setContactNumber("");
      setCategory("");
      setContactEmail("");
      setJobCompany("");
      setImageUrl("");
      closeModal();
    } catch (error: any) {
      console.error("Firebase Error:", error.code, error.message);
      alert(`Failed to save job posting: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "jobPostings", id));
      console.log("Job posting deleted successfully:", id);
    } catch (error: any) {
      console.error("Firebase Error:", error.code, error.message);
      alert(`Failed to delete job posting: ${error.message}`);
    }
  };

  const filteredJobs = jobPostings.filter((job) =>
    job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.jobCompany.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Job Postings</h1>
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
            placeholder="Search job postings by title or company..."
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
              <th className="px-4 py-3">Job Title</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Salary</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-100 transition">
                  <td className="px-4 py-3">{job.jobTitle}</td>
                  <td className="px-4 py-3">{job.jobCompany}</td>
                  <td className="px-4 py-3">{job.salary}</td>
                  <td className="px-4 py-3">{`${job.city}, ${job.state} ${job.postalCode}`}</td>
                  <td className="px-4 py-3">{job.category}</td>
                  <td className="px-4 py-3">
                    <img
                      src={job.imageUrl}
                      alt={job.jobTitle}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 min-w-[120px]">
                      <button
                        onClick={() => openEditModal(job)}
                        className="flex items-center px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow"
                      >
                        <Pencil size={14} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="flex items-center px-2 py-1 text-xs font-medium bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow"
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
                <td colSpan={7} className="px-4 py-3 text-center">
                  No job postings found
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
            className={`relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl z-10 transition-all ${
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
              {editJob ? "Edit Job Posting" : "Add New Job Posting"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Job Company</label>
                  <input
                    type="text"
                    value={jobCompany}
                    onChange={(e) => setJobCompany(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Job Description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Salary</label>
                  <input
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Contact Number</label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                    required
                  />
                </div>
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
              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
              >
                {editJob ? "Update" : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}