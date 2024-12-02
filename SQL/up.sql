-- Tables

CREATE TABLE Admin (
    AdminID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL
);

CREATE TABLE FrontCosmetic (
	FrontCosmeticID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    Cost INT NOT NULL,
    Src VARCHAR(255) NOT NULL
);
CREATE TABLE MiddleCosmetic (
	MiddleCosmeticID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    Cost INT NOT NULL,
    Src VARCHAR(255) NOT NULL
);
CREATE TABLE BackCosmetic (
	BackCosmeticID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    Cost INT NOT NULL,
    Src VARCHAR(255) NOT NULL
);

CREATE TABLE User (
	UserID CHAR(7) PRIMARY KEY NOT NULL,
    Username VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    ProfileBio TEXT NOT NULL,
    Points INT DEFAULT 0 NOT NULL,
    LifetimePoints INT DEFAULT 0 NOT NULL,
    Streak INT DEFAULT 0 NOT NULL,
    PredictionAccuracy DOUBLE DEFAULT 0 NOT NULL,
    FrontDisplayed INT NOT NULL,
    MiddleDisplayed INT NOT NULL,
    BackDisplayed INT NOT NULL,
    FOREIGN KEY (FrontDisplayed) REFERENCES FrontCosmetic(FrontCosmeticID) ON UPDATE CASCADE,
    FOREIGN KEY (MiddleDisplayed) REFERENCES MiddleCosmetic(MiddleCosmeticID) ON UPDATE CASCADE,
    FOREIGN KEY (BackDisplayed) REFERENCES BackCosmetic(BackCosmeticID) ON UPDATE CASCADE
);

CREATE TABLE PointTransaction (
	TransactionID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    TransactionDate DATETIME NOT NULL,
    PointValueDelta INT NOT NULL,
    Reason TEXT, -- Intentionally nullable.
    UserID CHAR(7) NOT NULL,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON UPDATE CASCADE
);

CREATE TABLE Suggestion (
	Title VARCHAR(255) NOT NULL,
    Description TEXT NOT NULL,
    OptionA VARCHAR(255) NOT NULL,
    OptionB VARCHAR(255) NOT NULL,
    SuggestionID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    Dismissed BOOLEAN DEFAULT FALSE NOT NULL,
    SuggesterID CHAR(7) NOT NULL,
    FOREIGN KEY (SuggesterID) REFERENCES User(UserID) ON UPDATE CASCADE
);

CREATE TABLE OwnedFrontCosmetic (
	UserID CHAR(7) NOT NULL,
    FrontCosmeticID INT NOT NULL,
    PRIMARY KEY (UserID, FrontCosmeticID),
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (FrontCosmeticID) REFERENCES FrontCosmetic(FrontCosmeticID) ON UPDATE CASCADE
);
CREATE TABLE OwnedMiddleCosmetic (
	UserID CHAR(7) NOT NULL,
    MiddleCosmeticID INT NOT NULL,
    PRIMARY KEY (UserID, MiddleCosmeticID),
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (MiddleCosmeticID) REFERENCES MiddleCosmetic(MiddleCosmeticID) ON UPDATE CASCADE
);
CREATE TABLE OwnedBackCosmetic (
	UserID CHAR(7) NOT NULL,
    BackCosmeticID INT NOT NULL,
    PRIMARY KEY (UserID, BackCosmeticID),
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (BackCosmeticID) REFERENCES BackCosmetic(BackCosmeticID) ON UPDATE CASCADE
);

