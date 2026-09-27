from flask import (
    Flask,
    render_template,
    session,
    redirect,
    url_for,
    request
)

from urllib.parse import quote
from dotenv import load_dotenv
import os
import uuid

from werkzeug.utils import secure_filename

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)
from database import get_connection
load_dotenv()

# =========================================================
# SMARTMART APPLICATION
# =========================================================

app = Flask(__name__)


secret_key = os.getenv("SECRET_KEY")

if not secret_key:
    raise RuntimeError(
        "SECRET_KEY is not configured."
    )

app.secret_key = secret_key

# =========================================================
# FILE UPLOAD SETTINGS
# =========================================================

ALLOWED_EXTENSIONS = {
    "jpg",
    "jpeg",
    "png",
    "webp"
}


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower()
        in ALLOWED_EXTENSIONS
    )


# =========================================================
# CUSTOMER SIDE
# =========================================================


# ---------------------------------------------------------
# HOME
# ---------------------------------------------------------

@app.route("/")
def home():

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    # Get categories
    cursor.execute("""
        SELECT
            id,
            name,
            description,
            image
        FROM categories
        ORDER BY name
    """)

    categories = cursor.fetchall()

    # Get active products
    cursor.execute("""
        SELECT
            products.id,
            products.name,
            products.description,
            products.price,
            products.stock,
            products.image,
            categories.name AS category_name
        FROM products
        INNER JOIN categories
            ON products.category_id = categories.id
        WHERE products.status = 'active'
        ORDER BY products.id DESC
    """)

    products = cursor.fetchall()

    cursor.close()
    connection.close()

    return render_template(
        "home.html",
        categories=categories,
        products=products
    )

@app.route("/product/<int:product_id>")
def product_details(product_id):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            p.id,
            p.category_id,
            p.name,
            p.description,
            p.price,
            p.stock,
            p.image,
            c.name AS category_name
        FROM products p
        JOIN categories c
            ON p.category_id = c.id
        WHERE p.id = %s
        AND p.status = 'active'
    """, (product_id,))

    product = cursor.fetchone()

    cursor.close()
    connection.close()

    if not product:
        return "Product not found.", 404

    return render_template(
        "product_details.html",
        product=product
    )


@app.route("/add-to-cart/<int:product_id>", methods=["POST"])
def add_to_cart(product_id):

    quantity_text = request.form.get("quantity", "1").strip()

    try:
        quantity = int(quantity_text)
    except ValueError:
        quantity = 1

    if quantity < 1:
        quantity = 1

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            id,
            name,
            price,
            stock
        FROM products
        WHERE id = %s
        AND status = 'active'
    """, (product_id,))

    product = cursor.fetchone()

    cursor.close()
    connection.close()

    if product is None:
        return "Product not found.", 404

    if product["stock"] <= 0:
        return "This product is out of stock.", 400

    # Get existing cart
    cart = session.get("cart", {})

    product_key = str(product_id)

    current_quantity = cart.get(product_key, 0)

    new_quantity = current_quantity + quantity

    # Do not allow cart quantity above available stock
    if new_quantity > product["stock"]:
        new_quantity = product["stock"]

    cart[product_key] = new_quantity

    session["cart"] = cart
    session.modified = True

    return redirect(url_for("cart"))

@app.route("/cart")
def cart():

    cart = session.get("cart", {})

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cart_items = []
    total = 0

    for product_id, quantity in cart.items():

        cursor.execute("""
            SELECT
                p.id,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.image,
                c.name AS category_name
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.id
            WHERE p.id = %s
        """, (product_id,))

        product = cursor.fetchone()

        if product:

            subtotal = product["price"] * quantity

            cart_items.append({
                "id": product["id"],
                "name": product["name"],
                "description": product["description"],
                "price": product["price"],
                "stock": product["stock"],
                "image": product["image"],
                "category_name": product["category_name"],
                "quantity": quantity,
                "subtotal": subtotal
            })

            total += subtotal

    cursor.close()
    connection.close()

    return render_template(
        "cart.html",
        cart_items=cart_items,
        total=total
    )

@app.route("/remove-from-cart/<int:product_id>")
def remove_from_cart(product_id):

    cart = session.get("cart", {})

    product_key = str(product_id)

    if product_key in cart:
        cart.pop(product_key)

    session["cart"] = cart
    session.modified = True

    return redirect(url_for("cart"))

@app.route("/clear-cart")
def clear_cart():

    session["cart"] = {}

    return redirect(url_for("cart"))

@app.route("/checkout")
def checkout():

    cart = session.get("cart", {})

    if not cart:
        return redirect(url_for("cart"))

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cart_items = []
    total = 0

    for product_id, quantity in cart.items():

        cursor.execute("""
            SELECT
                p.id,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.image,
                c.name AS category_name
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.id
            WHERE p.id = %s
        """, (product_id,))

        product = cursor.fetchone()

        if product:

            # Make sure quantity does not exceed available stock
            if quantity > product["stock"]:
                quantity = product["stock"]

            subtotal = product["price"] * quantity

            cart_items.append({
                "id": product["id"],
                "name": product["name"],
                "description": product["description"],
                "price": product["price"],
                "stock": product["stock"],
                "image": product["image"],
                "category_name": product["category_name"],
                "quantity": quantity,
                "subtotal": subtotal
            })

            total += subtotal

    cursor.close()
    connection.close()

    if not cart_items:
        session.pop("cart", None)
        return redirect(url_for("cart"))

    return render_template(
        "checkout.html",
        cart_items=cart_items,
        total=total
    )
# =========================================================
# PLACE ORDER
# =========================================================
@app.route("/place-order", methods=["POST"])
def place_order():

    cart = session.get("cart", {})

    if not cart:
        return redirect(url_for("cart"))

    # ---------------------------------------------------------
    # CUSTOMER INFORMATION
    # ---------------------------------------------------------

    customer_name = request.form.get(
        "customer_name",
        ""
    ).strip()

    phone = request.form.get(
        "phone",
        ""
    ).strip()

    district = request.form.get(
        "district",
        ""
    ).strip()

    town = request.form.get(
        "town",
        ""
    ).strip()

    delivery_address = request.form.get(
        "delivery_address",
        ""
    ).strip()

    additional_directions = request.form.get(
        "additional_directions",
        ""
    ).strip()


    # ---------------------------------------------------------
    # VALIDATE CUSTOMER INFORMATION
    # ---------------------------------------------------------

    if not customer_name:
        return "Customer name is required.", 400

    if not phone:
        return "Phone number is required.", 400

    if not district:
        return "District is required.", 400

    if not town:
        return "Town / City is required.", 400

    if not delivery_address:
        return "Delivery address is required.", 400


    connection = get_connection()
    cursor = connection.cursor(dictionary=True)


    try:

        # -----------------------------------------------------
        # START TRANSACTION
        # -----------------------------------------------------

        connection.start_transaction()

        total_amount = 0

        order_items = []


        # -----------------------------------------------------
        # CHECK PRODUCTS AND STOCK
        # -----------------------------------------------------

        for product_id, quantity in cart.items():

            cursor.execute("""
                SELECT
                    id,
                    name,
                    price,
                    buying_price,
                    stock,
                    status
                FROM products
                WHERE id = %s
                FOR UPDATE
            """, (product_id,))

            product = cursor.fetchone()


            if not product:

                connection.rollback()
                cursor.close()
                connection.close()

                return (
                    f"Product {product_id} was not found.",
                    400
                )


            if product["status"] != "active":

                connection.rollback()
                cursor.close()
                connection.close()

                return (
                    f'{product["name"]} is no longer available.',
                    400
                )


            if quantity <= 0:

                connection.rollback()
                cursor.close()
                connection.close()

                return (
                    "Invalid product quantity.",
                    400
                )


            if quantity > product["stock"]:

                connection.rollback()
                cursor.close()
                connection.close()

                return (
                    f'Only {product["stock"]} '
                    f'{product["name"]} available.',
                    400
                )


            subtotal = (
                product["price"] * quantity
            )

            total_amount += subtotal


            order_items.append({
                "product_id": product["id"],
                "quantity": quantity,
                "unit_price": product["price"],
                "buying_price": product["buying_price"],
                "subtotal": subtotal,
                "stock_before": product["stock"]
            })


        # -----------------------------------------------------
        # GENERATE ORDER NUMBER
        # -----------------------------------------------------

        order_number = (
            "SM-"
            + uuid.uuid4().hex[:8].upper()
        )


        # -----------------------------------------------------
        # CREATE ORDER
        # -----------------------------------------------------

        cursor.execute("""
            INSERT INTO orders
            (
                order_number,
                customer_name,
                phone,
                district,
                town,
                delivery_address,
                additional_directions,
                total_amount,
                status
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                'NEW'
            )
        """, (
            order_number,
            customer_name,
            phone,
            district,
            town,
            delivery_address,
            additional_directions,
            total_amount
        ))


        # -----------------------------------------------------
        # GET NEWLY CREATED ORDER ID
        # -----------------------------------------------------

        order_id = cursor.lastrowid


        # -----------------------------------------------------
        # CREATE ORDER ITEMS
        # + REDUCE STOCK
        # + RECORD SALE
        # -----------------------------------------------------

        for item in order_items:

            # ---------------------------------------------
            # CREATE ORDER ITEM
            # ---------------------------------------------

            cursor.execute("""
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    quantity,
                    unit_price,
                    buying_price,
                    subtotal
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )
            """, (
                order_id,
                item["product_id"],
                item["quantity"],
                item["unit_price"],
                item["buying_price"],
                item["subtotal"]
            ))


            # ---------------------------------------------
            # CALCULATE STOCK
            # ---------------------------------------------

            stock_before = item["stock_before"]

            stock_after = (
                stock_before
                - item["quantity"]
            )


            # ---------------------------------------------
            # REDUCE PRODUCT STOCK
            # ---------------------------------------------

            cursor.execute("""
                UPDATE products
                SET stock = %s
                WHERE id = %s
            """, (
                stock_after,
                item["product_id"]
            ))


            # ---------------------------------------------
            # RECORD SALE IN STOCK HISTORY
            # ---------------------------------------------

            cursor.execute("""
                INSERT INTO stock_adjustments
                (
                    product_id,
                    admin_id,
                    action,
                    quantity,
                    stock_before,
                    stock_after,
                    reason
                )
                VALUES
                (
                    %s,
                    %s,
                    'SALE',
                    %s,
                    %s,
                    %s,
                    %s
                )
            """, (
                item["product_id"],
                None,
                item["quantity"],
                stock_before,
                stock_after,
                f"Sale from order {order_number}"
            ))


        # -----------------------------------------------------
        # COMMIT TRANSACTION
        # -----------------------------------------------------

        connection.commit()


        # -----------------------------------------------------
        # EMPTY CART
        # -----------------------------------------------------

        session.pop("cart", None)


        # -----------------------------------------------------
        # CLOSE DATABASE
        # -----------------------------------------------------

        cursor.close()
        connection.close()


        # -----------------------------------------------------
        # SEND CUSTOMER TO CONFIRMATION
        # -----------------------------------------------------

        return redirect(
            url_for(
                "order_confirmation",
                order_number=order_number
            )
        )


    except Exception as e:

        connection.rollback()

        cursor.close()
        connection.close()

        return (
            f"Unable to place order: {e}",
            500
        )
