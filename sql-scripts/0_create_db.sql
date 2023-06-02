CREATE DATABASE MyEvents;

CREATE TABLE EventData (
    ID INT PRIMARY KEY,
    EventName VARCHAR(50),
    StartTime DATETIME,
    EndTime DATETIME
);

INSERT INTO
    EventData (ID, EventName, StartTime, EndTime)
VALUES
    (
        1,
        'Event 1',
        '2023-05-01 10:00:00',
        '2023-05-01 12:00:00'
    ),
    (
        2,
        'Event 2',
        '2023-05-02 15:30:00',
        '2023-05-02 17:30:00'
    ),
    (
        3,
        'Event 3',
        '2023-05-03 09:00:00',
        '2023-05-03 11:00:00'
    ),
    (
        4,
        'Event 4',
        '2023-05-04 14:00:00',
        '2023-05-04 16:00:00'
    ),
    (
        5,
        'Event 5',
        '2023-05-05 11:30:00',
        '2023-05-05 13:30:00'
    );

-- Enable CDC on the database
USE MyEvents EXEC sys.sp_cdc_enable_db EXEC sys.sp_cdc_enable_table @source_schema = 'dbo',
@source_name = 'EventData',
@role_name = NULL,
@supports_net_changes = 0 -- GO
-- Check if CDC is enabled for the table
SELECT
    [name],
    is_tracked_by_cdc
FROM
    sys.tables
WHERE
    [name] = 'EventData'
GO
