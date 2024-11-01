import { Post, PrismaClient, Section } from "@prisma/client";
import Elysia, { error, t } from "elysia";

const Prisma = new PrismaClient();

export const postPage = new Elysia().group("/posts", (app) => {
  return (
    app

      // ! check body and headers
      .guard({
        headers: t.Object({
          authorization: t.String(),
        }),
      })

      // ! add post
      .post(
        "/add",
        async ({
          body: { title, content },
          headers: { authorization },
          error: error,
        }) => {
          const checkToken: Section[] = await Prisma.section.findMany({
            where: {
              token: authorization,
            },
          });

          const userID = checkToken[0].userId;
          if (userID) {
            await Prisma.post.create({
              data: {
                title,
                content : content || "",
                userID
              },
            });

            return { message: "پست با موفقیت ثبت شد .", success: true };
          } else {
            return error(401, "! شما اجازه دسترسی به این بخش را ندارید ");
          }
        },
        {
          body: t.Object({
            title: t.String(),
            content: t.Optional(t.String()),
          }),
        }
      )

      // ! get posts
      .get(
        ":postID?",
        async ({ params: { postID }, headers: { authorization }, error }) => {
          const checkToken: Section[] = await Prisma.section.findMany({
            where: {
              token: authorization,
            },
          });

          if (checkToken[0]) {
            const { userId } = checkToken[0];

            // ! get one post
            if (postID) {
              const post = await Prisma.post.findUnique({
                where: {
                  id: postID,
                },
                include: {
                  userData: {
                    select: {
                      fristName: true,
                      lastName: true,
                      email: true,
                      id: true,
                    },
                  },
                },
              });
              return {
                message: "پست با موفقیت دریافت شد .",
                post,
                success: true,
              };
            }
            // ! get all posts
            else {
              const posts = await Prisma.post.findMany({
                where: {
                  userID: userId,
                },
                include: {
                  userData: {
                    select: {
                      fristName: true,
                      lastName: true,
                      email: true,
                      id: true,
                    },
                  },
                },
              });
              return {
                message: "پست ها با موفقیت دریافت شدند .",
                posts,
                success: true,
              };
            }
          } else {
            return error(401, "! توکن شما معتبر نمی باشد ");
          }
        },
        {
          params: t.Object({
            postID: t.Optional(t.Number()),
          }),
        }
      )

      // ! delete post
      .delete(
        "/remove/:id",
        async ({ params: { id }, headers: { authorization }, error }) => {
          const checkToken: Section[] = await Prisma.section.findMany({
            where: {
              token: authorization,
            },
          });
          const checkPost: Post[] = await Prisma.post.findMany({
            where: {
              id,
            },
          });

          if (checkToken[0] && checkPost[0]) {
            const deletePost = await Prisma.post.delete({
              where: {
                id,
              },
            });

            return {
              message: "پست با موفقیت حذف شد .",
              deletePost,
              success: true,
            };
          } else if (!checkPost[0]) {
            return error(401, "! پستی با این شماره پیدا نشد ");
          } else {
            return error(401, "! توکن شما معتبر نمی باشد ");
          }
        },
        {
          params: t.Object({
            id: t.Number(),
          }),
        }
      )

      // ! Update post
      .put(
        "/update/:id",
        async ({
          params: { id },
          body: { title, content },
          headers: { authorization },
          error,
        }) => {
          const checkToken: Section[] = await Prisma.section.findMany({
            where: {
              token: authorization,
            },
          });
          const checkPost: Post[] = await Prisma.post.findMany({
            where: {
              id,
            },
          });

          if (checkToken[0] && checkPost[0]) {
            const updatePost = await Prisma.post.update({
              where: {
                id,
              },
              data: {
                title,
                content,
              },
            });

            return {
              message: "پست با موفقیت آپدیت شد .",
              updatePost,
              success: true,
            };
          } else if (!checkPost[0]) {
            return error(401, "! پستی با این شماره پیدا نشد ");
          } else {
            return error(401, "! توکن شما معتبر نمی باشد ");
          }
        },
        {
          body: t.Object({
            title: t.String(),
            content: t.String(),
          }),
          params: t.Object({
            id: t.Number(),
          }),
        }
      )

      // ! like post
      .put(
        "/likePost/:id",
        async ({ params: { id }, headers: { authorization }, error }) => {
          const checkToken: Section[] = await Prisma.section.findMany({
            where: {
              token: authorization,
            },
          });
          const checkPost: Post[] = await Prisma.post.findMany({
            where: {
              id,
            },
          });

          if (checkToken[0] && checkPost[0]) {
            const likePost = await Prisma.post.update({
              where: {
                id,
              },
              data: {
                like: {
                  increment: 1,
                },
              },
            });

            return {
              message: "پست با موفقیت لایک شد .",
              likePost,
              success: true,
            };
          } else if (!checkPost[0]) {
            return error(401, "! پستی با این شماره پیدا نشد ");
          } else {
            return error(401, "! توکن شما معتبر نمی باشد ");
          }
        },
        {
          params: t.Object({
            id: t.Number(),
          }),
        }
      )

      // ------- all posts
      // ! get posts
      .get("/allPosts", 
        async ({ headers: { authorization }, error }) => {
        const checkToken: Section[] = await Prisma.section.findMany({
          where: {
            token: authorization,
          },
        });

        if (checkToken[0]) {
          const { userId } = checkToken[0];

          if (userId) {
            const posts = await Prisma.post.findMany({
              where: {
                userID: {
                  not : userId
                }
              },
              include: {
                userData: {
                  select: {
                    fristName: true,
                    lastName: true,
                    email: true,
                    id: true,
                  },
                },
              },
            });
            return {
              message: "پست ها با موفقیت دریافت شدند .",
              posts,
              success: true,
            };
          }
        } else {
          return error(401, "! توکن شما معتبر نمی باشد ");
        }
      })
  );
});
