const express = require("express");
const { Posts, Users } = require("../models");
const CustomError = require("../middlewares/errorhandler.js");
const { Op } = require("sequelize");
const axios = require("axios");
const cheerio = require("cheerio");
const authmiddleware = require("../middlewares/auth-middleware");
const router = express.Router();

// const PostController = require("../controllers/posts.controllers");
// const postsController = new PostController();

// router.get("/", postsController.getPosts);
// router.post("/post", authmiddleware, postsController.createPost);
// router.delete("/post/:postId", authmiddleware, postsController.delPost);

//게시글 조회api
//localhost:3017 
router.get("/", async (req, res, next) => {
  try {
    const posts = await Posts.findAll({
      raw: true,
      attributes: [
        "postId",
        "User.accountId",
        "User.nick",
        "img",
        "category",
        "title",
        "isDone",
        "createdAt",
      ],
      include: [
        {
          model: Users,
          attributes: [],
        },
      ],
      order: [["postId", "desc"]],
    });
    res.status(200).json({ posts: posts });
  } catch (error) {
    next(error);
    return res
      .status(400)
      .json({ errorMessage: "게시글조회에 실패하였습니다." });
  }
});

//게시글 생성 api
//localhost:3017/post
router.post("/post", authmiddleware, async (req, res, next) => {
  try {
    const { userId } = res.locals.user;
    const { url: postUrl, title, category, desc } = req.body;

    if (!title) {
      throw new CustomError("title을 입력해주세요", 410);
    }
    if (!desc) {
      throw new CustomError("desc를 입력해주세요.", 410);
    }
    if (Number(title.length) > 50 || typeof title !== "string") {
      throw new CustomError("게시글 제목이 형식이 올바르지않습니다.", 412);
    }
    if (Number(desc.length) > 500 || typeof desc !== "string") {
      throw new CustomError("게시글 내용의 형식이 일치하지않습니다.", 412);
    }

    // const { error, value } = globalSchema.validate(data);
    // if (error) {
    //   if (error.details[0].path[0] === "title") {
    //     throw new CustomError("title을 입력해주세요", 410);
    //   }
    //   if (error.details[0].path[0] === "desc") {
    //     throw new CustomError("desc를 입력해주세요.", 410);
    //   }
    //   if (
    //     error.details[0].path[0] === "title" &&
    //     error.details[0].type === "string.max"
    //   ) {
    //     throw new CustomError("게시글 제목이 형식이 올바르지않습니다.", 412);
    //   }
    //   if (
    //     error.details[0].path[0] === "title" &&
    //     error.details[0].type === "string.max"
    //   ) {
    //     throw new CustomError("게시글 내용의 형식이 일치하지않습니다.", 412);
    //   }
    // }

    // url을 가지고 크롤링해오는 api

    // // axios모듈을 사용해서 postUrl로 get요청을 보내 HTML데이터를 가져온다.
    //$에 cheerio모듈로 파싱해온 HTML데이터를 할당한다
    //img mainImg의 src에 붙어있는 url을 가져온다.
    //url이 존재하지 않으면
    //메타태그의 og:image의 content에 적힌 url을 가져온다
    //값이 없다면 undefined
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
    const posts = await Posts.create({
      userId: userId,
      url: postUrl,
      img: imageUrl,
      title,
      category,
      desc,
      isDone: false,
    });
    if (!posts) {
      throw new CustomError("데이터 형식이 올바르지 않습니다..", 412);
    }
    res.status(201).json({ posts, message: "게시글 작성에 성공하였습니다." });
  } catch (error) {
    next(error);
    return res
      .status(412)
      .json({ errorMessage: "게시글 작성에 실패하였습니다." });
  }
});

//게시글 삭제 api
//localhost:3017/post/:postId
router.delete("/post/:postId", authmiddleware, async (req, res, next) => {
  try {
    const { userId } = res.locals.user;
    const { postId } = req.params;

    const post = await Posts.findOne({ where: { postId } });

    if (!post) {
      throw new CustomError("게시글이 존재하지 않습니다.", 404);
    } else if (post.userId !== userId) {
      throw new CustomError("게시글의 삭제권한이 존재하지 않습니다.", 403);
    }
    await Posts.destroy({
      where: {
        [Op.and]: [{ postId }, { userId: userId }],
      },
    });
    return res.status(200).json({ message: "게시글이 삭제되었습니다." });
  } catch (error) {
    next(error);
    return res
      .status(401)
      .json({ errorMessage: "게시글이 정상적으로 삭제되지 않았습니다." });
  }
});
module.exports = router;