CREATE TABLE Poll (
	PollID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Description TEXT NOT NULL,
    OptionA VARCHAR(255) NOT NULL,
    OptionB VARCHAR(255) NOT NULL,
    VotesA INT DEFAULT 0 NOT NULL,
    VotesB INT DEFAULT 0 NOT NULL,
    TotalVotes INT AS (VotesA + VotesB) STORED,
    PercentageVotesA DOUBLE AS (IF(TotalVotes > 0, VotesA / TotalVotes, 0)) STORED,
    PercentageVotesB DOUBLE AS (IF(TotalVotes > 0, VotesB / TotalVotes, 0)) STORED,
    WinningVotes ENUM('A', 'B', 'Tie') AS (
        CASE
            WHEN VotesA > VotesB THEN 'A'
            WHEN VotesB > VotesA THEN 'B'
            ELSE 'Tie'
        END
    ) STORED,
    PredictionsA INT DEFAULT 0 NOT NULL,
    PredictionsB INT DEFAULT 0 NOT NULL,
    TotalPredictions INT AS (PredictionsA + PredictionsB) STORED,
    PercentagePredictionsA DOUBLE AS (IF(TotalPredictions > 0, PredictionsA / TotalPredictions, 0)) STORED,
    PercentagePredictionsB DOUBLE AS (IF(TotalPredictions > 0, PredictionsB / TotalPredictions, 0)) STORED,
    Closed BOOLEAN DEFAULT FALSE NOT NULL,
    CreationDate DATETIME NOT NULL,
    ClosesAt DATETIME NOT NULL,
    SuggestedBy Char(7), -- Intentionally able to be null.
    FOREIGN KEY (SuggestedBy) REFERENCES User(UserID) ON UPDATE CASCADE,
    INDEX (Closed)
);

CREATE TABLE Submission (
	VoteChoiceA BOOLEAN NOT NULL,
    PredictionChoiceA BOOLEAN NOT NULL,
    TimeSubmitted DATETIME NOT NULL,
    PollID INT NOT NULL,
    UserID CHAR(7) NOT NULL,
    PRIMARY KEY (UserID, PollID),
    FOREIGN KEY (PollID) REFERENCES Poll(PollID),
    FOREIGN KEY (UserID) REFERENCES User(UserID)
);

CREATE TABLE Comment (
	CommentID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    Content TEXT NOT NULL,
    PollClosedAtPost BOOLEAN NOT NULL,
    CommentTimeSubmitted DATETIME NOT NULL,
    PollID INT NOT NULL,
    UserID CHAR(7) NOT NULL,
    FOREIGN KEY (PollID) REFERENCES Poll(PollID) ON UPDATE CASCADE,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON UPDATE CASCADE
);

CREATE TABLE Reply (
	ReplyID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    Content TEXT NOT NULL,
    PollClosedAtPost BOOLEAN NOT NULL,
    CommentTimeSubmitted DATETIME NOT NULL,
    ReplyTo INT NOT NULL,
    UserID CHAR(7) NOT NULL,
    FOREIGN KEY (ReplyTo) REFERENCES Comment(CommentID) ON UPDATE CASCADE,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON UPDATE CASCADE
);

CREATE TABLE CommentReport(
	Reason TEXT NOT NULL,
    Dismissed BOOLEAN DEFAULT FALSE NOT NULL,
    ReportDate DATETIME NOT NULL,
    ReportedCommentID INT NOT NULL,
    ReporterID CHAR(7) NOT NULL,
    PRIMARY KEY (ReportedCommentID, ReporterID),
    FOREIGN KEY (ReportedCommentID) REFERENCES Comment(CommentID) ON UPDATE CASCADE,
    FOREIGN KEY (ReporterID) REFERENCES User(UserID) ON UPDATE CASCADE
);
CREATE TABLE UserReport(
	Reason TEXT NOT NULL,
    Dismissed BOOLEAN DEFAULT FALSE NOT NULL,
    ReportDate DATETIME NOT NULL,
    ReportedUserID CHAR(7) NOT NULL,
    ReporterID CHAR(7) NOT NULL,
    PRIMARY KEY (ReportedUserID, ReporterID),
    FOREIGN KEY (ReportedUserID) REFERENCES User(UserID) ON UPDATE CASCADE,
    FOREIGN KEY (ReporterID) REFERENCES User(UserID) ON UPDATE CASCADE
);
CREATE TABLE ReplyReport(
	Reason TEXT NOT NULL,
    Dismissed BOOLEAN DEFAULT FALSE NOT NULL,
    ReportDate DATETIME NOT NULL,
    ReportedReplyID INT NOT NULL,
    ReporterID CHAR(7) NOT NULL,
    PRIMARY KEY (ReportedReplyID, ReporterID),
    FOREIGN KEY (ReportedReplyID) REFERENCES Reply(ReplyID) ON UPDATE CASCADE,
    FOREIGN KEY (ReporterID) REFERENCES User(UserID) ON UPDATE CASCADE
);

-- Triggers

