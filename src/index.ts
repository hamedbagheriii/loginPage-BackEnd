import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { userPanel } from "./userPanel";
import { postPage } from "./postPage";

const app = new Elysia()
.use(swagger())
.group('/userPanel',(app)=>{
    return app
    .use(userPanel)
    .use(postPage)
})

.listen(3000);


