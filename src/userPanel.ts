import { PrismaClient } from "@prisma/client";
import Elysia, { error, t } from "elysia";

const Prisma = new PrismaClient();

export const userPanel = new Elysia().group("/auth", (app) => {
  return (
    app

      // ! ثبت نام کاربر
      .post(
        "sign-up",
        async ({ body: { email, password, fristName, lastName }, set }) => {
          const allUsers = await Prisma.user.findMany({
            where: {
              email: email,
            },
          });

          if (allUsers.length) {
            set.status = 401;
            return { message: "کاربر قبلا ثبت نام کرده است !", success: false };
          } else {
            const user = await Prisma.user.create({
              data: {
                email,
                lastName,
                fristName,
                password: await Bun.password.hash(password),
              },
            });

            return {
              message: "کاربر با موفقیت ثبت نام شد !",
              data: { ...user, password: null },
              success: true,
            };
          }
        },
        {
          body: t.Object({
            email: t.String(),
            password: t.String(),
            fristName: t.String(),
            lastName: t.String(),
          }),
        }
      )

      // ! ورود کاربر
      .post(
        "sign-in",
        async ({ body: { email, password }, set }) => {
          const allUsers = await Prisma.user.findMany({
            where: {
              email: email,
            },
          });

          if (
            !allUsers.length ||
            !(await Bun.password.verify(password, allUsers[0].password))
          ) {
            set.status = 401;
            return {
              message: "ایمیل یا رمز عبور اشتباه است !",
              success: false,
            };
          } else {
            // ! حذف توکن قبلی
            return await Prisma.section
              .deleteMany({
                where: {
                  userId: allUsers[0].id,
                },
              })
              .then(async () => {
                // ! ایجاد توکن برای کاربر
                const key = crypto.randomUUID()
                const token = key;
                
                await Prisma.section.create({
                  data: {
                    token,
                    userId: allUsers[0].id,
                  },
                });

                return {
                  message: "کاربر با موفقیت وارد شد !",
                  token,
                  success: true,
                };
              });
          }
        },
        {
          body: t.Object({
            email: t.String(),
            password: t.String(),
          }),
        }
      )

      // ! یافتن کاربر
      .get(
        "user",
        async ({ headers: { authorization }, set }) => {
          const checkToken = await Prisma.section.findMany({
            where: {
              token: authorization,
            },
            include: {
              userData: {
                include : {
                  posts : true
                }
              },
            },
          });
          if (!checkToken.length) {
            set.status = 401;
            return { message: "توکن اشتباه است !", success: false };
          } else {
            return {
              message: "کاربر با موفقیت یافت شد !",
              success: true,
              data: { ...checkToken[0].userData, password: null },
            };
          }
        },
        {
          headers: t.Object({
            authorization: t.String(),
          }),
        }
      )

      // ! خروج کاربر
      .get(
        "logout",
        async ({ headers: { authorization } }) => {
          await Prisma.section.deleteMany({
            where: {
              token: authorization,
            },
          });

          return { message: "کاربر با موفقیت خارج شد !", success: true };
        },
        {
          headers: t.Object({
            authorization: t.String(),
          }),
        }
      )

      // ! ویرایش کاربر
      .put(
        "update",
        async ({
          body: { email, u_password, o_password, fristName, lastName },
          headers: { authorization },
          set,
        }) => {
          const checkToken = await Prisma.section.findMany({
            where: {
              token: authorization,
            },
            include: {
              userData: true,
            },
          });

          // ! بررسی رمز عبور قبلی
          const checkPassword = await Bun.password.verify(
            o_password,
            checkToken[0].userData.password
          );
          
          if (!checkToken.length || !checkPassword) {
            set.status = 401;
            return { message: "توکن یا رمز عبور اشتباه است !", success: false };
          } else {
            const user = await Prisma.user.update({
              where: {
                id: checkToken[0].userId,
              },
              data: {
                email,
                lastName,
                fristName,
                password: await Bun.password.hash(u_password),
              },
            });

            return {
              message: "کاربر با موفقیت ویرایش شد !",
              data: { ...user, password: null },
              success: true,
            };
          }
        },
        {
          body: t.Object({
            email: t.String(),
            u_password: t.String(),
            o_password: t.String(),
            fristName: t.String(),
            lastName: t.String(),
          }),
          headers: t.Object({
            authorization: t.String(),
          }),
        }
      )
  );
});
