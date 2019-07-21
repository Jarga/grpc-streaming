# grpc-streaming

To Setup local nuget/npm:

1) Add two entries in you hosts file (Windows: C:\Windows\System32\drivers\etc\hosts, Linux: /etc/hosts):
    127.0.0.1 npm-local
    127.0.0.1 nuget-local
2) docker-compose up -d

To setup Jenkins:

1) docker-compose up -d
2) Wait for jenkins to load (Use: "docker-compose logs -f")
3) Once Jenkins initializes copy the initialAdminPassword (From the logs or the file directly) and go to http://localhost:8080
4) Put the password in the box & hit continue
5) Click Install Suggested Plugins
6) Once done you will be sent to the create user screen, just click "continue as admin" or, if you want, create a new user you can remember
7) Click "Save and Finish"
8) Click "Start using Jenkins"
9) Click "Open Blue Ocean" on left hand pane
10) Click "Create a new Pipeline" after it loads
11) Follow the wizard
    - Choose GitHub
    - Input your access token (create it if required)
    - Choose "Jarga" as the organization
    - Choose grpc-streaming as the repository
    - Click Create Pipeline
12) Copy content of jobs folder at root(~) of project into the ./jenkins_data/jobs folder
13) Delete the folder 'grpc-streaming' in ./jenkins_data/jobs
14) Click "Administration" in the Jenkins blue ocean UI
15) Click "Reload Configuration from Disk" and OK on the popup
16) When jenkins reloads jobs should exist for the proto files, Click into any job
17) Click "Scan Repository Now" (This should pick up all tags available)
18) Refresh the job view and then go to the "Tags" tab, all tags should be listed.
19) Build the tag you want (Only tags > 1.0.0-v5 work)
21) Go to http://nuget-local:8000/ to see nuget packages
22) Go to http://npm-local:4873/ to see npm packages


ADDITIONAL FOR WEB DEMO:

1) You will need to upload the file adventure_time_bacon_pancakes_new_york_remix_frag.mp4 to mongo via the grpc-click
2) Take the ID generated from mongo and insert it into the grpc-video Videos table (ExternalFileId column) with the Id "TEST"