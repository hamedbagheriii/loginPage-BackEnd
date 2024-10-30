import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { userPanel } from "./userPanel";
import { postPage } from "./postPage";
import cors from "@elysiajs/cors";

const app = new Elysia()

.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
.use(swagger())
.group('/userPanel',(app)=>{
    return app
    .use(userPanel)
    .use(postPage)
})

.listen(3100);



