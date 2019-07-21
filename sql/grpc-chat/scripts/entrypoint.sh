#!/bin/bash
deploy() {
	/app/shared-scripts/execute-sql-script.sh /app/grpc-chat/sql-deployment/full-deployment.sql | sed 's/^/[deploy]: /'; test ${PIPESTATUS[0]} -eq 0
}

start_sql_server() {
	/opt/mssql/bin/sqlservr | sed 's/^/[start_sql_server]: /'; test ${PIPESTATUS[0]} -eq 0
}

start_sql_server &
StartSqlServer=$!

sleep 20

deploy
Deploy=$!

wait $PreDeploy; if [ $? -ne 0 ]; then exit $?; fi
wait $Deploy; if [ $? -ne 0 ]; then exit $?; fi

#always wait on sql server last
wait $StartSqlServer; if [ $? -ne 0 ]; then exit $?; fi
