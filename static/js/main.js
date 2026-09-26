// =========================================================
// SMARTMART GLOBAL JAVASCRIPT
// =========================================================


document.addEventListener("DOMContentLoaded", function () {

    console.log(
        "SmartMart JavaScript loaded successfully."
    );


    // =====================================================
    // CUSTOMER FEATURES
    // =====================================================

    initProductSearch();

    initQuantityControls();

    initCartActions();

    initCheckoutForm();

    initOrderConfirmation();

    initTrackOrder();

    initOrderTracking();
    initAdminEditProduct();
    initAdminInventory();
    initAdminUpdateStock();
    initAdminStockHistory();
    initAdminOrders();
    // =====================================================
    // ADMIN FEATURES
    // =====================================================

    initAdminDashboard();

    initAdminProducts();

    initAdminAddProduct();
    initAdminSales();
    initAdminOrderDetails();
    initDeliveryDashboard();
    initDeliveryOrderDetails();
    initDeliveryProfile();
    initAdminDeliveryPersonnel();
    initAdminAddDeliveryPerson();
    initAdminEditDeliveryPerson();
    initAdminCustomers();
    initAdminCustomerDetails();

    initAdminDeliveries();
});



// =========================================================
// PRODUCT SEARCH
// =========================================================

function initProductSearch() {

    const searchInput =
        document.getElementById("productSearch");


    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        searchProducts
    );

}



// =========================================================
// SEARCH PRODUCTS
// =========================================================

function searchProducts() {

    const searchInput =
        document.getElementById("productSearch");


    const productCards =
        document.querySelectorAll(".product-card");


    const noProducts =
        document.getElementById("noProducts");


    if (!searchInput || !noProducts) {
        return;
    }


    const searchValue =
        searchInput.value
            .toLowerCase()
            .trim();


    let visibleProducts = 0;


    productCards.forEach(function (card) {

        const productName =
            (card.dataset.name || "")
                .toLowerCase();


        const productCategory =
            (card.dataset.category || "")
                .toLowerCase();


        if (
            productName.includes(searchValue) ||
            productCategory.includes(searchValue)
        ) {

            card.style.display = "";

            visibleProducts++;

        } else {

            card.style.display = "none";

        }

    });


    if (visibleProducts === 0) {

        noProducts.style.display = "block";

    } else {

        noProducts.style.display = "none";

    }

}



// =========================================================
// PRODUCT QUANTITY CONTROLS
// =========================================================

function initQuantityControls() {

    const quantityInput =
        document.getElementById("quantity");


    const increaseButton =
        document.getElementById("increaseQuantity");


    const decreaseButton =
        document.getElementById("decreaseQuantity");


    if (
        !quantityInput ||
        !increaseButton ||
        !decreaseButton
    ) {
        return;
    }


    const maximumQuantity =
        parseInt(quantityInput.max);


    increaseButton.addEventListener(
        "click",
        function () {

            let quantity =
                parseInt(quantityInput.value);


            if (isNaN(quantity)) {

                quantity = 1;

            }


            if (
                !isNaN(maximumQuantity) &&
                quantity < maximumQuantity
            ) {

                quantity++;

            }


            quantityInput.value =
                quantity;

        }
    );


    decreaseButton.addEventListener(
        "click",
        function () {

            let quantity =
                parseInt(quantityInput.value);


            if (isNaN(quantity)) {

                quantity = 1;

            }


            if (quantity > 1) {

                quantity--;

            }


            quantityInput.value =
                quantity;

        }
    );


    quantityInput.addEventListener(
        "change",
        function () {

            let quantity =
                parseInt(quantityInput.value);


            if (
                isNaN(quantity) ||
                quantity < 1
            ) {

                quantityInput.value =
                    1;

                return;

            }


            if (
                !isNaN(maximumQuantity) &&
                quantity > maximumQuantity
            ) {

                quantityInput.value =
                    maximumQuantity;

            }

        }
    );

}



// =========================================================
// CART ACTIONS
// =========================================================

function initCartActions() {

    initRemoveButtons();

    initClearCartButton();

    initCheckoutButton();

}



// =========================================================
// REMOVE FROM CART
// =========================================================

function initRemoveButtons() {

    const removeButtons =
        document.querySelectorAll(
            ".cart-remove-btn"
        );


    if (removeButtons.length === 0) {
        return;
    }


    removeButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function (event) {

                const productName =
                    button.dataset.productName ||
                    "this product";


                const confirmed =
                    confirm(
                        "Are you sure you want to remove " +
                        productName +
                        " from your cart?"
                    );


                if (!confirmed) {

                    event.preventDefault();

                    return;

                }


                button.style.pointerEvents =
                    "none";

                button.style.opacity =
                    "0.7";

                button.textContent =
                    "Removing...";

            }
        );

    });

}



// =========================================================
// CLEAR CART
// =========================================================

function initClearCartButton() {

    const clearCartButton =
        document.getElementById(
            "clearCartButton"
        );


    if (!clearCartButton) {
        return;
    }


    clearCartButton.addEventListener(
        "click",
        function (event) {

            const confirmed =
                confirm(
                    "Are you sure you want to clear your entire cart?"
                );


            if (!confirmed) {

                event.preventDefault();

                return;

            }


            clearCartButton.textContent =
                "Clearing Cart...";


            clearCartButton.style.pointerEvents =
                "none";

            clearCartButton.style.opacity =
                "0.7";

        }
    );

}



// =========================================================
// CART CHECKOUT BUTTON
// =========================================================

function initCheckoutButton() {

    const checkoutButton =
        document.getElementById(
            "checkoutButton"
        );


    if (!checkoutButton) {
        return;
    }


    checkoutButton.addEventListener(
        "click",
        function () {

            checkoutButton.style.pointerEvents =
                "none";

            checkoutButton.style.opacity =
                "0.7";


            const buttonText =
                checkoutButton.querySelector(
                    "span"
                );


            if (buttonText) {

                buttonText.textContent =
                    "Opening Checkout...";

            }

        }
    );

}



// =========================================================
// CHECKOUT FORM
// =========================================================

function initCheckoutForm() {

    const checkoutForm =
        document.getElementById(
            "checkoutForm"
        );


    if (!checkoutForm) {
        return;
    }


    const customerName =
        document.getElementById(
            "customer_name"
        );


    const phone =
        document.getElementById(
            "phone"
        );


    const district =
        document.getElementById(
            "district"
        );


    const town =
        document.getElementById(
            "town"
        );


    const deliveryAddress =
        document.getElementById(
            "delivery_address"
        );


    const placeOrderButton =
        document.getElementById(
            "placeOrderButton"
        );


    const placeOrderText =
        document.getElementById(
            "placeOrderText"
        );


    const formError =
        document.getElementById(
            "checkoutFormError"
        );


    checkoutForm.addEventListener(
        "submit",
        function (event) {

            clearCheckoutErrors();


            let formIsValid =
                true;


            // =============================================
            // CUSTOMER NAME
            // =============================================

            if (
                !customerName ||
                customerName.value.trim().length < 2
            ) {

                showCheckoutError(
                    "customer_name",
                    "Please enter your full name."
                );

                formIsValid =
                    false;

            }


            // =============================================
            // PHONE
            // =============================================

            if (phone) {

                const phoneValue =
                    phone.value.trim();


                if (
                    !isValidUgandaPhone(
                        phoneValue
                    )
                ) {

                    showCheckoutError(
                        "phone",
                        "Please enter a valid Ugandan phone number."
                    );

                    formIsValid =
                        false;

                }

            }


            // =============================================
            // DISTRICT
            // =============================================

            if (
                !district ||
                district.value.trim().length < 2
            ) {

                showCheckoutError(
                    "district",
                    "Please enter your district."
                );

                formIsValid =
                    false;

            }


            // =============================================
            // TOWN
            // =============================================

            if (
                !town ||
                town.value.trim().length < 2
            ) {

                showCheckoutError(
                    "town",
                    "Please enter your town or city."
                );

                formIsValid =
                    false;

            }


            // =============================================
            // DELIVERY ADDRESS
            // =============================================

            if (
                !deliveryAddress ||
                deliveryAddress.value.trim().length < 5
            ) {

                showCheckoutError(
                    "delivery_address",
                    "Please enter a more detailed delivery address."
                );

                formIsValid =
                    false;

            }


            // =============================================
            // STOP SUBMISSION IF INVALID
            // =============================================

            if (!formIsValid) {

                event.preventDefault();


                if (formError) {

                    formError.textContent =
                        "Please correct the highlighted information before placing your order.";

                    formError.style.display =
                        "block";

                }


                const firstError =
                    checkoutForm.querySelector(
                        ".checkout-input.error, .checkout-textarea.error"
                    );


                if (firstError) {

                    firstError.focus();

                }


                return;

            }


            // =============================================
            // PREVENT DOUBLE SUBMISSION
            // =============================================

            if (placeOrderButton) {

                placeOrderButton.disabled =
                    true;

                placeOrderButton.style.opacity =
                    "0.7";

                placeOrderButton.style.cursor =
                    "not-allowed";

            }


            if (placeOrderText) {

                placeOrderText.textContent =
                    "Placing Order...";

            }

        }
    );

}



// =========================================================
// UGANDA PHONE VALIDATION
// =========================================================

function isValidUgandaPhone(phone) {

    const cleanedPhone =
        phone.replace(
            /[\s\-()]/g,
            ""
        );


    const ugandaPhonePattern =
        /^(?:0|256|\+256)(7|3)\d{8}$/;


    return ugandaPhonePattern.test(
        cleanedPhone
    );

}



// =========================================================
// SHOW CHECKOUT ERROR
// =========================================================

function showCheckoutError(
    fieldName,
    message
) {

    const field =
        document.getElementById(
            fieldName
        );


    if (!field) {
        return;
    }


    field.classList.add(
        "error"
    );


    const errorElement =
        document.getElementById(
            getErrorElementId(
                fieldName
            )
        );


    if (errorElement) {

        errorElement.textContent =
            message;

        errorElement.style.display =
            "block";

    }

}



// =========================================================
// CHECKOUT ERROR ELEMENT
// =========================================================

function getErrorElementId(
    fieldName
) {

    const errorMap = {

        customer_name:
            "customerNameError",

        phone:
            "phoneError",

        district:
            "districtError",

        town:
            "townError",

        delivery_address:
            "deliveryAddressError"

    };


    return errorMap[fieldName] || "";

}



// =========================================================
// CLEAR CHECKOUT ERRORS
// =========================================================

function clearCheckoutErrors() {

    const fields =
        document.querySelectorAll(
            "#checkoutForm .checkout-input, " +
            "#checkoutForm .checkout-textarea"
        );


    fields.forEach(function (field) {

        field.classList.remove(
            "error"
        );

    });


    const errors =
        document.querySelectorAll(
            "#checkoutForm .checkout-validation-error"
        );


    errors.forEach(function (error) {

        error.textContent =
            "";

        error.style.display =
            "none";

    });


    const formError =
        document.getElementById(
            "checkoutFormError"
        );


    if (formError) {

        formError.textContent =
            "";

        formError.style.display =
            "none";

    }

}



// =========================================================
// ORDER CONFIRMATION
// =========================================================

function initOrderConfirmation() {

    initCopyOrderNumber();

    initWhatsAppButton();

    initConfirmationTrackButton();

}



// =========================================================
// COPY ORDER NUMBER
// =========================================================

function initCopyOrderNumber() {

    const copyButton =
        document.getElementById(
            "copyOrderNumber"
        );


    const orderNumber =
        document.getElementById(
            "orderNumber"
        );


    const copyMessage =
        document.getElementById(
            "copyOrderMessage"
        );


    if (
        !copyButton ||
        !orderNumber
    ) {
        return;
    }


    copyButton.addEventListener(
        "click",
        function () {

            const orderText =
                orderNumber.textContent.trim();


            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {

                navigator.clipboard.writeText(
                    orderText
                )
                .then(function () {

                    showCopiedMessage();

                })
                .catch(function () {

                    fallbackCopyOrderNumber(
                        orderText
                    );

                });

            } else {

                fallbackCopyOrderNumber(
                    orderText
                );

            }

        }
    );


    function showCopiedMessage() {

        copyButton.textContent =
            "✓ Copied";

        copyButton.classList.add(
            "copied"
        );


        if (copyMessage) {

            copyMessage.textContent =
                "Order number copied successfully.";

            copyMessage.classList.add(
                "success"
            );

        }


        setTimeout(function () {

            copyButton.textContent =
                "📋 Copy";

            copyButton.classList.remove(
                "copied"
            );


            if (copyMessage) {

                copyMessage.textContent =
                    "Keep this number safe. You can use it to track your order.";

                copyMessage.classList.remove(
                    "success"
                );

            }

        }, 2500);

    }

}



