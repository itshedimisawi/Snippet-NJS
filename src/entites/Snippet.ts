import { DateTimeResolver } from 'graphql-scalars';
import {Field, ObjectType} from 'type-graphql'

@ObjectType()
export class Snippet{
    //userid:id
    @Field(()=>String)
    id!: string;

    @Field(()=>String, {nullable:true})
    language: string;

    @Field(()=>String)
    name!: string;

    @Field(()=>String)
    content!: string;

    @Field(()=>String, {nullable:true})
    color: string;

    @Field(()=>Boolean)
    isPrivate!: boolean;

    @Field(()=>Boolean, {nullable:true})
    isStarred: boolean;
}

@ObjectType()
export class StarredSnippet{
    @Field(()=>String)
    snippetId!: string;

    @Field(()=>String)
    userId!: string;

    @Field(()=>DateTimeResolver)
    createdAt!: Date;
    
}