-- Update LifetimePoints when Points are updated
-- DELIMITER //
-- CREATE TRIGGER update_lifetime_points
-- BEFORE UPDATE ON User
-- FOR EACH ROW
-- BEGIN
--     IF NEW.Points != OLD.Points THEN
--         SET NEW.LifetimePoints = OLD.LifetimePoints + (NEW.Points - OLD.Points);
--     END IF;
-- END;
-- //
-- DELIMITER ;

-- Update VotesA/Votes after a new Submission
DELIMITER //
CREATE TRIGGER updates_votes_on_poll
AFTER INSERT ON Submission
FOR EACH ROW
BEGIN
    IF NEW.VoteChoiceA = true THEN
        UPDATE Poll
        SET VotesA = VotesA + 1
        WHERE PollID = NEW.PollID;
	END IF;
    IF NEW.VoteChoiceA = false  THEN
        UPDATE Poll
        SET VotesB = VotesB + 1
        WHERE PollID = NEW.PollID;
    END IF;
	IF NEW.PredictionChoiceA = true THEN
		UPDATE Poll
        SET PredictionsA = PredictionsA + 1
        WHERE PollID = NEW.PollID;
	END IF;
	IF NEW.PredictionChoiceA = false THEN
		UPDATE Poll
        SET PredictionsB = PredictionsB + 1
        WHERE PollID = NEW.PollID;
	END IF;
END;
//
DELIMITER ;
        
-- Update PredictionAccuracy after a Poll Closes
-- DELIMITER //
-- CREATE TRIGGER update_prediction_accuracy
-- AFTER UPDATE ON Poll
-- FOR EACH ROW
-- BEGIN
--     IF NEW.Closed = TRUE AND OLD.Closed = FALSE THEN
--         UPDATE User u
--         SET PredictionAccuracy = (
--             SELECT 
--                 IFNULL((SUM(
--                     CASE 
--                         WHEN ((NEW.WinningVotes = 'A' AND s.PredictionChoiceA = TRUE) OR 
--                               (NEW.WinningVotes = 'B' AND s.PredictionChoiceA = FALSE))
--                              THEN 1 ELSE 0 END) 
--                     / COUNT(*)) * 100, 0)
--                 FROM Submission s
--                 WHERE s.UserID = u.UserID
--                   AND s.PollID = NEW.PollID
--             )
--         WHERE EXISTS (
--             SELECT 1
--             FROM Submission s
--             WHERE s.PollID = NEW.PollID AND s.UserID = u.UserID
--         );
--     END IF;
-- END;
-- //
-- DELIMITER ;



-- Update Streak when Poll Closes
-- DELIMITER //
-- CREATE TRIGGER update_streak
-- AFTER UPDATE ON Poll
-- FOR EACH ROW
-- BEGIN
--     IF NEW.Closed = TRUE AND OLD.Closed = FALSE THEN
--         UPDATE User u
--         SET Streak = Streak + 1
--         WHERE EXISTS (
--             SELECT 1
--             FROM Submission s
--             WHERE s.UserID = u.UserID 
--               AND s.PollID = NEW.PollID
--               AND (
--                   (NEW.WinningVotes = 'A' AND s.PredictionChoiceA = TRUE) OR
--                   (NEW.WinningVotes = 'B' AND s.PredictionChoiceA = FALSE)
--               )
--         );

--         UPDATE User u
--         SET Streak = 0
--         WHERE EXISTS (
--             SELECT 1
--             FROM Submission s
--             WHERE s.UserID = u.UserID 
--               AND s.PollID = NEW.PollID
--               AND NOT (
--                   (NEW.WinningVotes = 'A' AND s.PredictionChoiceA = TRUE) OR
--                   (NEW.WinningVotes = 'B' AND s.PredictionChoiceA = FALSE)
--               )
--         );
--     END IF;
-- END;
-- //
-- DELIMITER ;

CREATE TABLE DebugLog (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    LogTime DATETIME NOT NULL,
    Message TEXT NOT NULL
);



-- Enable the MySQL event scheduler
SET GLOBAL event_scheduler = ON;

-- Drop existing event if it exists
DROP EVENT IF EXISTS ClosePollsEverySecond;

