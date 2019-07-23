CREATE TABLE [dbo].[Videos]
(
	[Id] NVARCHAR(50) NOT NULL PRIMARY KEY, 
    [ExternalFileName] NVARCHAR(MAX) NOT NULL, 
    [ExternalFileId] NVARCHAR(50) NOT NULL
)