# =========================================================
# PLACE ORDER
# =========================================================


@app.route("/order-confirmation/<order_number>")
def order_confirmation(order_number):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    # Get order
    cursor.execute("""
        SELECT
            id,
            order_number,
            customer_name,
            phone,
            district,
            town,
            delivery_address,
            additional_directions,
            total_amount,
            status,
            created_at
        FROM orders
        WHERE order_number = %s
    """, (order_number,))

    order = cursor.fetchone()

    if not order:
        cursor.close()
        connection.close()

        return "Order not found.", 404


    # Get order items
    cursor.execute("""
        SELECT
            oi.id,
            oi.quantity,
            oi.unit_price,
            oi.subtotal,
            p.name AS product_name,
            p.image AS product_image
        FROM order_items oi
        JOIN products p
            ON oi.product_id = p.id
        WHERE oi.order_id = %s
        ORDER BY oi.id ASC
    """, (order["id"],))

    items = cursor.fetchall()

    cursor.close()
    connection.close()


    # SmartMart WhatsApp number
    # Replace this with your real business WhatsApp number later.
    whatsapp_number = "256700000000"


    # Build WhatsApp message
    message = f"""
Hello SmartMart,

I have placed an order.

Order Number: {order["order_number"]}

Customer Name: {order["customer_name"]}
Phone: {order["phone"]}

Delivery Location:
{order["district"]}, {order["town"]}

Delivery Address:
{order["delivery_address"]}
"""


    if order["additional_directions"]:

        message += f"""
Additional Directions:
{order["additional_directions"]}
"""


    message += """
Order Items:
"""


    for item in items:

        message += (
            f'- {item["product_name"]} '
            f'x{item["quantity"]} '
            f'= UGX {item["subtotal"]:,.0f}\n'
        )


    message += f"""
Total: UGX {order["total_amount"]:,.0f}

Please confirm that you have received my order.
"""


    # Encode message for WhatsApp URL
    whatsapp_url = (
        f"https://wa.me/{whatsapp_number}"
        f"?text={quote(message)}"
    )


    return render_template(
        "order_confirmation.html",
        order=order,
        items=items,
        whatsapp_url=whatsapp_url
    )
# =========================================================
# ORDER CONFIRMATION
# =========================================================




# =========================================================
# CUSTOMER ORDER TRACKING
# =========================================================

@app.route("/track-order", methods=["GET", "POST"])
def track_order():

    order = None
    items = []
    error = None

    if request.method == "POST":

        order_number = request.form.get(
            "order_number",
            ""
        ).strip().upper()

        if not order_number:
            error = "Please enter your order number."

        else:

            connection = get_connection()
            cursor = connection.cursor(dictionary=True)

            # Get order information
            cursor.execute("""
                SELECT
                    o.id,
                    o.order_number,
                    o.customer_name,
                    o.phone,
                    o.district,
                    o.town,
                    o.delivery_address,
                    o.additional_directions,
                    o.total_amount,
                    o.status,
                    o.created_at,

                    dp.full_name AS delivery_person_name,
                    dp.phone AS delivery_person_phone

                FROM orders o

                LEFT JOIN delivery_personnel dp
                    ON o.delivery_person_id = dp.id

                WHERE o.order_number = %s
            """, (order_number,))

            order = cursor.fetchone()

            if order:

                # Get products belonging to the order
                cursor.execute("""
                    SELECT
                        oi.id,
                        oi.quantity,
                        oi.unit_price,
                        oi.subtotal,

                        p.name AS product_name,
                        p.image AS product_image

                    FROM order_items oi

                    JOIN products p
                        ON oi.product_id = p.id

                    WHERE oi.order_id = %s

                    ORDER BY oi.id ASC
                """, (order["id"],))

                items = cursor.fetchall()

            else:

                error = (
                    "Order not found. "
                    "Please check your order number."
                )

            cursor.close()
            connection.close()

    return render_template(
        "order_tracking.html",
        order=order,
        items=items,
        error=error
    )

# =========================================================
# ADMIN LOGIN
# =========================================================

@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():

    if request.method == "POST":

        username = request.form.get(
            "username",
            ""
        ).strip()

        password = request.form.get(
            "password",
            ""
        ).strip()

        # ---------------------------------------------
        # VALIDATE INPUT
        # ---------------------------------------------

        if not username or not password:
            return render_template(
                "admin/login.html",
                error="Username and password are required."
            )

        # ---------------------------------------------
        # CONNECT TO DATABASE
        # ---------------------------------------------

        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                id,
                username,
                password
            FROM admins
            WHERE username = %s
        """, (
            username,
        ))

        admin = cursor.fetchone()

        cursor.close()
        connection.close()

        # ---------------------------------------------
        # CHECK ADMIN
        # ---------------------------------------------

        if admin:

            if check_password_hash(
                admin["password"],
                password
            ):

                session["admin_id"] = admin["id"]

                session["admin_username"] = (
                    admin["username"]
                )

                return redirect(
                    url_for("admin_dashboard")
                )

        # ---------------------------------------------
        # INVALID LOGIN
        # ---------------------------------------------

        return render_template(
            "admin/login.html",
            error="Invalid username or password."
        )

    return render_template(
        "admin/login.html"
    )

# =========================================================
# ADMIN DASHBOARD
# =========================================================


@app.route("/admin/dashboard")
def admin_dashboard():

    if "admin_id" not in session:
        return redirect(
            url_for("admin_login")
        )

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    # Total products
    cursor.execute("""
        SELECT COUNT(*) AS total
        FROM products
    """)

    product_count = cursor.fetchone()["total"]

    # Total orders
    cursor.execute("""
        SELECT COUNT(*) AS total
        FROM orders
    """)

    order_count = cursor.fetchone()["total"]

    # Customers
    cursor.execute("""
        SELECT COUNT(DISTINCT phone) AS total
        FROM orders
    """)

    customer_count = cursor.fetchone()["total"]

    # Total sales
    cursor.execute("""
        SELECT
            COALESCE(
                SUM(total_amount),
                0
            ) AS total
        FROM orders
        WHERE status != 'CANCELLED'
    """)

    total_sales = cursor.fetchone()["total"]

    cursor.close()
    connection.close()

    return render_template(
        "admin/dashboard.html",
        product_count=product_count,
        order_count=order_count,
        customer_count=customer_count,
        total_sales=total_sales
    )


# =========================================================
# ADMIN LOGOUT
# =========================================================


@app.route("/admin/logout")
def admin_logout():

    session.pop("admin_id", None)

    session.pop("admin_username", None)

    return redirect(
        url_for("admin_login")
    )


# =========================================================
# ADMIN PRODUCT MANAGEMENT
# =========================================================


# ---------------------------------------------------------
# VIEW PRODUCTS
# ---------------------------------------------------------

@app.route("/admin/products")
def admin_products():

    if "admin_id" not in session:
        return redirect(
            url_for("admin_login")
        )

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            products.id,
            products.name,
            products.description,
            products.buying_price,
            products.price,
            products.stock,
            products.image,
            products.status,
            categories.name AS category_name
        FROM products
        INNER JOIN categories
            ON products.category_id = categories.id
        ORDER BY products.id DESC
    """)

    products = cursor.fetchall()

    cursor.close()
    connection.close()

    return render_template(
        "admin/products.html",
        products=products
    )


