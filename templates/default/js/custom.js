$(document).ready(function () {
    isvg();

    var hash = document.location.hash;

    if (hash.length > 0 && hash.indexOf('question_') > 0) {
        setTimeout(function () {
            $(hash).siblings('.accordion-title').click();
        }, 500);
    }

    /**
     * Mask
     */
    var phone_input = $('input.phone');
    if (phone_input.length > 0) {
        phone_input.mask("+Z (000) 000-00-00", {
            clearIfNotMatch: true,
            placeholder: "+7/8 (___) ___-__-__",
            translation: {
                '+': {
                    pattern: /\+/, optional: true
                },
                'Z': {
                    pattern: /7|8/
                }
            }
        });
    }

    /**
     * модалка скачиваемого файла
     */
    $('.load-price').on('click', function () {

        var link = $(this).attr('data-link');
        var modal = $('#load_price_form');
        modal.attr('data-link', link);
        modal.foundation('open');

        return false;
    });

    $(document).on('open.zf.reveal', function () {
        $('html').addClass('modal_open');
    });

    $(document).on('closed.zf.reveal', function () {
        $('html').removeClass('modal_open');
    });

    /**
     * Отправка форм на ajax
     */
    $('form[data-request="ajax"]').each(function () {
        var form = $(this);

        initAjaxForm(form, true, function () {

            //скачивание файла
            if (form.closest('#load_price_form').length > 0) {
                formClear();

                var modal = $('#load_price_form');

                document.location.href = modal.attr('data-link');

                modal.foundation('hide');
            }

        });
    });


    /**
     * Переключение номеров телефона
     */
    $('#areaSelect_1 a').on('click', function () {
        $('#areaSelect_sup_1').foundation('toggle');
    });

    $('#areaSelect_2 a').on('click', function () {
        $('#areaSelect_sup_2').foundation('toggle');
    });

    $('#areaSelect_3 a').on('click', function () {
        $('#areaSelect_sup_3').foundation('toggle');
    });

    $('.areaSelect .areaSelect__sity a').on('click', function (e) {
        e.preventDefault();
        var text = $(this).text();
        var id = $(this).attr('data-id');

        var date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toUTCString();

        document.cookie = "current_city=" + id + expires + "; path=/";

        $('.areaSelect__sity_target span').text(text);

        $('.areaSelect__sity li.is-active').removeClass('is-active').find('a').removeAttr('aria-selected');
        $(this).attr('aria-selected', 'true').parent().addClass('is-active');

        $('[id^="city_phone_p"]').removeClass('is-active');
        $('#city_phone_p1_' + id).addClass('is-active');
        $('#city_phone_p2_' + id).addClass('is-active');
        $('#city_phone_p3_' + id).addClass('is-active');

        //$('#city_phone_p4_' + id).addClass('is-active');
        $('[id^="city_phone_p4"]').addClass('is-active');//в футере отображаются оба номера

        $('#city_phone_p5_' + id).addClass('is-active');
        $('#city_phone_p6_' + id).addClass('is-active');
        $('#city_phone_p7_' + id).addClass('is-active');

        $('.city_block').removeClass('is-active');
        $('.city_block_' + id).addClass('is-active');
    });

    //показ блока только для текущего города
    var current_city = getCookie('current_city');
    if (!current_city) {
        current_city = $('.areaSelect .areaSelect__sity .is-active a').attr('data-id');
    }
    if (current_city) {
        $('.city_block').removeClass('is-active');
        $('.city_block_' + current_city).addClass('is-active');
    }

    /**
     * Указать порядок сортировки
     */
    $('select.catalog-sort').on('change', function () {
        var date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toUTCString();

        document.cookie = "catalog_sort_field=" + $(this).val() + expires + "; path=/";

        catalogUpdate(true, false);
    });


    /**
     * Изменение вида каталога
     */
    $('.listing__viewSwitch a').on('click', function (e) {
        e.preventDefault();

        $(this).toggleClass('active').siblings().removeClass('active');

        var inner = $('.listing__inner');
        inner.toggleClass('list-view');
        inner.find('.columns').toggleClass('medium-6 large-4');

        var date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toUTCString();

        document.cookie = "catalog_view=" + $(this).attr('data-view') + expires + "; path=/";
    });

    /**
     * Показать еще
     *
     * @type {boolean}
     */
    $('.listing__more').on('click', function (e) {
        e.preventDefault();

        $(this).hide();

        var pagination_next = $('.pagination-next');
        if (!pagination_next.length || pagination_next.hasClass('disabled')) {
            return false;
        }

        $('.pagination .current').removeClass('current').next().addClass('current');

        var page = $(this).attr('data-page');
        //var pages = $(this).attr('data-pages');
        page++;
        $(this).attr('data-page', page);

        catalogUpdate(false, true);
    });

    /**
     * Перейти на страницу "Где купить" со страницы "Доставка и оплата"
     * "Показать всех"
     */
    $('.delivery_page_more_delegates').on('click', function (e) {
        e.preventDefault();
        var url = $(this).attr('href');
        var city = $('select[name="city"]').val();
        if (city) {
            url += "?city=" + city;
        }
        document.location.href = url;
        return false;
    });


    /**
     * Пагинация
     *
     * @type {boolean}
     */
    $('.items').on('click', '.pagination a', function (e) {
        e.preventDefault();

        var parent = $(this).parent();

        var more = $('.listing__more');


        if (parent.hasClass('disabled') || parent.hasClass('current')) {
            return false;
        } else if (parent.hasClass('pagination-previous')) {
            $('.pagination .current').removeClass('current').prev().addClass('current');

            more.attr('data-page', $(".pagination li.current a").text()-1);
            catalogUpdate(false, false);

        } else if (parent.hasClass('pagination-next')) {
            $('.pagination .current').removeClass('current').next().addClass('current');

            more.attr('data-page', $(".pagination li.current a").text()-1);
            catalogUpdate(false, false);
        } else {
            $('.pagination .current').removeClass('current');
            $(this).parent().addClass('current');

            more.attr('data-page', $(".pagination li.current a").text()-1);
            catalogUpdate(false, false);
        }
    })

    /**
     * Добавление товара в корзину
     * из списка товаров
     */
        .on('click', '.listing_in_cart', function (e) {
            return false;
        })

        .on('click', 'button.listing_to_cart', function (e) {
            e.preventDefault();

            var link = $(this);
            var url = $(this).attr('data-href');
            var item = $(this).closest('.columns');

            //показываем прелуадер
            showLoader(link);

            ajaxLink(link, url, function (result) {

                //обновить кнопку
                link.toggleClass('listing_in_cart listing_to_cart button__halfGreen button__incart button__green button__small');
                $('span', link).text('В корзине');

                //обновить корзину
                updateBasketInformer(result.summary.amount);

                var cartItem = null;
                for (var i in result.items.item) {
                    if (result.items.item[i].page.id == item.attr('data-id')) {
                        cartItem = result.items.item[i];
                    }
                }

                //открыть модаль
                var modal = $('#modal-incart');

                $('.cartCard__img img').attr('src', $('.listingCard__image img', item).attr('src'));
                $('.cartCard__title').html($('.listingCard__info .title', item).html());
                $('.cartCard__art').text($('.listingCard__info .article', item).text());
                $('.cartCard__item form').attr('action', '/udata/emarket/basket/put/element/' + item.attr('data-id') + '/.json');

                var price_actual = cartItem.price.actual;
                if (!price_actual) {
                    price_actual = 0;
                }
                var total_price_actual = cartItem['total-price'].actual;
                if (!total_price_actual) {
                    total_price_actual = 0;
                }

                $('.cartCard__price').attr('data-price', price_actual).html(formatPrice(total_price_actual));


                /*$('.modalIncart select[name="amount"]').each(function () {
                 var select = $(this);
                 $('option', select).prop('selected', false);
                 $('option[value="' + cartItem.amount + '"]', select).prop('selected', true);
                 select.niceSelect('update');
                 });*/
                $('.modalIncart input[name="amount"]').val(cartItem.amount);

                //Удаление товара из корзины из модали добавления товара
                $('.cartCard__delete', modal)
                    .unbind()
                    .on('click', function (e) {
                        e.preventDefault();

                        var url = '/udata/emarket/basket/remove/item/' + cartItem.id + '/.json';

                        ajaxLink($(this), url, function (result) {
                            //обновить корзину
                            updateBasketInformer(result.summary.amount);

                            //обновить кнопку
                            link.toggleClass('listing_in_cart listing_to_cart button__halfGreen button__incart button__green button__small');
                            $('span', link).text('В корзину');

                            var modal = $('#modal-incart');
                            modal.foundation('close');
                        });
                    });

                modal.foundation('open');

                if (typeof dataLayer == 'object') {
                    dataLayer.push({'event': 'CART_ADDITEM'}); //Товар добавили в корзину
                }
            });
            return false;
        });


    /**
     * Добавление товара в корзину
     * из карточки товаров
     */
    $('button.object_to_cart').on('click', function (e) {
        e.preventDefault();

        var link = $(this);
        var url = $(this).attr('data-href');
        var item = $('.itemCard[data-id]');

        //показываем прелуадер
        showLoader(link);

        ajaxLink(link, url, function (result) {
            //обновить кнопку
            link.toggleClass('object_in_cart button__halfGreen object_to_cart button__green');
            $('span', link).text('В корзине');

            //обновить корзину
            updateBasketInformer(result.summary.amount);

            var cartItem = null;
            for (var i in result.items.item) {
                if (result.items.item[i].page.id == item.attr('data-id')) {
                    cartItem = result.items.item[i];
                }
            }

            //открыть модаль
            var modal = $('#modal-incart');

            var mainImage = $('img.mainImage');
            if (mainImage.length > 0) {
                $('.cartCard__img img').attr('src', mainImage.attr('src'));
            }

            $('.cartCard__title').html($('.itemCard__title').text());

            $('.cartCard__art').html($('.itemCard__articul').html());

            $('.cartCard__item form').attr('action', '/udata/emarket/basket/put/element/' + item.attr('data-id') + '/.json');

            var price_actual = cartItem.price.actual;
            if (!price_actual) {
                price_actual = 0;
            }
            var total_price_actual = cartItem['total-price'].actual;
            if (!total_price_actual) {
                total_price_actual = 0;
            }
            $('.cartCard__price').attr('data-price', price_actual).html(formatPrice(total_price_actual));

            $('.modalIncart input[name="amount"]').val(cartItem.amount);

            //Удаление товара из корзины из модали добавления товара
            $('.cartCard__delete')
                .unbind()
                .on('click', function (e) {
                    e.preventDefault();

                    var url = '/udata/emarket/basket/remove/item/' + cartItem.id + '/.json';

                    ajaxLink($(this), url, function (result) {
                        //обновить корзину
                        updateBasketInformer(result.summary.amount);

                        //обновить кнопку
                        link.toggleClass('object_in_cart button__halfGreen object_to_cart button__green');
                        $('span', link).text('Добавить в корзину');

                        var modal = $('#modal-incart');
                        modal.foundation('close');
                    });
                });

            modal.foundation('open');

            if (typeof dataLayer == 'object') {
                dataLayer.push({'event': 'CART_ADDITEM'}); //Товар добавили в корзину
            }
        });
        return false;
    });

    $('.modalIncart__continueBtn').on('click', function (e) {
        e.preventDefault();
        var modal = $('#modal-incart');
        modal.foundation('close');
        return false;
    });


    /**
     * Фильтрация
     *
     * @type {boolean}
     */
    var filtring_timer = null;
    $('.listingFilter')
        .on('keyup', 'input[type="text"]', function () {
            if (filtring_timer) {
                clearTimeout(filtring_timer);
            }

            filtring_timer = setTimeout(function () {
                catalogUpdate(true, false)
            }, 500);
        })

        .on('change', 'input[type="checkbox"], input[type="radio"], select', function () {
            catalogUpdate(true, false);
        });


    /**
     * Изменение кол-ва товаров в корзине из модали после добавления товара
     */
        //$('.modalIncart select[name="amount"]').on('change', function () {
    var changeAmount = null;
    //var lastAmount = null;
    $('.modalIncart input[name="amount"]').on('keyup change', function () {
        var input = $(this);
        var val = input.val();
        if (val <= 0) {
            val = 1;
        }

        if (changeAmount) {
            clearTimeout(changeAmount);
        }

        changeAmount = setTimeout(function () {
            //if(lastAmount != val) {
            //lastAmount = val;

            var action = input.closest('form').attr('action');
            action += '?amount=' + val;

            ajaxLink(input, action, function (result) {
                //обновить корзину
                updateBasketInformer(result.summary.amount);
            });

            //обновить стоимость
            var cart_price = $('.cartCard__price');
            cart_price.html(formatPrice(val * cart_price.attr('data-price')));
            //}
        }, 400);
    });


    /**
     * Изменение кол-ва товаров в корзине
     */
    $('.cartList input[name="amount"]').on('keyup change', function () {
        var input = $(this);
        var item = input.closest('.cartCard');
        var val = input.val();
        if (val <= 0) {
            val = 1;
        }

        if (changeAmount) {
            clearTimeout(changeAmount);
        }
        var action = input.closest('form').attr('action');
        action += '?amount=' + val;

        changeAmount = setTimeout(function () {
            ajaxLink(input, action, function (result) {
                var cartItem = null;
                for (var i in result.items.item) {
                    if (result.items.item[i].id == item.attr('data-id')) {
                        cartItem = result.items.item[i];
                    }
                }

                //обновить корзину
                updateBasketInformer(result.summary.amount);

                updateBasketTotalPrice(result.summary.price.actual);

                //обновить стоимость
                var cart_price = $('.cartCard__price', item);
                cart_price.html(formatPrice(cartItem['total-price'].actual));
            });
        }, 400);
    }).on('keypress', function (event) {
        //отслеживаем нажатие по Enter
        if (event.which == 13) {
            return false;
        }
    });


    //Удаление товара из корзины
    $('.cartList .cartCard__delete').on('click', function (e) {
        e.preventDefault();

        var item = $(this).closest('.cartCard');

        var url = $(this).attr('data-url');

        ajaxLink($(this), url, function (result) {
            //обновить корзину
            updateBasketInformer(result.summary.amount);

            updateBasketTotalPrice(result.summary.price.actual);

            item.remove();

            if ($('.cartList .cartCard').length == 0) {
                $('.cartForm').hide();
                $('.cartList').text('В корзине нет ни одного товара');
            }
        });
    });


    /**
     * указать стоимость доставки на странице корзины товаров
     */
    $('.cart_delivery a').on('click', function () {
        $('#delivery_type_sup_2').foundation('toggle');
        var text = $(this).text();
        $('.cartForm__deliveryTarget span').text(text);

        var date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toUTCString();

        document.cookie = "cart_delivery=" + $(this).parent().attr('data-id') + expires + "; path=/";

        setTimeout(function () {
            updateBasketTotalPrice();
        }, 400);
    });


    $('.purchasing_delivery a').on('click', function () {
        $('#delivery_type_sup_2').foundation('toggle');

        var text = $(this).text();
        var id = $(this).parent().attr('data-id');

        $('.cartForm__deliveryTarget span').text(text);

        var date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toUTCString();

        document.cookie = "cart_delivery=" + id + expires + "; path=/";

        $('input[type="radio"]', $(this)).prop('checked', true);

        //сбросить адрес доставки, если самовывоз
        if (id == 1017) {
            formClear($('.cartForm__addressForm'));
            $('input[name="delivery-address"]').prop('checked', false);

            $('input[name="data[new][city]"]').removeAttr('required').prop('required', false);
            $('input[name="data[new][street]"]').removeAttr('required').prop('required', false);
            $('input[name="data[new][house]"]').removeAttr('required').prop('required', false);
        } else {
            $('input[name="delivery-address"]').prop('checked', true);
            $('input[name="data[new][city]"]').attr('required', 'required').prop('required', true);
            $('input[name="data[new][street]"]').attr('required', 'required').prop('required', true);
            $('input[name="data[new][house]"]').attr('required', 'required').prop('required', true);
        }

        setTimeout(function () {
            updateBasketTotalPrice();
        }, 400);
    });

    /**
     * указать способ оплаты на странице корзины товаров
     */
    $('.cart_payment a').on('click', function () {
        $('#payment_type_sup_2').foundation('toggle');
        var text = $(this).text();
        $('.cartForm__paymentTarget span').text(text);

        var date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toUTCString();

        document.cookie = "cart_payment=" + $(this).parent().attr('data-id') + expires + "; path=/";

        setTimeout(function () {
            updateBasketTotalPrice();
        }, 400);
    });

    /**
     * указать способ оплаты на странице заказа
     */
    $('.purchasing_payment a').on('click', function () {
        $('#payment_type_sup_2').foundation('toggle');

        var text = $(this).text();
        var id = $(this).parent().attr('data-id');

        $('.cartForm__paymentTarget span').text(text);

        var date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toUTCString();

        document.cookie = "cart_payment=" + id + expires + "; path=/";

        $('input[type="radio"]', $(this)).prop('checked', true);

        //если по счету для организации, то показать поле реквизиты компании
        if(id == 79134){
            $('.file_requisites').show();
            //$('#input_requisites').attr('required', 'required').prop('required', true);
        }else{
            $('.file_requisites').hide();
            //$('#input_requisites').removeAttr('required').prop('required', false);
        }
    });


    /**
     * Форма оформления заказа
     */
    var purchasing_form = $('form.purchasing');
    purchasing_form.ajaxValidFormSender({
        show_loader: true, //имеет смысл только при отправки на ajax
        hideForm: false, //после после успешной отправки, форму нужно скрыть
        show_errors: "global",
        parentErrorClass: "formGroup__error",
        ajax: {
            need: false
        },
        onAjaxSendSuccess: function (form, settings, result) {

            /*
             if(typeof dataLayer == 'object'){
             dataLayer.push({'event': 'TEST'}); // Форма оформления заказа
             }
             */
        }
    });

    /**
     * Ввод только цифр
     */
    $('input[name="amount"]').on('keypress', function (event) {
        if (event.which > 31 && (event.which < 48 || event.which > 57) && (event.which != 44 && event.which != 46 && event.which != 97 && event.which != 99 && event.which != 118)) {
            return false;
        } else {
            /*if($(this).val() <= 0){
             $(this).val(1);
             }*/
            return true;
        }
    });

    $('body').on('click', 'a[disabled]', function (e) {
        e.preventDefault();
    });


    /**
     * Показать скрытые категории
     */
    $('.show_more_categories').on('click', function (e) {
        e.preventDefault();

        $('.catalogGrid .column-block').show();

        $(this).remove();

        return false;
    });


    $('a.scroll_to[href^="#"]').on('click', function (event) {
        var target = $(this.getAttribute('href'));

        if (target.length) {
            event.preventDefault();
            $('html, body').stop().animate({
                scrollTop: target.offset().top
            }, 1000);
        }
    });


    /**
     * Калькулятор Ложемент
     */
    $('.calculate').on('click', function () {
        var calculator = $('#calculator');

        var form = $(this).closest('form');

        var price = parseInt(calculator.attr('data-price'));
        //var discount = calculator.attr('data-discount');

        var input_length = $('input[name="data[new][length]"]', form);
        var input_width = $('input[name="data[new][width]"]', form);
        var input_height = $('input[name="data[new][height]"]', form);
        var input_number = $('input[name="data[new][number]"]', form);

        var length = parseInt(input_length.val());
        var width = parseInt(input_width.val());
        var height = parseInt(input_height.val());
        var number = parseInt(input_number.val());

        //Валидация формы
        var error = false;
        if (!length) {
            error = true;
            input_length.parent().addClass('formGroup__error');
        }

        if (!width) {
            error = true;
            input_width.parent().addClass('formGroup__error');
        }

        if (!height) {
            error = true;
            input_height.parent().addClass('formGroup__error');
        }

        if (!number) {
            error = true;
            input_number.parent().addClass('formGroup__error');
        }

        if (error) {
            return false;
        }


        //миллиметры => метры
        length = length / (1000);
        width = width / (1000);
        height = height / (1000);


        //просчет
        var result = length * width * height * number * price;

        //применение скидки
        var discount_array = {"50000": "10", "100000": "15", "150000": "20"};
        var discount_percent = 0;
        var discount_price = 0;
        for (var i in discount_array) {
            if (i < result) {
                discount_percent = discount_array[i];
            }
        }

        if (discount_percent) {
            discount_price = discount_percent / 100 * result;
        }

        if (discount_price) {
            $('.order_price', form).html(fl2str(result, 0, ' ') + ' <span class="fa fa-rouble"></span>').parent().show();
            $('.order_discount', form).html(fl2str(discount_price, 0, ' ') + ' <span class="fa fa-rouble"></span>').parent().show();
            $('.cartForm__total h3', form).html('Сумма заказа со скидкой:');

            $('.order_item_price', form).html(fl2str((length * width * height * price), 0, ' ') + ' <span class="fa fa-rouble"></span>');
        } else {
            $('.order_price', form).parent().hide();
            $('.order_discount', form).parent().hide();
            $('.cartForm__total h3', form).html('Сумма заказа:');
        }
        var sum = fl2str((result - discount_price), 0, ' ');
        $('.cartForm__total .sum', form).html(sum + ' <span class="fa fa-rouble"></span>');


        $('input[name="data[new][price]"]', form).val(sum);
        $('input[name="data[new][discount]"]', form).val(discount_price);

        $('.step-result', form).show();
        $('.step-text', form).hide();
    });

    $('.show-step-form').on('click', function () {
        $('.step-form').show();
        $('.step-calculator').hide();
        $(this).hide();
        $('.show-step-calculator').show();
    });


    $('.show-step-calculator').on('click', function () {
        $('.step-form').hide();
        $('.step-result').hide();
        $('.step-calculator').show();
        $('.show-step-form').show();
        $('.step-text').show();
        $(this).hide();
    });

    $("#modal-video-banner")
        .on('open.zf.reveal', function () {
            var width = window.innerWidth
                || document.documentElement.clientWidth
                || document.body.clientWidth;

            var height;
            if (width > 1000) {
                height = '728px';
            } else if (width > 800) {
                height = '600px';
            } else if (width > 640) {
                height = '400px';
            } else {
                height = '300px';
            }

            $("#modal-video-banner").prepend('<iframe id="youTubeIframe" height="' + height + '" width="100%" src="https://www.youtube.com/embed/aTHmGS4tP1U?autoplay=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>');
        })
        .on('closed.zf.reveal', function () {
            $("#youTubeIframe").remove();
        });


    //ПЕРЕДАТЬ roistat ИДЕНТИФИКАТОР В ЗАКАЗ и в ФОРМУ ОБРАТНОЙ СВЯЗИ
    var input_order_roistat_id = $('#order_roistat_id');

    if (getCookie('roistat_visit')) {
        //console.log('roistatVisitCookie');
        //console.log(getCookie('roistat_visit'));
        if (input_order_roistat_id.length > 0) {
            input_order_roistat_id.val(getCookie('roistat_visit'));
        }

        $('meta[name="_roistat"]').attr('content', getCookie('roistat_visit'));
    } else {
        window.roistatVisitCallback = function (visitId) {

            //console.log('roistatVisitCallback');
            //передача в заказ
            //console.log(visitId);

            if (input_order_roistat_id.length > 0) {
                input_order_roistat_id.val(visitId);
            }
            $('meta[name="_roistat"]').attr('content', visitId);
        };
    }
});


