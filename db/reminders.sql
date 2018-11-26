DROP TABLE IF EXISTS reminders;
CREATE TABLE reminders (
    id UUID NOT NULL PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    comments TEXT,
    amount float8 NOT NULL,
    remind_date TIMESTAMP NOT NULL,
    created TIMESTAMP DEFAULT current_timestamp,
    status VARCHAR(10)
)