import Redis from "ioredis"
import {Request, Response} from "express";
import { ObjectType, Field, InputType } from "type-graphql";
import { User } from "./entites/User";

export type AppContext = {
    req: Request,
    res: Response,
    redis: Redis,
    authUser?: string
}

@ObjectType()
export class UserResponse{
    @Field(()=>User,{nullable:true})
    user?: User;

    @Field(()=>String,{nullable:true})
    error?: string;

    @Field(()=>String,{nullable:true})
    token?: string;
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

@InputType()
export class SnippetInput{ //for updating snippets
    
    @Field(()=>String, {nullable:true})
    language: string;

    @Field(()=>String, {nullable:true})
    name!: string;

    @Field(()=>String, {nullable:true})
    content!: string;

    @Field(()=>String, {nullable:true})
    color: string;

    @Field(()=>Boolean, {nullable:true})
    isPrivate!: boolean;

}


@InputType()
export class AddSnippetInput{ //for updating snippets
    
    @Field(()=>String)
    language: string;

    @Field(()=>String)
    name!: string;

    @Field(()=>String)
    content!: string;

    @Field(()=>String, {nullable:true})
    color: string;

    @Field(()=>Boolean)
    isPrivate!: boolean;

}


@InputType()
export class UserTeamInput{
    @Field({nullable:true})
    username?: string;
    @Field({nullable:true})
    teamId?: string;
}

@InputType()
export class CreateTeamInput{

    @Field()
    name!: string;

    @Field({nullable:true})
    organisation?: string;
}