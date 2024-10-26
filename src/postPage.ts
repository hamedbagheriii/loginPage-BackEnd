import { PrismaClient, Section } from "@prisma/client";
import Elysia, { error, t } from "elysia";

const Prisma = new PrismaClient();

export const postPage = new Elysia()
.group('/posts',(app)=>{
    return app

    // ! check body and headers
    .guard({
        headers : t.Object({
            authorization : t.Number()
        })
    })

    // ! add post
    .post('/add',async(
        {
            body : {title , content , userId} ,
            headers : {authorization} ,
            error : error
        },
    ) => {
        const checkToken : Section[] = await Prisma.section.findMany({
            where : {
                token : authorization
            }
        })

        if (checkToken[0].userId == userId) {
            await Prisma.post.create({
                data : {
                    title ,
                    content ,
                    userID : userId
                }
            })

            return {message : 'پست با موفقیت ثبت شد .'}
        }
        else{
            return error(401 , '! شما اجازه دسترسی به این بخش را ندارید ')
        }

    },{
        body : t.Object({
            title : t.String(),
            content : t.String(),
            userId : t.Number()
        })
    })

    // ! get posts
    .get('',async({
        headers : {authorization} ,
        error
    })=>{
        const checkToken : Section[] = await Prisma.section.findMany({
            where : {
                token : authorization
            }
        })
        
        if (checkToken[0]) {
            const {userId} = checkToken[0]

            const posts = await Prisma.post.findMany({
                where : {
                    userID : userId
                },
                include : {
                    userData : {
                        select : {
                            fristName : true ,
                            lastName : true,
                            email : true,
                            id : true
                        }
                    }
                }
            })

            return {message : 'پست ها با موفقیت دریافت شدند .' , posts}
        }
        else{
            return error(401 , '! توکن شما معتبر نمی باشد ')
        }
    })
    
})