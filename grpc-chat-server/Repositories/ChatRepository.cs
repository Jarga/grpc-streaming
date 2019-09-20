using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using System.Reactive.Linq;
using System.Reactive.Disposables;
using System.Text.Json;

namespace grpc_chat_server.Repositories
{
    public class ChatRepository
    {
        private readonly ILogger _logger;
        private readonly string _sqlConnectionString;
        private readonly ConnectionMultiplexer _redisMultiplexer;
        private const string _streamKeyPrefix = "grpc_chat_stream";

        public ChatRepository(ILogger<ChatRepository> logger, IConfiguration configuration, ConnectionMultiplexer redisMultiplexer)
        {
            _logger = logger;
            _sqlConnectionString = configuration.GetConnectionString("Sql");
            _redisMultiplexer = redisMultiplexer;
        }

        private RedisValue ToRedisValue(Message message)
        {
            return JsonSerializer.Serialize(message);
        }

        private Message FromRedisValue(RedisValue value)
        {
            return JsonSerializer.Deserialize<Message>(value.ToString());
        }

        public async Task AddComment(Message message)
        {
            var db = _redisMultiplexer.GetDatabase();

            await db.PublishAsync($"{_streamKeyPrefix}:{message.VideoId}", ToRedisValue(message));

            using (var conn = new SqlConnection(_sqlConnectionString))
            {
                await conn.OpenAsync();

                var insert = @"INSERT INTO [dbo].[Comments]([VideoId], [UserId], [Content]) VALUES (@VideoId, @UserId, @Content)";

                await conn.ExecuteAsync(insert, new { message.VideoId, message.UserId, message.Content });
            }
        }

        public async Task<IObservable<Message>> GetCommentsObservable(JoinRequest joinRequest)
        {
            var subscriber = _redisMultiplexer.GetSubscriber();

            using (var conn = new SqlConnection(_sqlConnectionString))
            {
                await conn.OpenAsync();

                var insert = @"INSERT INTO [dbo].[JoinRequest]([VideoId], [UserId]) VALUES (@VideoId, @UserId)";

                await conn.ExecuteAsync(insert, new { joinRequest.VideoId, joinRequest.UserId });
            }

            return Observable.Create<Message>(async (obs, ct) =>
            {
                var channel = $"{_streamKeyPrefix}:{joinRequest.VideoId}";
                await subscriber.SubscribeAsync(channel, (_, message) =>
                {
                    obs.OnNext(FromRedisValue(message));
                }).ConfigureAwait(false);

                return Disposable.Create(() => subscriber.Unsubscribe(channel));
            });
        }
    }
}
