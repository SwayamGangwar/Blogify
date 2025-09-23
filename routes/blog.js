const express = require ("express");
const router = express.Router();
const Blog =  require ("../models/blog")
const path = require ("path"); //path resolve
const multer = require ("multer"); //multer for file uploads
const Comment = require("../models/comment");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/uploads"))
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage })

router.get("/add-new", (req,res)=>{
    return res.render("addBlog",{
        user: req.user,
    });
});

router.get("/:id", async(req,res)=>{ //id get stored in req.params.id
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({blogId: req.params.id}).populate("createdBy");
    console.log("comment",comments);
    return res.render("blog", {
        user: req.user,
        blog,
        comments,
    });
});

router.post("/comment/:blogId", async (req,res)=>{ //blogid get stored in req.params.blogID
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/", upload.single("coverImage"), async(req,res)=>{
    const {title,body} = req.body;
    const blog = await Blog.create({
        title,
        body,
        createdBy: req.user._id,
        coverImageURL: `/uploads/${req.file.filename}`,
    });
    return res.redirect(`/blog/${blog._id}`);
});
   
module.exports = router;
