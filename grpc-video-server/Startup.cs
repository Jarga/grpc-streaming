using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using grpc_video_server.Repositories;
using grpc_file_server;
using StackExchange.Redis;
using grpc_video_server.BackgroundServices;

namespace grpc_video_server
{
    public class Startup
    {
        public Startup(IWebHostEnvironment env, IConfiguration configuration)
        {
            Configuration = configuration;
            HostingEnvironment = env;
        }

        public IConfiguration Configuration { get; }
        public IWebHostEnvironment HostingEnvironment { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            AppContext.SetSwitch("System.Net.Http.SocketsHttpHandler.Http2UnencryptedSupport", true);
            services.AddGrpc();

            services.AddLogging(config => config.AddConsole());
            services.AddTransient<VideoRepository>();
            services.AddTransient<TranscodeService>();

            services.AddGrpcClient<FileServer.FileServerClient>((options) =>
            {
                options.BaseAddress = new Uri(Configuration.GetValue<string>("FileServerUrl"));
            });

            services.AddSingleton((services) =>
            {
                var config = Configuration.GetConnectionString("Redis");
                return ConnectionMultiplexer.Connect("localhost");
            });
            services.AddHostedService<FileEventService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment()) app.UseDeveloperExceptionPage();

            app.UseRouting();

            app.UseEndpoints(endpoints => endpoints.MapGrpcService<VideoStreamService>());
        }
    }
}