function formatPrice(price){
    if(price >= 10000){
        return fl2str(price, 0, ' ') + '<span class="fa fa-rouble"></span>';
    }else {
        return fl2str(price, 2, ' ') + '<span class="fa fa-rouble"></span>';
    }
}

function updateBasketTotalPrice(price) {
    var container = $('.cartForm__total .sum');
    if (!price) {
        price = container.attr('data-price');
    }

    price = parseFloat(price);
    if (!price) {
        price = 0;
    }

    var min_order = parseFloat(container.attr('data-min-order'));
    if (!min_order) {
        min_order = 0;
    }

    //учитываем стоимость доставки
    var delivery_price = parseFloat($('.cartForm__deliveryTypes li.is-active').attr('data-price'));
    if (!delivery_price) {
        delivery_price = 0;
    }

    container.attr('data-price', price).html(formatPrice((price + delivery_price)));

    if (min_order > 0 && min_order > price) {
        $('.min_order_notify').show();
        $('.orderButton').addClass('disabled').attr('disabled', 'disabled');
    } else {
        $('.min_order_notify').hide();
        $('.orderButton').removeClass('disabled').removeAttr('disabled');
    }

}


function updateBasketInformer(amount) {
    if (amount > 0) {
        $('.header__basket').attr('href', '/emarket/cart/');
        $('.header__basket_counter').show().text(amount);
    } else {
        $('.header__basket').attr('href', '#');
        $('.header__basket_counter').hide().text('');
    }
}

