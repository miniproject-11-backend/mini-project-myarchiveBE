const express = require("express");
const { Posts } = require("../models");
const authmiddleware = require("../middlewares/auth-middleware.js");
const CustomError = require("../middlewares/errorhandler");
const router = express.Router();

//유저 게시글 조회API
//localhost:3017/mypage
router.get("/mypage", authmiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const donepostlist = await Posts.findAll({
      attributes: [
        "postId",
        "url",
        "title",
        "category",
        "desc",
        "isDone",
        "createdAt",
        "updatedAt",
      ],
      where: {
        userId: userId,
        isDone: true,
      },
      order: [["createdAt", "DESC"]],
    });
    const notDonepostlist = await Posts.findAll({
      attributes: [
        "postId",
        "url",
        "title",
        "category",
        "desc",
        "isDone",
        "createdAt",
        "updatedAt",
      ],
      where: {
        userId: userId,
        isDone: false,
      },
      order: [["createdAt", "DESC"]],
    });
    const postslist = { done: donepostlist, notdone: notDonepostlist };
    res.status(200).json(postslist);
  } catch (err) {
    res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

//유저 게시글 수정API
//localhost:3017/post/:postId
router.put("/post/:postId", authmiddleware, async (req, res, next) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;
  const { url, title, desc } = req.body;
  try {
    const existPost = await Posts.findOne({
      where: {
        postId: postId,
        userId: userId
      }
    })
    //게시글이 존재하지 않을 때
    if (!existPost) {
      throw new CustomError("게시글이 존재하지 않습니다.", 403)
    }
    //수정권한이 없을때
    if (userId !== existPost.userId) {
      throw new CustomError("게시글 수정의 권한이 존재하지 않습니다.", 403)
    }
    //수정 업데이트
    await Posts.update({ url, title, desc }, { where: { postId, userId } })
    res.status(200).json({ "message": "게시글을 수정하였습니다." })
  } catch (error) {
    next(error)
  }

})

/**
 * //위시리스트 수정API
//localhost:3017/mypage/:postId
router.put("/mypage/:postId", authmiddleware, async (req, res, next) => {
  const { postId } = req.params;
  const { isDone } = req.body;
  const { userId } = res.locals.user;
  const existsPosts = await Posts.findOne({ where: { postId, userId } });
   //이부분은 프론트랑 상의 후 작성
  if (existsPosts.isDone == false){

    await Posts.update({ isDone }, { where: { postId, userId } })
  }
})
 */


module.exports = router;
