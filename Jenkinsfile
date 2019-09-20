pipeline {
  agent any 
  environment {
    //Use credentials plugin instead of this
    DOCKER = credentials('docker-credentials')
  }
  stages {
    stage('publish') {
      steps {
        dir('./grpc-file-server') {
          sh "docker build --network=host -t ${DOCKER_USR}/grpc-file-server:${env.TAG_NAME} ."
          sh "docker login -u ${DOCKER_USR} -p ${DOCKER_PSW}"
          sh "docker push ${DOCKER_USR}/grpc-file-server:${env.TAG_NAME}"
        }
        dir('./grpc-chat-server') {
          sh "docker build --network=host -t ${DOCKER_USR}/grpc-chat-server:${env.TAG_NAME} ."
          sh "docker login -u ${DOCKER_USR} -p ${DOCKER_PSW}"
          sh "docker push ${DOCKER_USR}/grpc-chat-server:${env.TAG_NAME}"
        }
        dir('./grpc-video-server') {
          sh "docker build --network=host -t ${DOCKER_USR}/grpc-video-server:${env.TAG_NAME} ."
          sh "docker login -u ${DOCKER_USR} -p ${DOCKER_PSW}"
          sh "docker push ${DOCKER_USR}/grpc-video-server:${env.TAG_NAME}"
        }
        dir('./web') {
          sh "docker build --network=host -t ${DOCKER_USR}/grpc-web:${env.TAG_NAME} ."
          sh "docker login -u ${DOCKER_USR} -p ${DOCKER_PSW}"
          sh "docker push ${DOCKER_USR}/grpc-web:${env.TAG_NAME}"
        }
        dir('./sql') {
          sh "docker build --network=host -t ${DOCKER_USR}/grpc-chat-sql:${env.TAG_NAME} -f ./grpc-chat/Dockerfile ."
          sh "docker login -u ${DOCKER_USR} -p ${DOCKER_PSW}"
          sh "docker push ${DOCKER_USR}/grpc-chat-sql:${env.TAG_NAME}"
        }
        dir('./sql') {
          sh "docker build --network=host -t ${DOCKER_USR}/grpc-video-sql:${env.TAG_NAME}  -f ./grpc-video/Dockerfile ."
          sh "docker login -u ${DOCKER_USR} -p ${DOCKER_PSW}"
          sh "docker push ${DOCKER_USR}/grpc-video-sql:${env.TAG_NAME}"
        }
      }
    }
  }
}