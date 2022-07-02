import { AppContext } from "src/types";
import { MiddlewareFn } from "type-graphql";

export const setAuthUser: MiddlewareFn<AppContext> = async ({context},next) => {
    const token = context.req.headers.authorization
    if (token){
        const authUser = await context.redis.get(`token:${context.req.headers.authorization}`)
        if (authUser){
            context.authUser = authUser;
        }
    }
    return next();

}