// =========================================================
// FALLBACK COPY
// =========================================================

function fallbackCopyOrderNumber(text) {

    const temporaryInput =
        document.createElement(
            "input"
        );


    temporaryInput.value =
        text;


    document.body.appendChild(
        temporaryInput
    );


    temporaryInput.select();


    try {

        document.execCommand(
            "copy"
        );


        const copyButton =
            document.getElementById(
                "copyOrderNumber"
            );


        const copyMessage =
            document.getElementById(
                "copyOrderMessage"
            );


        if (copyButton) {

            copyButton.textContent =
                "✓ Copied";

            copyButton.classList.add(
                "copied"
            );

        }


        if (copyMessage) {

            copyMessage.textContent =
                "Order number copied successfully.";

            copyMessage.classList.add(
                "success"
            );

        }

    } catch (error) {

        alert(
            "Unable to copy the order number. Please copy it manually."
        );

    }


    document.body.removeChild(
        temporaryInput
    );

}



// =========================================================
// WHATSAPP BUTTON
// =========================================================

function initWhatsAppButton() {

    const whatsappButton =
        document.getElementById(
            "whatsappOrderButton"
        );


    if (!whatsappButton) {
        return;
    }


    whatsappButton.addEventListener(
        "click",
        function () {

            const originalText =
                whatsappButton.innerHTML;


            whatsappButton.innerHTML =
                "💬 Opening WhatsApp...";


            whatsappButton.style.opacity =
                "0.75";


            setTimeout(function () {

                whatsappButton.innerHTML =
                    originalText;

                whatsappButton.style.opacity =
                    "";

            }, 3000);

        }
    );

}



// =========================================================
// CONFIRMATION TRACK BUTTON
// =========================================================

function initConfirmationTrackButton() {

    const trackButton =
        document.getElementById(
            "trackOrderButton"
        );


    if (!trackButton) {
        return;
    }


    trackButton.addEventListener(
        "click",
        function () {

            trackButton.style.opacity =
                "0.7";

            trackButton.style.pointerEvents =
                "none";


            trackButton.innerHTML =
                "🔍 Opening Order Tracking...";

        }
    );

}



// =========================================================
// TRACK ORDER PAGE
// =========================================================

function initTrackOrder() {

    const trackForm =
        document.getElementById(
            "trackOrderForm"
        );


    if (!trackForm) {
        return;
    }


    const orderInput =
        document.getElementById(
            "order_number"
        );


    const trackButton =
        document.getElementById(
            "trackOrderButton"
        );


    const trackOrderIcon =
        document.getElementById(
            "trackOrderIcon"
        );


    const trackOrderText =
        document.getElementById(
            "trackOrderText"
        );


    const inputError =
        document.getElementById(
            "trackOrderInputError"
        );


    if (orderInput) {

        orderInput.addEventListener(
            "input",
            function () {

                let value =
                    orderInput.value
                        .toUpperCase()
                        .replace(/\s/g, "");


                orderInput.value =
                    value;


                if (inputError) {

                    inputError.textContent =
                        "";

                    inputError.style.display =
                        "none";

                }


                orderInput.classList.remove(
                    "error"
                );

            }
        );

    }


    trackForm.addEventListener(
        "submit",
        function (event) {

            if (!orderInput) {
                return;
            }


            const orderNumber =
                orderInput.value
                    .trim()
                    .toUpperCase();


            orderInput.value =
                orderNumber;


            if (!orderNumber) {

                event.preventDefault();

                showTrackOrderError(
                    "Please enter your order number."
                );

                orderInput.focus();

                return;

            }


            const orderNumberPattern =
                /^SM-[A-Z0-9]+$/;


            if (
                !orderNumberPattern.test(
                    orderNumber
                )
            ) {

                event.preventDefault();

                showTrackOrderError(
                    "Please enter a valid SmartMart order number, for example SM-8F42A91C."
                );

                orderInput.focus();

                return;

            }


            if (trackButton) {

                trackButton.disabled =
                    true;

                trackButton.style.opacity =
                    "0.7";

                trackButton.style.cursor =
                    "not-allowed";

            }


            if (trackOrderIcon) {

                trackOrderIcon.textContent =
                    "⏳";

            }


            if (trackOrderText) {

                trackOrderText.textContent =
                    "Searching for Order...";

            }

        }
    );


    function showTrackOrderError(
        message
    ) {

        if (!inputError) {
            return;
        }


        inputError.textContent =
            message;


        inputError.style.display =
            "block";


        orderInput.classList.add(
            "error"
        );

    }

}



// =========================================================
// ORDER TRACKING PAGE
// =========================================================

function initOrderTracking() {

    const trackingSearchForm =
        document.getElementById(
            "trackingSearchForm"
        );


    const progressWrapper =
        document.querySelector(
            ".tracking-progress-wrapper"
        );


    const anotherOrderButton =
        document.getElementById(
            "trackingAnotherOrderButton"
        );


    const continueShoppingButton =
        document.getElementById(
            "trackingContinueShoppingButton"
        );


    // =====================================================
    // SEARCH
    // =====================================================

    if (trackingSearchForm) {

        const searchInput =
            document.getElementById(
                "trackingSearchInput"
            );


        const searchButton =
            document.getElementById(
                "trackingSearchButton"
            );


        const searchIcon =
            document.getElementById(
                "trackingSearchIcon"
            );


        const searchText =
            document.getElementById(
                "trackingSearchText"
            );


        const searchError =
            document.getElementById(
                "trackingSearchError"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                function () {

                    searchInput.value =
                        searchInput.value
                            .toUpperCase()
                            .replace(/\s/g, "");


                    searchInput.classList.remove(
                        "error"
                    );


                    if (searchError) {

                        searchError.textContent =
                            "";

                        searchError.style.display =
                            "none";

                    }

                }
            );

        }


        trackingSearchForm.addEventListener(
            "submit",
            function (event) {

                if (!searchInput) {
                    return;
                }


                const orderNumber =
                    searchInput.value
                        .trim()
                        .toUpperCase();


                searchInput.value =
                    orderNumber;


                if (!orderNumber) {

                    event.preventDefault();

                    showTrackingSearchError(
                        "Please enter your SmartMart order number."
                    );

                    searchInput.focus();

                    return;

                }


                const orderNumberPattern =
                    /^SM-[A-Z0-9]+$/;


                if (
                    !orderNumberPattern.test(
                        orderNumber
                    )
                ) {

                    event.preventDefault();

                    showTrackingSearchError(
                        "Please enter a valid SmartMart order number, for example SM-A82F91C4."
                    );

                    searchInput.focus();

                    return;

                }


                if (searchButton) {

                    searchButton.disabled =
                        true;

                    searchButton.style.opacity =
                        "0.7";

                    searchButton.style.cursor =
                        "not-allowed";

                }


                if (searchIcon) {

                    searchIcon.textContent =
                        "⏳";

                }


                if (searchText) {

                    searchText.textContent =
                        "Searching...";

                }

            }
        );


        function showTrackingSearchError(
            message
        ) {

            if (!searchError) {
                return;
            }


            searchError.textContent =
                message;


            searchError.style.display =
                "block";


            searchInput.classList.add(
                "error"
            );

        }

    }



    // =====================================================
    // CURRENT PROGRESS STEP
    // =====================================================

    if (progressWrapper) {

        const currentStep =
            parseInt(
                progressWrapper.dataset.currentStep
            );


        if (!isNaN(currentStep)) {

            const steps =
                document.querySelectorAll(
                    ".tracking-step"
                );


            steps.forEach(function (step) {

                const stepNumber =
                    parseInt(
                        step.dataset.step
                    );


                if (
                    stepNumber === currentStep
                ) {

                    step.classList.add(
                        "current"
                    );

                }

            });

        }

    }



    // =====================================================
    // TRACK ANOTHER ORDER
    // =====================================================

    if (anotherOrderButton) {

        anotherOrderButton.addEventListener(
            "click",
            function () {

                anotherOrderButton.style.opacity =
                    "0.7";

                anotherOrderButton.style.pointerEvents =
                    "none";


                const text =
                    document.getElementById(
                        "trackingAnotherOrderText"
                    );


                if (text) {

                    text.textContent =
                        "Opening Tracking...";

                }

            }
        );

    }



    // =====================================================
    // CONTINUE SHOPPING
    // =====================================================

    if (continueShoppingButton) {

        continueShoppingButton.addEventListener(
            "click",
            function () {

                continueShoppingButton.style.opacity =
                    "0.7";

                continueShoppingButton.style.pointerEvents =
                    "none";


                const text =
                    document.getElementById(
                        "trackingContinueShoppingText"
                    );


                if (text) {

                    text.textContent =
                        "Opening SmartMart...";

                }

            }
        );

    }

}



// =========================================================
// ADMIN DASHBOARD
// =========================================================

function initAdminDashboard() {

    const adminDashboard =
        document.querySelector(
            ".smart-admin-dashboard"
        );


    if (!adminDashboard) {
        return;
    }


    initAdminStatCounters();

    initAdminLogout();

    initAdminNavigation();

}



// =========================================================
// ADMIN STAT COUNTERS
// =========================================================

function initAdminStatCounters() {

    const statValues =
        document.querySelectorAll(
            "[data-stat-value]"
        );


    statValues.forEach(function (element) {

        const target =
            parseInt(
                element.dataset.statValue
            );


        if (
            isNaN(target) ||
            target < 0
        ) {

            element.textContent =
                "0";

            return;

        }


        animateNumber(
            element,
            target,
            700
        );

    });


    const salesElement =
        document.querySelector(
            "[data-stat-sales]"
        );


    if (salesElement) {

        const salesTarget =
            parseFloat(
                salesElement.dataset.statSales
            );


        if (
            !isNaN(salesTarget) &&
            salesTarget >= 0
        ) {

            animateSalesNumber(
                salesElement,
                salesTarget,
                900
            );

        }

    }

}



// =========================================================
// ANIMATE INTEGER
// =========================================================

function animateNumber(
    element,
    target,
    duration
) {

    const startTime =
        performance.now();


    function update(currentTime) {

        const elapsed =
            currentTime - startTime;


        const progress =
            Math.min(
                elapsed / duration,
                1
            );


        const easedProgress =
            1 - Math.pow(
                1 - progress,
                3
            );


        const currentValue =
            Math.floor(
                target * easedProgress
            );


        element.textContent =
            currentValue.toLocaleString();


        if (progress < 1) {

            requestAnimationFrame(
                update
            );

        } else {

            element.textContent =
                target.toLocaleString();

        }

    }


    requestAnimationFrame(
        update
    );

}



// =========================================================
// ANIMATE SALES
// =========================================================

function animateSalesNumber(
    element,
    target,
    duration
) {

    const startTime =
        performance.now();


    function update(currentTime) {

        const elapsed =
            currentTime - startTime;


        const progress =
            Math.min(
                elapsed / duration,
                1
            );


        const easedProgress =
            1 - Math.pow(
                1 - progress,
                3
            );


        const currentValue =
            target * easedProgress;


        element.textContent =
            "UGX " +
            Math.floor(
                currentValue
            ).toLocaleString();


        if (progress < 1) {

            requestAnimationFrame(
                update
            );

        } else {

            element.textContent =
                "UGX " +
                target.toLocaleString();

        }

    }


    requestAnimationFrame(
        update
    );

}



// =========================================================
// ADMIN LOGOUT
// =========================================================

function initAdminLogout() {

    const logoutButton =
        document.getElementById(
            "adminLogoutButton"
        );


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        function (event) {

            const confirmed =
                confirm(
                    "Are you sure you want to log out of SmartMart Administration?"
                );


            if (!confirmed) {

                event.preventDefault();

                return;

            }


            logoutButton.style.pointerEvents =
                "none";

            logoutButton.style.opacity =
                "0.7";


            const logoutText =
                document.getElementById(
                    "adminLogoutText"
                );


            if (logoutText) {

                logoutText.textContent =
                    "Logging out...";

            }

        }
    );

}



// =========================================================
// ADMIN NAVIGATION
// =========================================================

function initAdminNavigation() {

    const dashboardLinks =
        document.querySelectorAll(
            ".admin-dashboard-link"
        );


    if (dashboardLinks.length === 0) {
        return;
    }


    dashboardLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                if (
                    link.dataset.loading === "true"
                ) {

                    return;

                }


                link.dataset.loading =
                    "true";


                link.classList.add(
                    "admin-link-loading"
                );


                const originalText =
                    link.textContent.trim();


                link.dataset.originalText =
                    originalText;


                if (
                    !link.textContent
                        .toLowerCase()
                        .includes("loading")
                ) {

                    link.textContent =
                        "⏳ Loading...";

                }

            }
        );

    });

}



