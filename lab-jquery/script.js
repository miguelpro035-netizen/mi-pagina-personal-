/* ============================================
   DEPORZONE LA PAZ
   DISEÑO WEB II - UPDS 2026
============================================ */

$(document).ready(function () {

    let selectedSport = "";
    let selectedCourt = "";
    let selectedTime = "";
    let selectedPrice = 0;

    let reservations = [];
    let occupiedSlots = {};

    let clickCount = 0;
    let clickTimer = null;

    // LISTA DE CANCHAS Y PRECIOS

    const courts = [
        {name:"Cancha Futsal Premium",sport:"futsal",price:100},
        {name:"Cancha Futsal Norte",sport:"futsal",price:90},
        {name:"Cancha Futsal Central",sport:"futsal",price:110},

        {name:"Cancha Wally Pro",sport:"wally",price:80},
        {name:"Cancha Wally Sur",sport:"wally",price:75},
        {name:"Cancha Wally Arena",sport:"wally",price:95},

        {name:"Cancha Vóley Arena",sport:"voley",price:120},

        {name:"Cancha Básquet Central",sport:"basquet",price:130},
        {name:"Cancha Básquet Norte",sport:"basquet",price:115},
        {name:"Cancha Básquet Premium",sport:"basquet",price:140},

        {name:"Cancha Tenis Club",sport:"tenis",price:100},
        {name:"Cancha Tenis Norte",sport:"tenis",price:90},
        {name:"Cancha Tenis Premium",sport:"tenis",price:120}
    ];

    const sports = {
        futsal:"Futsal",
        wally:"Wally",
        voley:"Vóley",
        basquet:"Básquet",
        tenis:"Tenis"
    };

    // FECHA ACTUAL

    const today = new Date();

    const localDate = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];

    $("#reservationDate, #selectedDate")
        .attr("min", localDate)
        .val(localDate);

    populateCourtOptions();


    // 1. NOTIFICACIONES

    function showToast(message) {

        $("#toast")
            .stop(true, true)
            .text(message)
            .fadeIn(250)
            .delay(2200)
            .fadeOut(400);

    }


    // 2. CARGAR CANCHAS DINÁMICAMENTE

    function populateCourtOptions(sport = "", selected = "") {

        const $select = $("#selectedCourt");

        $select.empty().append(
            '<option value="">Seleccionar cancha</option>'
        );

        courts
            .filter(c => !sport || c.sport === sport)
            .forEach(c => {

                $select.append(
                    $("<option>")
                        .val(c.name)
                        .text(c.name + " — Bs " + c.price + "/hora")
                );

            });

        if (selected) {
            $select.val(selected);
        }

    }


    // 3. MENÚ HAMBURGUESA

    $("#menuToggle").click(function () {

        $("#mainNav").slideToggle(300);

    });

    $("#mainNav a").click(function () {

        if ($(window).width() <= 600) {

            $("#mainNav").slideUp(250);

        }

    });


    // 4. CAMBIO DE TEMA

    $("#themeToggle").click(function () {

        $("body").toggleClass("light");

        const light = $("body").hasClass("light");

        $(this).text(
            light ? "🌙 Modo oscuro" : "☀️ Modo claro"
        );

        showToast(
            light ? "Tema claro activado" : "Tema oscuro activado"
        );

    });


    // 5. FILTROS POR DEPORTE

    $(".tab").click(function () {

        $(".tab").removeClass("active");

        $(this).addClass("active");

        applyFilters();

        const sport = $(this).data("sport");

        showToast(
            sport === "todos"
                ? "Mostrando todos los deportes"
                : "Filtro: " + sports[sport]
        );

    });


    // 6. BÚSQUEDA EN TIEMPO REAL

    $("#searchCourt").on("keyup", function () {

        applyFilters();

    });


    // 7. FILTROS DE PRECIO Y ORDENAMIENTO

    $("#priceFilter, #sortFilter").on("change", function () {

        applyFilters();

    });


    // 8. FUNCIÓN CENTRAL DE FILTRADO

    function applyFilters() {

        const search = $("#searchCourt")
            .val()
            .toLowerCase()
            .trim();

        const sport = $(".tab.active").data("sport");

        const price = $("#priceFilter").val();

        const sort = $("#sortFilter").val();

        let cards = $(".court-card").toArray();

        // Ordenar precios

        if (sort === "asc") {

            cards.sort(function (a, b) {

                return Number($(a).data("price")) -
                       Number($(b).data("price"));

            });

        }

        if (sort === "desc") {

            cards.sort(function (a, b) {

                return Number($(b).data("price")) -
                       Number($(a).data("price"));

            });

        }

        $("#courtsGrid").append(cards);

        let visible = 0;

        $(".court-card").each(function () {

            const $card = $(this);

            const name = String(
                $card.data("name")
            ).toLowerCase();

            const cardSport = $card.data("sport");

            const cardPrice = Number(
                $card.data("price")
            );

            const matchSearch = name.includes(search);

            const matchSport =
                sport === "todos" || cardSport === sport;

            let matchPrice =
                price === "all" ||
                (price === "low" && cardPrice <= 80) ||
                (price === "medium" &&
                    cardPrice >= 81 && cardPrice <= 120) ||
                (price === "high" && cardPrice > 120);

            if (matchSearch && matchSport && matchPrice) {

                $card.stop(true, true).fadeIn(200);

                visible++;

            } else {

                $card.stop(true, true).fadeOut(150);

            }

        });

        $("#noResults").toggle(visible === 0);

    }


    // 9. LIMPIAR FILTROS

    $("#resetFilters").click(function () {

        $("#searchCourt").val("");

        $("#priceFilter").val("all");

        $("#sortFilter").val("default");

        $(".tab").removeClass("active");

        $('.tab[data-sport="todos"]').addClass("active");

        applyFilters();

        showToast("Filtros restablecidos");

    });


    // 10. ACORDEÓN DE DETALLES

    $(document).on("click", ".details-button", function () {

        const $button = $(this);

        $button.next(".accordion-content")
            .stop(true, true)
            .slideToggle(350);

        $button.text(
            $button.text().includes("Ver")
                ? "Ocultar detalles ↑"
                : "Ver detalles ↓"
        );

    });

    // 11. MODAL DE INFORMACIÓN

    function openCourtModal($card) {

        const name = $card.data("name");
        const sport = $card.data("sport");
        const price = $card.data("price");

        $("#modalTitle").text(name);

        $("#modalDescription").text(
            "Deporte: " + sports[sport] +
            ". Precio: Bs " + price +
            " por hora. Selecciona esta cancha para continuar."
        );

        $("#modalReserve").data("court", name);

        $("#courtModal")
            .css("display", "flex")
            .hide()
            .fadeIn(250);

    }

    // Botón visible "Más información" en cada tarjeta
    $(".court-card .court-info").append(
        '<button class="info-button" style="width:100%;margin-bottom:8px;' +
        'padding:9px;background:none;border:1px solid var(--border);' +
        'color:var(--text);border-radius:8px;cursor:pointer;font-size:12px;">' +
        'ℹ️ Más información</button>'
    );

    $(document).on("click", ".info-button", function () {
        openCourtModal($(this).closest(".court-card"));
    });

    // El doble clic sigue funcionando, pero ignora los botones
    $(".courts-grid").on("dblclick", ".court-card", function (event) {
        if ($(event.target).closest("button").length) return;
        openCourtModal($(this));
    });
    

    // 12. CERRAR MODAL

    $("#closeModal, #courtModal").click(function (event) {

        if (
            event.target.id === "closeModal" ||
            event.target.id === "courtModal"
        ) {

            $("#courtModal").fadeOut(200);

        }

    });


    // 13. SELECCIONAR CANCHA

    function selectCourt(name, sport) {

        const data = courts.find(c => c.name === name);

        if (!data) return;

        selectedCourt = name;

        selectedSport = sport;

        selectedPrice = data.price;

        $("#selectedSport").val(sport);

        populateCourtOptions(sport, name);

        updateSummary();

        $("#reservar")[0].scrollIntoView({
            behavior: "smooth"
        });

        showToast("Cancha seleccionada: " + name);

        refreshSlotAvailability();

    }


    // BOTONES DE SELECCIÓN

    $(document).on("click", ".reserve-button", function () {

        selectCourt(
            $(this).data("court"),
            $(this).data("sport")
        );

    });


    // SELECCIÓN DESDE EL MODAL

    $("#modalReserve").click(function () {

        const name = $(this).data("court");

        const data = courts.find(c => c.name === name);

        if (data) {

            selectCourt(name, data.sport);

        }

        $("#courtModal").fadeOut(200);

    });


    // 14. CAMBIO DE DEPORTE

    $("#selectedSport").change(function () {

        selectedSport = $(this).val();

        selectedCourt = "";

        selectedPrice = 0;

        populateCourtOptions(selectedSport);

        selectedTime = "";

        $("#selectedTime").val("");

        $(".slot").removeClass("selected vip");

        updateSummary();

        refreshSlotAvailability();

    });


    // 15. CAMBIO DE CANCHA

    $("#selectedCourt").change(function () {

        selectedCourt = $(this).val();

        const data = courts.find(
            c => c.name === selectedCourt
        );

        selectedPrice = data ? data.price : 0;

        selectedTime = "";

        $("#selectedTime").val("");

        $(".slot").removeClass("selected vip");

        updateSummary();

        refreshSlotAvailability();

    });


    // 16. ACTUALIZAR RESUMEN

    function updateSummary() {

        $("#summarySport").text(
            sports[selectedSport] || "No seleccionado"
        );

        $("#summaryCourt").text(
            selectedCourt || "No seleccionada"
        );

        $("#summaryDate").text(
            $("#selectedDate").val() || "No seleccionada"
        );

        $("#summaryTime").text(
            selectedTime || "No seleccionado"
        );

        $("#summaryPrice").text(
            "Bs " + selectedPrice
        );

        $("#summaryPrice")
            .stop(true)
            .animate({opacity: 0.35}, 100)
            .animate({opacity: 1}, 250);

    }


    // 17. CONTROL DE HORARIOS OCUPADOS

    function currentReservationKey(time) {

        return selectedCourt + "|" +
               $("#reservationDate").val() + "|" +
               time;

    }


    function refreshSlotAvailability() {

        $(".slot").each(function () {

            const time = $(this).data("time");

            const key = currentReservationKey(time);

            const isOccupied = !!occupiedSlots[key];

            $(this)
                .toggleClass("occupied", isOccupied)
                .prop("disabled", isOccupied);

            if (isOccupied) {

                $(this).removeClass("selected vip");

            }

        });

    }


    // 18. SELECCIÓN DE HORARIOS

    $(".slot").click(function () {

        const $button = $(this);

        if (!selectedCourt) {

            showToast("Primero selecciona una cancha.");

            return;

        }

        if ($button.hasClass("occupied")) {

            showToast(
                "Este horario ya está reservado para esta cancha."
            );

            return;

        }

        clickCount++;

        clearTimeout(clickTimer);

        const clicked = $button;

        clickTimer = setTimeout(function () {

            $(".slot").removeClass("selected vip");

            if (clickCount >= 3) {

                clicked.addClass("vip");

                selectedTime =
                    clicked.data("time") + " (VIP)";

                showToast("¡Selección VIP activada!");

            } else {

                clicked.addClass("selected");

                selectedTime = clicked.data("time");

                showToast(
                    "Horario seleccionado: " + selectedTime
                );

            }

            $("#selectedTime").val(selectedTime);

            updateSummary();

            clickCount = 0;

        }, 450);

    });


    // 19. CAMBIO DE FECHA

    function changeReservationDate(date) {

        $("#reservationDate, #selectedDate").val(date);

        selectedTime = "";

        $("#selectedTime").val("");

        $(".slot").removeClass("selected vip");

        refreshSlotAvailability();

        updateSummary();

    }


    $("#reservationDate").change(function () {

        changeReservationDate($(this).val());

        showToast("Fecha de reserva actualizada");

    });


    $("#selectedDate").change(function () {

        changeReservationDate($(this).val());

    });


    // 20. VALIDACIÓN DEL NOMBRE

    $("#clientName").on("input", function () {

        const value = $(this).val().trim();

        const valid =
            /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{3,60}$/.test(value);

        $("#nameError").text(
            value.length === 0 || valid
                ? ""
                : "Introduce un nombre válido de al menos 3 letras."
        );

    });


    // 21. VALIDACIÓN DEL TELÉFONO BOLIVIANO

    $("#clientPhone").on("input", function () {

        let value = $(this).val()
            .replace(/\D/g, "")
            .slice(0, 8);

        $(this).val(value);

        const valid = /^[67]\d{7}$/.test(value);

        $("#phoneError").text(
            value.length === 0 || valid
                ? ""
                : "Introduce un celular boliviano válido de 8 dígitos."
        );

    });


    // 22. ACTUALIZACIÓN DEL RESUMEN

    $("#selectedDate, #comments").on(
        "change input",
        updateSummary
    );


    // 23. REGISTRO DE RESERVAS

    $("#bookingForm").submit(function (event) {

        event.preventDefault();

        const name = $("#clientName").val().trim();

        const phone = $("#clientPhone").val().trim();

        const sport = $("#selectedSport").val();

        const court = $("#selectedCourt").val();

        const date = $("#selectedDate").val();

        const time = selectedTime;

        const terms = $("#terms").is(":checked");

        const nameValid =
            /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{3,60}$/.test(name);

        const phoneValid = /^[67]\d{7}$/.test(phone);

        const data = courts.find(c => c.name === court);

        const error = message => $("#formError").text(message);


        // VALIDAR NOMBRE

        if (!nameValid) {

            error("Verifica el nombre del cliente.");

            return;

        }


        // VALIDAR TELÉFONO

        if (!phoneValid) {

            error(
                "El teléfono debe tener 8 dígitos y comenzar con 6 o 7."
            );

            return;

        }


        // VALIDAR CAMPOS

        if (!sport || !court || !date || !time) {

            error(
                "Completa el deporte, cancha, fecha y horario."
            );

            return;

        }


        // VALIDAR CONFIRMACIÓN

        if (!terms) {

            error(
                "Debes aceptar la confirmación de los datos."
            );

            return;

        }


        // VALIDAR FECHA

        if (date < localDate) {

            error(
                "No puedes reservar una fecha anterior a hoy."
            );

            return;

        }


        // COMPROBAR DEPORTE Y CANCHA

        if (!data || data.sport !== sport) {

            error(
                "El deporte seleccionado no corresponde a la cancha."
            );

            return;

        }


        // COMPROBAR HORARIO DUPLICADO

        const cleanTime = time.replace(" (VIP)", "");

        const key = court + "|" + date + "|" + cleanTime;

        if (occupiedSlots[key]) {

            error(
                "Este horario ya fue reservado. Selecciona otro."
            );

            return;

        }


        // GENERAR RESERVA

        const reservation = {

            id: Date.now(),

            name: name,

            phone: phone,

            sport: sports[sport],

            court: court,

            date: date,

            time: time,

            price: data.price,

            comments: $("#comments").val().trim()

        };


        // GUARDAR EN MEMORIA

        reservations.push(reservation);

        occupiedSlots[key] = true;


        // ACTUALIZAR INTERFAZ

        renderReservations();

        refreshSlotAvailability();

        error("");

        showToast("¡Reserva registrada correctamente!");


        // CONFIRMACIÓN

        alert(
            "DEPORZONE LA PAZ\n\n" +
            "RESERVA REGISTRADA\n\n" +
            "Cliente: " + name + "\n" +
            "Teléfono: " + phone + "\n" +
            "Deporte: " + sports[sport] + "\n" +
            "Cancha: " + court + "\n" +
            "Fecha: " + date + "\n" +
            "Horario: " + time + "\n" +
            "Total: Bs " + data.price + "\n\n" +
            "Solicitud registrada correctamente."
        );


        // REINICIAR FORMULARIO

        $("#bookingForm")[0].reset();

        selectedTime = "";

        selectedSport = "";

        selectedCourt = "";

        selectedPrice = 0;

        populateCourtOptions();

        $("#reservationDate, #selectedDate").val(date);

        $(".slot").removeClass("selected vip");

        refreshSlotAvailability();

        updateSummary();

        $("#reservas")[0].scrollIntoView({
            behavior: "smooth"
        });

    });


    // 24. MOSTRAR RESERVAS DINÁMICAMENTE

    function renderReservations() {

        const $container = $("#reservationsList");

        $container.empty();

        if (reservations.length === 0) {

            $container.html(
                '<p class="empty-message">' +
                'Todavía no existen reservas registradas.' +
                '</p>'
            );

        }

        reservations.forEach(function (r) {

            const $item = $("<div>")
                .addClass("reservation-item");

            const $info = $("<div>");

            $("<h3>")
                .text(r.name + " · " + r.court)
                .appendTo($info);

            $("<p>")
                .text(
                    r.sport + " | " +
                    r.date + " | " +
                    r.time + " | Tel: " + r.phone
                )
                .appendTo($info);

            $("<strong>")
                .text("Bs " + r.price)
                .appendTo($item);

            $item.prepend($info);

            $container.append($item);

            $item.hide().fadeIn(350);

        });

        $("#reservationCount").text(
            reservations.length +
            (reservations.length === 1
                ? " reserva"
                : " reservas")
        );

    }


    // 25. EFECTO VISUAL INICIAL

    $(".hero-content").hide().fadeIn(900);

    $(".court-card").each(function (index) {

        $(this)
            .css("opacity", 0)
            .delay(index * 70)
            .animate({
                opacity: 1
            }, 350);

    });
    // MENÚ: restablecer al cambiar el tamaño de la ventana

    $(window).on("resize", function () {

        if ($(window).width() > 600) {

            $("#mainNav").removeAttr("style");

        }

    });

    // 26. INICIALIZACIÓN

    updateSummary();

    console.log(
        "DEPORZONE LA PAZ | jQuery iniciado | 13 canchas | 5 deportes"
    );

});