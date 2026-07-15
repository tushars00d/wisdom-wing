import { Community } from "../models/Community.js";
import { Post } from "../models/Post.js";
import { Reply } from "../models/Reply.js";
import { generateAIAnswer } from "./auto-answer.service.js";
import { createReply } from "./engagement.service.js";
import { findBestScrapedAnswer } from "./scraping.service.js";

export async function runAutoReplyForPost(postId) {
  const post = await Post.findById(postId).lean();

  if (!post || post.postType !== "question") {
    return null;
  }

  const existingReply = await Reply.findOne({
    targetType: "post",
    targetId: post._id,
    source_type: { $in: ["scraped", "AI"] }
  }).lean();

  if (existingReply) {
    return null;
  }

  const community = await Community.findById(post.communityId).lean();
  const questionText = [post.title, post.content].filter(Boolean).join("\n");

  let answerPayload = null;

  if (community?.type === "college") {
    const scraped = await findBestScrapedAnswer({
      questionText,
      communityName: community.name,
      collegeName: community.college
    });

    if (scraped?.body) {
      answerPayload = {
        body: scraped.body,
        sourceType: "scraped",
        sourceUrl: scraped.sourceUrl
      };
      console.log(`Auto-reply used scraped result for post ${post._id}`);
    }
  }

  if (!answerPayload) {
    const aiAnswer = await generateAIAnswer({
      title: post.title,
      body: post.content,
      tags: post.tags,
      communityName: community?.name,
      collegeName: community?.college
    });
    answerPayload = {
      body: aiAnswer,
      sourceType: "AI"
    };
    console.log(`Auto-reply used AI fallback for post ${post._id}`);
  }

  return createReply({
    targetType: "post",
    targetId: post._id,
    content: answerPayload.body,
    model: Post,
    sourceType: answerPayload.sourceType,
    sourceUrl: answerPayload.sourceUrl
  });
}
