﻿CREATE TABLE [dbo].[Videos]
(
	[Id] NVARCHAR(50) NOT NULL PRIMARY KEY, 
    [ExternalFileName] NVARCHAR(MAX) NULL, 
    [ExternalFileId] NVARCHAR(50) NULL,
    [StreamName] NVARCHAR(MAX) NULL,
    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
)
