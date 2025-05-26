import { NextResponse } from "next/server"
import { parse } from "csv-parse"
import admin from "firebase-admin"
import { Readable } from "stream"

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccount = require("../serviceAccountKey.json")
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  } catch (error) {
    console.error("Firebase initialization error:", error)
    throw new Error("Failed to initialize Firebase Admin SDK")
  }
}
const db = admin.firestore()

// Convert buffer to readable stream
function bufferToStream(buffer) {
  const stream = new Readable()
  stream.push(buffer)
  stream.push(null)
  return stream
}

// Function to parse CSV and convert to JSON
async function parseCsvToJson(fileBuffer) {
  return new Promise((resolve, reject) => {
    const results = []
    bufferToStream(fileBuffer)
      .pipe(parse({ columns: true, trim: true }))
      .on("data", (row) => {
        results.push(row)
      })
      .on("end", () => {
        if (results.length === 0) {
          return reject(new Error("CSV file is empty"))
        }
        const requiredColumns = [
          "Category Title",
          "Category Created At",
          "Category Information",
          "Job Company",
          "Job Title",
        ]
        const missingColumns = requiredColumns.filter((col) => !(col in results[0]))
        if (missingColumns.length > 0) {
          return reject(new Error(`Missing required columns: ${missingColumns.join(", ")}`))
        }
        const jsonData = [
          {
            category: {
              title: results[0]["Category Title"],
              createdAt: results[0]["Category Created At"],
              information: results[0]["Category Information"],
            },
            postings: results.map((row) => ({
              jobCompany: row["Job Company"],
              jobTitle: row["Job Title"],
              jobDescription: row["Job Description"],
              contactEmail: row["Contact Email"],
              contactNumber: row["Contact Number"],
              address: row["Address"],
              city: row["City"],
              state: row["State"],
              postalCode: row["Postal Code"],
              salary: row["Salary"],
              imageUrl: row["Image URL"],
              tags: row["Tags"] ? row["Tags"].split(",") : [],
              createdAt: row["Job Created At"],
            })),
          },
        ]
        resolve(jsonData)
      })
      .on("error", (error) => reject(error))
  })
}

// Function to upload JSON data to Firestore
async function uploadData(jsonData) {
  if (!Array.isArray(jsonData)) {
    throw new Error("Data should be an array")
  }

  const BATCH_LIMIT = 450
  let operationCount = 0
  let currentBatch = db.batch()

  const commitBatchIfNeeded = async () => {
    if (operationCount >= BATCH_LIMIT) {
      await currentBatch.commit()
      operationCount = 0
      currentBatch = db.batch()
    }
  }

  for (const item of jsonData) {
    const { category, postings } = item

    if (!category || !category.title) {
      console.warn(`Skipping invalid category: ${JSON.stringify(category)}`)
      continue
    }

    const categoryRef = db.collection("categories").doc()
    const categoryData = {
      createdAt: category.createdAt || null,
      information: category.information || null,
      title: category.title,
    }

    currentBatch.set(categoryRef, categoryData)
    operationCount++

    await commitBatchIfNeeded()

    if (Array.isArray(postings) && postings.length > 0) {
      for (const post of postings) {
        if (!post.jobTitle) {
          console.warn(`Skipping posting with missing jobTitle: ${JSON.stringify(post)}`)
          continue
        }

        const postingRef = categoryRef.collection("posting").doc()
        const postingData = {
          ...post,
          category: category.title,
        }

        currentBatch.set(postingRef, postingData)
        operationCount++

        await commitBatchIfNeeded()
      }
    }
  }

  if (operationCount > 0) {
    await currentBatch.commit()
  }
}

// POST handler for CSV upload
export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get("csvFile")

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.type !== "text/csv") {
      return NextResponse.json({ error: "Invalid file type. Please upload a CSV file." }, { status: 400 })
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const jsonData = await parseCsvToJson(fileBuffer)
    await uploadData(jsonData)

    return NextResponse.json({ message: "Data uploaded successfully" }, { status: 200 })
  } catch (error) {
    console.error("Upload error:", error.stack)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
