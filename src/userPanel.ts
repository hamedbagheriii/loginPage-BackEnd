import { PrismaClient } from "@prisma/client";
import Elysia, { error, t } from "elysia";

const Prisma = new PrismaClient();

export const userPanel = new Elysia()
.group('/auth', (app)=>{
    return app 

    // ! ثبت نام کاربر
    .post('sign-up',async({
        body : {email , password , fristName , lastName }
    })=>{
        const allUsers = await Prisma.user.findMany({
            where : {
                email : email
            }
        })
        
        if (allUsers.length) {
            return {message : 'کاربر قبلا ثبت نام کرده است !'}
        }
        else {
            await Prisma.user.create({
                data : {
                    email ,
                    lastName,
                    fristName,
                    password : await Bun.password.hash(password)
                }
            })

            return {message : 'کاربر با موفقیت ثبت نام شد !'}
        }
    },{
        body : t.Object({
            email : t.String(),
            password : t.String(),
            fristName :t.String(),
            lastName : t.String(),
        })
    })


    // ! ورود کاربر
    .post('sign-in',async({
        body : {email , password}
    })=>{
        const allUsers = await Prisma.user.findMany({
            where : {
                email : email
            }
        })
        
        if (!allUsers.length || !await Bun.password.verify(password , allUsers[0].password)) {
            return {message : 'ایمیل یا رمز عبور اشتباه است !'}
        }
        else {
            // ! حذف توکن قبلی
            await Prisma.section.deleteMany({
                where : {
                    userId : allUsers[0].id
                }
            })

            // ! ایجاد توکن برای کاربر
            const key = crypto.getRandomValues(new Uint32Array(1))[0]
            const token = key

            await Prisma.section.create({
                data : {
                    token ,
                    userId : allUsers[0].id
                }
            })

            return {message : 'کاربر با موفقیت وارد شد !' , token }
        }
    },{
        body : t.Object({
            email : t.String(),
            password : t.String(),
        })
    })


    // ! یافتن کاربر
    .get('user',async({
        headers : {authorization} ,
    })=>{
        const checkToken = await Prisma.section.findMany({
            where : {
                token : authorization 
            },
            include : {
                userData : true
            }
        })
        if (!checkToken.length) {
            return {message : 'توکن اشتباه است !'}
        }
        else {
            return {
                message : 'کاربر با موفقیت یافت شد !',
                data : {...checkToken[0].userData  , password : null}
            }
        }

    },{
        headers : t.Object({
            authorization : t.Number()
        })
    })
})