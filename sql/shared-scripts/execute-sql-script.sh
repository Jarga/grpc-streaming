#!/bin/bash

SCRIPT=$1
MAX_TRIES=${2:-8} #if no try count was given default to 8
ERR=1 # or some non zero error number you want
COUNT=0
while [  $COUNT -lt $MAX_TRIES ]; do
   echo "EXECUTING SQL SCRIPT(${SCRIPT})"
   /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P ${MSSQL_SA_PASSWORD} -i ${SCRIPT}
   EXIT=$?
   if [ $EXIT -eq 0 ];then
      exit 0
   fi
   echo "FAILED TO EXECUTE SQL SCRIPT, Code: $EXIT"
   sleep 2
   let COUNT=COUNT+1
done
echo "TOO MANY FAILED ATTEMPTS TO EXECUTE SQL SCRIPT(${SCRIPT}), EXITING"
exit $ERR