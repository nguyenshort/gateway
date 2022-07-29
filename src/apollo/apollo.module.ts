import {IntrospectAndCompose, RemoteGraphQLDataSource} from '@apollo/gateway';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {ApolloGatewayDriver, ApolloGatewayDriverConfig} from "@nestjs/apollo"
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core'

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
    willSendRequest({ request, context }) {
        const headers = context?.req?.headers
        for (const key in headers) {
            const value = headers[key]
            if (value) {
                request.http?.headers.set(key, String(value))
            }
        }
    }
}

@Module({
    imports: [
        GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
            imports: [],
            inject: [],
            driver: ApolloGatewayDriver,
            useFactory: () => ({
                server: {
                    playground: false,
                    debug: true,
                    cors: true,
                    path: '/graphql',
                    plugins: [ApolloServerPluginLandingPageLocalDefault()]
                },
                gateway: {
                    debug: true,
                    supergraphSdl: new IntrospectAndCompose({
                        subgraphs: [
                            { name: 'bookmarks', url: 'http://localhost:3001/graphql' },
                            { name: 'categories', url: 'http://localhost:3002/graphql' },
                            { name: 'chapters', url: 'http://localhost:3003/graphql' },
                            { name: 'histories', url: 'http://localhost:3004/graphql' },
                            { name: 'stories', url: 'http://localhost:3005/graphql' },
                            { name: 'users', url: 'http://localhost:3006/graphql' },
                            { name: 'counters', url: 'http://localhost:3007/graphql' },
                        ]
                    }),
                    buildService({ name, url }) {
                        return new AuthenticatedDataSource({ url })
                    }
                }
            })
        })
    ]
})
export class ApolloModule {}