-- Create the event to call the procedure every minute (adjust as needed)
CREATE EVENT ClosePollsEveryMinute
ON SCHEDULE EVERY 1 SECOND
DO
  CALL ClosePollsAndAwardPoints();

DELIMITER //

CREATE PROCEDURE ClosePollsAndAwardPoints()
BEGIN
    DECLARE no_polls_to_close BOOLEAN DEFAULT FALSE;

    -- Step 1: Ensure temporary table is cleared
    DROP TEMPORARY TABLE IF EXISTS PollsToClose;

    CREATE TEMPORARY TABLE PollsToClose (PollID INT PRIMARY KEY);

    -- Insert PollIDs that need to be closed
    INSERT INTO PollsToClose (PollID)
    SELECT DISTINCT PollID
    FROM Poll
    WHERE ClosesAt <= NOW() AND Closed = FALSE;

    -- Log the number of polls to process
    INSERT INTO DebugLog (LogTime, Message)
    VALUES (NOW(), CONCAT('Number of polls to close: ', (SELECT COUNT(*) FROM PollsToClose)));

    -- Check if there are polls to process
    IF (SELECT COUNT(*) FROM PollsToClose) = 0 THEN
        SET no_polls_to_close = TRUE;
    END IF;

    CloseProcedure: BEGIN
        IF no_polls_to_close THEN
            INSERT INTO DebugLog (LogTime, Message)
            VALUES (NOW(), 'No polls to close. Exiting procedure.');
            DROP TEMPORARY TABLE IF EXISTS PollsToClose;
            LEAVE CloseProcedure;
        END IF;

        -- Step 2: Close the Polls
        UPDATE Poll p
        JOIN PollsToClose pc ON p.PollID = pc.PollID
        SET p.Closed = TRUE;

        INSERT INTO DebugLog (LogTime, Message)
        SELECT NOW(), CONCAT('Poll closed. PollID: ', PollID)
        FROM PollsToClose;

        -- Step 3: Award Points (Delegate)
        CALL AwardPointsWithoutClosing();

    END CloseProcedure;

    -- Step 4: Clean Up
    DROP TEMPORARY TABLE IF EXISTS PollsToClose;
END;
//
DELIMITER ;


DELIMITER //

CREATE PROCEDURE ReverifyTotalPoints()
BEGIN
    -- Update current points
    UPDATE User u
    SET 
        u.Points = (
            SELECT COALESCE(SUM(pt.PointValueDelta), 0)
            FROM PointTransaction pt
            WHERE pt.UserID = u.UserID
        );

    -- Update lifetime points
    UPDATE User u
    SET 
        u.LifetimePoints = (
            SELECT COALESCE(SUM(pt.PointValueDelta), 0)
            FROM PointTransaction pt
            WHERE pt.UserID = u.UserID
        );

    -- Log the recalibration
    INSERT INTO DebugLog (LogTime, Message)
    VALUES (NOW(), 'Reverified total points for all users.');
END;
//

DELIMITER ;

DELIMITER //

