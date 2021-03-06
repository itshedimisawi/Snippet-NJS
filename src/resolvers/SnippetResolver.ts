import { Snippet } from "../entites/Snippet";
import { AddSnippetInput, AppContext, MessageErrorResponse, SnippetInput } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { isAuth } from "../middleware/isAuth";
import { v4 } from "uuid";
import { setAuthUser } from "../middleware/setAuthUser";

@Resolver()
export class SnippetResolver{
    @Query(()=>[Snippet])
    @UseMiddleware(setAuthUser)
    async snippets(
        @Ctx() {redis,authUser} : AppContext
    ){
        const result: Snippet[] = [];
        const snippetsKeys = await redis.keys('snippet:*');
        if (snippetsKeys.length===0){
            return result;
        }
        const snippetsData = await redis.mget(snippetsKeys);
        console.log(snippetsData);
        await Promise.all(snippetsData.map(async (value, index) => {
            if (value){
                const {name,content,isPrivate,language} = JSON.parse(value);
                const snippet = {
                    id: snippetsKeys[index],
                    name: name,
                    content: content,
                    isPrivate:isPrivate,
                    language:language
                } as Snippet;
                if (authUser){
                    if (await redis.exists(`star:${snippet.id}:${authUser}`)){
                        snippet.isStarred = true;
                    }else{
                        snippet.isStarred = false;
                    }
                }
                if (!snippet.isPrivate){
                    result.push(snippet);
                }
            }
        }));
        console.log(result);
        return result;
    }

    @Query(()=>[Snippet])
    @UseMiddleware(isAuth)
    async mySnippets(
        @Ctx() {redis,authUser} : AppContext
    ){
        const result: Snippet[] = [];
        const snippetsKeys = await redis.keys(`snippet:${authUser}:*`);
        if (snippetsKeys.length===0){
            return result;
        }
        const snippetsData = await redis.mget(snippetsKeys);
        snippetsData.forEach((value, index) => {
            if (value){
                const {name,content,isPrivate,language} = JSON.parse(value);
                const snippet = {
                    id: snippetsKeys[index],
                    name: name,
                    content: content,
                    isPrivate:isPrivate,
                    language:language
                } as Snippet;
                result.push(snippet);
            }
        });
        return result;
    }

    @Mutation(()=>MessageErrorResponse)
    @UseMiddleware(isAuth)
    async deleteSnippet(
        @Arg("id") snippetId: string,
        @Ctx() {redis, authUser}: AppContext
    ):Promise<MessageErrorResponse>{
        if (snippetId.split(':')[1]===authUser){
            const deleted = await redis.del(snippetId)
            if (deleted === 0){
                return {error: "Snippet does not exist"}
            }else{
                return {message: `${deleted} snippet deleted`}
            }
        }else{
            return {error: "Snippet does not exist"}
        }
    }

    @Mutation(()=>MessageErrorResponse)
    @UseMiddleware(isAuth)
    async updateSnippet(
        @Arg("id") snippetId: string,
        @Arg("input") input: SnippetInput,
        @Ctx() {redis, authUser}: AppContext
    ):Promise<MessageErrorResponse>{
        if (snippetId.split(':')[1]===authUser){
            const snippetData = await redis.get(snippetId)
            if (snippetData){
                const snippet = JSON.parse(snippetData) as Snippet
                await redis.set(snippetId, 
                    JSON.stringify(
                        {
                        name: input.name ? input.name : snippet.name,
                        language: input.language ? input.language : snippet.language,
                        content: input.content ? input.content : snippet.content,
                        color: input.color ? input.color : snippet.color,
                        isPrivate: input.isPrivate ? input.isPrivate : snippet.isPrivate,
                    }
                ));
                return {message: "Snippet updated"}
            }else{
                return {error: "Snippet does not exist"}
            }
        }else{
            return {error: "Snippet does not exist"}
        }
    }

    @Mutation(()=>Snippet)
    @UseMiddleware(isAuth)
    async addSnippet(
        @Arg('input') input: AddSnippetInput,
        @Ctx() {redis,authUser} : AppContext
    ){
        const snippetId = `snippet:${authUser}:${v4()}`;
        const snippet = {
            id: snippetId,
            name: input.name,
            content: input.content,
            color: input.color,
            language: input.language,
            isPrivate: input.isPrivate
        }
        await redis.set(snippetId, JSON.stringify(snippet));
        return snippet as Snippet;
    }


    @Mutation(()=>MessageErrorResponse)
    @UseMiddleware(isAuth)
    async starSnippet(
        @Arg('snippet') snippetId: string,
        @Ctx() {redis,authUser} : AppContext
    ){
        const snippet = await redis.get(snippetId);
        if (!snippet || (JSON.parse(snippet) as Snippet).isPrivate){
            return {error: "Snippet does not exists"};
        }
        await redis.del(`star:${snippetId}:${authUser}`);
        await redis.set(`star:${snippetId}:${authUser}`, JSON.stringify(
            {createdAt: Date.now()}
        ));
        return {message:"Snipped starred"};
    }
}