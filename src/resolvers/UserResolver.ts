import { AppContext, LoginInput, RegisterInput, UserResponse } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";



@Resolver()
export class UserResolver {
    @Query(()=> UserResponse)
    async login(
        @Arg('input') input:LoginInput,
        @Ctx() {redis}: AppContext
    ):Promise<UserResponse>{
        const result = await redis.get(input.username);
        if (result){
            const data = JSON.parse(result);
            const {password, name, team} = data;
            return {user: {username:input.username,password:password,name:name,team:team}}
        }else{
            return {
                error : "Invalid credentials"
            }; 
        }
    }

    @Mutation(()=>UserResponse)
    async register(
        @Arg("input") input: RegisterInput, 
        @Ctx() {redis}: AppContext,
    ):Promise<UserResponse>{
        if (await redis.exists(input.username)){
            return {error: "Username already taken"}
        }else{
            redis.set(input.username, JSON.stringify({password:input.password,name:input.name}));
            return {user:{
                username: input.username,
                password: input.password,
                name: input.name
            }}
        }
    }
}