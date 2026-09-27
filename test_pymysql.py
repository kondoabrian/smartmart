import os

import pymysql
from dotenv import load_dotenv


load_dotenv()


try:

    connection = pymysql.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        port=int(os.getenv("DB_PORT", 3306)),
        ssl={
            "check_hostname": False
        }
    )

    print("PYMYSQL CONNECTION SUCCESSFUL!")

    cursor = connection.cursor()

    cursor.execute("SHOW TABLES")

    tables = cursor.fetchall()

    print("\nSmartMart tables:")

    for table in tables:
        print(table[0])

    cursor.close()
    connection.close()

except Exception as e:

    print("PYMYSQL CONNECTION FAILED!")
    print(type(e).__name__)
    print(e)