# ---------------------------------------------------------
# ADD PRODUCT
# ---------------------------------------------------------

@app.route(
    "/admin/products/add",
    methods=["GET", "POST"]
)
def admin_add_product():

    if "admin_id" not in session:
        return redirect(
            url_for("admin_login")
        )

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    # Get categories
    cursor.execute("""
        SELECT
            id,
            name
        FROM categories
        ORDER BY name
    """)

    categories = cursor.fetchall()

    if request.method == "POST":

        name = request.form.get(
            "name",
            ""
        ).strip()

        category_id = request.form.get(
            "category_id",
            ""
        ).strip()

        description = request.form.get(
            "description",
            ""
        ).strip()

        buying_price = request.form.get(
            "buying_price",
            ""
        ).strip()

        price = request.form.get(
            "price",
            ""
        ).strip()

        stock = request.form.get(
            "stock",
            ""
        ).strip()

        image = request.files.get("image")

        # Validate required fields
        if not name:
            cursor.close()
            connection.close()

            return render_template(
                "admin/add_product.html",
                categories=categories,
                error="Product name is required."
            )

        if not category_id:
            cursor.close()
            connection.close()

            return render_template(
                "admin/add_product.html",
                categories=categories,
                error="Please select a category."
            )

        try:

            buying_price = float(
                buying_price
            )

            price = float(price)

            stock = int(stock)

        except ValueError:

            cursor.close()
            connection.close()

            return render_template(
                "admin/add_product.html",
                categories=categories,
                error=(
                    "Buying price, selling price "
                    "and stock must contain valid values."
                )
            )

        if buying_price < 0:

            cursor.close()
            connection.close()

            return render_template(
                "admin/add_product.html",
                categories=categories,
                error="Buying price cannot be negative."
            )

        if price < 0:

            cursor.close()
            connection.close()

            return render_template(
                "admin/add_product.html",
                categories=categories,
                error="Selling price cannot be negative."
            )

        if stock < 0:

            cursor.close()
            connection.close()

            return render_template(
                "admin/add_product.html",
                categories=categories,
                error="Stock cannot be negative."
            )

        image_filename = None

        # Handle image upload
        if image and image.filename:

            if not allowed_file(image.filename):

                cursor.close()
                connection.close()

                return render_template(
                    "admin/add_product.html",
                    categories=categories,
                    error=(
                        "Invalid image format. "
                        "Use JPG, JPEG, PNG or WEBP."
                    )
                )

            original_filename = secure_filename(
                image.filename
            )

            extension = (
                original_filename
                .rsplit(".", 1)[1]
                .lower()
            )

            image_filename = (
                uuid.uuid4().hex
                + "."
                + extension
            )

            upload_folder = os.path.join(
                app.static_folder,
                "images",
                "products"
            )

            os.makedirs(
                upload_folder,
                exist_ok=True
            )

            image.save(
                os.path.join(
                    upload_folder,
                    image_filename
                )
            )

        cursor.execute("""
            INSERT INTO products
            (
                category_id,
                name,
                description,
                buying_price,
                price,
                stock,
                image,
                status
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                'active'
            )
        """, (
            category_id,
            name,
            description,
            buying_price,
            price,
            stock,
            image_filename
        ))

        connection.commit()

        cursor.close()
        connection.close()

        return redirect(
            url_for("admin_products")
        )

    cursor.close()
    connection.close()

    return render_template(
        "admin/add_product.html",
        categories=categories
    )


# ---------------------------------------------------------
# EDIT PRODUCT
# ---------------------------------------------------------
@app.route(
    "/admin/products/edit/<int:product_id>",
    methods=["GET", "POST"]
)
def admin_edit_product(product_id):

    if "admin_id" not in session:
        return redirect(
            url_for("admin_login")
        )

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    # =====================================================
    # GET PRODUCT
    # =====================================================

    cursor.execute("""
        SELECT
            id,
            category_id,
            name,
            description,
            buying_price,
            price,
            stock,
            image,
            status
        FROM products
        WHERE id = %s
    """, (
        product_id,
    ))

    product = cursor.fetchone()

    if product is None:

        cursor.close()
        connection.close()

        return "Product not found.", 404

    # =====================================================
    # GET CATEGORIES
    # =====================================================

    cursor.execute("""
        SELECT
            id,
            name
        FROM categories
        ORDER BY name
    """)

    categories = cursor.fetchall()

    # =====================================================
    # HANDLE FORM SUBMISSION
    # =====================================================

    if request.method == "POST":

        name = request.form.get(
            "name",
            ""
        ).strip()

        category_id = request.form.get(
            "category_id",
            ""
        ).strip()

        description = request.form.get(
            "description",
            ""
        ).strip()

        buying_price = request.form.get(
            "buying_price",
            ""
        ).strip()

        price = request.form.get(
            "price",
            ""
        ).strip()

        image = request.files.get("image")

        # =================================================
        # BASIC VALIDATION
        # =================================================

        if not name:

            cursor.close()
            connection.close()

            return render_template(
                "admin/edit_product.html",
                product=product,
                categories=categories,
                error="Product name is required."
            )

        if not category_id:

            cursor.close()
            connection.close()

            return render_template(
                "admin/edit_product.html",
                product=product,
                categories=categories,
                error="Please select a category."
            )

        try:

            buying_price = float(
                buying_price
            )

            price = float(
                price
            )

        except ValueError:

            cursor.close()
            connection.close()

            return render_template(
                "admin/edit_product.html",
                product=product,
                categories=categories,
                error=(
                    "Buying price and selling price "
                    "must contain valid numbers."
                )
            )

        # =================================================
        # PRICE VALIDATION
        # =================================================

        if buying_price < 0:

            cursor.close()
            connection.close()

            return render_template(
                "admin/edit_product.html",
                product=product,
                categories=categories,
                error="Buying price cannot be negative."
            )

        if price < 0:

            cursor.close()
            connection.close()

            return render_template(
                "admin/edit_product.html",
                product=product,
                categories=categories,
                error="Selling price cannot be negative."
            )

        # =================================================
        # IMAGE
        # =================================================

        image_filename = product["image"]

        if image and image.filename:

            if not allowed_file(
                image.filename
            ):

                cursor.close()
                connection.close()

                return render_template(
                    "admin/edit_product.html",
                    product=product,
                    categories=categories,
                    error=(
                        "Invalid image format. "
                        "Use JPG, JPEG, PNG or WEBP."
                    )
                )

            original_filename = secure_filename(
                image.filename
            )

            extension = (
                original_filename
                .rsplit(".", 1)[1]
                .lower()
            )

            image_filename = (
                uuid.uuid4().hex
                + "."
                + extension
            )

            upload_folder = os.path.join(
                app.static_folder,
                "images",
                "products"
            )

            os.makedirs(
                upload_folder,
                exist_ok=True
            )

            image.save(
                os.path.join(
                    upload_folder,
                    image_filename
                )
            )

        # =================================================
        # UPDATE PRODUCT
        #
        # IMPORTANT:
        # Stock is intentionally NOT updated here.
        # =================================================

        cursor.execute("""
            UPDATE products
            SET
                category_id = %s,
                name = %s,
                description = %s,
                buying_price = %s,
                price = %s,
                image = %s
            WHERE id = %s
        """, (
            category_id,
            name,
            description,
            buying_price,
            price,
            image_filename,
            product_id
        ))

        connection.commit()

        cursor.close()
        connection.close()

        return redirect(
            url_for("admin_products")
        )

    # =====================================================
    # DISPLAY EDIT PAGE
    # =====================================================

    cursor.close()
    connection.close()

    return render_template(
        "admin/edit_product.html",
        product=product,
        categories=categories
    )


# ---------------------------------------------------------
# TOGGLE PRODUCT STATUS
# ---------------------------------------------------------

@app.route(
    "/admin/products/toggle/<int:product_id>"
)
def admin_toggle_product(product_id):

    if "admin_id" not in session:
        return redirect(
            url_for("admin_login")
        )

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            status
        FROM products
        WHERE id = %s
    """, (product_id,))

    product = cursor.fetchone()

    if product is None:

        cursor.close()
        connection.close()

        return "Product not found.", 404

    if product["status"] == "active":

        new_status = "inactive"

    else:

        new_status = "active"

    cursor.execute("""
        UPDATE products
        SET status = %s
        WHERE id = %s
    """, (
        new_status,
        product_id
    ))

    connection.commit()

    cursor.close()
    connection.close()

    return redirect(
        url_for("admin_products")
    )


# =========================================================
# ADMIN ORDER MANAGEMENT
# =========================================================


# ---------------------------------------------------------
# VIEW ORDERS
# ---------------------------------------------------------

@app.route("/admin/orders")
def admin_orders():

    if "admin_id" not in session:
        return redirect(
            url_for("admin_login")
        )

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            id,
            order_number,
            customer_name,
            phone,
            district,
            town,
            total_amount,
            status,
            created_at
        FROM orders
        ORDER BY created_at DESC
    """)

    orders = cursor.fetchall()

    cursor.close()
    connection.close()

    return render_template(
        "admin/orders.html",
        orders=orders
    )


