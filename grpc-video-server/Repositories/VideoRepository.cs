using Dapper;
using Grpc.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace grpc_video_server.Repositories
{
    public class VideoRepository
    {
        private readonly ILogger _logger;
        private readonly string _sqlConnectionString;

        public VideoRepository(ILogger<VideoRepository> logger, IConfiguration configuration)
        {
            _logger = logger;
            _sqlConnectionString = configuration.GetConnectionString("Sql");
        }

        public class FileResult
        {
            public string ExternalFileName { get; set; }
            public string ExternalFileId { get; set; }
        } 

        public async Task<FileResult> FindById(string videoId)
        {
            using (var conn = new SqlConnection(_sqlConnectionString))
            {
                await conn.OpenAsync();

                var sql = @"SELECT [ExternalFileName], [ExternalFileId] FROM [dbo].[Videos] WHERE [Id] = @VideoId";
                return await conn.QueryFirstAsync<FileResult>(sql, new { VideoId = videoId });
            }
        }

        public async Task<bool> AddVideoFile(string externalFileName, string externalFileId)
        {
            using (var conn = new SqlConnection(_sqlConnectionString))
            {
                await conn.OpenAsync();

                var sql = @"INSERT INTO [dbo].[Videos] ([Id], [ExternalFileName], [ExternalFileId]) VALUES (@Id, @ExternalFileName, @ExternalFileId)";
                var result = await conn.ExecuteAsync(sql, new { Id = Guid.NewGuid(), ExternalFileName = externalFileName, ExternalFileId = externalFileId });
                return result == 1;
            }
        }

        //This should be IAsyncEnumerable<dynamic> but preview!
        public async Task StreamVideoEntries(IServerStreamWriter<VideoRecord> stream, long? offset, long? fetch)
        {
            using (var conn = new SqlConnection(_sqlConnectionString))
            {
                await conn.OpenAsync();

                var offsetClause = offset.HasValue ? "OFFSET @Offset ROWS" : string.Empty;
                var fetchClause = fetch.HasValue ? "FETCH NEXT @Fetch ROWS ONLY" : string.Empty;
                var sql = $@"SELECT * FROM [dbo].[Videos]
                            {offsetClause} 
                            {fetchClause}
                           ";

                var result = conn.Query(sql, new { Offset = offset, Fetch = fetch }, buffered: true);

                foreach (var item in result)
                {
                    await stream.WriteAsync(new VideoRecord {
                        VideoId = item["Id"],
                        FileName = item["ExternalFileName"],
                        FileId = item["ExternalFileId"]
                    });
                }
            }
        }
    }
}
