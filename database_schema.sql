-- Flowly Task Management Database Schema (PostgreSQL) - SERIAL (Integer) ID Versiyası
-- Qeyd: Xarici açar (Foreign Key) asılılıqlarına görə cədvəllər doğru ardıcıllıqla yaradılır.

-- 1. Roles Table
CREATE TABLE Roles (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(50) UNIQUE NOT NULL,
    Description TEXT
);

-- Insert Default Roles
INSERT INTO Roles (Name, Description) VALUES 
('SuperAdmin', 'Sistemin tam idarəçisi'),
('Admin', 'Administrator'),
('Manager', 'Menencer'),
('Employee', 'İşçi');

-- 2. Departments Table
CREATE TABLE Departments (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(100) UNIQUE NOT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users Table
CREATE TABLE Users (
    Id SERIAL PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    UserName VARCHAR(100) UNIQUE NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    AvatarUrl TEXT,
    RoleId INT NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    FailedLoginAttempts INT DEFAULT 0,
    DepartmentId INT,
    Position VARCHAR(100),
    LockoutEnd TIMESTAMP WITH TIME ZONE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES Roles(Id),
    CONSTRAINT FK_Users_Departments FOREIGN KEY (DepartmentId) REFERENCES Departments(Id) ON DELETE SET NULL
);

-- 4. Workspaces Table
CREATE TABLE Workspaces (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(200) NOT NULL,
    Description TEXT,
    OwnerId INT NOT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Workspaces_Users FOREIGN KEY (OwnerId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- 5. Projects Table
CREATE TABLE Projects (
    Id SERIAL PRIMARY KEY,
    WorkspaceId INT NOT NULL,
    Name VARCHAR(200) NOT NULL,
    Description TEXT,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Projects_Workspaces FOREIGN KEY (WorkspaceId) REFERENCES Workspaces(Id) ON DELETE CASCADE
);

-- 6. ProjectMembers Table
CREATE TABLE ProjectMembers (
    ProjectId INT NOT NULL,
    UserId INT NOT NULL,
    RoleId INT NOT NULL,
    JoinedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ProjectId, UserId),
    CONSTRAINT FK_ProjectMembers_Projects FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ProjectMembers_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ProjectMembers_Roles FOREIGN KEY (RoleId) REFERENCES Roles(Id) ON DELETE RESTRICT
);

-- 7. Boards Table
CREATE TABLE Boards (
    Id SERIAL PRIMARY KEY,
    ProjectId INT NOT NULL,
    Name VARCHAR(200) NOT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Boards_Projects FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE
);

-- 8. BoardColumns Table
CREATE TABLE BoardColumns (
    Id SERIAL PRIMARY KEY,
    BoardId INT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    OrderIndex INT NOT NULL DEFAULT 0,
    ColorHex VARCHAR(7) DEFAULT '#E2E8F0',
    CONSTRAINT FK_BoardColumns_Boards FOREIGN KEY (BoardId) REFERENCES Boards(Id) ON DELETE CASCADE
);

-- 9. Tasks Table
CREATE TABLE Tasks (
    Id SERIAL PRIMARY KEY,
    BoardId INT NOT NULL,
    ColumnId INT NOT NULL,
    AssigneeId INT,
    ReporterId INT NOT NULL,
    ParentTaskId INT,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    Priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
    StoryPoints INT,
    DueDate TIMESTAMP WITH TIME ZONE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Tasks_Boards FOREIGN KEY (BoardId) REFERENCES Boards(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Tasks_BoardColumns FOREIGN KEY (ColumnId) REFERENCES BoardColumns(Id) ON DELETE RESTRICT,
    CONSTRAINT FK_Tasks_Assignee FOREIGN KEY (AssigneeId) REFERENCES Users(Id) ON DELETE SET NULL,
    CONSTRAINT FK_Tasks_Reporter FOREIGN KEY (ReporterId) REFERENCES Users(Id) ON DELETE RESTRICT,
    CONSTRAINT FK_Tasks_Parent FOREIGN KEY (ParentTaskId) REFERENCES Tasks(Id) ON DELETE CASCADE
);

-- 10. TaskDependencies Table
CREATE TABLE TaskDependencies (
    TaskId INT NOT NULL,
    DependsOnTaskId INT NOT NULL,
    DependencyType VARCHAR(50) NOT NULL DEFAULT 'Blocks',
    PRIMARY KEY (TaskId, DependsOnTaskId),
    CONSTRAINT FK_TaskDeps_Task FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    CONSTRAINT FK_TaskDeps_DependsOn FOREIGN KEY (DependsOnTaskId) REFERENCES Tasks(Id) ON DELETE CASCADE
);

-- 11. Tags Table
CREATE TABLE Tags (
    Id SERIAL PRIMARY KEY,
    ProjectId INT NOT NULL,
    Name VARCHAR(50) NOT NULL,
    ColorHex VARCHAR(7) DEFAULT '#808080',
    CONSTRAINT FK_Tags_Projects FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE
);

-- 12. TaskTags Table
CREATE TABLE TaskTags (
    TaskId INT NOT NULL,
    TagId INT NOT NULL,
    PRIMARY KEY (TaskId, TagId),
    CONSTRAINT FK_TaskTags_Tasks FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    CONSTRAINT FK_TaskTags_Tags FOREIGN KEY (TagId) REFERENCES Tags(Id) ON DELETE CASCADE
);

-- 13. Comments Table
CREATE TABLE Comments (
    Id SERIAL PRIMARY KEY,
    TaskId INT NOT NULL,
    UserId INT NOT NULL,
    Content TEXT NOT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Comments_Tasks FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Comments_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- 14. Attachments Table
CREATE TABLE Attachments (
    Id SERIAL PRIMARY KEY,
    TaskId INT NOT NULL,
    UploadedById INT NOT NULL,
    FileName VARCHAR(255) NOT NULL,
    FileUrl TEXT NOT NULL,
    FileSize BIGINT,
    ContentType VARCHAR(100),
    UploadedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Attachments_Tasks FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Attachments_Users FOREIGN KEY (UploadedById) REFERENCES Users(Id) ON DELETE CASCADE
);

-- 15. ActivityLogs Table
CREATE TABLE ActivityLogs (
    Id SERIAL PRIMARY KEY,
    TaskId INT,
    UserId INT NOT NULL,
    ActionType VARCHAR(100) NOT NULL,
    OldValue TEXT,
    NewValue TEXT,
    Description TEXT,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_ActivityLogs_Tasks FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ActivityLogs_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- 16. Notifications Table
CREATE TABLE Notifications (
    Id SERIAL PRIMARY KEY,
    UserId INT NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Message TEXT NOT NULL,
    ReferenceId INT,
    ReferenceType VARCHAR(50),
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- 17. ChatRooms Table
CREATE TABLE ChatRooms (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(200),
    IsGroup BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. ChatMembers Table
CREATE TABLE ChatMembers (
    ChatRoomId INT NOT NULL,
    UserId INT NOT NULL,
    JoinedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ChatRoomId, UserId),
    CONSTRAINT FK_ChatMembers_ChatRooms FOREIGN KEY (ChatRoomId) REFERENCES ChatRooms(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ChatMembers_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- 19. Messages Table
CREATE TABLE Messages (
    Id SERIAL PRIMARY KEY,
    ChatRoomId INT NOT NULL,
    SenderId INT NOT NULL,
    Content TEXT NOT NULL,
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Messages_ChatRooms FOREIGN KEY (ChatRoomId) REFERENCES ChatRooms(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Messages_Users FOREIGN KEY (SenderId) REFERENCES Users(Id) ON DELETE CASCADE
);

    -- 20. PasswordResetTokens Table
    CREATE TABLE PasswordResetTokens (
        Id SERIAL PRIMARY KEY,
        UserId INT NOT NULL,
        Token VARCHAR(255) NOT NULL UNIQUE,
        ExpiresAt TIMESTAMP WITH TIME ZONE NOT NULL,
        IsUsed BOOLEAN DEFAULT FALSE,
        CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT FK_PasswordResetTokens_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );

    -- 21. RefreshTokens Table
    CREATE TABLE RefreshTokens (
        Id SERIAL PRIMARY KEY,
        UserId INT NOT NULL,
        Token TEXT NOT NULL,
        Expires TIMESTAMP WITH TIME ZONE NOT NULL,
        CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        IsRevoked BOOLEAN DEFAULT FALSE,
        CONSTRAINT FK_RefreshTokens_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );

    -- 22. Teams Table
    CREATE TABLE Teams (
        Id SERIAL PRIMARY KEY,
        Name VARCHAR(200) NOT NULL UNIQUE,
        CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 23. TeamMembers Table
    CREATE TABLE TeamMembers (
        TeamId INT NOT NULL,
        UserId INT NOT NULL,
        JoinedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (TeamId, UserId),
        CONSTRAINT FK_TeamMembers_Teams FOREIGN KEY (TeamId) REFERENCES Teams(Id) ON DELETE CASCADE,
        CONSTRAINT FK_TeamMembers_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );
