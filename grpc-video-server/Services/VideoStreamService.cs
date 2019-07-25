using System;
using System.Buffers.Text;
using System.Collections.Concurrent;
using System.Linq;
using System.Reactive.Disposables;
using System.Reactive.Linq;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using Google.Protobuf;
using Grpc.Core;
using Grpc.Net.Client;
using grpc_file_server;
using grpc_video_server.Repositories;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace grpc_video_server
{
    public class VideoStreamService : VideoStream.VideoStreamBase
    {
        private readonly ILogger<VideoStreamService> _logger;
        private readonly FileServer.FileServerClient _fileServerClient;
        private readonly ConnectionMultiplexer _redisMultiplexer;
        private readonly VideoRepository _repo;


        public VideoStreamService(
            ILogger<VideoStreamService> logger, 
            FileServer.FileServerClient fileServerClient, 
            VideoRepository repo,
            ConnectionMultiplexer redisMultiplexer
        ) : base()
        {
            _logger = logger;
            _fileServerClient = fileServerClient;
            _repo = repo;
            _redisMultiplexer = redisMultiplexer;
        }

        public override async Task<StreamRecord> uploadStream(IAsyncStreamReader<VideoChunk> requestStream, ServerCallContext context)
        {
            var streamId = Guid.NewGuid();
            var record = await _repo.AddStream(streamId);

            var db = _redisMultiplexer.GetDatabase();

            while (await requestStream.MoveNext(context.CancellationToken))
            {
                var chunk = requestStream.Current.Chunk;
                await db.PublishAsync(streamId.ToString(), ToRedisValue(new VideoChunk { VideoId = streamId.ToString(), Chunk = chunk }));

            }

            return new StreamRecord
            {
                VideoId = streamId.ToString(),
                StreamName = streamId.ToString()
            };
        }

        public override async Task stream(StreamRequest request, IServerStreamWriter<VideoChunk> responseStream, ServerCallContext context)
        {
            var findResult = await _repo.FindById(request.VideoId);

            if(findResult == null)
            {
                throw new RpcException(new Status(StatusCode.NotFound, "Video not found"));
            }

            if (!string.IsNullOrWhiteSpace(findResult.ExternalFileId))
            {
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
            else if (!string.IsNullOrWhiteSpace(findResult.StreamName))
            {
                var subscriber = _redisMultiplexer.GetSubscriber();

                var observable = Observable.Create<VideoChunk>(async (obs, ct) =>
                {
                    var channel = findResult.StreamName;
                    await subscriber.SubscribeAsync(channel, (_, message) =>
                    {
                        obs.OnNext(FromRedisValue(message));
                    }).ConfigureAwait(false);

                    return Disposable.Create(() => subscriber.Unsubscribe(channel));
                });


                var breakCount = 0;
                using (var subscription = observable.Subscribe(async (message) =>
                {
                    try
                    {
                        if (breakCount < 3)
                        {
                            await responseStream.WriteAsync(message);
                            breakCount = 0;
                        }
                    }
                    catch (Exception e)
                    {
                        breakCount++;
                        _logger.LogError(e, "Error while writing video chunk to response.");
                    }
                }))
                {
                    _logger.LogInformation("User {UserId} subscribed to video {VideoId}", request.UserId, request.VideoId);
                    //This is to prevent the response stream from being disposed
                    while (breakCount < 3)
                    {
                        await Task.Delay(1000);
                    }
                }
            }
        }

        private VideoChunk FromRedisValue(RedisValue value)
        {
            return new VideoChunk
            {
                Chunk = ByteString.CopyFrom(value)
            };
        }

        private RedisValue ToRedisValue(VideoChunk message)
        {
            return message.Chunk.ToByteArray();
        }

        public override async Task streamRecords(RecordStreamRequest request, IServerStreamWriter<VideoRecord> responseStream, ServerCallContext context)
        {
            var offset = request.Offset > 0 ? (long?)request.Offset : null;
            var fetch = request.Fetch > 0 ? (long?)request.Fetch : null;
            await _repo.StreamVideoEntries(responseStream, offset, fetch);
        }
    }
}