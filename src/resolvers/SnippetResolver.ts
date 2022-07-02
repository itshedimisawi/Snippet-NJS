import { Snippet } from "../entites/Snippet";
import { AppContext } from "../types";
import { Ctx, Query, Resolver, UseMiddleware } from "type-graphql";
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
}