// =========================================================
// ADMIN PRODUCT MANAGEMENT
// =========================================================

function initAdminProducts() {

    const productSection =
        document.querySelector(
            ".smart-admin-products-section"
        );


    if (!productSection) {
        return;
    }


    const toggleButtons =
        productSection.querySelectorAll(
            "[data-product-action]"
        );


    if (toggleButtons.length === 0) {
        return;
    }


    toggleButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function (event) {

                const productName =
                    button.dataset.productName ||
                    "this product";


                const action =
                    button.dataset.productAction ||
                    "";


                let confirmationMessage =
                    "";


                // =========================================
                // DEACTIVATE
                // =========================================

                if (
                    action === "deactivate"
                ) {

                    confirmationMessage =
                        "Are you sure you want to deactivate " +
                        productName +
                        "?";

                }


                // =========================================
                // ACTIVATE
                // =========================================

                else if (
                    action === "activate"
                ) {

                    confirmationMessage =
                        "Are you sure you want to activate " +
                        productName +
                        "?";

                }


                // =========================================
                // UNKNOWN ACTION
                // =========================================

                else {

                    return;

                }


                // =========================================
                // CONFIRM ACTION
                // =========================================

                const confirmed =
                    confirm(
                        confirmationMessage
                    );


                if (!confirmed) {

                    event.preventDefault();

                    return;

                }


                // =========================================
                // PREVENT DOUBLE CLICK
                // =========================================

                button.style.pointerEvents =
                    "none";

                button.style.opacity =
                    "0.7";


                // =========================================
                // SHOW LOADING TEXT
                // =========================================

                if (
                    action === "deactivate"
                ) {

                    button.textContent =
                        "Deactivating...";

                } else {

                    button.textContent =
                        "Activating...";

                }

            }
        );

    });

}



// =========================================================
// ADMIN ADD PRODUCT
// =========================================================

function initAdminAddProduct() {

    const addProductSection =
        document.querySelector(
            ".smart-add-product-section"
        );


    if (!addProductSection) {
        return;
    }


    const form =
        addProductSection.querySelector(
            "form"
        );


    if (!form) {
        return;
    }


    const productName =
        document.getElementById(
            "productName"
        );


    const productCategory =
        document.getElementById(
            "productCategory"
        );


    const productDescription =
        document.getElementById(
            "productDescription"
        );


    const buyingPrice =
        document.getElementById(
            "buyingPrice"
        );


    const sellingPrice =
        document.getElementById(
            "sellingPrice"
        );


    const productStock =
        document.getElementById(
            "productStock"
        );


    const productImage =
        document.getElementById(
            "productImage"
        );


    const submitButton =
        form.querySelector(
            ".add-product-submit-btn"
        );


    // =====================================================
    // REMOVE ERROR MESSAGE
    // =====================================================

    function removeFieldError(field) {

        if (!field) {
            return;
        }


        field.classList.remove(
            "error"
        );


        const existingError =
            field.parentElement
                ? field.parentElement.querySelector(
                    ".add-product-error"
                )
                : null;


        if (existingError) {

            existingError.remove();

        }

    }



    // =====================================================
    // SHOW FIELD ERROR
    // =====================================================

    function showFieldError(
        field,
        message
    ) {

        if (!field) {
            return;
        }


        field.classList.add(
            "error"
        );


        const existingError =
            field.parentElement
                ? field.parentElement.querySelector(
                    ".add-product-error"
                )
                : null;


        if (existingError) {

            existingError.remove();

        }


        const error =
            document.createElement(
                "div"
            );


        error.className =
            "add-product-error";


        error.textContent =
            message;


        field.parentElement.appendChild(
            error
        );

    }



    // =====================================================
    // PRODUCT NAME
    // =====================================================

    if (productName) {

        productName.addEventListener(
            "input",
            function () {

                productName.value =
                    productName.value
                        .replace(/\s+/g, " ");


                removeFieldError(
                    productName
                );

            }
        );

    }



    // =====================================================
    // CATEGORY
    // =====================================================

    if (productCategory) {

        productCategory.addEventListener(
            "change",
            function () {

                removeFieldError(
                    productCategory
                );

            }
        );

    }



    // =====================================================
    // DESCRIPTION
    // =====================================================

    if (productDescription) {

        productDescription.addEventListener(
            "input",
            function () {

                removeFieldError(
                    productDescription
                );

            }
        );

    }



    // =====================================================
    // BUYING PRICE
    // =====================================================

    if (buyingPrice) {

        buyingPrice.addEventListener(
            "input",
            function () {

                if (
                    Number(buyingPrice.value) < 0
                ) {

                    buyingPrice.value =
                        0;

                }


                removeFieldError(
                    buyingPrice
                );

            }
        );

    }



    // =====================================================
    // SELLING PRICE
    // =====================================================

    if (sellingPrice) {

        sellingPrice.addEventListener(
            "input",
            function () {

                if (
                    Number(sellingPrice.value) < 0
                ) {

                    sellingPrice.value =
                        0;

                }


                removeFieldError(
                    sellingPrice
                );

            }
        );

    }



    // =====================================================
    // STOCK
    // =====================================================

    if (productStock) {

        productStock.addEventListener(
            "input",
            function () {

                if (
                    Number(productStock.value) < 0
                ) {

                    productStock.value =
                        0;

                }


                removeFieldError(
                    productStock
                );

            }
        );

    }



    // =====================================================
    // IMAGE VALIDATION
    // =====================================================

    if (productImage) {

        productImage.addEventListener(
            "change",
            function () {

                removeFieldError(
                    productImage
                );


                if (
                    !productImage.files ||
                    productImage.files.length === 0
                ) {

                    return;

                }


                const file =
                    productImage.files[0];


                const allowedTypes = [
                    "image/jpeg",
                    "image/png",
                    "image/webp"
                ];


                const maximumFileSize =
                    5 * 1024 * 1024;


                if (
                    !allowedTypes.includes(
                        file.type
                    )
                ) {

                    showFieldError(
                        productImage,
                        "Please choose a JPG, JPEG, PNG or WEBP image."
                    );


                    productImage.value =
                        "";

                    return;

                }


                if (
                    file.size > maximumFileSize
                ) {

                    showFieldError(
                        productImage,
                        "The product image must not be larger than 5 MB."
                    );


                    productImage.value =
                        "";

                    return;

                }

            }
        );

    }



    // =====================================================
    // FORM SUBMISSION
    // =====================================================

    form.addEventListener(
        "submit",
        function (event) {

            // =============================================
            // REMOVE OLD ERRORS
            // =============================================

            const oldErrors =
                form.querySelectorAll(
                    ".add-product-error"
                );


            oldErrors.forEach(function (error) {

                error.remove();

            });


            const errorFields =
                form.querySelectorAll(
                    ".error"
                );


            errorFields.forEach(function (field) {

                field.classList.remove(
                    "error"
                );

            });


            let formIsValid =
                true;


            let firstErrorField =
                null;



            // =============================================
            // PRODUCT NAME
            // =============================================

            if (
                !productName ||
                productName.value.trim().length < 2
            ) {

                showFieldError(
                    productName,
                    "Please enter a product name."
                );


                formIsValid =
                    false;


                if (!firstErrorField) {

                    firstErrorField =
                        productName;

                }

            }



            // =============================================
            // CATEGORY
            // =============================================

            if (
                !productCategory ||
                !productCategory.value
            ) {

                showFieldError(
                    productCategory,
                    "Please select a product category."
                );


                formIsValid =
                    false;


                if (!firstErrorField) {

                    firstErrorField =
                        productCategory;

                }

            }



            // =============================================
            // DESCRIPTION
            // =============================================

            if (
                !productDescription ||
                productDescription.value.trim().length < 5
            ) {

                showFieldError(
                    productDescription,
                    "Please provide a product description."
                );


                formIsValid =
                    false;


                if (!firstErrorField) {

                    firstErrorField =
                        productDescription;

                }

            }



            // =============================================
            // BUYING PRICE
            // =============================================

            const buyingPriceValue =
                buyingPrice
                    ? Number(
                        buyingPrice.value
                    )
                    : NaN;


            if (
                !buyingPrice ||
                buyingPrice.value === "" ||
                isNaN(buyingPriceValue) ||
                buyingPriceValue < 0
            ) {

                showFieldError(
                    buyingPrice,
                    "Please enter a valid buying price."
                );


                formIsValid =
                    false;


                if (!firstErrorField) {

                    firstErrorField =
                        buyingPrice;

                }

            }



            // =============================================
            // SELLING PRICE
            // =============================================

            const sellingPriceValue =
                sellingPrice
                    ? Number(
                        sellingPrice.value
                    )
                    : NaN;


            if (
                !sellingPrice ||
                sellingPrice.value === "" ||
                isNaN(sellingPriceValue) ||
                sellingPriceValue < 0
            ) {

                showFieldError(
                    sellingPrice,
                    "Please enter a valid selling price."
                );


                formIsValid =
                    false;


                if (!firstErrorField) {

                    firstErrorField =
                        sellingPrice;

                }

            }
            else if (
                !isNaN(buyingPriceValue) &&
                sellingPriceValue < buyingPriceValue
            ) {

                showFieldError(
                    sellingPrice,
                    "Selling price cannot be lower than buying price."
                );


                formIsValid =
                    false;


                if (!firstErrorField) {

                    firstErrorField =
                        sellingPrice;

                }

            }



            // =============================================
            // STOCK
            // =============================================

            const stockValue =
                productStock
                    ? Number(
                        productStock.value
                    )
                    : NaN;


            if (
                !productStock ||
                productStock.value === "" ||
                isNaN(stockValue) ||
                stockValue < 0 ||
                !Number.isInteger(stockValue)
            ) {

                showFieldError(
                    productStock,
                    "Please enter a valid whole number for stock."
                );


                formIsValid =
                    false;


                if (!firstErrorField) {

                    firstErrorField =
                        productStock;

                }

            }



            // =============================================
            // IMAGE
            // =============================================

            if (
                productImage &&
                productImage.files &&
                productImage.files.length > 0
            ) {

                const file =
                    productImage.files[0];


                const allowedTypes = [
                    "image/jpeg",
                    "image/png",
                    "image/webp"
                ];


                const maximumFileSize =
                    5 * 1024 * 1024;


                if (
                    !allowedTypes.includes(
                        file.type
                    )
                ) {

                    showFieldError(
                        productImage,
                        "Please choose a JPG, JPEG, PNG or WEBP image."
                    );


                    formIsValid =
                        false;


                    if (!firstErrorField) {

                        firstErrorField =
                            productImage;

                    }

                }
                else if (
                    file.size > maximumFileSize
                ) {

                    showFieldError(
                        productImage,
                        "The product image must not be larger than 5 MB."
                    );


                    formIsValid =
                        false;


                    if (!firstErrorField) {

                        firstErrorField =
                            productImage;

                    }

                }

            }



            // =============================================
            // STOP FORM IF INVALID
            // =============================================

            if (!formIsValid) {

                event.preventDefault();


                if (firstErrorField) {

                    firstErrorField.focus();

                }


                return;

            }



            // =============================================
            // PREVENT DOUBLE SUBMISSION
            // =============================================

            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.style.opacity =
                    "0.7";

                submitButton.style.cursor =
                    "not-allowed";


                submitButton.innerHTML =
                    "<span>⏳</span> Adding Product...";

            }

        }
    );

}
// =========================================================
// ADMIN EDIT PRODUCT
// =========================================================

