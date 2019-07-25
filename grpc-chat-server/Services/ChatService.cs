using System;
using System.Threading.Tasks;
using Grpc.Core;
using grpc_chat_server.Repositories;
using Microsoft.Extensions.Logging;

namespace grpc_chat_server
{
    public class ChatService : Chat.ChatBase
    {
        private readonly ILogger _logger;
        private readonly ChatRepository _repo;

        public ChatService(ChatRepository repo, ILogger<ChatService> logger)
        {
            _logger = logger;
            _repo = repo;
        }

        public override async Task join(JoinRequest request, IServerStreamWriter<Message> responseStream, ServerCallContext context)
        {
            var observable = await _repo.GetCommentsObservable(request);

            using (var subscription = observable.Subscribe(async (message) =>
            {
                try
                {
                    await responseStream.WriteAsync(message);
                }
                catch (Exception e)
                {
                    _logger.LogError(e, "Error while writing comments to response.");
                }
            }))
            {
                _logger.LogInformation("User {UserId} subscribed to video {VideoId}", request.UserId, request.VideoId);
                //This is to prevent the response stream from being disposed
                while (true)
                {
                    await Task.Delay(1000);
                }
            }
        }

        public override async Task<PostedResponse> send(Message request, ServerCallContext context)
        {
            try
            {
                await _repo.AddComment(request);
                _logger.LogTrace("User {UserId} commented on video {VideoId}", request.UserId, request.VideoId);

                return new PostedResponse
                {
                    VideoId = request.VideoId,
                    UserId = request.UserId,
                    Success = true
                };
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Failed to add comment.");

                return new PostedResponse
                {
                    VideoId = request.VideoId,
                    UserId = request.UserId,
                    Success = false
                };
            }
        }
    }
}
