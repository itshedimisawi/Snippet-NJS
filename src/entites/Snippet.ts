import {Field, ObjectType} from 'type-graphql'
import { User } from './User';

@ObjectType()
export class Snippet{
    //userid:id
    @Field(()=>String)
    id!: string;

    @Field(()=>String)
    language: string;

    @Field(()=>String)
    name!: string;

    @Field(()=>String)
    content!: string;

    @Field(()=>String)
    color: string;

    @Field(()=>Boolean)
    isPrivate!: boolean;

    @Field(()=>User)
    user: User;
}