function initAdminEditProduct() {

    const editProductSection =
        document.querySelector(
            ".smart-edit-product-section"
        );


    if (!editProductSection) {
        return;
    }


    const form =
        editProductSection.querySelector(
            "form"
        );


    if (!form) {
        return;
    }


    // =====================================================
    // FORM FIELDS
    // =====================================================

    const productName =
        document.getElementById(
            "productName"
        );


    const productCategory =
        document.getElementById(
            "productCategory"
        );


    const productDescription =
        document.getElementById(
            "productDescription"
        );


    const buyingPrice =
        document.getElementById(
            "buyingPrice"
        );


    const sellingPrice =
        document.getElementById(
            "sellingPrice"
        );


    const productImage =
        document.getElementById(
            "productImage"
        );


    const saveButton =
        form.querySelector(
            ".edit-product-save-btn"
        );



    // =====================================================
    // REMOVE FIELD ERROR
    // =====================================================

    function removeFieldError(field) {

        if (!field) {
            return;
        }


        field.classList.remove(
            "error"
        );


        const fieldContainer =
            field.closest(
                ".edit-product-field"
            );


        if (fieldContainer) {

            const existingError =
                fieldContainer.querySelector(
                    ".edit-product-error"
                );


            if (existingError) {

                existingError.remove();

            }

        }


        if (
            field === productImage
        ) {

            const uploadContent =
                field.closest(
                    ".edit-product-upload-content"
                );


            if (uploadContent) {

                const existingError =
                    uploadContent.querySelector(
                        ".edit-product-error"
                    );


                if (existingError) {

                    existingError.remove();

                }

            }

        }

    }



    // =====================================================
    // SHOW FIELD ERROR
    // =====================================================

    function showFieldError(
        field,
        message
    ) {

        if (!field) {
            return;
        }


        field.classList.add(
            "error"
        );


        let container =
            field.closest(
                ".edit-product-field"
            );


        if (!container) {

            container =
                field.closest(
                    ".edit-product-upload-content"
                );

        }


        if (!container) {
            return;
        }


        const oldError =
            container.querySelector(
                ".edit-product-error"
            );


        if (oldError) {

            oldError.remove();

        }


        const error =
            document.createElement(
                "div"
            );


        error.className =
            "edit-product-error";


        error.textContent =
            message;


        container.appendChild(
            error
        );

    }



    // =====================================================
    // PRODUCT NAME
    // =====================================================

    if (productName) {

        productName.addEventListener(
            "input",
            function () {

                productName.value =
                    productName.value
                        .replace(/\s+/g, " ");


                removeFieldError(
                    productName
                );

            }
        );

    }



    // =====================================================
    // CATEGORY
    // =====================================================

    if (productCategory) {

        productCategory.addEventListener(
            "change",
            function () {

                removeFieldError(
                    productCategory
                );

            }
        );

    }



    // =====================================================
    // DESCRIPTION
    // =====================================================

    if (productDescription) {

        productDescription.addEventListener(
            "input",
            function () {

                removeFieldError(
                    productDescription
                );

            }
        );

    }



    // =====================================================
    // BUYING PRICE
    // =====================================================

    if (buyingPrice) {

        buyingPrice.addEventListener(
            "input",
            function () {

                if (
                    Number(
                        buyingPrice.value
                    ) < 0
                ) {

                    buyingPrice.value =
                        0;

                }


                removeFieldError(
                    buyingPrice
                );

            }
        );

    }



    // =====================================================
    // SELLING PRICE
    // =====================================================

    if (sellingPrice) {

        sellingPrice.addEventListener(
            "input",
            function () {

                if (
                    Number(
                        sellingPrice.value
                    ) < 0
                ) {

                    sellingPrice.value =
                        0;

                }


                removeFieldError(
                    sellingPrice
                );

            }
        );

    }



    // =====================================================
    // IMAGE VALIDATION
    // =====================================================

    if (productImage) {

        productImage.addEventListener(
            "change",
            function () {

                removeFieldError(
                    productImage
                );


                if (
                    !productImage.files ||
                    productImage.files.length === 0
                ) {

                    return;

                }


                const file =
                    productImage.files[0];


                const allowedTypes = [
                    "image/jpeg",
                    "image/png",
                    "image/webp"
                ];


                const maximumFileSize =
                    5 * 1024 * 1024;


                // =========================================
                // FILE TYPE
                // =========================================

                if (
                    !allowedTypes.includes(
                        file.type
                    )
                ) {

                    showFieldError(
                        productImage,
                        "Please choose a JPG, JPEG, PNG or WEBP image."
                    );


                    productImage.value =
                        "";


                    return;

                }


                // =========================================
                // FILE SIZE
                // =========================================

                if (
                    file.size >
                    maximumFileSize
                ) {

                    showFieldError(
                        productImage,
                        "The product image must not be larger than 5 MB."
                    );


                    productImage.value =
                        "";


                    return;

                }

            }
        );

    }



    // =====================================================
    // FORM SUBMISSION
    // =====================================================

    form.addEventListener(
        "submit",
        function (event) {

            // =============================================
            // REMOVE PREVIOUS ERRORS
            // =============================================

            const oldErrors =
                form.querySelectorAll(
                    ".edit-product-error"
                );


            oldErrors.forEach(
                function (error) {

                    error.remove();

                }
            );


            const errorFields =
                form.querySelectorAll(
                    ".error"
                );


            errorFields.forEach(
                function (field) {

                    field.classList.remove(
                        "error"
                    );

                }
            );


            let formIsValid =
                true;


            let firstErrorField =
                null;



            // =============================================
            // PRODUCT NAME
            // =============================================

            if (
                !productName ||
                productName.value.trim().length < 2
            ) {

                showFieldError(
                    productName,
                    "Please enter a valid product name."
                );


                formIsValid =
                    false;


                if (!firstErrorField) {

                    firstErrorField =
                        productName;

                }

            }



            // =============================================
            // CATEGORY
            // =============================================

            if (
                !productCategory ||
                !productCategory.value
            ) {

                showFieldError(
                    productCategory,
                    "Please select a product category."
                );


                formIsValid =
                    false;


                if (!firstErrorField) {

                    firstErrorField =
                        productCategory;

                }

            }



            // =============================================
            // DESCRIPTION
            // =============================================

            if (
                !productDescription ||
                productDescription.value.trim().length < 5
            ) {

                showFieldError(
                    productDescription,
                    "Please provide a product description."
                );


                formIsValid =
                    false;


                if (!firstErrorField) {

                    firstErrorField =
                        productDescription;

                }

            }



            // =============================================
            // BUYING PRICE
            // =============================================

            const buyingPriceValue =
                buyingPrice
                    ? Number(
                        buyingPrice.value
                    )
                    : NaN;


            if (
                !buyingPrice ||
                buyingPrice.value === "" ||
                isNaN(buyingPriceValue) ||
                buyingPriceValue < 0
            ) {

                showFieldError(
                    buyingPrice,
                    "Please enter a valid buying price."
                );


                formIsValid =
                    false;


                if (!firstErrorField) {

                    firstErrorField =
                        buyingPrice;

                }

            }



            // =============================================
            // SELLING PRICE
            // =============================================

            const sellingPriceValue =
                sellingPrice
                    ? Number(
                        sellingPrice.value
                    )
                    : NaN;


            if (
                !sellingPrice ||
                sellingPrice.value === "" ||
                isNaN(sellingPriceValue) ||
                sellingPriceValue < 0
            ) {

                showFieldError(
                    sellingPrice,
                    "Please enter a valid selling price."
                );


                formIsValid =
                    false;


                if (!firstErrorField) {

                    firstErrorField =
                        sellingPrice;

                }

            }
            else if (
                !isNaN(buyingPriceValue) &&
                sellingPriceValue < buyingPriceValue
            ) {

                showFieldError(
                    sellingPrice,
                    "Selling price cannot be lower than buying price."
                );


                formIsValid =
                    false;


                if (!firstErrorField) {

                    firstErrorField =
                        sellingPrice;

                }

            }



            // =============================================
            // IMAGE
            // =============================================

            if (
                productImage &&
                productImage.files &&
                productImage.files.length > 0
            ) {

                const file =
                    productImage.files[0];


                const allowedTypes = [
                    "image/jpeg",
                    "image/png",
                    "image/webp"
                ];


                const maximumFileSize =
                    5 * 1024 * 1024;


                if (
                    !allowedTypes.includes(
                        file.type
                    )
                ) {

                    showFieldError(
                        productImage,
                        "Please choose a JPG, JPEG, PNG or WEBP image."
                    );


                    formIsValid =
                        false;


                    if (!firstErrorField) {

                        firstErrorField =
                            productImage;

                    }

                }
                else if (
                    file.size >
                    maximumFileSize
                ) {

                    showFieldError(
                        productImage,
                        "The product image must not be larger than 5 MB."
                    );


                    formIsValid =
                        false;


                    if (!firstErrorField) {

                        firstErrorField =
                            productImage;

                    }

                }

            }



            // =============================================
            // STOP IF INVALID
            // =============================================

            if (!formIsValid) {

                event.preventDefault();


                if (firstErrorField) {

                    firstErrorField.focus();

                }


                return;

            }



            // =============================================
            // PREVENT DOUBLE SUBMISSION
            // =============================================

            if (saveButton) {

                saveButton.disabled =
                    true;


                saveButton.style.opacity =
                    "0.7";


                saveButton.style.cursor =
                    "not-allowed";


                saveButton.innerHTML =
                    "⏳ Saving Changes...";

            }

        }
    );

}
// =========================================================
// ADMIN INVENTORY
// =========================================================

function initAdminInventory() {

    const inventorySection =
        document.querySelector(
            ".smart-inventory-section"
        );


    if (!inventorySection) {
        return;
    }


    // =====================================================
    // ANIMATE INVENTORY STAT NUMBERS
    // =====================================================

    const statNumbers =
        inventorySection.querySelectorAll(
            ".inventory-stat-number"
        );


    statNumbers.forEach(function (element) {

        const target =
            parseInt(
                element.textContent.trim()
            );


        if (
            isNaN(target) ||
            target < 0
        ) {

            return;

        }


        animateNumber(
            element,
            target,
            700
        );

    });



    // =====================================================
    // UPDATE STOCK BUTTONS
    // =====================================================

    const updateButtons =
        inventorySection.querySelectorAll(
            ".inventory-update-btn"
        );


    updateButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                // Prevent accidental double click

                if (
                    button.dataset.loading === "true"
                ) {

                    return;

                }


                button.dataset.loading =
                    "true";


                button.style.pointerEvents =
                    "none";


                button.style.opacity =
                    "0.7";


                const originalText =
                    button.innerHTML;


                button.dataset.originalText =
                    originalText;


                button.innerHTML =
                    "⏳ Loading...";

            }
        );

    });



    // =====================================================
    // INVENTORY QUICK ACTIONS
    // =====================================================

    const quickButtons =
        inventorySection.querySelectorAll(
            ".inventory-quick-btn"
        );


    quickButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                if (
                    button.dataset.loading === "true"
                ) {

                    return;

                }


                button.dataset.loading =
                    "true";


                button.style.opacity =
                    "0.7";


                button.style.pointerEvents =
                    "none";


                const originalText =
                    button.innerHTML;


                button.dataset.originalText =
                    originalText;


                if (
                    !button.textContent
                        .toLowerCase()
                        .includes("dashboard")
                ) {

                    button.innerHTML =
                        "⏳ Loading...";

                }

            }
        );

    });



    // =====================================================
    // STOCK HISTORY BUTTON
    // =====================================================

    const stockHistoryButtons =
        inventorySection.querySelectorAll(
            ".inventory-action-primary"
        );


    stockHistoryButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                if (
                    button.dataset.loading === "true"
                ) {

                    return;

                }


                button.dataset.loading =
                    "true";


                button.style.opacity =
                    "0.7";


                button.style.pointerEvents =
                    "none";


                button.innerHTML =
                    "⏳ Loading History...";

            }
        );

    });



    // =====================================================
    // MANAGE PRODUCTS BUTTON
    // =====================================================

    const manageProductsButton =
        inventorySection.querySelector(
            ".inventory-action-secondary"
        );


    if (manageProductsButton) {

        manageProductsButton.addEventListener(
            "click",
            function () {

                if (
                    manageProductsButton.dataset.loading ===
                    "true"
                ) {

                    return;

                }


                manageProductsButton.dataset.loading =
                    "true";


                manageProductsButton.style.opacity =
                    "0.7";


                manageProductsButton.style.pointerEvents =
                    "none";


                manageProductsButton.innerHTML =
                    "⏳ Loading Products...";

            }
        );

    }



    // =====================================================
    // ADD PRODUCT EMPTY-STATE BUTTON
    // =====================================================

    const addProductButtons =
        inventorySection.querySelectorAll(
            ".inventory-add-btn"
        );


    addProductButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                button.style.opacity =
                    "0.7";


                button.style.pointerEvents =
                    "none";


                button.innerHTML =
                    "⏳ Opening...";

            }
        );

    });

}
// =========================================================
// ADMIN UPDATE STOCK
// =========================================================

