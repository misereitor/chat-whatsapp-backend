CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    trade_name VARCHAR(100),
    cnpj VARCHAR(14) NOT NULL UNIQUE,
    type VARCHAR(50),
    dealer_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dealer_id) REFERENCES companies(id)
);

CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR,
    max_admins INTEGER NOT NULL DEFAULT 1,
    max_supervisors INTEGER NOT NULL,
    max_users INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS companies_plans (
    company_id INTEGER NOT NULL,
    plan_id INTEGER NOT NULL,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(id),
    PRIMARY KEY (company_id, plan_id),
    UNIQUE (company_id)
);

CREATE TABLE IF NOT EXISTS companies_modules (
    company_id INTEGER NOT NULL,
    module_id INTEGER NOT NULL,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id),
    PRIMARY KEY (company_id, module_id)
);

CREATE TABLE IF NOT EXISTS business_hours_days (
    id SERIAL PRIMARY KEY,
    from_time TIME NOT NULL, 
    to_time TIME NOT NULL  
);

CREATE TABLE IF NOT EXISTS business_hours (
    id SERIAL PRIMARY KEY,
    sunday_id INTEGER,
    monday_id INTEGER,
    tuesday_id INTEGER,
    wednesday_id INTEGER,
    thursday_id INTEGER,
    friday_id INTEGER,
    saturday_id INTEGER,
    FOREIGN KEY (sunday_id) REFERENCES business_hours_days(id),
    FOREIGN KEY (monday_id) REFERENCES business_hours_days(id),
    FOREIGN KEY (tuesday_id) REFERENCES business_hours_days(id),
    FOREIGN KEY (wednesday_id) REFERENCES business_hours_days(id),
    FOREIGN KEY (thursday_id) REFERENCES business_hours_days(id),
    FOREIGN KEY (friday_id) REFERENCES business_hours_days(id),
    FOREIGN KEY (saturday_id) REFERENCES business_hours_days(id)
);

CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    business_hours_id INTEGER,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (business_hours_id) REFERENCES business_hours(id)
);

CREATE TABLE IF NOT EXISTS channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    connection VARCHAR(250) NOT NULL,
    session VARCHAR (100) NOT NULL,
    channel_type VARCHAR(30) NOT NULL,
    company_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone_number VARCHAR(14),
    photo_url VARCHAR(255),
    grade INTEGER[],
    login VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE users_roles_companies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    company_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    UNIQUE (user_id, company_id, role_id)
);

CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id INTEGER,
    company_id INTEGER NOT NULL,
    all_department BOOLEAN,
    bg_color VARCHAR(20) NOT NULL,
    text_color VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS tag_departments (
    tag_id INTEGER NOT NULL,
    department_id INTEGER NOT NULL,
    PRIMARY KEY (tag_id, department_id),
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_department (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    department_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, department_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bots (
    id SERIAL PRIMARY KEY,
    type INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR,
    greeting_message VARCHAR,
    has_menu BOOLEAN DEFAULT FALSE,
    has_segmentation BOOLEAN DEFAULT FALSE,
    has_evaluation BOOLEAN DEFAULT FALSE,
    option_message VARCHAR,
    targeting_message VARCHAR,
    absent_message VARCHAR,
    message_evaluation VARCHAR,
    evaluation_thanks_message VARCHAR,
    error_evaluation_message VARCHAR,
    final_greeting_message VARCHAR,
    time_limit_avaliation INTEGER NOT NULL,
    time_limit_notes INTEGER NOT NULL,
    time_limit_potential INTEGER NOT NULL,
    enable_avaliation BOOLEAN DEFAULT FALSE,
    enable_viewer BOOLEAN DEFAULT FALSE,
    send_user_name_in_chat BOOLEAN DEFAULT FALSE,
    enable_finish_quest BOOLEAN DEFAULT FALSE,
    enable_contact_finish_chat BOOLEAN DEFAULT FALSE,
    enable_groups BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bot_questions (
    id SERIAL PRIMARY KEY,
    bot_id INTEGER NOT NULL,
    sequence_segmentation INTEGER,
    options JSONB,
    key_segmentation: VARCHAR(50),
    type_response VARCHAR(50) NOT NULL,
    type_question VARCHAR(50) NOT NULL,
    url VARCHAR,
    text VARCHAR, 
    principal BOOLEAN,
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS channel_bots (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER NOT NULL,
    bot_id INTEGER NOT NULL,
    UNIQUE (channel_id, bot_id),
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fast_messages (
    id SERIAL PRIMARY KEY,
    message VARCHAR(255) NOT NULL,
    keyword VARCHAR(50) NOT NULL,
    user_create_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_create_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS departments_fast_messages (
    id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL,
    fast_message_id INTEGER NOT NULL,
    UNIQUE (department_id, fast_message_id),
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    FOREIGN KEY (fast_message_id) REFERENCES fast_messages(id)
);

CREATE TABLE IF NOT EXISTS user_fast_message (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    fast_message_id INTEGER NOT NULL,
    UNIQUE (user_id, fast_message_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fast_message_id) REFERENCES fast_messages(id)
);

CREATE TABLE IF NOT EXISTS departments_users (
    id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    UNIQUE (department_id, user_id),
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    chat_id VARCHAR(50) NOT NULL,
    photo_url VARCHAR,
    total_attendances INTEGER,
    total_messages INTEGER,
    phone_number VARCHAR(20) NOT NULL,
    contact_name VARCHAR(50),
    channel_id INTEGER NOT NULL,
    last_message BIGINT,
    in_bot BOOLEAN,
    active BOOLEAN,
    department_id INTEGER,
    user_id INTEGER,
    date_create_chat BIGINT,
    segment_info JSONB,
    current_stage VARCHAR(20) NOT NULL,
    current_question_id INTEGER,
    current_segmentation_id INTEGER,
    started_at BIGINT NOT NULL,
    UNIQUE (phone_number, channel_id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (channel_id) REFERENCES channels(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO companies
	(company_name, trade_name, type, cnpj, is_active)
VALUES
	('Misael Miranda', 'Misael Baista Miranda', 'master', '12345678000134', true);

INSERT INTO users 
	(name, email, phone_number, photo_url, login, password, is_active)
VALUES
	('Misael Miranda', 'misaelbahia1@hotmail.com', '75983094954', 'https://www.iconsdb.com/icons/preview/deep-pink/whatsapp-xxl.png', 'misael.miranda', '$2b$10$3lRKnN.y7Ab8cIAyVSLXteyDxzgJfu5ed.j6XBeJhsXea4zOuaNYq', true);

INSERT INTO users_roles_companies
	(user_id, company_id, role_id)
VALUES
	(1, 1, 1);
