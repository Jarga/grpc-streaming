using Grpc.Net.Client;
using grpc_chat_server;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Threading.Tasks;

namespace grpc_chat_client
{
    class Program
    {
        static async Task Main(string[] args)
        {
            AppContext.SetSwitch("System.Net.Http.SocketsHttpHandler.Http2UnencryptedSupport", true);
            var httpClient = new HttpClient();

            httpClient.BaseAddress = new Uri("http://localhost:5000");
            var client = GrpcClient.Create<Chat.ChatClient>(httpClient);

            var videoId = "7AA7C331-E66A-478B-BE49-75CF81CDAEFC";
            var userId = DateTime.Now.Ticks.ToString();

            var responseStream = client.join(new JoinRequest { VideoId = videoId, UserId = userId }).ResponseStream;
            
            var processTimer = new Stopwatch();
            var chatTimer = new Stopwatch();

            chatTimer.Start();
            processTimer.Start();

            var workerTask2 = Task.Factory.StartNew(() =>
            {
                while (true)
                {
                    if (chatTimer.ElapsedMilliseconds > 1000)
                    {
                        var response = client.send(new Message { UserId = userId, VideoId = videoId, Content = $"Elapsed: {processTimer.ElapsedMilliseconds} ms" });
                        chatTimer.Restart();
                    }
                }
            }, TaskCreationOptions.LongRunning);

            while (true)
            {
                if (await responseStream.MoveNext())
                {
                    Console.WriteLine($"Chat: User: {responseStream.Current.UserId}, Video: {responseStream.Current.VideoId}, Message: {responseStream.Current.Content}");
                }
            }
        }
    }
}