/**
 * Листинг на ajax
 * @returns {undefined}
 */
var sending = false;

function catalogUpdate(clear_pager, append) {

    //1. собираем данные формы
    var query = getQueryData(clear_pager);

    var container = $('.items');
    var url = container.attr('data-url');
    if (append) {
        url = container.attr('data-append-url');
    }

    url += query;

    //защита от повторной отправки формы
    if (sending !== 1) {
        sending = 1;

        //показываем прелуадер
        showLoader(container);

        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json', //все данные принимаем в json
            success: function (result) {
                //возникла ошибка. Попробуем показать результат с перезагрузкой страницы
                if (result.error) {
                    //alert(result.error);

                    if (query == '?') {
                        document.location.href = document.location.pathname;
                    } else {
                        document.location.href = query;
                    }
                } else if (result.success) {

                    if (!append) {
                        //показываем результат
                        container.html(result.html);

                        //подкрутим экран
                        $('html, body').animate({
                            scrollTop: $('.breadcrumbs').offset().top
                        }, 1000);

                        //подмена url

                        if (query == '?') {
                            history.pushState(null, null, document.location.pathname);
                        } else {
                            history.pushState(null, null, query);
                        }
                    } else {
                        $('.listing__inner', container).append(result.html);
                    }

                    var more = $('.listing__more');
                    if(more.attr('data-pages')-1 > more.attr('data-page')){
                        more.show();
                    }

                    /*if (!$('.pagination-next').length || $('.pagination-next').hasClass('disabled')) {
                        $('.listing__more').hide();
                    } else {
                        $('.listing__more').show();
                    }*/

                }
            }, error: function (object, type, msg) {
                //document.location.href = query;//возникла ошибка. Попробуем показать результат с перезагрузкой страницы
                console.log(type + ': ' + msg);
                console.log(object);
            }, complete: function () {
                sending = 0;
                hideLoader(container);
            }
        });
    }
}


