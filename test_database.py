from database import get_connection


try:

    connection = get_connection()

    print("DATABASE CONNECTION SUCCESSFUL!")

    cursor = connection.cursor()

    cursor.execute("SHOW TABLES")

    tables = cursor.fetchall()

    print("\nSmartMart tables:")

    for table in tables:
        print(table[0])

    cursor.close()
    connection.close()

except Exception as e:

    print("DATABASE CONNECTION FAILED!")
    print(e)