using grpc_video_server.Repositories;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reactive.Disposables;
using System.Reactive.Linq;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace grpc_video_server.BackgroundServices
{
    public class FileEventService : BackgroundService
    {
        private readonly ILogger _logger;
        private readonly VideoRepository _videoRepository;
        private readonly ConnectionMultiplexer _redisMultiplexer;
        private readonly TranscodeService transcodeService;
        private const string _fileEventKey = "grpc_file_events";

        public FileEventService(
            ConnectionMultiplexer redisMultiplexer,
            TranscodeService transcodeService,
            VideoRepository videoRepository,
            ILogger<FileEventService> logger)
        {
            _logger = logger;
            _videoRepository = videoRepository;
            _redisMultiplexer = redisMultiplexer;
            this.transcodeService = transcodeService;
        }

        private FileEvent FromRedisValue(RedisValue value)
        {
            return JsonSerializer.Parse<FileEvent>(value.ToString());
        }

        public class FileEvent
        {
            public long chunkSize { get; set; }
            public string filename { get; set; }
            public string id { get; set; }
            public long length { get; set; }
            public string md5 { get; set; }
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var subscriber = _redisMultiplexer.GetSubscriber();

            var observable = Observable.Create<FileEvent>(async (obs, ct) =>
            {
                await subscriber.SubscribeAsync(_fileEventKey, (_, message) =>
                {
                    obs.OnNext(FromRedisValue(message));
                }).ConfigureAwait(false);

                return Disposable.Create(() => subscriber.Unsubscribe(_fileEventKey));
            });

            using (var subscription = observable.Subscribe(async (message) =>
            {
                try
                {
                    if(new [] { ".mp4", ".webm" }.Contains(Path.GetExtension(message.filename)))
                    {
                        var result = await transcodeService.TranscodeAndUpload(message);
                        await _videoRepository.AddVideoFile(result.Filename, result.Id);
                    }
                }
                catch (Exception e)
                {
                    _logger.LogError(e, "Error while recording file event.");
                }
            }))
            {
                //This is to prevent the service from being disposed
                while (true)
                {
                    await Task.Delay(1000);
                }
            }
        }
    }
}