/**
 * Собираем данные для формы
 *
 * @returns {undefined}
 */
function getQueryData(clear_pager) {
    var filters = $('.listingFilter').serializeArray();

    //1. поиск
    var query = new Array;
    for (var i in filters) {
        var item = filters[i];
        if (item.value) {
            query.push(item.name + '=' + item.value);
        }
    }

    //2. учитываем поисковую строку
    var by_name = $('input[name="search_string"]');
    if (by_name.val()) {
        query.push('search_string=' + by_name.eq(0).val());
    }

    //3. учитываем пагинатор
    if (!clear_pager) {
        /*var page = $(".pagination li.current a").text();
        page--;*/
        var page = $('.listing__more').attr('data-page');
        if (page > 0) {
            query.push('p=' + page);
        }
    }

    if (query.length > 0) {
        return '?' + query.join('&');
    }
    return '?';
}

function isvg(container) {
    if (container) {
        var items = $('.isvg[data-icon]', container);
    } else {
        var items = $('.isvg[data-icon]');
    }

    items.each(function () {
        var icon = $(this);
        var url = './templates/default/img/svg/' + icon.attr('data-icon') + '.svg';
        $.ajax({
            url: url,
            dataType: 'html',
            success: function (response) {
                icon.html(response);
            }
        });
    });
}

