const { model } = require("mongoose");
const Blog = require("../model/blogs");


module.exports.get_blogs = (req, res) => {
  console.log(req.url);
  Blog.find()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
    });
};
module.exports.get_blog = (req,res) =>{
  const id = req.params.id;
  Blog.findById(id)
    .then(async(result)=>{
        var allblogs=await Blog.find();
        res.status(200).json(result);
    })
    .catch((err)=>{
        console.log(err);
    });
}

module.exports.post_blog = (req, res) => {
  const {title, snippet, img, category, body, keywords} = req.body
  console.log(req.body,keywords)
  const blog = new Blog({title, snippet, img, category, body, keywords});
  blog
    .save()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
    });
};
