echo "Building chat server"
(cd ./grpc-chat-server && docker build -t grpc-chat-server:latest --network=host .)

echo "Building file server"
(cd ./grpc-file-server && docker build -t grpc-file-server:latest --network=host .)

echo "Building video server"
(cd ./grpc-video-server && docker build -t grpc-video-server:latest --network=host .)

echo "Building web server"
(cd ./web && docker build -t grpc-web:latest --network=host .)

echo "Bringing up Docker"
docker-compose down && docker-compose up -d --build --remove-orphans