//заглушка
function showLoader(form) {
    form.addClass('loading');
}

//заглушка
function hideLoader(form) {
    form.removeClass('loading');
}

function formClear(form) {
    $('[name^="data[new]"]', form).each(function () {
        if ($(this).attr('type') == 'radio' || $(this).attr('type') == 'checkbox') {
            $(this).prop('checked', false);
        } else {
            $(this).val('');
        }
    });
}

function modifyData(data) {
    var s = $('meta[name="_token"]').attr('content');
    if (s) {
        if (data != '') {
            data += "&k=" + s;
        } else {
            data += "?k=" + s;
        }
    }

    var roistat = $('meta[name="_roistat"]').attr('content');
    if (roistat) {
        if (data != '') {
            data += "&roistat_id=" + roistat;
        } else {
            data += "?roistat_id=" + roistat;
        }
    }

    return data;
}

function initAjaxForm(form, show_success, callback) {
    form.ajaxValidFormSender({
        show_loader: true, //имеет смысл только при отправки на ajax
        hideForm: true, //после после успешной отправки, форму нужно скрыть
        show_errors: "global",
        parentErrorClass: "formGroup__error",
        onAjaxSendSuccess: function (form, settings, result) {
            formClear(form);

            if (callback) {
                callback(form, settings, result);
            }

            if (result.id && typeof dataLayer == 'object') {
                dataLayer.push({'event': 'SEND_FORM_AJAX'}); //Отправка любой формы где ексть контактные данные (кроме корзины)

                if (result.id == '137') {
                    dataLayer.push({'event': 'SEND_FORM_RECALL'});//Обратный звонок
                } else if (result.id == '142') {
                    dataLayer.push({'event': 'SEND_FORM_RECALL_FROM_ITEM'}); //Форма на карточке "Перезвоните мне" SEND_FORM_RECALL_FROM_ITEM
                } else if (result.id == '145') {
                    dataLayer.push({'event': 'SEND_FORM_CONTACT_PAGE'});//Форма обратной связи со страницы контакты
                } else if (result.id == '146') {
                    dataLayer.push({'event': 'SEND_FORM_RECALL_FROM_ITEM'});//Скачать прайс лист
                } else if (result.id == '383') {
                    dataLayer.push({'event': 'SEND_FORM_OPT_PAGE'});//Оптовикам
                } else if (result.id == '588') {
                    dataLayer.push({'event': 'SEND_FORM_ZAKAZ_CASE'});//Краткие формы с Кейс,Кофр под заказ (Со страницы лендинга)
                } else if (result.id == '759') {
                    dataLayer.push({'event': 'SEND_FORM_CASES_BUY'});//Кейс,Кофр форма заказа
                } else if (result.id == '761') {
                    dataLayer.push({'event': 'SEND_FORM_LOZAMENT_WITHOUT_DATA'});//Отправки со страницы калькулятор лоджемент (без данных)
                } else if (result.id == '762') {
                    dataLayer.push({'event': 'SEND_FORM_LOZAMENT'});//Отправки со страницы калькулятор лоджемент (с данными)
                }
            }
        },
        onBeforeSend: function (form, settings) {
            var data = form.serialize();
            settings.formData = modifyData(data);
        }
    });
}


