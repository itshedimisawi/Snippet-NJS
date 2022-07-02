import 'reflect-metadata';
import { ApolloServer, } from "apollo-server-express";
import express from "express";
import { buildSchema } from "type-graphql";
import Redis from 'ioredis';
import { AppContext } from "./types";
import { UserResolver } from "./resolvers/UserResolver";
import { SnippetResolver } from './resolvers/SnippetResolver';
import { TeamResolver } from './resolvers/TeamResolver';

const main = async () => {
    console.log("hello there");

    const redisClient = new Redis();
    
    redisClient.on('error', function (err) {
        console.log('Could not establish a connection with redis. ' + err);
    });
    redisClient.on('connect', function () {
        console.log('Connected to redis successfully');
    });
    
    const app = express();
    
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver,SnippetResolver, TeamResolver],
            validate: false,
        }),
        context: ({req,res}) : AppContext => ({req,res,redis:redisClient})
    });

    apolloServer.start().then(_ => {
        apolloServer.applyMiddleware({app});
        app.listen(4000, () => {
            console.log("Express server started")
        });
    });
    
}

main()