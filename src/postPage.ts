import { Post, PrismaClient, Section } from "@prisma/client";
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
    
    // ! delete post
    .delete('/remove/:id',async({
        params : {id} ,
        headers : {authorization} ,
        error
    })=>{

        const checkToken : Section[] = await Prisma.section.findMany({
            where : {
                token : authorization
            },
        })
        const checkPost : Post[] = await Prisma.post.findMany({
            where : {
                id 
            },
        })
        
        if (checkToken[0] && checkPost[0]) {
            const deletePost = await Prisma.post.delete({
                where : {
                    id
                }
            })

            return {message : 'پست با موفقیت حذف شد .' , deletePost}
        }
        else if (!checkPost[0]){
            return error(401 , '! پستی با این شماره پیدا نشد ')
        }
        else{
            return error(401 , '! توکن شما معتبر نمی باشد ')
        }

    },{
        params : t.Object({
            id : t.Number()
        })
    })

    // ! Update post
    .put('/update/:id', async({
        params : {id} ,
        body : {title , content} ,
        headers : {authorization} ,
        error
    })=>{
        const checkToken : Section[] = await Prisma.section.findMany({
            where : {
                token : authorization
            },
        })
        const checkPost : Post[] = await Prisma.post.findMany({
            where : {
                id 
            },
        })

        if (checkToken[0] && checkPost[0]) {
            const updatePost = await Prisma.post.update({
                where : {
                    id
                },
                data : {
                    title ,
                    content ,
                }
            })

            return {message : 'پست با موفقیت آپدیت شد .' , updatePost}
        }
        else if (!checkPost[0]){
            return error(401 , '! پستی با این شماره پیدا نشد ')
        }
        else{
            return error(401 , '! توکن شما معتبر نمی باشد ')
        }
    },{
        body : t.Object({
            title : t.String(),
            content : t.String(),
        }),
        params : t.Object({
            id : t.Number()
        })
    })
})