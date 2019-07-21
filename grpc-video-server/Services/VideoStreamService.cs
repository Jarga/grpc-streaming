using System;
using System.Threading;
using System.Threading.Tasks;
using Grpc.Core;
using Grpc.Net.Client;
using grpc_file_server;
using grpc_video_server.Repositories;
using Microsoft.Extensions.Logging;

namespace grpc_video_server
{
    public class VideoStreamService : VideoStream.VideoStreamBase
    {
        private readonly ILogger<VideoStreamService> _logger;
        private readonly FileServer.FileServerClient _fileServerClient;
        private readonly VideoRepository _repo;

        public VideoStreamService(ILogger<VideoStreamService> logger, FileServer.FileServerClient fileServerClient, VideoRepository repo) : base()
        {
            _logger = logger;
            _fileServerClient = fileServerClient;
            _repo = repo;
        }

        public override async Task stream(StreamRequest request, IServerStreamWriter<VideoChunk> responseStream, ServerCallContext context)
        {
            var findResult = await _repo.FindById(request.VideoId);

            if(findResult == null)
            {
                throw new RpcException(new Status(StatusCode.NotFound, "Video not found"));
            }

            var downloadRequest = new DownloadRequest
            {
                Id = findResult.ExternalFileId,
                Options = new FileOptions
                {
                    Start = 0
                }
            };

            var remoteStream = _fileServerClient.download(downloadRequest);
            var fileStream = remoteStream.ResponseStream;

            while (await fileStream.MoveNext(context.CancellationToken))
            {
                var chunk = fileStream.Current.Chunk;

                // TODO: Transcode Chunk

                await responseStream.WriteAsync(new VideoChunk { VideoId = request.VideoId, Chunk = chunk });
            }
        }
    }
}