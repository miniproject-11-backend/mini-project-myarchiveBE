const PostRepository = require("../repositories/posts.repositories");
const axios = require("axios");
const cheerio = require("cheerio");
const { Posts } = require("../models");

class PostService {
  constructor() {
    this.PostRepository = new PostRepository();
  }

  getPosts = async () => {
    const findAllPosts = await this.PostRepository.getPosts();

    return findAllPosts;
  };

  createPost = async ({
    userId,
    url: postUrl,
    title,
    category,
    desc,
    isDone,
  }) => {
    let imageUrl;

    if (postUrl) {
      const response = await axios.get(postUrl);
      let $ = cheerio.load(response.data);
      imageUrl =
        $("img#mainImg").attr("src") ||
        $('meta[property="og:image"][content^="http"]').attr("content");
      if (!postUrl.startsWith("http") && imageUrl.startsWith("/web")) {
        $("img").attr("src");
      }
    } else {
      undefined;
    }
    const newPost = await this.PostRepository.createPost({
      userId,
      url: postUrl,
      img: imageUrl,
      title,
      category,
      desc,
      isDone,
    });
    return newPost;
  };

  delPost = async (postId, userId) => {
    const post = await Posts.findOne({ where: { postId } });
    if (!post) {
      throw new CustomError("게시글이 존재하지 않습니다.", 404);
    } else if (post.userId !== userId) {
      throw new CustomError("게시글의 삭제권한이 존재하지 않습니다.", 403);
    }
    const deletePost = await this.PostRepository.delPost(postId, userId);
    return deletePost;
  };
}

module.exports = PostService;
