import { AppContext, ForgotPasswordInput, MessageErrorResponse, LoginInput, RegisterInput, UserResponse } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import argon from "argon2";
import { sendEmail } from "../util/sendEmail";
import { v4 } from "uuid";
import { isAuth } from "../middleware/isAuth";


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
            const {email, password, name, teams} = data;
            if (await argon.verify(password, input.password)){
                const token = v4();
                await redis.set(`token:${token}`, input.username);
                return {
                    user: {
                        username:input.username,
                        email:email,
                        password:password,
                        name:name,
                    },
                    token: token
                }
            }else{
                return  {
                    error: "Incorrect password"
                }
            }
        }else{
            return {
                error : "Incorrect username"
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
            const hashed_password = await argon.hash(input.password)
            await redis.set(input.username ,JSON.stringify({email:input.email, password:hashed_password,name:input.name}));
            return {user:{
                username: input.username,
                email: input.email,
                password: input.password,
                name: input.name
            }}
        }
    }

    @Mutation(()=>MessageErrorResponse)
    async forgotPassword(
        @Arg("input") input : ForgotPasswordInput,
        @Ctx() {redis} : AppContext,
    ):Promise<MessageErrorResponse>{
        const result = await redis.get(input.username);
        if (result){
            const data = JSON.parse(result);
            const {email} = data;
            if (email===input.email){
                const resetToken = v4();
                await redis.set(`password-reset:${resetToken}`, input.username);
                await sendEmail(email,`Token: ${resetToken}`);
                return {message: "A token has been sent to your email"}
            }else{
                return {error: "Incorrect email"}
            }
        }else{
            return {
                error : "User does not exist"
            }; 
        }
    }

    @Mutation(()=>MessageErrorResponse)
    async resetPassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() {redis} : AppContext
    ):Promise<MessageErrorResponse>{
        const username = await redis.get(`password-reset:${token}`)
        if (username){
            const userData = await redis.get(username)
            if (userData){
                const {email,name,team} = JSON.parse(userData)
                await redis.set(username, 
                    JSON.stringify({
                        email:email,
                        password: await argon.hash(newPassword),
                        name:name,
                        team:team
                    })
                );
                return {message: "Password has been updated successfully"}
            }
            return {error: "User no longer exist"}
        }
        return {error:"Token expired"}
    }

    @Query(()=>String)
    @UseMiddleware(isAuth)
    async hello(
        @Ctx() {authUser}: AppContext
    ):Promise<String>{
        return `hi ${authUser}`
    }
}