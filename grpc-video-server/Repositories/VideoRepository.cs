using Dapper;
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
    }
}