# ---------------------------------------------------------
# ORDER DETAILS
# ----------------------------
@app.route("/admin/orders/<int:order_id>")
def admin_order_details(order_id):

    if "admin_id" not in session:
        return redirect(url_for("admin_login"))

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    # Get order
    cursor.execute("""
        SELECT
            o.id,
            o.order_number,
            o.customer_name,
            o.phone,
            o.district,
            o.town,
            o.delivery_address,
            o.additional_directions,
            o.total_amount,
            o.status,
            o.created_at,
            o.delivery_person_id,

            dp.full_name AS delivery_person_name,
            dp.phone AS delivery_person_phone

        FROM orders o

        LEFT JOIN delivery_personnel dp
            ON o.delivery_person_id = dp.id

        WHERE o.id = %s
    """, (order_id,))

    order = cursor.fetchone()

    if not order:

        cursor.close()
        connection.close()

        return "Order not found.", 404


    # Get ordered products
    cursor.execute("""
        SELECT
            oi.id,
            oi.quantity,
            oi.unit_price,
            oi.buying_price,
            oi.subtotal,

            p.name AS product_name,
            p.image AS product_image

        FROM order_items oi

        JOIN products p
            ON oi.product_id = p.id

        WHERE oi.order_id = %s

        ORDER BY oi.id ASC
    """, (order_id,))

    items = cursor.fetchall()


    # Get active delivery personnel
    cursor.execute("""
        SELECT
            id,
            full_name,
            phone,
            district,
            town
        FROM delivery_personnel
        WHERE status = 'active'
        ORDER BY full_name ASC
    """)

    delivery_personnel = cursor.fetchall()


    # Allowed status transitions
    valid_transitions = {
        "NEW": [
            "CONFIRMED",
            "CANCELLED"
        ],

        "CONFIRMED": [
            "PREPARING",
            "CANCELLED"
        ],

        "PREPARING": [
            "ASSIGNED",
            "CANCELLED"
        ],

        "ASSIGNED": [
            "OUT FOR DELIVERY",
            "CANCELLED"
        ],

        "OUT FOR DELIVERY": [
            "DELIVERED"
        ],

        "DELIVERED": [],

        "CANCELLED": []
    }


    allowed_transitions = valid_transitions.get(
        order["status"],
        []
    )


    cursor.close()
    connection.close()


    return render_template(
        "admin/order_details.html",

        order=order,

        items=items,

        delivery_personnel=delivery_personnel,

        allowed_transitions=allowed_transitions
    )

@app.route(
    "/admin/orders/<int:order_id>/status",
    methods=["POST"]
)
def admin_update_order_status(order_id):

    if "admin_id" not in session:
        return redirect(url_for("admin_login"))

    new_status = request.form.get("status", "").strip()

    allowed_statuses = [
        "NEW",
        "CONFIRMED",
        "PREPARING",
        "ASSIGNED",
        "OUT FOR DELIVERY",
        "DELIVERED",
        "CANCELLED"
    ]

    if new_status not in allowed_statuses:
        return "Invalid order status.", 400

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:

        # Get current order
        cursor.execute("""
            SELECT
                id,
                status,
                delivery_person_id
            FROM orders
            WHERE id = %s
        """, (order_id,))

        order = cursor.fetchone()

        if not order:
            cursor.close()
            connection.close()
            return "Order not found.", 404

        current_status = order["status"]

        # -------------------------------------------------
        # VALID STATUS MOVEMENTS
        # -------------------------------------------------

        valid_transitions = {
            "NEW": ["CONFIRMED", "CANCELLED"],

            "CONFIRMED": [
                "PREPARING",
                "CANCELLED"
            ],

            "PREPARING": [
                "ASSIGNED",
                "CANCELLED"
            ],

            "ASSIGNED": [
                "OUT FOR DELIVERY",
                "CANCELLED"
            ],

            "OUT FOR DELIVERY": [
                "DELIVERED"
            ],

            "DELIVERED": [],

            "CANCELLED": []
        }

        # -------------------------------------------------
        # CHECK WHETHER TRANSITION IS ALLOWED
        # -------------------------------------------------

        if new_status == current_status:
            cursor.close()
            connection.close()

            return redirect(
                url_for(
                    "admin_order_details",
                    order_id=order_id
                )
            )

        if new_status not in valid_transitions.get(
            current_status,
            []
        ):
            cursor.close()
            connection.close()

            return (
                f"Cannot change order status from "
                f"{current_status} to {new_status}.",
                400
            )

        # -------------------------------------------------
        # DELIVERY PERSON CHECK
        # -------------------------------------------------

        if new_status == "OUT FOR DELIVERY":

            if not order["delivery_person_id"]:

                cursor.close()
                connection.close()

                return (
                    "You must assign a delivery person "
                    "before sending the order out for delivery.",
                    400
                )

        # -------------------------------------------------
        # UPDATE STATUS
        # -------------------------------------------------

        cursor.execute("""
            UPDATE orders
            SET status = %s
            WHERE id = %s
        """, (
            new_status,
            order_id
        ))

        connection.commit()

        cursor.close()
        connection.close()

        return redirect(
            url_for(
                "admin_order_details",
                order_id=order_id
            )
        )

    except Exception as e:

        connection.rollback()

        cursor.close()
        connection.close()

        return (
            f"Unable to update order status: {e}",
            500
        )

# =========================================================
# INVENTORY MANAGEMENT
# =========================================================


# ---------------------------------------------------------
# INVENTORY DASHBOARD
# ---------------------------------------------------------

@app.route("/admin/inventory")
def admin_inventory():

    if "admin_id" not in session:
        return redirect(
            url_for("admin_login")
        )

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    # Total products
    cursor.execute("""
        SELECT COUNT(*) AS total
        FROM products
    """)

    total_products = cursor.fetchone()["total"]

    # Low stock
    cursor.execute("""
        SELECT COUNT(*) AS total
        FROM products
        WHERE stock > 0
        AND stock <= 5
    """)

    low_stock = cursor.fetchone()["total"]

    # Out of stock
    cursor.execute("""
        SELECT COUNT(*) AS total
        FROM products
        WHERE stock = 0
    """)

    out_of_stock = cursor.fetchone()["total"]

    # Products
    cursor.execute("""
        SELECT
            products.id,
            products.name,
            products.buying_price,
            products.price,
            products.stock,
            categories.name AS category_name
        FROM products
        INNER JOIN categories
            ON products.category_id = categories.id
        ORDER BY products.stock ASC
    """)

    products = cursor.fetchall()

    cursor.close()
    connection.close()

    return render_template(
        "admin/inventory.html",
        total_products=total_products,
        low_stock=low_stock,
        out_of_stock=out_of_stock,
        products=products
    )


# =========================================================
# UPDATE STOCK
# =========================================================


