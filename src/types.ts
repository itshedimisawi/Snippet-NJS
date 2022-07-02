import Redis from "ioredis"
import {Request, Response} from "express";
import { ObjectType, Field, InputType } from "type-graphql";
import { User } from "./entites/User";

export type AppContext = {
    req: Request,
    res: Response,
    redis: Redis
}

@ObjectType()
export class UserResponse{
    @Field(()=>User,{nullable:true})
    user?: User;

    @Field(()=>String,{nullable:true})
    error?: string;
}

@InputType()
export class RegisterInput{
    @Field()
    username!: string;

    @Field()
    email!: string;

    @Field()
    password!: string;
    @Field()
    name!: string;
}

@InputType()
export class LoginInput{
    @Field()
    username!: string;
    @Field()
    password!: string;
}

@InputType()
export class ForgotPasswordInput{
    @Field()
    username!: string;
    @Field()
    email!: string;
}


@ObjectType()
export class MessageErrorResponse{
    @Field(()=>String,{nullable:true})
    message?: string;

    @Field(()=>String,{nullable:true})
    error?: string;
}

