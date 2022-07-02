import {Field, ObjectType} from 'type-graphql'

@ObjectType()
export class User{
    
    @Field(()=>String)
    username!: string;

    @Field(()=> String)
    email!: string;

    password!: string;

    @Field(()=>String)
    name!: string;


}