@app.route(
    "/admin/inventory/update/<int:product_id>",
    methods=["GET", "POST"]
)
def admin_update_stock(product_id):

    if "admin_id" not in session:
        return redirect(
            url_for("admin_login")
        )

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            id,
            name,
            stock
        FROM products
        WHERE id = %s
    """, (product_id,))

    product = cursor.fetchone()

    if product is None:

        cursor.close()
        connection.close()

        return "Product not found.", 404

    if request.method == "POST":

        quantity_text = request.form.get(
            "quantity",
            ""
        ).strip()

        action = request.form.get(
            "action",
            ""
        ).strip()

        reason = request.form.get(
            "reason",
            ""
        ).strip()

        # -------------------------------------------------
        # Validate quantity
        # -------------------------------------------------

        try:

            quantity = int(
                quantity_text
            )

        except ValueError:

            cursor.close()
            connection.close()

            return render_template(
                "admin/update_stock.html",
                product=product,
                error="Please enter a valid quantity."
            )

        if quantity <= 0:

            cursor.close()
            connection.close()

            return render_template(
                "admin/update_stock.html",
                product=product,
                error=(
                    "Quantity must be greater than zero."
                )
            )

        # -------------------------------------------------
        # Validate reason
        # -------------------------------------------------

        if not reason:

            cursor.close()
            connection.close()

            return render_template(
                "admin/update_stock.html",
                product=product,
                error=(
                    "Please provide a reason "
                    "for the stock adjustment."
                )
            )

        stock_before = product["stock"]

        # -------------------------------------------------
        # ADD STOCK
        # -------------------------------------------------

        if action == "add":

            stock_after = (
                stock_before + quantity
            )

            adjustment_action = "ADD"

        # -------------------------------------------------
        # REMOVE STOCK
        # -------------------------------------------------

        elif action == "remove":

            stock_after = (
                stock_before - quantity
            )

            if stock_after < 0:

                cursor.close()
                connection.close()

                return render_template(
                    "admin/update_stock.html",
                    product=product,
                    error=(
                        f"You cannot remove {quantity} "
                        f"items. Only {stock_before} "
                        f"items are available."
                    )
                )

            adjustment_action = "REMOVE"

        else:

            cursor.close()
            connection.close()

            return render_template(
                "admin/update_stock.html",
                product=product,
                error="Invalid stock action."
            )

        # -------------------------------------------------
        # Save adjustment
        # -------------------------------------------------

        try:

            # Update product stock
            cursor.execute("""
                UPDATE products
                SET stock = %s
                WHERE id = %s
            """, (
                stock_after,
                product_id
            ))

            # Save history
            cursor.execute("""
                INSERT INTO stock_adjustments
                (
                    product_id,
                    admin_id,
                    action,
                    quantity,
                    stock_before,
                    stock_after,
                    reason
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )
            """, (
                product_id,
                session["admin_id"],
                adjustment_action,
                quantity,
                stock_before,
                stock_after,
                reason
            ))

            connection.commit()

        except Exception as e:

            connection.rollback()

            cursor.close()
            connection.close()

            return (
                f"Stock adjustment failed: {e}"
            ), 500

        cursor.close()
        connection.close()

        return redirect(
            url_for("admin_inventory")
        )

    cursor.close()
    connection.close()

    return render_template(
        "admin/update_stock.html",
        product=product
    )


# =========================================================
# STOCK ADJUSTMENT HISTORY
# =========================================================


@app.route("/admin/inventory/history")
def admin_stock_history():

    if "admin_id" not in session:
        return redirect(
            url_for("admin_login")
        )

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            stock_adjustments.id,

            products.name AS product_name,

            admins.username AS admin_username,

            stock_adjustments.action,

            stock_adjustments.quantity,

            stock_adjustments.stock_before,

            stock_adjustments.stock_after,

            stock_adjustments.reason,

            stock_adjustments.created_at

        FROM stock_adjustments

        INNER JOIN products
            ON stock_adjustments.product_id = products.id

        INNER JOIN admins
            ON stock_adjustments.admin_id = admins.id

        ORDER BY stock_adjustments.created_at DESC
    """)

    adjustments = cursor.fetchall()

    cursor.close()
    connection.close()

    return render_template(
        "admin/stock_history.html",
        adjustments=adjustments
    )


# =========================================================
# RUN APPLICATION
# =========================================================
@app.route("/admin/sales")
def admin_sales():

    if "admin_id" not in session:
        return redirect(url_for("admin_login"))

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    # -------------------------------------------------
    # TOTAL SALES
    # -------------------------------------------------

    cursor.execute("""
        SELECT
            COALESCE(SUM(order_items.subtotal), 0) AS total_sales
        FROM order_items
        INNER JOIN orders
            ON order_items.order_id = orders.id
        WHERE orders.status != 'CANCELLED'
    """)

    total_sales = cursor.fetchone()["total_sales"]


    # -------------------------------------------------
    # TOTAL COST
    # -------------------------------------------------

    cursor.execute("""
        SELECT
            COALESCE(
                SUM(order_items.buying_price * order_items.quantity),
                0
            ) AS total_cost
        FROM order_items
        INNER JOIN orders
            ON order_items.order_id = orders.id
        WHERE orders.status != 'CANCELLED'
    """)

    total_cost = cursor.fetchone()["total_cost"]


    # -------------------------------------------------
    # GROSS PROFIT
    # -------------------------------------------------

    gross_profit = total_sales - total_cost


    # -------------------------------------------------
    # TOTAL ORDERS
    # -------------------------------------------------

    cursor.execute("""
        SELECT COUNT(*) AS total_orders
        FROM orders
        WHERE status != 'CANCELLED'
    """)

    total_orders = cursor.fetchone()["total_orders"]


    # -------------------------------------------------
    # UNITS SOLD
    # -------------------------------------------------

    cursor.execute("""
        SELECT
            COALESCE(SUM(order_items.quantity), 0) AS units_sold
        FROM order_items
        INNER JOIN orders
            ON order_items.order_id = orders.id
        WHERE orders.status != 'CANCELLED'
    """)

    units_sold = cursor.fetchone()["units_sold"]


    # -------------------------------------------------
    # TODAY'S SALES
    # -------------------------------------------------

    cursor.execute("""
        SELECT
            COALESCE(SUM(order_items.subtotal), 0) AS today_sales
        FROM order_items
        INNER JOIN orders
            ON order_items.order_id = orders.id
        WHERE orders.status != 'CANCELLED'
        AND DATE(orders.created_at) = CURDATE()
    """)

    today_sales = cursor.fetchone()["today_sales"]


    # -------------------------------------------------
    # TODAY'S COST
    # -------------------------------------------------

    cursor.execute("""
        SELECT
            COALESCE(
                SUM(
                    order_items.buying_price *
                    order_items.quantity
                ),
                0
            ) AS today_cost
        FROM order_items
        INNER JOIN orders
            ON order_items.order_id = orders.id
        WHERE orders.status != 'CANCELLED'
        AND DATE(orders.created_at) = CURDATE()
    """)

    today_cost = cursor.fetchone()["today_cost"]


    # -------------------------------------------------
    # TODAY'S PROFIT
    # -------------------------------------------------

    today_profit = today_sales - today_cost


    # -------------------------------------------------
    # THIS MONTH'S SALES
    # -------------------------------------------------

    cursor.execute("""
        SELECT
            COALESCE(SUM(order_items.subtotal), 0)
            AS month_sales
        FROM order_items
        INNER JOIN orders
            ON order_items.order_id = orders.id
        WHERE orders.status != 'CANCELLED'
        AND YEAR(orders.created_at) = YEAR(CURDATE())
        AND MONTH(orders.created_at) = MONTH(CURDATE())
    """)

    month_sales = cursor.fetchone()["month_sales"]


    # -------------------------------------------------
    # THIS MONTH'S COST
    # -------------------------------------------------

    cursor.execute("""
        SELECT
            COALESCE(
                SUM(
                    order_items.buying_price *
                    order_items.quantity
                ),
                0
            ) AS month_cost
        FROM order_items
        INNER JOIN orders
            ON order_items.order_id = orders.id
        WHERE orders.status != 'CANCELLED'
        AND YEAR(orders.created_at) = YEAR(CURDATE())
        AND MONTH(orders.created_at) = MONTH(CURDATE())
    """)

    month_cost = cursor.fetchone()["month_cost"]


    # -------------------------------------------------
    # THIS MONTH'S PROFIT
    # -------------------------------------------------

    month_profit = month_sales - month_cost


    # -------------------------------------------------
    # SALES DETAILS
    # -------------------------------------------------

    cursor.execute("""
        SELECT

            orders.order_number,

            products.name AS product_name,

            order_items.quantity,

            order_items.unit_price,

            order_items.buying_price,

            order_items.subtotal AS sales_amount,

            (
                order_items.buying_price *
                order_items.quantity
            ) AS cost_amount,

            (
                order_items.subtotal -
                (
                    order_items.buying_price *
                    order_items.quantity
                )
            ) AS profit,

            orders.created_at

        FROM order_items

        INNER JOIN orders
            ON order_items.order_id = orders.id

        INNER JOIN products
            ON order_items.product_id = products.id

        WHERE orders.status != 'CANCELLED'

        ORDER BY orders.created_at DESC
    """)

    sales_details = cursor.fetchall()


    cursor.close()
    connection.close()


    return render_template(
        "admin/sales.html",

        total_sales=total_sales,

        total_cost=total_cost,

        gross_profit=gross_profit,

        total_orders=total_orders,

        units_sold=units_sold,

        today_sales=today_sales,

        today_profit=today_profit,

        month_sales=month_sales,

        month_profit=month_profit,

        sales_details=sales_details
    )
@app.route("/admin/customers")
def admin_customers():

    if "admin_id" not in session:
        return redirect(url_for("admin_login"))

    search = request.args.get("search", "").strip()

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    # ==========================================
    # TOTAL UNIQUE CUSTOMERS
    # ==========================================

    cursor.execute("""
        SELECT COUNT(DISTINCT phone) AS total
        FROM orders
    """)

    total_customers = cursor.fetchone()["total"]


    # ==========================================
    # CUSTOMERS WITH ORDERS
    # ==========================================

    cursor.execute("""
        SELECT COUNT(DISTINCT phone) AS total
        FROM orders
        WHERE status != 'CANCELLED'
    """)

    customers_with_orders = cursor.fetchone()["total"]


    # ==========================================
    # TOTAL ORDERS
    # ==========================================

    cursor.execute("""
        SELECT COUNT(*) AS total
        FROM orders
    """)

    total_orders = cursor.fetchone()["total"]


    # ==========================================
    # CUSTOMER LIST
    # ==========================================

    query = """
        SELECT

            customer_name,

            phone,

            MAX(district) AS district,

            MAX(town) AS town,

            COUNT(*) AS total_orders,

            COALESCE(
                SUM(
                    CASE
                        WHEN status != 'CANCELLED'
                        THEN total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_spent,

            MAX(created_at) AS last_order

        FROM orders

    """

    params = []


    # ==========================================
    # SEARCH
    # ==========================================

    if search:

        query += """
            WHERE
                customer_name LIKE %s
                OR phone LIKE %s
        """

        search_value = f"%{search}%"

        params.append(search_value)
        params.append(search_value)


    # ==========================================
    # GROUP CUSTOMERS
    # ==========================================

    query += """
        GROUP BY
            customer_name,
            phone

        ORDER BY
            last_order DESC
    """


    cursor.execute(query, params)

    customers = cursor.fetchall()


    cursor.close()
    connection.close()


    return render_template(
        "admin/customers.html",

        total_customers=total_customers,

        customers_with_orders=customers_with_orders,

        total_orders=total_orders,

        customers=customers,

        search=search
    )
