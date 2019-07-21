FROM microsoft/mssql-server-linux:2017-latest

RUN apt-get update && apt-get install -y dos2unix

WORKDIR /app

COPY ./shared-scripts ./shared-scripts/
COPY ./grpc-video/scripts ./grpc-video/scripts/
COPY ./grpc-video/sql-deployment ./grpc-video/sql-deployment

RUN dos2unix ./grpc-video/scripts/entrypoint.sh \
	&& dos2unix ./shared-scripts/execute-sql-script.sh \
    && apt-get --purge remove -y dos2unix \
    && rm -rf /var/lib/apt/lists/* \
    && chmod 777 ./grpc-video/scripts/entrypoint.sh \
    && chmod 777 ./shared-scripts/execute-sql-script.sh

ENTRYPOINT ["/bin/bash", "-c", "./grpc-video/scripts/entrypoint.sh"]