/**
 * Выполнение get-запроса без перезагрузки страницы
 */
function ajaxLink(link, url, callback) {
    //показываем прелуадер
    showLoader(link);

    if (!url) {
        url = link.attr('href');
    }

    $.ajax({
        dataType: 'json', //все данные принимаем в json
        url: url,
        type: 'GET',
        success: function (result) {

            if (result.error) {
                document.location.href = link.attr('href');
            } else {
                if (callback) {

                    callback(result);
                }
            }
        }, error: function (object, type, msg) {
            document.location.href = link.attr('href');
            //console.log(object);
            //console.log(type);
            //console.log(msg);
        }, complete: function () {
            hideLoader(link);
        }
    });
}

// возвращает cookie с именем name, если есть, если нет, то undefined
function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

/**
 * Преобразует число в строку формата 1_separator000_separator000._decimal
 * Float To String
 * @param float|integer _number - число любое, целое или дробное не важно
 * @param integer _decimal - число знаков после запятой
 * @param String _separator - разделитель разрядов
 * @return String
 */
function fl2str(_number, _decimal, _separator) {
    //console.log('fl2str');
    // определяем, количество знаков после точки, по умолчанию выставляется 2 знака
    var decimal = (typeof (_decimal) != 'undefined') ? _decimal : 2;

    // определяем, какой будет сепаратор [он же разделитель] между разрядами
    var separator = (typeof (_separator) != 'undefined') ? _separator : '';

    // преобразовываем входящий параметр к дробному числу, на всяк случай, если вдруг
    // входящий параметр будет не корректным
    var r = parseFloat(_number);
    if (_decimal != 0) {
        // так как в javascript нет функции для фиксации дробной части после точки
        // то выполняем своеобразный fix
        var exp10 = Math.pow(10, decimal);// приводим к правильному множителю
        r = Math.round(r * exp10) / exp10;// округляем до необходимого числа знаков после запятой
    }
    // преобразуем к строгому, фиксированному формату, так как в случае вывода целого числа
    // нули отбрасываются не корректно, то есть целое число должно
    // отображаться 1.00, а не 1
    r = Number(r).toFixed(decimal).toString().split('.');

    // разделяем разряды в больших числах, если это необходимо
    // то есть, 1000 превращаем 1 000
    b = r[0].replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g, "\$1" + separator);
    if (_decimal != 0) {
        r = b + '.' + r[1];
    } else {
        r = b;
    }
    return r;
}