@app.route(
    "/admin/orders/<int:order_id>/assign-delivery",
    methods=["POST"]
)
def admin_assign_delivery(order_id):

    if "admin_id" not in session:
        return redirect(url_for("admin_login"))

    delivery_person_id = request.form.get(
        "delivery_person_id",
        ""
    ).strip()

    if not delivery_person_id:
        return "Please select a delivery person.", 400

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:

        # -----------------------------------------------------
        # GET ORDER
        # -----------------------------------------------------

        cursor.execute("""
            SELECT
                id,
                status,
                delivery_person_id
            FROM orders
            WHERE id = %s
        """, (order_id,))

        order = cursor.fetchone()

        if not order:
            cursor.close()
            connection.close()
            return "Order not found.", 404


        # -----------------------------------------------------
        # CHECK ORDER STATUS
        # -----------------------------------------------------

        if order["status"] not in [
            "PREPARING",
            "ASSIGNED"
        ]:
            cursor.close()
            connection.close()

            return (
                "Delivery can only be assigned when "
                "the order is being prepared or already assigned.",
                400
            )


        # -----------------------------------------------------
        # CHECK DELIVERY PERSON
        # -----------------------------------------------------

        cursor.execute("""
            SELECT
                id,
                full_name,
                phone,
                status
            FROM delivery_personnel
            WHERE id = %s
        """, (delivery_person_id,))

        delivery_person = cursor.fetchone()

        if not delivery_person:
            cursor.close()
            connection.close()
            return "Delivery person not found.", 404


        if delivery_person["status"] != "active":
            cursor.close()
            connection.close()
            return "This delivery person is inactive.", 400


        # -----------------------------------------------------
        # ASSIGN DELIVERY PERSON
        # -----------------------------------------------------

        cursor.execute("""
            UPDATE orders
            SET
                delivery_person_id = %s,
                status = 'ASSIGNED'
            WHERE id = %s
        """, (
            delivery_person_id,
            order_id
        ))


        connection.commit()

        cursor.close()
        connection.close()


        return redirect(
            url_for(
                "admin_order_details",
                order_id=order_id
            )
        )


    except Exception as e:

        connection.rollback()

        cursor.close()
        connection.close()

        return (
            f"Unable to assign delivery person: {e}",
            500
        )
@app.route("/admin/customers/<path:phone>")
def admin_customer_details(phone):

    if "admin_id" not in session:
        return redirect(url_for("admin_login"))

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    # ==========================================
    # CUSTOMER INFORMATION
    # ==========================================

    cursor.execute("""
        SELECT

            customer_name,

            phone,

            MAX(district) AS district,

            MAX(town) AS town,

            COUNT(*) AS total_orders,

            COALESCE(
                SUM(
                    CASE
                        WHEN status != 'CANCELLED'
                        THEN total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_spent,

            MAX(created_at) AS last_order

        FROM orders

        WHERE phone = %s

        GROUP BY
            customer_name,
            phone

        ORDER BY
            last_order DESC

        LIMIT 1
    """, (phone,))

    customer = cursor.fetchone()


    # ==========================================
    # CUSTOMER NOT FOUND
    # ==========================================

    if customer is None:

        cursor.close()
        connection.close()

        return "Customer not found.", 404


    # ==========================================
    # CUSTOMER ORDERS
    # ==========================================

    cursor.execute("""
        SELECT

            id,

            order_number,

            total_amount,

            status,

            delivery_address,

            created_at

        FROM orders

        WHERE phone = %s

        ORDER BY created_at DESC
    """, (phone,))

    orders = cursor.fetchall()


    cursor.close()
    connection.close()


    return render_template(
        "admin/customer_details.html",

        customer=customer,

        orders=orders
    )
@app.route("/admin/deliveries")
def admin_deliveries():

    if "admin_id" not in session:
        return redirect(url_for("admin_login"))

    search = request.args.get("search", "").strip()
    status = request.args.get("status", "").strip()

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    # =========================================================
    # DELIVERY STATUSES
    # =========================================================

    statuses = [
        "NEW",
        "CONFIRMED",
        "PREPARING",
        "ASSIGNED",
        "OUT FOR DELIVERY",
        "DELIVERED"
    ]

    status_counts = {}

    for current_status in statuses:

        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM orders
            WHERE status = %s
        """, (current_status,))

        result = cursor.fetchone()

        status_counts[current_status] = result["total"]


    # =========================================================
    # GET DELIVERY ORDERS
    # =========================================================

    query = """
        SELECT
            o.id,
            o.order_number,
            o.customer_name,
            o.phone,
            o.district,
            o.town,
            o.delivery_address,
            o.additional_directions,
            o.total_amount,
            o.status,
            o.created_at,

            dp.full_name AS delivery_person_name,
            dp.phone AS delivery_person_phone

        FROM orders o

        LEFT JOIN delivery_personnel dp
            ON o.delivery_person_id = dp.id

        WHERE 1 = 1
    """

    params = []


    # =========================================================
    # SEARCH
    # =========================================================

    if search:

        query += """
            AND (
                o.order_number LIKE %s
                OR o.customer_name LIKE %s
                OR o.phone LIKE %s
            )
        """

        search_value = f"%{search}%"

        params.extend([
            search_value,
            search_value,
            search_value
        ])


    # =========================================================
    # STATUS FILTER
    # =========================================================

    if status:

        query += """
            AND o.status = %s
        """

        params.append(status)


    # =========================================================
    # ORDER RESULTS
    # =========================================================

    query += """
        ORDER BY o.created_at DESC
    """


    cursor.execute(query, params)

    deliveries = cursor.fetchall()


    # =========================================================
    # CLOSE DATABASE
    # =========================================================

    cursor.close()
    connection.close()


    # =========================================================
    # RENDER PAGE
    # =========================================================

    return render_template(
        "admin/deliveries.html",
        deliveries=deliveries,
        status_counts=status_counts,
        search=search,
        status=status
    )
# ==========================================================
# DELIVERY PERSONNEL MANAGEMENT
# ==========================================================

@app.route("/admin/delivery-personnel")
def admin_delivery_personnel():

    if "admin_id" not in session:
        return redirect(url_for("admin_login"))

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            dp.id,
            dp.full_name,
            dp.phone,
            dp.district,
            dp.town,
            dp.address,
            dp.status,
            dp.created_at,

            COUNT(
                CASE
                    WHEN o.status != 'CANCELLED'
                    THEN o.id
                END
            ) AS total_deliveries,

            COUNT(
                CASE
                    WHEN o.status = 'OUT FOR DELIVERY'
                    THEN o.id
                END
            ) AS active_deliveries,

            COUNT(
                CASE
                    WHEN o.status = 'DELIVERED'
                    THEN o.id
                END
            ) AS completed_deliveries

        FROM delivery_personnel dp

        LEFT JOIN orders o
            ON dp.id = o.delivery_person_id

        GROUP BY
            dp.id,
            dp.full_name,
            dp.phone,
            dp.district,
            dp.town,
            dp.address,
            dp.status,
            dp.created_at

        ORDER BY dp.full_name ASC
    """)

    personnel = cursor.fetchall()

    cursor.close()
    connection.close()

    return render_template(
        "admin/delivery_personnel.html",
        personnel=personnel
    )


# ==========================================================
# ADD DELIVERY PERSONNEL
# ==========================================================

