import { UserTeam } from "../entites/UserTeam";
import { AppContext, CreateTeamInput, MessageErrorResponse, UserTeamInput } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { isAuth } from "../middleware/isAuth";
import { Team } from "../entites/Team";
import { v4 } from "uuid";


@Resolver()
export class TeamResolver{
    
    @Mutation(()=>Team)
    @UseMiddleware(isAuth)
    async createTeam(
        @Arg('input') input: CreateTeamInput,
        @Ctx() {redis, authUser}: AppContext
    ){
        const teamId = v4();
        const team = {
            id: teamId,
            name: input.name,
            organisation: input.organisation
        }
        await redis.set(`team:${teamId}`, JSON.stringify(team));
        await redis.set(`userteam:${authUser}:${teamId}`,
            JSON.stringify({
                role: "admin",
                joinedAt: Date.now()
            })
        );
        return team as Team;
    }

    @Query(()=>[UserTeam])
    async getUserTeam(
        @Arg("input") input:UserTeamInput,
        @Ctx() {redis} : AppContext
    ){
        const result: UserTeam[] = [];
        const usernamePattern = input.username ? input.username : '*';
        const teamIdPattern = input.teamId ? input.teamId : '*';
        const userTeamKeys = await redis.keys(`userteam:${usernamePattern}:${teamIdPattern}`);
        const userTeam = await redis.mget(userTeamKeys);
        userTeam.forEach((value, index) => {
            const entryId = userTeamKeys[index].split(':');
            if (value){
                const {role, joinedAt} = JSON.parse(value);
                result.push({
                    user: entryId[1],
                    team: entryId[2],
                    role: role,
                    joinedAt: joinedAt
                });
            }
        });
        return result;
    }

    @Mutation(()=>MessageErrorResponse)
    @UseMiddleware(isAuth)
    async addUserToTeam(
        @Arg("username") username:string,
        @Arg("teamId") teamId:string,
        @Ctx() {redis, authUser} : AppContext
    ){
        //check if authUser is in team
        const meInTeam = await redis.get(`userteam:${authUser}:${teamId}`);
        if (!meInTeam) {
            return {error: "You are not a member of this team"};
        }
        //check if authUser is admin in team
        console.log(meInTeam);
        const {role} = JSON.parse(meInTeam);
        if (role!=="admin"){
            return {error: "You don't have permission to manage this team"};
        }
        if (!await redis.exists(`user:${username}`)){
            return {error: "User does not exist"};
        }
        if (!await redis.exists(`team:${teamId}`)){
            return {error: "Team does not exist"}; 
        }
        if (await redis.exists(`userteam:${username}:${teamId}`)){
            return {error: "User already in team"}
        }
        await redis.set(`userteam:${username}:${teamId}`,
            JSON.stringify({
                role: "member",
                joinedAt: Date.now()
            })
        );
        return {message: "User added to team"}
    }

    @Mutation(()=>MessageErrorResponse)
    @UseMiddleware(isAuth)
    async changeUserRole(
        @Arg("username") username:string,
        @Arg("teamId") teamId:string,
        @Arg("role") newRole:string,
        @Ctx() {redis, authUser} : AppContext
    ){
        if (newRole!=="admin" && newRole!=="member"){
            return {error:"Role should be either admin or member"}
        }
        //check if authUser is in team
        const meInTeam = await redis.get(`userteam:${authUser}:${teamId}`);
        console.log(meInTeam);
        if (!meInTeam) {
            return {error: "You are not a member of this team"};
        }
        //check if authUser is admin in team
        const {role} = JSON.parse(meInTeam);
        if (role!=="admin"){
            return {error: "You don't have permission to manage this team"};
        }
        const userTeam = await redis.get(`userteam:${username}:${teamId}`);
        if (!userTeam){
            return  {error: "This is not a member in this team"}
        }
        const {joinedAt} = JSON.parse(userTeam);
            await redis.set(`userteam:${username}:${teamId}`,
                JSON.stringify({
                    role: newRole,
                    joinedAt: joinedAt
                })
            );
        
        return {message: `User set a ${newRole}`}
    }
}