'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { db, auth } from '../../lib/firebase'; // Adjust path to your firebase.js
import { collection, doc, setDoc, addDoc } from 'firebase/firestore';

export default function UploadData() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadStatus('');
    } else {
      setFile(null);
      setUploadStatus('Please select a valid CSV file.');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('No file selected.');
      return;
    }

    // Optional: Check if user is authenticated
    if (!auth.currentUser) {
      setUploadStatus('Please sign in to upload data.');
      return;
    }

    setIsLoading(true);
    setUploadStatus('Processing...');

    try {
      // Read and parse the CSV file
      const results = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => resolve(result),
          error: (error) => reject(error),
        });
      });

      const jsonData = results.data;
      if (jsonData.length === 0) {
        throw new Error('CSV file is empty');
      }

      // Validate required columns
      const requiredColumns = [
        'Category Title',
        'Category Created At',
        'Category Information',
        'Job Company',
        'Job Title',
      ];
      const missingColumns = requiredColumns.filter((col) => !(col in jsonData[0]));
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      // Structure data to match your original format
      const formattedData = [
        {
          category: {
            title: jsonData[0]['Category Title'],
            createdAt: jsonData[0]['Category Created At'],
            information: jsonData[0]['Category Information'],
          },
          postings: jsonData.map((row) => ({
            jobCompany: row['Job Company'],
            jobTitle: row['Job Title'],
            jobDescription: row['Job Description'],
            contactEmail: row['Contact Email'],
            contactNumber: row['Contact Number'],
            address: row['Address'],
            city: row['City'],
            state: row['State'],
            postalCode: row['Postal Code'],
            salary: row['Salary'],
            imageUrl: row['Image URL'],
            tags: row['Tags'] ? row['Tags'].split(',') : [],
            createdAt: row['Job Created At'],
          })),
        },
      ];

      // Upload to Firestore
      for (const item of formattedData) {
        const { category, postings } = item;

        if (!category || !category.title) {
          console.warn(`Skipping invalid category: ${JSON.stringify(category)}`);
          continue;
        }

        // Add category to Firestore
        const categoryRef = doc(collection(db, 'categories'));
        await setDoc(categoryRef, {
          title: category.title,
          createdAt: category.createdAt || null,
          information: category.information || null,
        });

        // Add postings to subcollection
        if (Array.isArray(postings) && postings.length > 0) {
          for (const post of postings) {
            if (!post.jobTitle) {
              console.warn(`Skipping posting with missing jobTitle: ${JSON.stringify(post)}`);
              continue;
            }
            await addDoc(collection(categoryRef, 'posting'), {
              ...post,
              category: category.title,
            });
          }
        }
      }

      setUploadStatus('Data uploaded successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setUploadStatus(`Upload failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Data</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700 mb-2">
            Select CSV File
          </label>
          <input
            type="file"
            id="csvFile"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-gray-100 file:text-gray-700
              hover:file:bg-gray-200"
          />
        </div>
        <button
          onClick={handleUpload}
          disabled={isLoading || !file}
          className={`px-4 py-2 rounded-md text-white font-semibold
            ${isLoading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isLoading ? 'Uploading...' : 'Upload CSV'}
        </button>
        {uploadStatus && (
          <p
            className={`mt-4 text-sm ${
              uploadStatus.includes('successfully')
                ? 'text-green-600'
                : uploadStatus.includes('Processing')
                ? 'text-blue-600'
                : 'text-red-600'
            }`}
          >
            {uploadStatus}
          </p>
        )}
      </div>
    </div>
  );
}
