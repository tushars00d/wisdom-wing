import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

import { Post } from "./src/models/Post.js";
import { Question } from "./src/models/Question.js";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const query = {
    $or: [
      { title: { $regex: /passing criteria/i } },
      { title: { $regex: /image segmentation/i } },
      { content: { $regex: /passing criteria/i } },
      { content: { $regex: /image segmentation/i } },
      { body: { $regex: /passing criteria/i } },
      { body: { $regex: /image segmentation/i } }
    ]
  };

  // For Post
  const posts = await Post.find({
    $or: [
      { title: { $regex: /passing criteria/i } },
      { title: { $regex: /image segmentation/i } }
    ]
  });
  console.log(`Found ${posts.length} Posts matching.`);
  for (let p of posts) {
    console.log(`Deleting Post: ${p.title}`);
    await Post.findByIdAndDelete(p._id);
  }

  // For Question
  const questions = await Question.find({
    $or: [
      { title: { $regex: /passing criteria/i } },
      { title: { $regex: /image segmentation/i } }
    ]
  });
  console.log(`Found ${questions.length} Questions matching.`);
  for (let q of questions) {
    console.log(`Deleting Question: ${q.title}`);
    await Question.findByIdAndDelete(q._id);
  }

  console.log("Done.");
  process.exit(0);
}

run().catch(console.error);