function initAdminUpdateStock() {

    const updateStockPage =
        document.querySelector(
            ".container"
        );


    // Make sure we are actually on the Update Stock page.
    // The page contains the quantity and reason fields.

    const quantityInput =
        document.getElementById("quantity");

    const reasonInput =
        document.getElementById("reason");


    if (
        !quantityInput ||
        !reasonInput
    ) {
        return;
    }


    const form =
        quantityInput.closest("form");


    if (!form) {
        return;
    }


    const addButton =
        form.querySelector(
            'button[value="add"]'
        );


    const removeButton =
        form.querySelector(
            'button[value="remove"]'
        );


    const cancelButton =
        form.querySelector(
            'a.btn-outline-secondary'
        );


    // =====================================================
    // CURRENT STOCK
    // =====================================================

    const currentStockElement =
        document.querySelector(
            ".alert-info strong"
        );


    let currentStock = 0;


    if (currentStockElement) {

        currentStock =
            parseInt(
                currentStockElement.textContent.trim(),
                10
            );


        if (isNaN(currentStock)) {
            currentStock = 0;
        }

    }


    // =====================================================
    // CREATE ERROR MESSAGE
    // =====================================================

    function showFieldError(
        input,
        message
    ) {

        clearFieldError(input);


        input.classList.add("is-invalid");


        const error =
            document.createElement("div");


        error.className =
            "update-stock-validation-error";


        error.textContent =
            message;


        input.parentNode.appendChild(error);

    }


    // =====================================================
    // CLEAR ERROR
    // =====================================================

    function clearFieldError(input) {

        input.classList.remove(
            "is-invalid"
        );


        const existingError =
            input.parentNode.querySelector(
                ".update-stock-validation-error"
            );


        if (existingError) {

            existingError.remove();

        }

    }


    // =====================================================
    // QUANTITY VALIDATION
    // =====================================================

    function validateQuantity() {

        clearFieldError(
            quantityInput
        );


        const value =
            quantityInput.value.trim();


        if (value === "") {

            showFieldError(
                quantityInput,
                "Please enter a quantity."
            );

            return false;

        }


        const quantity =
            Number(value);


        if (!Number.isInteger(quantity)) {

            showFieldError(
                quantityInput,
                "Quantity must be a whole number."
            );

            return false;

        }


        if (quantity < 1) {

            showFieldError(
                quantityInput,
                "Quantity must be at least 1."
            );

            return false;

        }


        return true;

    }


    // =====================================================
    // REASON VALIDATION
    // =====================================================

    function validateReason() {

        clearFieldError(
            reasonInput
        );


        const reason =
            reasonInput.value.trim();


        if (reason === "") {

            showFieldError(
                reasonInput,
                "Please provide a reason for the stock change."
            );

            return false;

        }


        if (reason.length < 5) {

            showFieldError(
                reasonInput,
                "Please provide a more detailed reason."
            );

            return false;

        }


        return true;

    }


    // =====================================================
    // ADD STOCK VALIDATION
    // =====================================================

    function validateAddStock() {

        const quantityValid =
            validateQuantity();


        const reasonValid =
            validateReason();


        return (
            quantityValid &&
            reasonValid
        );

    }


    // =====================================================
    // REMOVE STOCK VALIDATION
    // =====================================================

    function validateRemoveStock() {

        const quantityValid =
            validateQuantity();


        const reasonValid =
            validateReason();


        if (
            !quantityValid ||
            !reasonValid
        ) {

            return false;

        }


        const quantity =
            Number(
                quantityInput.value
            );


        // Prevent removing more stock
        // than currently exists.

        if (
            quantity > currentStock
        ) {

            showFieldError(
                quantityInput,
                "You cannot remove more stock than is currently available."
            );

            return false;

        }


        return true;

    }


    // =====================================================
    // BUTTON LOADING STATE
    // =====================================================

    function setLoadingState(
        button,
        text
    ) {

        if (!button) {
            return;
        }


        button.disabled = true;


        button.style.opacity =
            "0.7";


        button.style.cursor =
            "not-allowed";


        button.innerHTML =
            text;

    }


    // =====================================================
    // ADD STOCK BUTTON
    // =====================================================

    if (addButton) {

        addButton.addEventListener(
            "click",
            function (event) {

                if (
                    !validateAddStock()
                ) {

                    event.preventDefault();

                    quantityInput.focus();

                    return;

                }


                // Store which action was selected.

                form.dataset.selectedAction =
                    "add";

            }
        );

    }


    // =====================================================
    // REMOVE STOCK BUTTON
    // =====================================================

    if (removeButton) {

        removeButton.addEventListener(
            "click",
            function (event) {

                if (
                    !validateRemoveStock()
                ) {

                    event.preventDefault();

                    quantityInput.focus();

                    return;

                }


                // Store which action was selected.

                form.dataset.selectedAction =
                    "remove";

            }
        );

    }


    // =====================================================
    // FORM SUBMISSION PROTECTION
    // =====================================================

    form.addEventListener(
        "submit",
        function (event) {

            const selectedAction =
                form.dataset.selectedAction;


            // If the form was submitted by
            // an unexpected method, stop it.

            if (
                selectedAction !== "add" &&
                selectedAction !== "remove"
            ) {

                event.preventDefault();

                return;

            }


            let valid = false;


            if (
                selectedAction === "add"
            ) {

                valid =
                    validateAddStock();

            }


            if (
                selectedAction === "remove"
            ) {

                valid =
                    validateRemoveStock();

            }


            if (!valid) {

                event.preventDefault();

                quantityInput.focus();

                return;

            }


            // Prevent double submission.

            if (
                form.dataset.submitting ===
                "true"
            ) {

                event.preventDefault();

                return;

            }


            form.dataset.submitting =
                "true";


            // Disable both action buttons.

            if (addButton) {

                addButton.disabled =
                    true;

            }


            if (removeButton) {

                removeButton.disabled =
                    true;

            }


            if (cancelButton) {

                cancelButton.style.pointerEvents =
                    "none";

                cancelButton.style.opacity =
                    "0.5";

            }


            // Show appropriate loading message.

            if (
                selectedAction === "add"
            ) {

                setLoadingState(
                    addButton,
                    "⏳ Updating Stock..."
                );

            }


            if (
                selectedAction === "remove"
            ) {

                setLoadingState(
                    removeButton,
                    "⏳ Updating Stock..."
                );

            }

        }
    );


    // =====================================================
    // CLEAR QUANTITY ERROR WHILE TYPING
    // =====================================================

    quantityInput.addEventListener(
        "input",
        function () {

            clearFieldError(
                quantityInput
            );

        }
    );


    // =====================================================
    // CLEAR REASON ERROR WHILE TYPING
    // =====================================================

    reasonInput.addEventListener(
        "input",
        function () {

            clearFieldError(
                reasonInput
            );

        }
    );


    // =====================================================
    // PREVENT INVALID QUANTITY INPUT
    // =====================================================

    quantityInput.addEventListener(
        "input",
        function () {

            // Remove decimals and negative signs.

            this.value =
                this.value.replace(
                    /[^0-9]/g,
                    ""
                );

        }
    );

}
// =========================================================
// ADMIN STOCK HISTORY
// =========================================================

function initAdminStockHistory() {

    const historySection =
        document.querySelector(
            ".smart-stock-history-section"
        );


    if (!historySection) {
        return;
    }


    // =====================================================
    // HISTORY NAVIGATION BUTTONS
    // =====================================================

    const navigationButtons =
        historySection.querySelectorAll(
            ".stock-history-nav-btn"
        );


    navigationButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                if (
                    button.dataset.loading === "true"
                ) {

                    return;

                }


                button.dataset.loading =
                    "true";


                button.style.pointerEvents =
                    "none";


                button.style.opacity =
                    "0.7";


                const originalText =
                    button.innerHTML;


                button.dataset.originalText =
                    originalText;


                // Give different feedback depending
                // on where the user is going.

                const text =
                    button.textContent
                        .trim()
                        .toLowerCase();


                if (
                    text.includes("inventory")
                ) {

                    button.innerHTML =
                        "⏳ Opening Inventory...";

                }

                else if (
                    text.includes("products")
                ) {

                    button.innerHTML =
                        "⏳ Opening Products...";

                }

                else if (
                    text.includes("dashboard")
                ) {

                    button.innerHTML =
                        "⏳ Opening Dashboard...";

                }

            }
        );

    });



    // =====================================================
    // TOP INVENTORY BUTTON
    // =====================================================

    const inventoryButton =
        historySection.querySelector(
            ".stock-history-back-btn"
        );


    if (inventoryButton) {

        inventoryButton.addEventListener(
            "click",
            function () {

                if (
                    inventoryButton.dataset.loading ===
                    "true"
                ) {

                    return;

                }


                inventoryButton.dataset.loading =
                    "true";


                inventoryButton.style.pointerEvents =
                    "none";


                inventoryButton.style.opacity =
                    "0.7";


                inventoryButton.innerHTML =
                    "<span>⏳</span> Opening Inventory...";

            }
        );

    }



    // =====================================================
    // EMPTY STATE BUTTON
    // =====================================================

    const emptyStateButton =
        historySection.querySelector(
            ".stock-history-empty-btn"
        );


    if (emptyStateButton) {

        emptyStateButton.addEventListener(
            "click",
            function () {

                emptyStateButton.style.pointerEvents =
                    "none";


                emptyStateButton.style.opacity =
                    "0.7";


                emptyStateButton.innerHTML =
                    "⏳ Opening Inventory...";

            }
        );

    }



    // =====================================================
    // ADJUSTMENT ROWS
    // =====================================================

    const rows =
        historySection.querySelectorAll(
            ".stock-history-table tbody tr"
        );


    // Do nothing if there are no records.

    if (!rows.length) {
        return;
    }


    // =====================================================
    // ADD RECORD COUNT TO PAGE
    // =====================================================

    const recordCount =
        rows.length;


    const historyCard =
        historySection.querySelector(
            ".stock-history-main-card"
        );


    if (historyCard) {

        const cardHeader =
            historyCard.querySelector(
                ".stock-history-card-description"
            );


        if (cardHeader) {

            const existingCount =
                cardHeader.dataset.recordCount;


            if (!existingCount) {

                cardHeader.dataset.recordCount =
                    "true";


                const countText =
                    document.createElement("span");


                countText.style.display =
                    "block";


                countText.style.marginTop =
                    "6px";


                countText.style.fontWeight =
                    "600";


                countText.textContent =
                    recordCount +
                    (
                        recordCount === 1
                            ? " adjustment recorded."
                            : " adjustments recorded."
                    );


                cardHeader.appendChild(
                    countText
                );

            }

        }

    }



    // =====================================================
    // ROW HOVER ACCESSIBILITY
    // =====================================================

    rows.forEach(function (row) {

        row.addEventListener(
            "mouseenter",
            function () {

                row.dataset.hovered =
                    "true";

            }
        );


        row.addEventListener(
            "mouseleave",
            function () {

                row.dataset.hovered =
                    "false";

            }
        );

    });



    // =====================================================
    // REASON TEXT
    // =====================================================

    const reasons =
        historySection.querySelectorAll(
            ".stock-history-reason"
        );


    reasons.forEach(function (reason) {

        const text =
            reason.textContent.trim();


        // Add a title so the complete reason can
        // still be seen when the text is long.

        if (text.length > 40) {

            reason.setAttribute(
                "title",
                text
            );

        }

    });



    // =====================================================
    // ACTION TYPE IDENTIFICATION
    // =====================================================

    const actions =
        historySection.querySelectorAll(
            ".stock-history-action"
        );


    actions.forEach(function (action) {

        const actionText =
            action.textContent
                .trim()
                .toUpperCase();


        action.dataset.action =
            actionText;

    });

}
// =========================================================
// ADMIN SALES & PROFIT
// =========================================================

