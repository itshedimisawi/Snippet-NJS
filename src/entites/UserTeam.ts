import { DateTimeResolver } from "graphql-scalars";
import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class UserTeam{

    @Field(()=>String)
    user!: string;

    @Field(()=>String)
    team!: string;

    @Field(()=>DateTimeResolver)
    joinedAt!: Date;

    @Field(()=>String)
    role!: string;
}