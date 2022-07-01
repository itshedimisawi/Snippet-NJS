import {Field, ObjectType} from 'type-graphql'

@ObjectType()
export class User{
    
    @Field(()=>String)
    username!: string;

    @Field(()=>String)
    password!: string;

    @Field(()=>String)
    name!: string;

    @Field(()=>String, {nullable: true})
    team?: string;

}