#---------------------------- Build ------------------------------#
FROM mcr.microsoft.com/dotnet/core/sdk:3.0.100-rc1-alpine3.9 as build

RUN apk update \
    && apk --no-cache add libc6-compat \
    && apk --no-cache add protobuf \
    && ln -s /lib/libc.musl-x86_64.so.1 /lib/ld-linux-x86-64.so.2

WORKDIR /app

COPY ./*.csproj ./
RUN dotnet restore --runtime linux-musl-x64

RUN cd /root/.nuget/packages/grpc.tools/*/tools/linux_x64 \
    && rm protoc \
    && ln -s /usr/bin/protoc protoc \
    && chmod +x grpc_csharp_plugin

COPY ./ ./

RUN dotnet publish -o build --runtime linux-musl-x64

#--------------------------- Runtime -----------------------------#
FROM mcr.microsoft.com/dotnet/core/runtime:3.0.0-rc1-alpine3.9 as runtime

WORKDIR /app

COPY --from=build /app/build ./

ENTRYPOINT ["./grpc-chat-server"]