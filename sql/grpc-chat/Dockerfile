FROM microsoft/mssql-server-linux:2017-latest

RUN apt-get update && apt-get install -y dos2unix

WORKDIR /app

COPY ./shared-scripts ./shared-scripts/
COPY ./grpc-chat/scripts ./grpc-chat/scripts/
COPY ./grpc-chat/sql-deployment ./grpc-chat/sql-deployment

RUN dos2unix ./grpc-chat/scripts/entrypoint.sh \
	&& dos2unix ./shared-scripts/execute-sql-script.sh \
    && apt-get --purge remove -y dos2unix \
    && rm -rf /var/lib/apt/lists/* \
    && chmod 777 ./grpc-chat/scripts/entrypoint.sh \
    && chmod 777 ./shared-scripts/execute-sql-script.sh

ENTRYPOINT ["/bin/bash", "-c", "./grpc-chat/scripts/entrypoint.sh"]
