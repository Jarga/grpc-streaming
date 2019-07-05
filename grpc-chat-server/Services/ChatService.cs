using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Formatters.Binary;
using System.Threading.Channels;
using System.Threading.Tasks;
using Grpc.Core;

namespace grpc_chat_server
{
    public class ChatService : Chat.ChatBase
    {
        private static ConcurrentDictionary<string, ConcurrentDictionary<string, Channel<Message>>> commentFeeds = new ConcurrentDictionary<string, ConcurrentDictionary<string, Channel<Message>>>();

        public override async Task join(JoinRequest request, IServerStreamWriter<Message> responseStream, ServerCallContext context)
        {
            if(!commentFeeds.ContainsKey(request.VideoId))
            {
                commentFeeds.TryAdd(request.VideoId, new ConcurrentDictionary<string, Channel<Message>>());
            }

            var subscriberChannel = Channel.CreateBounded<Message>(100);
            commentFeeds[request.VideoId][request.UserId] = subscriberChannel;

            Console.WriteLine($"Subscribed: Video: {request.VideoId}, User: {request.UserId}");

            while (true)
            {
                var message = await subscriberChannel.Reader.ReadAsync();
                await responseStream.WriteAsync(message);
            }
        }

        public override async Task<PostedResponse> send(Message request, ServerCallContext context)
        {
            if(commentFeeds.TryGetValue(request.VideoId, out var subs))
            {
                await Task.WhenAll(subs.Values.Select(s => s.Writer.WriteAsync(request).AsTask()));

                Console.WriteLine($"Post: Video: {request.VideoId}, User: {request.UserId}, Content: {request.Content}");

                return new PostedResponse
                {
                    VideoId = request.VideoId,
                    UserId = request.UserId,
                    Success = true
                };
            }

            return new PostedResponse
            {
                VideoId = request.VideoId,
                UserId = request.UserId,
                Success = false
            };
        }

        public static byte[] MessageToByteArray(Message obj)
        {
            BinaryFormatter bf = new BinaryFormatter();
            using (var ms = new MemoryStream())
            {
                bf.Serialize(ms, obj);
                return ms.ToArray();
            }
        }

        public static Message ByteArrayToMessage(byte[] arrBytes)
        {
            using (var memStream = new MemoryStream())
            {
                var binForm = new BinaryFormatter();
                memStream.Write(arrBytes, 0, arrBytes.Length);
                memStream.Seek(0, SeekOrigin.Begin);
                var obj = binForm.Deserialize(memStream) as Message;
                return obj;
            }
        }
    }
}
