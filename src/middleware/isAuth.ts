import { AppContext } from "src/types";
import { MiddlewareFn } from "type-graphql";

export const isAuth: MiddlewareFn<AppContext> = async ({context},next) => {
    const token = context.req.headers.authorization
    if (token){
        const authUser = await context.redis.get(`token:${context.req.headers.authorization}`)
        if (authUser){
            context.authUser = authUser;
        }else{
            throw new Error("Not authenticated");
        }
    }else{
        throw new Error("Not authenticated");
    }
    return next();

}