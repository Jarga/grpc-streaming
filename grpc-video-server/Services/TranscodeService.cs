using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Google.Protobuf;
using grpc_file_server;
using grpc_video_server.BackgroundServices;
using NReco.VideoConverter;
using File = System.IO.File;

namespace grpc_video_server
{
    public class TranscodeService
    {
        private readonly FileServer.FileServerClient _fileServerClient;

        public TranscodeService(FileServer.FileServerClient fileServerClient)
        {
            _fileServerClient = fileServerClient;
        }

        public async Task<grpc_file_server.File> TranscodeAndUpload(FileEventService.FileEvent fileEvent, CancellationToken token = default)
        {
            var remoteStream = _fileServerClient.download(new DownloadRequest
            {
                Id = fileEvent.id
            });

            var tmpFilePath = Path.GetTempFileName();
            await using var tmpFile = File.Create(tmpFilePath);
            while (await remoteStream.ResponseStream.MoveNext(token))
            {
                var chunk = remoteStream.ResponseStream.Current.Chunk;
                await tmpFile.WriteAsync(chunk.ToByteArray(), token);
            }

            // Transcode
            var outFilePath = Path.GetTempFileName();
            var ffMpeg = new FFMpegConverter();
            ffMpeg.ConvertMedia(tmpFilePath, null, outFilePath, Format.mp4, new ConvertSettings
            {
                CustomOutputArgs = "-movflags frag_keyframe+empty_moov+default_base_moof"
            });

            // Upload
            var newFileName = Path.GetFileNameWithoutExtension(fileEvent.filename) + ".fmp4";

            var clientStreamingCall = _fileServerClient.upload();
            var responseStream = clientStreamingCall.RequestStream;
            await responseStream.WriteAsync(new UploadRequest
            {
                Chunk = null,
                Filename = newFileName
            });

            await using var outFile = File.OpenRead(outFilePath);
            var dataToRead = outFile.Length;
            var buffer = new byte[Math.Min(10000, dataToRead)];
            var startbyte = 0;
            outFile.Seek(startbyte, SeekOrigin.Begin);

            while (dataToRead > 0)
            {
                // Read the data in buffer.
                outFile.Read(buffer, 0, buffer.Length);

                await responseStream.WriteAsync(new UploadRequest
                {
                    Chunk = ByteString.CopyFrom(buffer),
                    Filename = newFileName
                });

                dataToRead -= buffer.Length;
                buffer = new byte[Math.Min(buffer.Length, dataToRead)];
            }

            await responseStream.CompleteAsync();

            var result = await clientStreamingCall.ResponseAsync;
            return result.File;
        }
    }
}