const express = require("express");
const router = express.Router();
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// multer temporary storage (local /tmp uploads folder)
const upload = multer({ dest: "uploads/" });

// Add Blog Route (with image upload to Cloudinary)
router.post("/add", upload.single("coverImage"), async (req, res) => {
  try {
    let imageUrl = "/images/default.png"; // default image if no upload

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "blogify",
      });
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path); // delete local temp file
    }

    const blog = new Blog({
      title: req.body.title,
      body: req.body.body,
      createdBy: req.user._id,
      coverImageURL: imageUrl,
    });

    await blog.save();
    res.redirect(`/blog/${blog._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed");
  }
});

// Render Add Blog Page
router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

// View Blog
router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");
  console.log("comment", comments);
  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

// Add Comment
router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

module.exports = router;