function initAdminSales() {

    const salesSection =
        document.querySelector(
            ".smart-sales-section"
        );


    if (!salesSection) {
        return;
    }


    // =====================================================
    // ANIMATE SALES STATISTICS
    // =====================================================

    const statNumbers =
        salesSection.querySelectorAll(
            ".sales-stat-number"
        );


    statNumbers.forEach(function (element) {

        animateSalesNumber(
            element,
            700
        );

    });


    // =====================================================
    // ANIMATE MINI STATISTICS
    // =====================================================

    const miniNumbers =
        salesSection.querySelectorAll(
            ".sales-mini-card h3"
        );


    miniNumbers.forEach(function (element) {

        animateSalesNumber(
            element,
            700
        );

    });


    // =====================================================
    // ANIMATE PERIOD PERFORMANCE
    // =====================================================

    const periodValues =
        salesSection.querySelectorAll(
            ".sales-period-card h2"
        );


    periodValues.forEach(function (element) {

        animateSalesNumber(
            element,
            800
        );

    });


    // =====================================================
    // ANIMATE MONTH PROFIT
    // =====================================================

    const monthProfit =
        salesSection.querySelector(
            ".sales-month-profit-value"
        );


    if (monthProfit) {

        animateSalesNumber(
            monthProfit,
            900
        );

    }


    // =====================================================
    // QUICK ACTION BUTTONS
    // =====================================================

    const quickButtons =
        salesSection.querySelectorAll(
            ".sales-quick-btn"
        );


    quickButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                if (
                    button.dataset.loading === "true"
                ) {

                    return;

                }


                button.dataset.loading =
                    "true";


                button.style.pointerEvents =
                    "none";


                button.style.opacity =
                    "0.7";


                const text =
                    button.textContent
                        .trim()
                        .toLowerCase();


                if (
                    text.includes("orders")
                ) {

                    button.innerHTML =
                        "⏳ Opening Orders...";

                }

                else if (
                    text.includes("inventory")
                ) {

                    button.innerHTML =
                        "⏳ Opening Inventory...";

                }

                else if (
                    text.includes("products")
                ) {

                    button.innerHTML =
                        "⏳ Opening Products...";

                }

                else if (
                    text.includes("dashboard")
                ) {

                    button.innerHTML =
                        "⏳ Opening Dashboard...";

                }

            }
        );

    });


    // =====================================================
    // DASHBOARD HEADER BUTTON
    // =====================================================

    const dashboardButton =
        salesSection.querySelector(
            ".sales-dashboard-btn"
        );


    if (dashboardButton) {

        dashboardButton.addEventListener(
            "click",
            function () {

                if (
                    dashboardButton.dataset.loading ===
                    "true"
                ) {

                    return;

                }


                dashboardButton.dataset.loading =
                    "true";


                dashboardButton.style.pointerEvents =
                    "none";


                dashboardButton.style.opacity =
                    "0.7";


                dashboardButton.innerHTML =
                    "<span>⏳</span> Opening Dashboard...";

            }
        );

    }


    // =====================================================
    // EMPTY SALES STATE
    // =====================================================

    const emptySalesButton =
        salesSection.querySelector(
            ".sales-empty-btn"
        );


    if (emptySalesButton) {

        emptySalesButton.addEventListener(
            "click",
            function () {

                emptySalesButton.style.pointerEvents =
                    "none";


                emptySalesButton.style.opacity =
                    "0.7";


                emptySalesButton.innerHTML =
                    "⏳ Opening Orders...";

            }
        );

    }


    // =====================================================
    // SALES TABLE ROWS
    // =====================================================

    const salesRows =
        salesSection.querySelectorAll(
            ".sales-table tbody tr"
        );


    salesRows.forEach(function (row) {

        row.addEventListener(
            "mouseenter",
            function () {

                row.dataset.hovered =
                    "true";

            }
        );


        row.addEventListener(
            "mouseleave",
            function () {

                row.dataset.hovered =
                    "false";

            }
        );

    });

}
// =========================================================
// ADMIN ORDERS
// =========================================================

function initAdminOrders() {

    const ordersSection =
        document.querySelector(
            ".smart-admin-orders-section"
        );


    if (!ordersSection) {
        return;
    }


    // =====================================================
    // SEARCH ELEMENT
    // =====================================================

    const searchInput =
        document.getElementById(
            "adminOrderSearch"
        );


    // =====================================================
    // STATUS FILTER
    // =====================================================

    const statusFilter =
        document.getElementById(
            "adminOrderStatusFilter"
        );


    // =====================================================
    // ORDER ROWS
    // =====================================================

    const orderRows =
        ordersSection.querySelectorAll(
            ".admin-order-row"
        );


    // =====================================================
    // NO RESULTS MESSAGE
    // =====================================================

    const noResults =
        document.getElementById(
            "adminOrdersNoResults"
        );


    // =====================================================
    // NOTHING TO PROCESS
    // =====================================================

    if (
        !searchInput &&
        !statusFilter &&
        orderRows.length === 0
    ) {

        return;

    }


    // =====================================================
    // FILTER ORDERS
    // =====================================================

    function filterOrders() {

        const searchValue =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        const selectedStatus =
            statusFilter
                ? statusFilter.value
                    .trim()
                    .toUpperCase()
                : "";


        let visibleOrders =
            0;


        // =================================================
        // CHECK EVERY ORDER
        // =================================================

        orderRows.forEach(function (row) {

            const orderNumber =
                (
                    row.dataset.order ||
                    ""
                ).toLowerCase();


            const customer =
                (
                    row.dataset.customer ||
                    ""
                ).toLowerCase();


            const phone =
                (
                    row.dataset.phone ||
                    ""
                ).toLowerCase();


            const location =
                (
                    row.dataset.location ||
                    ""
                ).toLowerCase();


            const status =
                (
                    row.dataset.status ||
                    ""
                ).toUpperCase();


            // =============================================
            // SEARCH MATCH
            // =============================================

            const searchMatches =
                !searchValue ||
                orderNumber.includes(
                    searchValue
                ) ||
                customer.includes(
                    searchValue
                ) ||
                phone.includes(
                    searchValue
                ) ||
                location.includes(
                    searchValue
                );


            // =============================================
            // STATUS MATCH
            // =============================================

            const statusMatches =
                !selectedStatus ||
                status === selectedStatus;


            // =============================================
            // SHOW / HIDE ROW
            // =============================================

            if (
                searchMatches &&
                statusMatches
            ) {

                row.style.display =
                    "";

                visibleOrders++;

            } else {

                row.style.display =
                    "none";

            }

        });


        // =================================================
        // NO RESULTS MESSAGE
        // =================================================

        if (noResults) {

            if (
                visibleOrders === 0 &&
                orderRows.length > 0
            ) {

                noResults.classList.add(
                    "show"
                );

                noResults.style.display =
                    "block";

            } else {

                noResults.classList.remove(
                    "show"
                );

                noResults.style.display =
                    "none";

            }

        }

    }



    // =====================================================
    // SEARCH INPUT
    // =====================================================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                filterOrders();

            }
        );

    }



    // =====================================================
    // STATUS FILTER
    // =====================================================

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            function () {

                filterOrders();

            }
        );

    }



    // =====================================================
    // VIEW ORDER BUTTONS
    // =====================================================

    const viewButtons =
        ordersSection.querySelectorAll(
            ".admin-view-order-btn"
        );


    viewButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                // =========================================
                // PREVENT DOUBLE CLICK
                // =========================================

                if (
                    button.dataset.loading ===
                    "true"
                ) {

                    return;

                }


                button.dataset.loading =
                    "true";


                // =========================================
                // DISABLE BUTTON
                // =========================================

                button.style.pointerEvents =
                    "none";


                button.style.opacity =
                    "0.7";


                // =========================================
                // SAVE ORIGINAL TEXT
                // =========================================

                const originalText =
                    button.innerHTML;


                button.dataset.originalText =
                    originalText;


                // =========================================
                // LOADING MESSAGE
                // =========================================

                button.innerHTML =
                    "⏳ Opening...";

            }
        );

    });



    // =====================================================
    // RUN INITIAL FILTER
    // =====================================================

    filterOrders();

}
// =========================================================
// ADMIN ORDER DETAILS
// =========================================================

function initAdminOrderDetails() {

    // =====================================================
    // FIND ORDER DETAILS PAGE
    // =====================================================

    const orderDetailsSection =
        document.querySelector(
            ".smart-admin-order-details-section"
        );


    // =====================================================
    // STOP IF WE ARE NOT ON ORDER DETAILS PAGE
    // =====================================================

    if (!orderDetailsSection) {
        return;
    }


    // =====================================================
    // DELIVERY ASSIGNMENT FORM
    // =====================================================

    const deliveryForm =
        orderDetailsSection.querySelector(
            ".delivery-assignment-form form"
        );


    // =====================================================
    // STATUS UPDATE FORM
    // =====================================================

    const statusForm =
        orderDetailsSection.querySelector(
            'form[action*="admin_update_order_status"]'
        );


    // =====================================================
    // DELIVERY ASSIGNMENT BUTTON
    // =====================================================

    const assignButton =
        orderDetailsSection.querySelector(
            ".admin-assign-delivery-btn"
        );


    // =====================================================
    // STATUS UPDATE BUTTON
    // =====================================================

    const statusButton =
        orderDetailsSection.querySelector(
            ".admin-update-status-btn"
        );


    // =====================================================
    // DELIVERY ASSIGNMENT
    // =====================================================

    if (deliveryForm && assignButton) {

        deliveryForm.addEventListener(
            "submit",
            function (event) {

                // =========================================
                // PREVENT DOUBLE SUBMISSION
                // =========================================

                if (
                    assignButton.dataset.loading ===
                    "true"
                ) {

                    event.preventDefault();

                    return;

                }


                // =========================================
                // GET SELECTED DELIVERY PERSON
                // =========================================

                const deliverySelect =
                    document.getElementById(
                        "delivery_person_id"
                    );


                // =========================================
                // CHECK SELECTION
                // =========================================

                if (
                    !deliverySelect ||
                    !deliverySelect.value
                ) {

                    event.preventDefault();

                    alert(
                        "Please select a delivery person."
                    );

                    return;

                }


                // =========================================
                // MARK BUTTON AS LOADING
                // =========================================

                assignButton.dataset.loading =
                    "true";


                // =========================================
                // DISABLE BUTTON
                // =========================================

                assignButton.disabled =
                    true;


                // =========================================
                // CHANGE BUTTON TEXT
                // =========================================

                assignButton.innerHTML =
                    "⏳ Assigning...";

            }
        );

    }


    // =====================================================
    // STATUS UPDATE
    // =====================================================

    if (statusForm && statusButton) {

        statusForm.addEventListener(
            "submit",
            function (event) {

                // =========================================
                // PREVENT DOUBLE SUBMISSION
                // =========================================

                if (
                    statusButton.dataset.loading ===
                    "true"
                ) {

                    event.preventDefault();

                    return;

                }


                // =========================================
                // GET STATUS SELECT
                // =========================================

                const statusSelect =
                    document.getElementById(
                        "order_status"
                    );


                // =========================================
                // CHECK STATUS
                // =========================================

                if (
                    !statusSelect ||
                    !statusSelect.value
                ) {

                    event.preventDefault();

                    alert(
                        "Please select the next order status."
                    );

                    return;

                }


                // =========================================
                // GET SELECTED STATUS
                // =========================================

                const selectedStatus =
                    statusSelect.value;


                // =========================================
                // CONFIRM STATUS CHANGE
                // =========================================

                const confirmed =
                    confirm(
                        "Are you sure you want to change " +
                        "the order status to " +
                        selectedStatus +
                        "?"
                    );


                // =========================================
                // CANCEL UPDATE
                // =========================================

                if (!confirmed) {

                    event.preventDefault();

                    return;

                }


                // =========================================
                // MARK BUTTON AS LOADING
                // =========================================

                statusButton.dataset.loading =
                    "true";


                // =========================================
                // DISABLE BUTTON
                // =========================================

                statusButton.disabled =
                    true;


                // =========================================
                // CHANGE BUTTON TEXT
                // =========================================

                statusButton.innerHTML =
                    "⏳ Updating...";

            }
        );

    }

}
// =========================================================
// DELIVERY DASHBOARD
// =========================================================

function initDeliveryDashboard() {

    const dashboard =
        document.querySelector(
            "[data-delivery-dashboard='true']"
        );

    if (!dashboard) {
        return;
    }


    // =====================================================
    // SEARCH
    // =====================================================

    const searchInput =
        document.getElementById(
            "deliveryOrderSearch"
        );


    // =====================================================
    // STATUS FILTER
    // =====================================================

    const statusFilter =
        document.getElementById(
            "deliveryOrderStatusFilter"
        );


    // =====================================================
    // ORDER ROWS
    // =====================================================

    const orderRows =
        dashboard.querySelectorAll(
            ".delivery-order-row"
        );


    // =====================================================
    // NO RESULTS
    // =====================================================

    const noResults =
        document.getElementById(
            "deliveryOrdersNoResults"
        );


    // =====================================================
    // FILTER ORDERS
    // =====================================================

    function filterDeliveryOrders() {

        const searchValue =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        const selectedStatus =
            statusFilter
                ? statusFilter.value
                    .trim()
                    .toUpperCase()
                : "";


        let visibleOrders = 0;


        orderRows.forEach(function (row) {

            const order =
                (
                    row.dataset.order ||
                    ""
                ).toLowerCase();


            const customer =
                (
                    row.dataset.customer ||
                    ""
                ).toLowerCase();


            const phone =
                (
                    row.dataset.phone ||
                    ""
                ).toLowerCase();


            const location =
                (
                    row.dataset.location ||
                    ""
                ).toLowerCase();


            const status =
                (
                    row.dataset.status ||
                    ""
                ).toUpperCase();


            // =============================================
            // SEARCH MATCH
            // =============================================

            const searchMatches =
                !searchValue ||
                order.includes(searchValue) ||
                customer.includes(searchValue) ||
                phone.includes(searchValue) ||
                location.includes(searchValue);


            // =============================================
            // STATUS MATCH
            // =============================================

            const statusMatches =
                !selectedStatus ||
                status === selectedStatus;


            // =============================================
            // DISPLAY ROW
            // =============================================

            if (
                searchMatches &&
                statusMatches
            ) {

                row.style.display = "";

                visibleOrders++;

            } else {

                row.style.display = "none";

            }

        });


        // =================================================
        // NO RESULTS MESSAGE
        // =================================================

        if (noResults) {

            if (visibleOrders === 0) {

                noResults.style.display =
                    "block";

            } else {

                noResults.style.display =
                    "none";

            }

        }

    }


    // =====================================================
    // SEARCH EVENT
    // =====================================================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                filterDeliveryOrders();

            }
        );

    }


    // =====================================================
    // STATUS EVENT
    // =====================================================

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            function () {

                filterDeliveryOrders();

            }
        );

    }


    // =====================================================
    // VIEW ORDER BUTTONS
    // =====================================================

    const viewButtons =
        dashboard.querySelectorAll(
            ".delivery-view-order-btn"
        );


    viewButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                // =========================================
                // PREVENT DOUBLE CLICK
                // =========================================

                if (
                    button.dataset.loading ===
                    "true"
                ) {

                    return;
                }


                // =========================================
                // MARK AS LOADING
                // =========================================

                button.dataset.loading =
                    "true";


                // =========================================
                // PREVENT REPEATED CLICK
                // =========================================

                button.style.pointerEvents =
                    "none";


                button.style.opacity =
                    "0.7";


                // =========================================
                // LOADING TEXT
                // =========================================

                button.innerHTML =
                    "⏳ Opening...";

            }
        );

    });


    // =====================================================
    // INITIAL FILTER
    // =====================================================

    filterDeliveryOrders();

}
// =========================================================
// DELIVERY ORDER DETAILS
// =========================================================