CREATE PROCEDURE AwardPointsWithoutClosing()
BEGIN
    DECLARE no_polls_to_process BOOLEAN DEFAULT FALSE;

    -- Step 1: Ensure temporary table is cleared
    DROP TEMPORARY TABLE IF EXISTS PollsToAward;

    CREATE TEMPORARY TABLE PollsToAward (PollID INT PRIMARY KEY);

    -- Insert PollIDs for already closed polls that have not been processed for awarding
    INSERT INTO PollsToAward (PollID)
    SELECT DISTINCT p.PollID
    FROM Poll p
    WHERE p.Closed = TRUE
      AND NOT EXISTS (
          SELECT 1
          FROM PointTransaction pt
          WHERE pt.Reason LIKE CONCAT('%poll ID: ', p.PollID, '%')
      );

    -- Log the number of polls to process
    INSERT INTO DebugLog (LogTime, Message)
    VALUES (NOW(), CONCAT('Number of polls to award points for: ', (SELECT COUNT(*) FROM PollsToAward)));

    -- Check if there are polls to process
    IF (SELECT COUNT(*) FROM PollsToAward) = 0 THEN
        SET no_polls_to_process = TRUE;
    END IF;

    AwardProcedure: BEGIN
        IF no_polls_to_process THEN
            INSERT INTO DebugLog (LogTime, Message)
            VALUES (NOW(), 'No polls to award points for. Exiting procedure.');
            DROP TEMPORARY TABLE IF EXISTS PollsToAward;
            LEAVE AwardProcedure;
        END IF;

        -- Step 2: Award Points to Users
        CREATE TEMPORARY TABLE IF NOT EXISTS PollResults AS
        SELECT p.PollID, p.WinningVotes, p.PercentageVotesA, p.PercentageVotesB
        FROM Poll p
        JOIN PollsToAward pta ON p.PollID = pta.PollID;

        INSERT INTO PointTransaction (TransactionDate, PointValueDelta, Reason, UserID)
        SELECT
            NOW(),
            10 + FLOOR(
                (CASE
                    WHEN (s.PredictionChoiceA = TRUE AND pr.WinningVotes = 'A') OR
                         (s.PredictionChoiceA = FALSE AND pr.WinningVotes = 'B')
                    THEN 100 * (1 - pr.PercentageVotesA)
                    ELSE 100 * (1 - pr.PercentageVotesB)
                END) * GREATEST(u.Streak, 1) * 1.5
            ),
            CONCAT('Points awarded for poll ID: ', pr.PollID),
            s.UserID
        FROM Submission s
        JOIN PollResults pr ON s.PollID = pr.PollID
        JOIN User u ON s.UserID = u.UserID;

        INSERT INTO DebugLog (LogTime, Message)
        SELECT NOW(), CONCAT('Points awarded for poll ID: ', PollID)
        FROM PollsToAward;

        -- Step 3: Update User Streaks
        UPDATE User u
        JOIN Submission s ON u.UserID = s.UserID
        JOIN PollResults pr ON s.PollID = pr.PollID
        SET u.Streak = CASE
            WHEN (s.PredictionChoiceA = TRUE AND pr.WinningVotes = 'A') OR
                 (s.PredictionChoiceA = FALSE AND pr.WinningVotes = 'B')
            THEN u.Streak + 1
            ELSE 0
        END;

        -- Update User Points from PointTransaction
        UPDATE User u
        SET u.Points = (
            SELECT COALESCE(SUM(pt.PointValueDelta), 0)
            FROM PointTransaction pt
            WHERE pt.UserID = u.UserID
        );

        -- Log streak updates
        INSERT INTO DebugLog (LogTime, Message)
        SELECT NOW(), CONCAT('Streak updated for users in poll ID: ', PollID)
        FROM PollsToAward;
    END AwardProcedure;

    -- Step 4: Clean Up
    DROP TEMPORARY TABLE IF EXISTS PollsToAward;
    DROP TEMPORARY TABLE IF EXISTS PollResults;
END;
//
DELIMITER ;

-- Create default data
-- INSERT INTO FrontCosmetic (Cost, Src) VALUES (0, "TODO");
-- INSERT INTO MiddleCosmetic (Cost, Src) VALUES (0, "TODO");
-- INSERT INTO BackCosmetic (Cost, Src) VALUES (0, "TODO");

-- Create test values
-- INSERT INTO `WeVote`.`Poll` (`Title`, `Description`, `OptionA`, `OptionB`, `CreationDate`, `ClosesAt`) VALUES ('Test Poll?', 'Poll Test.', 'Test', 'Poll', '2024-11-29 00:00:00', '2024-11-30 00:00:00');
-- INSERT INTO `WeVote`.`Poll` (`Title`, `Description`, `OptionA`, `OptionB`, `CreationDate`, `ClosesAt`) VALUES ('Second Test Poll?', 'Second Poll Test.', 'Poll', 'Test', '2024-11-29 15:37:57', '2024-12-01 00:00:00');
-- INSERT INTO `WeVote`.`Poll` (`Title`, `Description`, `OptionA`, `OptionB`, `CreationDate`, `ClosesAt`) VALUES ('Third Test Poll?', 't', 't', '3', '2024-10-19 00:00:00', '2024-11-19 00:00:00');
-- INSERT INTO `WeVote`.`Poll` 
-- (`Title`, `Description`, `OptionA`, `OptionB`, `CreationDate`, `ClosesAt`) 
-- VALUES 
-- ('Short Test Poll', 'This poll closes in 20 seconds.', 'Option A', 'Option B', NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE));