@app.route("/admin/delivery-personnel/add", methods=["GET", "POST"])
def admin_add_delivery_person():

    if "admin_id" not in session:
        return redirect(url_for("admin_login"))

    if request.method == "POST":

        full_name = request.form.get(
            "full_name",
            ""
        ).strip()

        phone = request.form.get(
            "phone",
            ""
        ).strip()

        password = request.form.get(
            "password",
            ""
        )

        district = request.form.get(
            "district",
            ""
        ).strip()

        town = request.form.get(
            "town",
            ""
        ).strip()

        address = request.form.get(
            "address",
            ""
        ).strip()

        # -----------------------------------------
        # VALIDATION
        # -----------------------------------------

        if not full_name or not phone or not password:

            return render_template(
                "admin/add_delivery_person.html",
                error="Full name, phone number and password are required."
            )

        if len(password) < 6:

            return render_template(
                "admin/add_delivery_person.html",
                error="Password must be at least 6 characters long."
            )

        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        try:

            # -----------------------------------------
            # CHECK IF PHONE ALREADY EXISTS
            # -----------------------------------------

            cursor.execute("""
                SELECT id
                FROM delivery_personnel
                WHERE phone = %s
            """, (
                phone,
            ))

            existing_person = cursor.fetchone()

            if existing_person:

                return render_template(
                    "admin/add_delivery_person.html",
                    error="A delivery person with this phone number already exists."
                )

            # -----------------------------------------
            # HASH PASSWORD
            # -----------------------------------------

            password_hash = generate_password_hash(
                password
            )

            # -----------------------------------------
            # INSERT DELIVERY PERSON
            # -----------------------------------------

            cursor.execute("""
                INSERT INTO delivery_personnel (
                    full_name,
                    phone,
                    password,
                    district,
                    town,
                    address,
                    status
                )
                VALUES (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    'active'
                )
            """, (
                full_name,
                phone,
                password_hash,
                district,
                town,
                address
            ))

            connection.commit()

            return redirect(
                url_for("admin_delivery_personnel")
            )

        except Exception as e:

            connection.rollback()

            return render_template(
                "admin/add_delivery_person.html",
                error="Failed to add delivery person: " + str(e)
            )

        finally:

            cursor.close()
            connection.close()

    return render_template(
        "admin/add_delivery_person.html"
    )
# ==========================================================
# EDIT DELIVERY PERSONNEL
# ==========================================================

@app.route(
    "/admin/delivery-personnel/edit/<int:person_id>",
    methods=["GET", "POST"]
)
def admin_edit_delivery_person(person_id):

    if "admin_id" not in session:
        return redirect(url_for("admin_login"))

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT *
        FROM delivery_personnel
        WHERE id = %s
    """, (person_id,))

    person = cursor.fetchone()

    if not person:

        cursor.close()
        connection.close()

        return "Delivery person not found.", 404


    if request.method == "POST":

        full_name = request.form.get("full_name", "").strip()
        phone = request.form.get("phone", "").strip()
        district = request.form.get("district", "").strip()
        town = request.form.get("town", "").strip()
        address = request.form.get("address", "").strip()
        status = request.form.get("status", "").strip()

        if not full_name:

            cursor.close()
            connection.close()

            return render_template(
                "admin/edit_delivery_person.html",
                person=person,
                error="Full name is required."
            )

        if not phone:

            cursor.close()
            connection.close()

            return render_template(
                "admin/edit_delivery_person.html",
                person=person,
                error="Phone number is required."
            )

        if status not in ["active", "inactive"]:

            cursor.close()
            connection.close()

            return render_template(
                "admin/edit_delivery_person.html",
                person=person,
                error="Invalid personnel status."
            )


        # Check whether another person already uses the phone
        cursor.execute("""
            SELECT id
            FROM delivery_personnel
            WHERE phone = %s
            AND id != %s
        """, (phone, person_id))

        duplicate = cursor.fetchone()

        if duplicate:

            cursor.close()
            connection.close()

            return render_template(
                "admin/edit_delivery_person.html",
                person=person,
                error="Another delivery person already uses this phone number."
            )


        try:

            cursor.execute("""
                UPDATE delivery_personnel

                SET
                    full_name = %s,
                    phone = %s,
                    district = %s,
                    town = %s,
                    address = %s,
                    status = %s

                WHERE id = %s
            """, (
                full_name,
                phone,
                district,
                town,
                address,
                status,
                person_id
            ))

            connection.commit()

            cursor.close()
            connection.close()

            return redirect(
                url_for("admin_delivery_personnel")
            )

        except Exception as e:

            connection.rollback()

            cursor.close()
            connection.close()

            return render_template(
                "admin/edit_delivery_person.html",
                person=person,
                error=f"Unable to update delivery person: {e}"
            )


    cursor.close()
    connection.close()

    return render_template(
        "admin/edit_delivery_person.html",
        person=person
    )


# ==========================================================
# TOGGLE DELIVERY PERSONNEL STATUS
# ==========================================================

@app.route(
    "/admin/delivery-personnel/toggle/<int:person_id>"
)
def admin_toggle_delivery_person(person_id):

    if "admin_id" not in session:
        return redirect(url_for("admin_login"))

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT status
        FROM delivery_personnel
        WHERE id = %s
    """, (person_id,))

    person = cursor.fetchone()

    if not person:

        cursor.close()
        connection.close()

        return "Delivery person not found.", 404


    if person["status"] == "active":

        new_status = "inactive"

    else:

        new_status = "active"


    cursor.execute("""
        UPDATE delivery_personnel
        SET status = %s
        WHERE id = %s
    """, (
        new_status,
        person_id
    ))

    connection.commit()

    cursor.close()
    connection.close()

    return redirect(
        url_for("admin_delivery_personnel")
    )
@app.route("/delivery/login", methods=["GET", "POST"])
def delivery_login():

    if request.method == "POST":

        phone = request.form.get(
            "phone",
            ""
        ).strip()

        password = request.form.get(
            "password",
            ""
        )

        if not phone or not password:

            return render_template(
                "delivery/login.html",
                error="Phone number and password are required."
            )

        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        try:

            cursor.execute("""
                SELECT
                    id,
                    full_name,
                    phone,
                    password,
                    district,
                    town,
                    address,
                    status
                FROM delivery_personnel
                WHERE phone = %s
            """, (
                phone,
            ))

            person = cursor.fetchone()

        finally:

            cursor.close()
            connection.close()

        if person:

            # Check account status first
            if person["status"] != "active":

                return render_template(
                    "delivery/login.html",
                    error="Your delivery account is inactive."
                )

            # Verify hashed password
            if check_password_hash(
                person["password"],
                password
            ):

                session["delivery_id"] = person["id"]
                session["delivery_name"] = person["full_name"]
                session["delivery_phone"] = person["phone"]

                return redirect(
                    url_for("delivery_dashboard")
                )

        return render_template(
            "delivery/login.html",
            error="Invalid phone number or password."
        )

    return render_template(
        "delivery/login.html"
    )
# ============================================================
# DELIVERY PERSONNEL - DASHBOARD
# ============================================================

@app.route("/delivery/dashboard")
def delivery_dashboard():

    # Make sure delivery person is logged in
    if "delivery_person_id" not in session:
        return redirect(url_for("delivery_login"))

    delivery_person_id = session["delivery_person_id"]

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    # --------------------------------------------------------
    # TOTAL DELIVERIES
    # --------------------------------------------------------

    cursor.execute("""
        SELECT COUNT(*) AS total
        FROM orders
        WHERE delivery_person_id = %s
    """, (delivery_person_id,))

    total_deliveries = cursor.fetchone()["total"]

    # --------------------------------------------------------
    # ASSIGNED DELIVERIES
    # --------------------------------------------------------

    cursor.execute("""
        SELECT COUNT(*) AS total
        FROM orders
        WHERE delivery_person_id = %s
        AND status = 'ASSIGNED'
    """, (delivery_person_id,))

    assigned_count = cursor.fetchone()["total"]

    # --------------------------------------------------------
    # OUT FOR DELIVERY
    # --------------------------------------------------------

    cursor.execute("""
        SELECT COUNT(*) AS total
        FROM orders
        WHERE delivery_person_id = %s
        AND status = 'OUT FOR DELIVERY'
    """, (delivery_person_id,))

    out_for_delivery_count = cursor.fetchone()["total"]

    # --------------------------------------------------------
    # DELIVERED
    # --------------------------------------------------------

    cursor.execute("""
        SELECT COUNT(*) AS total
        FROM orders
        WHERE delivery_person_id = %s
        AND status = 'DELIVERED'
    """, (delivery_person_id,))

    delivered_count = cursor.fetchone()["total"]

    # --------------------------------------------------------
    # DELIVERY ORDERS
    # --------------------------------------------------------

    cursor.execute("""
        SELECT
            id,
            order_number,
            customer_name,
            phone,
            district,
            town,
            delivery_address,
            additional_directions,
            total_amount,
            status,
            created_at

        FROM orders

        WHERE delivery_person_id = %s

        ORDER BY created_at DESC
    """, (delivery_person_id,))

    deliveries = cursor.fetchall()

    cursor.close()
    connection.close()

    # --------------------------------------------------------
    # SEND DATA TO DASHBOARD
    # --------------------------------------------------------

    return render_template(
        "delivery/dashboard.html",
        total_deliveries=total_deliveries,
        assigned_count=assigned_count,
        out_for_delivery_count=out_for_delivery_count,
        delivered_count=delivered_count,
        deliveries=deliveries
    )
# ============================================================
# DELIVERY PERSONNEL - ORDER DETAILS
# ============================================================

