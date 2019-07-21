using System;
using System.IO;
using System.Threading.Tasks;
using Google.Protobuf;
using Grpc.Core;

namespace grpc_video_server
{
    public class VideoStreamService : VideoStream.VideoStreamBase
    {
        public override async Task stream(StreamRequest request, IServerStreamWriter<VideoChunk> responseStream, ServerCallContext context)
        {
            int length;
            long dataToRead;

            // Open the file.
            var fileStream = new FileStream(".\\Media\\adventure_time_bacon_pancakes_new_york_remix_frag.mp4", FileMode.Open, FileAccess.Read, FileShare.Read);

            // Total bytes to read:
            dataToRead = fileStream.Length;
            var buffer = new byte[Math.Min(10000, dataToRead)];

            var startbyte = 0;
            fileStream.Seek(startbyte, SeekOrigin.Begin);

            while (dataToRead > 0)
            {
                // Read the data in buffer.
                length = fileStream.Read(buffer, 0, buffer.Length);

                await responseStream.WriteAsync(new VideoChunk {VideoId = request.VideoId, Chunk = ByteString.CopyFrom(buffer)});

                dataToRead = dataToRead - buffer.Length;
                buffer = new byte[Math.Min(buffer.Length, dataToRead)];
                await Task.Delay(100);
            }
        }
    }
}