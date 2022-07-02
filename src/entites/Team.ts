import {Field, ObjectType} from 'type-graphql'

@ObjectType()
export class Team{
    @Field(()=>String)
    id!: string;

    @Field(()=>String)
    name!: string;

    @Field(()=>String, {nullable:true})
    organisation?: string;
}