function initDeliveryOrderDetails() {

    const orderDetailsSection =
        document.querySelector(
            "[data-delivery-order-details='true']"
        );

    if (!orderDetailsSection) {
        return;
    }


    // ---------------------------------------------------------
    // DELIVERY STATUS FORMS
    // ---------------------------------------------------------

    const statusForms =
        orderDetailsSection.querySelectorAll(
            ".delivery-status-form"
        );


    statusForms.forEach(function (form) {

        const button =
            form.querySelector(
                ".delivery-action-button"
            );


        if (!button) {
            return;
        }


        form.addEventListener("submit", function (event) {

            // Prevent double submission
            if (button.dataset.loading === "true") {

                event.preventDefault();

                return;
            }


            // Get the status that will be applied
            const nextStatus =
                button.dataset.nextStatus || "";


            // -------------------------------------------------
            // CONFIRMATION
            // -------------------------------------------------

            let confirmationMessage = "";


            if (nextStatus === "OUT FOR DELIVERY") {

                confirmationMessage =
                    "Are you sure you want to mark this order as OUT FOR DELIVERY?\n\n" +
                    "This means you are starting the delivery.";

            }


            else if (nextStatus === "DELIVERED") {

                confirmationMessage =
                    "Are you sure you want to mark this order as DELIVERED?\n\n" +
                    "Only continue if the customer has received the order.";

            }


            else {

                confirmationMessage =
                    "Are you sure you want to change the order status to " +
                    nextStatus +
                    "?";

            }


            const confirmed =
                window.confirm(
                    confirmationMessage
                );


            // User cancelled
            if (!confirmed) {

                event.preventDefault();

                return;
            }


            // -------------------------------------------------
            // LOADING STATE
            // -------------------------------------------------

            button.dataset.loading = "true";

            button.disabled = true;

            button.style.pointerEvents = "none";

            button.style.opacity = "0.7";


            // Change button text
            if (nextStatus === "OUT FOR DELIVERY") {

                button.innerHTML =
                    "<span>⏳</span> Starting Delivery...";

            }

            else if (nextStatus === "DELIVERED") {

                button.innerHTML =
                    "<span>⏳</span> Completing Delivery...";

            }

            else {

                button.innerHTML =
                    "<span>⏳</span> Updating...";

            }

        });

    });

}
// =========================================================
// DELIVERY PROFILE
// =========================================================

function initDeliveryProfile() {

    const profileSection =
        document.querySelector(
            "[data-delivery-profile='true']"
        );

    if (!profileSection) {
        return;
    }


    // ---------------------------------------------------------
    // CHANGE PASSWORD FORM
    // ---------------------------------------------------------

    const passwordForm =
        profileSection.querySelector(
            ".delivery-change-password-form"
        );

    if (passwordForm) {

        passwordForm.addEventListener(
            "submit",
            function (event) {

                const currentPassword =
                    document.getElementById(
                        "current_password"
                    );

                const newPassword =
                    document.getElementById(
                        "new_password"
                    );

                const confirmPassword =
                    document.getElementById(
                        "confirm_password"
                    );


                // Check fields
                if (
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                ) {
                    return;
                }


                // -------------------------------------------------
                // EMPTY PASSWORD CHECK
                // -------------------------------------------------

                if (
                    currentPassword.value.trim() === "" ||
                    newPassword.value.trim() === "" ||
                    confirmPassword.value.trim() === ""
                ) {

                    event.preventDefault();

                    alert(
                        "Please fill in all password fields."
                    );

                    return;
                }


                // -------------------------------------------------
                // PASSWORD LENGTH
                // -------------------------------------------------

                if (
                    newPassword.value.length < 6
                ) {

                    event.preventDefault();

                    alert(
                        "New password must contain at least 6 characters."
                    );

                    newPassword.focus();

                    return;
                }


                // -------------------------------------------------
                // PASSWORD MATCH
                // -------------------------------------------------

                if (
                    newPassword.value !==
                    confirmPassword.value
                ) {

                    event.preventDefault();

                    alert(
                        "New passwords do not match."
                    );

                    confirmPassword.focus();

                    return;
                }


                // -------------------------------------------------
                // PREVENT SAME PASSWORD
                // -------------------------------------------------

                if (
                    currentPassword.value ===
                    newPassword.value
                ) {

                    event.preventDefault();

                    alert(
                        "Your new password must be different from your current password."
                    );

                    newPassword.focus();

                    return;
                }


                // -------------------------------------------------
                // CONFIRM CHANGE
                // -------------------------------------------------

                const confirmed =
                    window.confirm(
                        "Are you sure you want to change your password?"
                    );


                if (!confirmed) {

                    event.preventDefault();

                    return;
                }


                // -------------------------------------------------
                // PREVENT DOUBLE SUBMISSION
                // -------------------------------------------------

                const submitButton =
                    passwordForm.querySelector(
                        ".delivery-change-password-button"
                    );


                if (submitButton) {

                    if (
                        submitButton.dataset.loading ===
                        "true"
                    ) {

                        event.preventDefault();

                        return;
                    }


                    submitButton.dataset.loading =
                        "true";

                    submitButton.disabled = true;

                    submitButton.style.pointerEvents =
                        "none";

                    submitButton.style.opacity =
                        "0.7";

                    submitButton.innerHTML =
                        "⏳ Changing Password...";
                }

            }
        );
    }


    // ---------------------------------------------------------
    // SHOW / HIDE PASSWORD
    // ---------------------------------------------------------

    const passwordToggleButtons =
        profileSection.querySelectorAll(
            ".password-toggle"
        );


    passwordToggleButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const inputId =
                        button.dataset.target;

                    const passwordInput =
                        document.getElementById(
                            inputId
                        );


                    if (!passwordInput) {
                        return;
                    }


                    if (
                        passwordInput.type ===
                        "password"
                    ) {

                        passwordInput.type =
                            "text";

                        button.textContent =
                            "🙈";

                        button.setAttribute(
                            "aria-label",
                            "Hide password"
                        );

                    } else {

                        passwordInput.type =
                            "password";

                        button.textContent =
                            "👁️";

                        button.setAttribute(
                            "aria-label",
                            "Show password"
                        );
                    }

                }
            );

        }
    );

}
// =====================================================
// ADMIN DELIVERY PERSONNEL
// =====================================================

