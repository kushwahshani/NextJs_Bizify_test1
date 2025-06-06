CREATE TABLE IF NOT EXISTS customer(
    name VARCHAR(15),
    email VARCHAR(100) UNIQUE,
    message VARCHAR(255),
);

CREATE TABLE IF NOT EXISTS shops(
    shop TEXT UNIQUE,
    access_token TEXT,
    is_embedded INTEGER
);

wrangler d1 execute DB --local --command "CREATE TABLE IF NOT EXISTS customer ( name VARCHAR(15),email VARCHAR(100) UNIQUE,message VARCHAR(255));"
wrangler d1 execute DB --local --command "DELETE FROM shops WHERE shop = 'ac-dev-25.myshopify.com';"