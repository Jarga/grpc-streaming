using System.Threading.Tasks;
using Grpc.Core;
using grpc_file_server;

namespace grpc_video_server
{
    public class VideoStreamService : VideoStream.VideoStreamBase
    {
        private readonly FileServer.FileServerClient client;

        public VideoStreamService(FileServer.FileServerClient client)
        {
            this.client = client;
        }

        public override async Task stream(StreamRequest request, IServerStreamWriter<VideoChunk> responseStream, ServerCallContext context)
        {
            // Open the file.
            var result = client.download(new DownloadRequest {Id = request.VideoId});
            var fileStream = result.ResponseStream;

            while (await fileStream.MoveNext(context.CancellationToken))
            {
                var chunk = fileStream.Current.Chunk;

                // TODO: Transcode Chunk

                await responseStream.WriteAsync(new VideoChunk {VideoId = request.VideoId, Chunk = chunk});
            }
        }
    }
}