function initAdminDeliveryPersonnel() {

    const personnelSection =
        document.querySelector(
            "[data-admin-delivery-personnel='true']"
        );

    if (!personnelSection) {
        return;
    }


    // =================================================
    // SEARCH
    // =================================================

    const searchInput =
        document.getElementById(
            "deliveryPersonnelSearch"
        );


    // =================================================
    // STATUS FILTER
    // =================================================

    const statusFilter =
        document.getElementById(
            "deliveryPersonnelStatusFilter"
        );


    // =================================================
    // PERSONNEL ROWS
    // =================================================

    const personnelRows =
        personnelSection.querySelectorAll(
            ".delivery-personnel-row"
        );


    // =================================================
    // NO RESULTS MESSAGE
    // =================================================

    const noResults =
        document.getElementById(
            "deliveryPersonnelNoResults"
        );


    if (
        !searchInput &&
        !statusFilter &&
        personnelRows.length === 0
    ) {
        return;
    }


    // =================================================
    // FILTER PERSONNEL
    // =================================================

    function filterPersonnel() {

        const searchValue =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        const selectedStatus =
            statusFilter
                ? statusFilter.value
                    .trim()
                    .toLowerCase()
                : "";


        let visiblePersonnel = 0;


        personnelRows.forEach(function (row) {

            const name =
                (
                    row.dataset.name || ""
                ).toLowerCase();


            const phone =
                (
                    row.dataset.phone || ""
                ).toLowerCase();


            const town =
                (
                    row.dataset.town || ""
                ).toLowerCase();


            const district =
                (
                    row.dataset.district || ""
                ).toLowerCase();


            const status =
                (
                    row.dataset.status || ""
                ).toLowerCase();


            const searchMatches =
                !searchValue ||
                name.includes(searchValue) ||
                phone.includes(searchValue) ||
                town.includes(searchValue) ||
                district.includes(searchValue);


            const statusMatches =
                !selectedStatus ||
                status === selectedStatus;


            if (
                searchMatches &&
                statusMatches
            ) {

                row.style.display = "";

                visiblePersonnel++;

            } else {

                row.style.display = "none";

            }

        });


        // =============================================
        // NO RESULTS
        // =============================================

        if (noResults) {

            if (
                visiblePersonnel === 0 &&
                personnelRows.length > 0
            ) {

                noResults.style.display =
                    "block";

            } else {

                noResults.style.display =
                    "none";

            }

        }

    }


    // =================================================
    // SEARCH EVENT
    // =================================================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                filterPersonnel();

            }
        );

    }


    // =================================================
    // STATUS FILTER EVENT
    // =================================================

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            function () {

                filterPersonnel();

            }
        );

    }


    // =================================================
    // ACTION BUTTONS
    // =================================================

    const actionButtons =
        personnelSection.querySelectorAll(
            ".personnel-action-button"
        );


    actionButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function (event) {

                if (
                    button.dataset.loading ===
                    "true"
                ) {

                    event.preventDefault();

                    return;

                }


                const action =
                    button.dataset.action || "";


                let message = "";


                if (action === "deactivate") {

                    message =
                        "Are you sure you want to deactivate this delivery person?\n\n" +
                        "They will no longer be available for new delivery assignments.";

                } else if (action === "activate") {

                    message =
                        "Are you sure you want to activate this delivery person?\n\n" +
                        "They will become available for delivery assignments.";

                } else {

                    return;

                }


                const confirmed =
                    window.confirm(message);


                if (!confirmed) {

                    event.preventDefault();

                    return;

                }


                button.dataset.loading =
                    "true";


                button.style.pointerEvents =
                    "none";


                button.style.opacity =
                    "0.7";


                if (action === "deactivate") {

                    button.innerHTML =
                        "⏳ Deactivating...";

                } else {

                    button.innerHTML =
                        "⏳ Activating...";

                }

            }
        );

    });


    // =================================================
    // EDIT BUTTONS
    // =================================================

    const editButtons =
        personnelSection.querySelectorAll(
            ".personnel-action.edit"
        );


    editButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                if (
                    button.dataset.loading ===
                    "true"
                ) {
                    return;
                }


                button.dataset.loading =
                    "true";


                button.style.pointerEvents =
                    "none";


                button.style.opacity =
                    "0.7";


                button.innerHTML =
                    "⏳ Opening...";

            }
        );

    });


    // =================================================
    // INITIAL FILTER
    // =================================================

    filterPersonnel();

}
function initAdminAddDeliveryPerson() {
    const section = document.querySelector(
        "[data-admin-add-delivery-person='true']"
    );

    if (!section) return;

    const form = section.querySelector(
        ".add-delivery-person-form"
    );

    if (!form) return;

    const password = document.getElementById("password");
    const confirmPassword =
        document.getElementById("confirm_password");

    const submitButton =
        form.querySelector(".add-personnel-submit-btn");

    form.addEventListener("submit", function (event) {

        if (!password || !confirmPassword) {
            return;
        }

        if (password.value.length < 6) {
            event.preventDefault();

            alert(
                "The password must contain at least 6 characters."
            );

            password.focus();

            return;
        }

        if (
            password.value !==
            confirmPassword.value
        ) {
            event.preventDefault();

            alert(
                "The passwords do not match."
            );

            confirmPassword.focus();

            return;
        }

        if (
            submitButton &&
            submitButton.dataset.loading === "true"
        ) {
            event.preventDefault();

            return;
        }

        if (submitButton) {

            submitButton.dataset.loading =
                "true";

            submitButton.disabled = true;

            submitButton.style.pointerEvents =
                "none";

            submitButton.style.opacity =
                "0.7";

            submitButton.innerHTML =
                "⏳ Creating Account...";
        }

    });
}
function initAdminEditDeliveryPerson() {

    const section =
        document.querySelector(
            "[data-admin-edit-delivery-person='true']"
        );

    if (!section) {
        return;
    }

    const form =
        section.querySelector(
            ".edit-delivery-person-form"
        );

    if (!form) {
        return;
    }

    const fullName =
        document.getElementById("full_name");

    const phone =
        document.getElementById("phone");

    const status =
        document.getElementById("status");

    const saveButton =
        form.querySelector(
            ".edit-personnel-save-btn"
        );


    form.addEventListener(
        "submit",
        function (event) {

            /*
             * Prevent double submission.
             */

            if (
                saveButton &&
                saveButton.dataset.loading === "true"
            ) {

                event.preventDefault();

                return;
            }


            /*
             * Validate full name.
             */

            if (fullName) {

                const name =
                    fullName.value.trim();

                if (name.length < 2) {

                    event.preventDefault();

                    alert(
                        "Please enter a valid full name."
                    );

                    fullName.focus();

                    return;
                }

            }


            /*
             * Validate phone.
             */

            if (phone) {

                const phoneValue =
                    phone.value.trim();

                if (phoneValue === "") {

                    event.preventDefault();

                    alert(
                        "Please enter a phone number."
                    );

                    phone.focus();

                    return;
                }

            }


            /*
             * Make sure a status has been selected.
             */

            if (
                status &&
                status.value === ""
            ) {

                event.preventDefault();

                alert(
                    "Please select an account status."
                );

                status.focus();

                return;
            }


            /*
             * Confirm the administrator wants
             * to save the changes.
             */

            const confirmed =
                window.confirm(
                    "Are you sure you want to save these changes to this delivery personnel account?"
                );

            if (!confirmed) {

                event.preventDefault();

                return;
            }


            /*
             * Loading state.
             */

            if (saveButton) {

                saveButton.dataset.loading =
                    "true";

                saveButton.disabled =
                    true;

                saveButton.style.pointerEvents =
                    "none";

                saveButton.style.opacity =
                    "0.7";

                saveButton.innerHTML =
                    "<span>⏳</span> Saving Changes...";
            }

        }
    );

}
function initAdminCustomers() {

    const customersSection =
        document.querySelector(
            "[data-admin-customers='true']"
        );

    if (!customersSection) {
        return;
    }


    const searchInput =
        document.getElementById(
            "adminCustomerSearch"
        );

    const customerRows =
        customersSection.querySelectorAll(
            ".admin-customer-row"
        );

    const noResults =
        document.getElementById(
            "adminCustomersNoResults"
        );


    /*
     * Client-side customer filtering.
     */

    function filterCustomers() {

        const searchValue =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";

        let visibleCustomers = 0;


        customerRows.forEach(
            function (row) {

                const name =
                    (
                        row.dataset.customerName ||
                        ""
                    ).toLowerCase();

                const phone =
                    (
                        row.dataset.customerPhone ||
                        ""
                    ).toLowerCase();

                const town =
                    (
                        row.dataset.customerTown ||
                        ""
                    ).toLowerCase();

                const district =
                    (
                        row.dataset.customerDistrict ||
                        ""
                    ).toLowerCase();


                const matches =
                    !searchValue ||
                    name.includes(searchValue) ||
                    phone.includes(searchValue) ||
                    town.includes(searchValue) ||
                    district.includes(searchValue);


                if (matches) {

                    row.style.display = "";

                    visibleCustomers++;

                } else {

                    row.style.display = "none";

                }

            }
        );


        if (noResults) {

            if (
                visibleCustomers === 0 &&
                customerRows.length > 0
            ) {

                noResults.style.display =
                    "block";

            } else {

                noResults.style.display =
                    "none";

            }

        }

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                filterCustomers();

            }
        );

    }


    /*
     * Search form loading state.
     */

    const searchForm =
        document.getElementById(
            "adminCustomersSearchForm"
        );

    const searchButton =
        document.getElementById(
            "adminCustomersSearchButton"
        );


    if (searchForm && searchButton) {

        searchForm.addEventListener(
            "submit",
            function () {

                if (
                    searchButton.dataset.loading ===
                    "true"
                ) {
                    return;
                }


                searchButton.dataset.loading =
                    "true";

                searchButton.disabled =
                    true;

                searchButton.style.pointerEvents =
                    "none";

                searchButton.style.opacity =
                    "0.7";

                searchButton.innerHTML =
                    "⏳ Searching...";

            }
        );

    }


    /*
     * View customer loading state.
     */

    const viewButtons =
        customersSection.querySelectorAll(
            "[data-customer-view='true']"
        );


    viewButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    if (
                        button.dataset.loading ===
                        "true"
                    ) {
                        return;
                    }


                    button.dataset.loading =
                        "true";

                    button.style.pointerEvents =
                        "none";

                    button.style.opacity =
                        "0.7";

                    button.innerHTML =
                        "⏳ Opening...";

                }
            );

        }
    );


    /*
     * Run once when the page loads.
     */

    filterCustomers();

}
function initAdminCustomerDetails() {

    const customerDetailsSection =
        document.querySelector(
            "[data-admin-customer-details='true']"
        );

    if (!customerDetailsSection) {
        return;
    }

    // =====================================================
    // VIEW ORDER BUTTONS
    // =====================================================

    const viewOrderButtons =
        customerDetailsSection.querySelectorAll(
            "[data-customer-view-order='true']"
        );

    viewOrderButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function (event) {

                if (
                    button.dataset.loading ===
                    "true"
                ) {
                    event.preventDefault();
                    return;
                }

                button.dataset.loading =
                    "true";

                button.style.pointerEvents =
                    "none";

                button.style.opacity =
                    "0.7";

                button.innerHTML =
                    "⏳ Opening...";
            }
        );

    });


    // =====================================================
    // BACK TO CUSTOMERS BUTTONS
    // =====================================================

    const backButtons =
        customerDetailsSection.querySelectorAll(
            "[data-customer-back='true']"
        );

    backButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function (event) {

                if (
                    button.dataset.loading ===
                    "true"
                ) {
                    event.preventDefault();
                    return;
                }

                button.dataset.loading =
                    "true";

                button.style.pointerEvents =
                    "none";

                button.style.opacity =
                    "0.7";

                button.innerHTML =
                    "⏳ Opening...";
            }
        );

    });


    // =====================================================
    // ALL ORDERS BUTTON
    // =====================================================

    const allOrdersButton =
        customerDetailsSection.querySelector(
            "[data-customer-all-orders='true']"
        );

    if (allOrdersButton) {

        allOrdersButton.addEventListener(
            "click",
            function (event) {

                if (
                    allOrdersButton.dataset.loading ===
                    "true"
                ) {
                    event.preventDefault();
                    return;
                }

                allOrdersButton.dataset.loading =
                    "true";

                allOrdersButton.style.pointerEvents =
                    "none";

                allOrdersButton.style.opacity =
                    "0.7";

                allOrdersButton.innerHTML =
                    "⏳ Opening...";
            }
        );

    }

}
function initAdminDashboardNavigation() {

    const dashboard =
        document.querySelector(
            "[data-admin-dashboard='true']"
        );

    if (!dashboard) {
        return;
    }

    const navigationLinks =
        dashboard.querySelectorAll(
            ".admin-dashboard-link"
        );

    navigationLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function (event) {

                if (
                    link.dataset.loading ===
                    "true"
                ) {
                    event.preventDefault();
                    return;
                }

                link.dataset.loading =
                    "true";

                link.style.pointerEvents =
                    "none";

                link.style.opacity =
                    "0.7";

                link.innerHTML =
                    "⏳ Opening...";

            }
        );

    });


    const logoutButton =
        document.getElementById(
            "adminLogoutButton"
        );

    const logoutText =
        document.getElementById(
            "adminLogoutText"
        );

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function (event) {

                if (
                    logoutButton.dataset.loading ===
                    "true"
                ) {
                    event.preventDefault();
                    return;
                }

                const confirmed =
                    window.confirm(
                        "Are you sure you want to log out of the SmartMart admin dashboard?"
                    );

                if (!confirmed) {
                    event.preventDefault();
                    return;
                }

                logoutButton.dataset.loading =
                    "true";

                logoutButton.style.pointerEvents =
                    "none";

                logoutButton.style.opacity =
                    "0.7";

                if (logoutText) {
                    logoutText.textContent =
                        "Logging out...";
                }

            }
        );

    }

}
// =========================================================
// ADMIN DELIVERY MANAGEMENT
// =========================================================

function initAdminDeliveries() {

    const deliveriesSection =
        document.querySelector(
            "[data-admin-deliveries='true']"
        );

    if (!deliveriesSection) {
        return;
    }


    // =====================================================
    // HEADER / QUICK ACTION LINKS
    // =====================================================

    const actionLinks =
        deliveriesSection.querySelectorAll(
            "a.delivery-header-btn, " +
            "a.delivery-view-btn, " +
            "a.delivery-empty-btn, " +
            "a.delivery-action-btn"
        );


    actionLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function (event) {

                if (
                    link.dataset.loading ===
                    "true"
                ) {
                    event.preventDefault();
                    return;
                }

                link.dataset.loading =
                    "true";

                link.style.pointerEvents =
                    "none";

                link.style.opacity =
                    "0.7";


                const originalText =
                    link.innerHTML;

                link.dataset.originalText =
                    originalText;

                link.innerHTML =
                    "⏳ Opening...";

            }
        );

    });


    // =====================================================
    // SEARCH FORM
    // =====================================================

    const filterForm =
        deliveriesSection.querySelector(
            'form[action*="admin_deliveries"]'
        );


    const searchInput =
        deliveriesSection.querySelector(
            'input[name="search"]'
        );


    const statusSelect =
        deliveriesSection.querySelector(
            'select[name="status"]'
        );


    const filterButton =
        deliveriesSection.querySelector(
            ".delivery-filter-btn"
        );


    if (filterForm) {

        filterForm.addEventListener(
            "submit",
            function (event) {

                if (
                    filterButton &&
                    filterButton.dataset.loading ===
                    "true"
                ) {
                    event.preventDefault();
                    return;
                }


                if (filterButton) {

                    filterButton.dataset.loading =
                        "true";

                    filterButton.disabled =
                        true;

                    filterButton.style.pointerEvents =
                        "none";

                    filterButton.style.opacity =
                        "0.7";

                    filterButton.innerHTML =
                        "⏳ Searching...";

                }

            }
        );

    }


    // =====================================================
    // SEARCH INPUT - CLEAR WITH ESC
    // =====================================================

    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    searchInput.value =
                        "";

                    searchInput.focus();

                }

            }
        );

    }


    // =====================================================
    // STATUS FILTER
    // =====================================================

    if (statusSelect) {

        statusSelect.addEventListener(
            "change",
            function () {

                if (
                    filterForm &&
                    statusSelect.value === ""
                ) {
                    return;
                }

                /*
                 * We do not automatically submit here.
                 * The administrator can choose the status
                 * and then click Search.
                 */

            }
        );

    }


    // =====================================================
    // RESET FILTER BUTTON
    // =====================================================

    const resetButton =
        deliveriesSection.querySelector(
            ".delivery-reset-btn"
        );


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            function (event) {

                if (
                    resetButton.dataset.loading ===
                    "true"
                ) {
                    event.preventDefault();
                    return;
                }


                resetButton.dataset.loading =
                    "true";

                resetButton.style.pointerEvents =
                    "none";

                resetButton.style.opacity =
                    "0.7";

                resetButton.innerHTML =
                    "⏳ Resetting...";

            }
        );

    }


    // =====================================================
    // INITIAL FORM STATE
    // =====================================================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                if (
                    filterButton &&
                    filterButton.dataset.loading ===
                    "true"
                ) {

                    filterButton.dataset.loading =
                        "false";

                    filterButton.disabled =
                        false;

                    filterButton.style.pointerEvents =
                        "";

                    filterButton.style.opacity =
                        "";

                    filterButton.innerHTML =
                        "🔍 Search";

                }

            }
        );

    }

}