import { Snippet } from "../entites/Snippet";
import { AppContext, MessageErrorResponse, SnippetInput } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { isAuth } from "../middleware/isAuth";

@Resolver()
export class SnippetResolver{
    @Query(()=>[Snippet])
    async snippets(
        @Ctx() {redis} : AppContext
    ){
        const result: Snippet[] = [];
        const snippetsKeys = await redis.keys('snippet:*');
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
                if (!snippet.isPrivate){
                    result.push(snippet);
                }
            }
        });
        return result;
    }

    @Query(()=>[Snippet])
    @UseMiddleware(isAuth)
    async mySnipp(
        @Ctx() {redis,authUser} : AppContext
    ){
        const result: Snippet[] = [];
        const snippetsKeys = await redis.keys(`snippet:${authUser}:*`);
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
}