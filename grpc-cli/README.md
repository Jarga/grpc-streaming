## gRPC-cli
Simple command line utility to remote communicate with the gRPC-File-Server

```                   
usage: grpc-cli fileserver [-h] [-i INFO] [-l LISTFILES] [-u UPLOAD]
                           [-d DOWNLOAD] [-r REMOVE] [-c CAT] [-f]
                           

Optional arguments:
  -h, --help            Show this help message and exit.
  -i INFO, --info INFO  Gets all file information from the server for the 
                        provided file id.
  -l LISTFILES, --listFiles LISTFILES
                        List files from the server using a JSON filter. Use 
                        {} for all files.
  -u UPLOAD, --upload UPLOAD
                        Upload a file to the file server
  -d DOWNLOAD, --download DOWNLOAD
                        Download a file with the provided id from the file 
                        server
  -r REMOVE, --remove REMOVE
                        Remove a file by the provided id from the file server
  -c CAT, --cat CAT     Concatenates a file with the provided id from the 
                        file server to stdout
  -f, --format          Formats the file server (Deletes all files)

```