@app.route("/delivery/orders/<int:order_id>")
def delivery_order_details(order_id):

    if "delivery_person_id" not in session:
        return redirect(url_for("delivery_login"))

    delivery_person_id = session["delivery_person_id"]

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    # Get only an order assigned to this delivery person
    cursor.execute("""
        SELECT
            o.id,
            o.order_number,
            o.customer_name,
            o.phone,
            o.district,
            o.town,
            o.delivery_address,
            o.additional_directions,
            o.total_amount,
            o.status,
            o.created_at,

            dp.full_name AS delivery_person_name,
            dp.phone AS delivery_person_phone

        FROM orders o

        LEFT JOIN delivery_personnel dp
            ON o.delivery_person_id = dp.id

        WHERE o.id = %s
        AND o.delivery_person_id = %s
    """, (order_id, delivery_person_id))

    order = cursor.fetchone()

    if not order:
        cursor.close()
        connection.close()

        return "Order not found or not assigned to you.", 404

    # Get products in this order
    cursor.execute("""
        SELECT
            oi.product_id,
            oi.quantity,
            oi.unit_price,
            oi.subtotal,
            p.name,
            p.image
        FROM order_items oi

        JOIN products p
            ON oi.product_id = p.id

        WHERE oi.order_id = %s
    """, (order_id,))

    items = cursor.fetchall()

    cursor.close()
    connection.close()

    return render_template(
        "delivery/order_details.html",
        order=order,
        items=items
    )


# ============================================================
# DELIVERY PERSONNEL - UPDATE ORDER STATUS
# ============================================================

@app.route(
    "/delivery/orders/<int:order_id>/status",
    methods=["POST"]
)
def delivery_update_order_status(order_id):

    if "delivery_person_id" not in session:
        return redirect(url_for("delivery_login"))

    delivery_person_id = session["delivery_person_id"]

    new_status = request.form.get("status", "").strip()

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    # Make sure this order belongs to this delivery person
    cursor.execute("""
        SELECT id, status
        FROM orders
        WHERE id = %s
        AND delivery_person_id = %s
    """, (order_id, delivery_person_id))

    order = cursor.fetchone()

    if not order:
        cursor.close()
        connection.close()

        return "Order not found or not assigned to you.", 404

    current_status = order["status"]

    # Only allow delivery personnel to perform these transitions
    valid_transitions = {
        "ASSIGNED": "OUT FOR DELIVERY",
        "OUT FOR DELIVERY": "DELIVERED"
    }

    if current_status not in valid_transitions:
        cursor.close()
        connection.close()

        return "This order cannot be updated at this stage.", 400

    expected_status = valid_transitions[current_status]

    if new_status != expected_status:
        cursor.close()
        connection.close()

        return "Invalid status update.", 400

    cursor.execute("""
        UPDATE orders
        SET status = %s
        WHERE id = %s
        AND delivery_person_id = %s
    """, (
        new_status,
        order_id,
        delivery_person_id
    ))

    connection.commit()

    cursor.close()
    connection.close()

    return redirect(
        url_for(
            "delivery_order_details",
            order_id=order_id
        )
    )
@app.route("/delivery/profile")
def delivery_profile():

    if "delivery_id" not in session:
        return redirect(
            url_for("delivery_login")
        )

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute("""
            SELECT
                id,
                full_name,
                phone,
                district,
                town,
                address,
                status
            FROM delivery_personnel
            WHERE id = %s
        """, (
            session["delivery_id"],
        ))

        person = cursor.fetchone()

    finally:

        cursor.close()
        connection.close()

    if not person:
        session.clear()

        return redirect(
            url_for("delivery_login")
        )

    return render_template(
        "delivery/profile.html",
        person=person
    )


@app.route(
    "/delivery/change-password",
    methods=["POST"]
)
def delivery_change_password():

    if "delivery_id" not in session:
        return redirect(
            url_for("delivery_login")
        )

    current_password = request.form.get(
        "current_password",
        ""
    )

    new_password = request.form.get(
        "new_password",
        ""
    )

    confirm_password = request.form.get(
        "confirm_password",
        ""
    )


    # ---------------------------------------------------------
    # VALIDATE EMPTY FIELDS
    # ---------------------------------------------------------

    if (
        not current_password
        or not new_password
        or not confirm_password
    ):

        return redirect(
            url_for(
                "delivery_profile",
                error="All password fields are required."
            )
        )


    # ---------------------------------------------------------
    # CHECK NEW PASSWORD LENGTH
    # ---------------------------------------------------------

    if len(new_password) < 6:

        return redirect(
            url_for(
                "delivery_profile",
                error="New password must contain at least 6 characters."
            )
        )


    # ---------------------------------------------------------
    # CONFIRM PASSWORD
    # ---------------------------------------------------------

    if new_password != confirm_password:

        return redirect(
            url_for(
                "delivery_profile",
                error="New passwords do not match."
            )
        )


    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute("""
            SELECT password
            FROM delivery_personnel
            WHERE id = %s
        """, (
            session["delivery_id"],
        ))

        person = cursor.fetchone()


        if not person:

            return redirect(
                url_for(
                    "delivery_login",
                    error="Delivery account was not found."
                )
            )


        # -----------------------------------------------------
        # VERIFY CURRENT PASSWORD
        # -----------------------------------------------------

        if not check_password_hash(
            person["password"],
            current_password
        ):

            return redirect(
                url_for(
                    "delivery_profile",
                    error="Current password is incorrect."
                )
            )


        # -----------------------------------------------------
        # PREVENT SAME PASSWORD
        # -----------------------------------------------------

        if check_password_hash(
            person["password"],
            new_password
        ):

            return redirect(
                url_for(
                    "delivery_profile",
                    error="New password must be different from your current password."
                )
            )


        # -----------------------------------------------------
        # HASH NEW PASSWORD
        # -----------------------------------------------------

        hashed_password = generate_password_hash(
            new_password
        )


        # -----------------------------------------------------
        # UPDATE DATABASE
        # -----------------------------------------------------

        cursor.execute("""
            UPDATE delivery_personnel
            SET password = %s
            WHERE id = %s
        """, (
            hashed_password,
            session["delivery_id"]
        ))

        connection.commit()


    except Exception:

        connection.rollback()

        return redirect(
            url_for(
                "delivery_profile",
                error="Unable to change password. Please try again."
            )
        )

    finally:

        cursor.close()
        connection.close()


    return redirect(
        url_for(
            "delivery_profile",
            success="Password changed successfully."
        )
    )


@app.route("/delivery/logout")
def delivery_logout():

    session.pop(
        "delivery_id",
        None
    )

    session.pop(
        "delivery_name",
        None
    )

    session.pop(
        "delivery_phone",
        None
    )

    return redirect(
        url_for("delivery_login")
    )
@app.route("/category/<int:category_id>")
def category_products(category_id):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    # Get the selected category
    cursor.execute("""
        SELECT
            id,
            name,
            description,
            image
        FROM categories
        WHERE id = %s
    """, (category_id,))

    category = cursor.fetchone()

    if not category:
        cursor.close()
        connection.close()
        return "Category not found.", 404

    # Get products belonging to this category
    cursor.execute("""
        SELECT
            p.id,
            p.name,
            p.description,
            p.price,
            p.stock,
            p.image,

            c.name AS category_name

        FROM products p

        JOIN categories c
            ON p.category_id = c.id

        WHERE p.category_id = %s
        AND p.status = 'active'

        ORDER BY p.created_at DESC
    """, (category_id,))

    products = cursor.fetchall()

    cursor.close()
    connection.close()

    return render_template(
        "category_products.html",
        category=category,
        products=products
    )
@app.route("/update-cart/<int:product_id>", methods=["POST"])
def update_cart(product_id):

    cart = session.get("cart", {})

    if str(product_id) not in cart:
        return redirect(url_for("cart"))

    try:
        quantity = int(request.form.get("quantity", 1))
    except (TypeError, ValueError):
        quantity = 1

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, stock
        FROM products
        WHERE id = %s
        AND status = 'active'
    """, (product_id,))

    product = cursor.fetchone()

    cursor.close()
    connection.close()

    if not product or product["stock"] <= 0:
        cart.pop(str(product_id), None)

    else:

        if quantity < 1:
            cart.pop(str(product_id), None)

        else:
            quantity = min(quantity, product["stock"])
            cart[str(product_id)] = quantity

    session["cart"] = cart
    session.modified = True

    return redirect(url_for("cart"))
@app.route("/about")
def about():

    return render_template(
        "about.html"
    )


@app.route("/contact", methods=["GET", "POST"])
def contact():

    if request.method == "POST":

        name = request.form.get(
            "name",
            ""
        ).strip()

        phone = request.form.get(
            "phone",
            ""
        ).strip()

        email = request.form.get(
            "email",
            ""
        ).strip()

        subject = request.form.get(
            "subject",
            ""
        ).strip()

        order_number = request.form.get(
            "order_number",
            ""
        ).strip()

        message = request.form.get(
            "message",
            ""
        ).strip()

        # For now, display the submitted information.
        # We can connect this to WhatsApp/email later.

        return render_template(
            "contact.html",
            success=True,
            name=name,
            phone=phone,
            email=email,
            subject=subject,
            order_number=order_number,
            message=message
        )

    return render_template(
        "contact.html"
    )


@app.route("/faq")
def faq():

    return render_template(
        "faq.html"
    )


@app.route("/privacy")
def privacy():

    return render_template(
        "privacy.html"
    )


@app.route("/terms")
def terms():

    return render_template(
        "terms.html"
    )


@app.errorhandler(404)
def page_not_found(error):

    return render_template(
        "404.html"
    ), 404

if __name__ == "__main__":
    app.run(debug=False)