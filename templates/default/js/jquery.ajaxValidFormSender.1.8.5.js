//(function($,jQuery){
/**
 * Плагин для отправки форм с валидацией как на ajax, так и с перезагрузкой страницы
 * Версия 1.8.5
 *
 * - встроенный механизм валидаций (проверка обязательных полей, валидация email и чисел, в том числе с плавающей точкой, проверка макс допустимой длинны поля, обязательно запнение одного из полей (TODO группировка схожих полей)
 * - валидация инн и огрн по классам inn b ogrn
 * - поддержка отправки форм на ajax c прикрепленными файлами
 * - может производить валидацию произвольного блока не привязываясь к тегу <form>
 *
 * Внимание! Плагином не поддерживается обратная совместимость. Заменив старую версию, более новой, вероятно столкнешня с неожиданными последствиями
 *Внимание! У валидируемых полей обязательно должнен быть заполнен аттрибут name
 *
 * Пример 1: Простая инициализация плагина
 * $("form").ajaxValidFormSender();
 *
 * Пример 2: Только валидация формы (Есть баг. Плагин перехватывает управление и производит отправку формы. TODO Необходимо доработать метод destroy...)
 * $("form").ajaxValidFormSender("validation", {});
 *
 * Пример 3: Отправить форму сразу посли инициализации
 * $("form").ajaxValidFormSender("submit", {});
 *
 **/
;
(function ($) {
	/**
	 * Непосредственная иницализация
	 *
	 */
	$.fn.ajaxValidFormSender = function (options) {
		/**
		 * Список публичных методов, доступных извне
		 */
		var methods = {
			init: function (options) {
				return this.each(function () {
					var form = $(this);
					var settings = form.data('avfd_settings');
					// Если плагин ещё не проинициализирован, выполняем инициализацию
					if (!settings) {
						var settings = $.extend({
							show_loader: true, //имеет смысл только при отправки на ajax
							errors: [],	//контейнер для хранения сообщений об ошибках во время последней валидации
							error_msgs: {
								"required": {
									"global": "Заполнены не все обязательные поля",
									"local": "Поле обязательно для заполнения"
								},
								"email": {
									"global": "Указано неверное значение E-mail",
									"local": "Указано неверное значение"
								},
								"number": "Указано неверное значение",
								"inn": "Указано неверное значение ИНН",
								"ogrn": "Указано неверное значение ОГРН",
								"bik": "Указано неверное значение БИК",
								"maxlength": {
									"global": "Есть поля превышающие максимальную допустимую длину",
									"local": "Поле превышает максимальную допустимую длину"
								},
								'even_one': "Одно из полей обязательно должно быть заполнено"
							},
							ajax: {
								need: true, //нужно ли отправка на ajax
								action: null,
								//upload_files:false,	//нужно ли подгружать файлы на ajax
								/*
								 * Всегда будет передаваться только одно значение.
								 * Применим в сочетинии с onBeforeSend
								 */
								formData: null,
								method: form.attr('method') || 'POST'    //по умолчанию все запросы через POST
							},
							//Блок для сообщения об ошибке и успешной отправке соответственно
							error_block: $(".error_msg", form),
							success_block: $(".success_msg", form),
							validate: true,	//нужно ли производить валидацию данных
							hideForm: true, //после после успешной отправки, форму нужно скрыть
							show_errors: "local",//"global" //выводить сообщения об ошибках в одном месте(global) или под каждым полем
							parentErrorClass: "input-error",
							onAjaxSendSuccess: function (form, settings, result) {
								//имеет место только при ajax отправке
							},
							onAjaxSendComplete: function (form, settings) {
								//имеет место только при ajax отправке
							},
							onBeforeSend: function (form, settings) {
								/*
								 * дает возможность отредактировать данные перед отправкой
								 * Внимание! данные сохраняют свои значения при последующих вызовах
								 * Example1:
								 * var fd = new FormData(form[0]);
								 * if (!$('input[name="services[]"]', form).is(":checked")) {
								 * 	fd.append("services[]", "");;   //необходимо для полного нормального удаления услуг (работа с чекбоксами)
								 * }
								 * settings.formData = fd;
								 *
								 * Example2:
								 * settings.formData = form.serialize();
								 * if (!$('input[name="services[]"]', form).is(":checked")) {
								 *     settings.formData += "&services[]=";   //необходимо для полного нормального удаления услуг
								 * }
								 */
							}

						}, options || {});

						form.data("avfd_settings", settings);

						/* Регистрируем события */
						//скрыть ошибку по фокусу
						$(form).on('focus', 'input, textarea', function () {
							methods.clearError.call(form, $(this));
						});
						$(form).on('change', 'textarea, select, input[type="radio"], input[type="checkbox"]', function () {  //textarea необходимо для корректной работы с текстовым редактором
							methods.clearError.call(form, $(this));
						});
						$('input[type="submit"],button[type="submit"]', form).on('click', function () {
							return methods.submit.call(form);
						});

						//97(a), 99(c), 118(v) - для поддержки copy/paste
						$(form).on('keypress', 'input[type="number"], input.number, input.inn, input.ogrn, input.bik', function (event) {
							if (event.which > 31 && (event.which < 48 || event.which > 57) && (event.which != 44 && event.which != 46 && event.which != 97 && event.which != 99 && event.which != 118 )) {
								return false;
							} else {
								return true;
							}
						});
					}

				});

			},
			destroy: function () {
				var form = $(this);
				form.removeData('avfd_settings');
				//TODO продумать как удалять события, зарегистрированные только данным плагином
				/*$('input, textarea', form).off('focus');
				 $('textarea', 'select', form).off('change');
				 $('input[type="submit"]', form).off('click');
				 $('input[type="number"], input.number', form).off('keypress');
				 */
			},
			isValidDate: function (input) {
				var pattern = new RegExp(/^[0-9][0-9]\.[0-9][0-9]\.[0-9][0-9][0-9][0-9]$/);
				return pattern.test(input.val());
			},
			isValidNumber: function (number) {
				number = number.replace(/\s+/g, '');
				var pattern = new RegExp(/^[0-9 ]+[.,]?[0-9]?$/);
				return pattern.test(number);
			},
			// Функция для проверки правильности ИНН
			isValidInn: function (i) {
				if (i.match(/\D/)) {
					return false;
				}
				var inn = i.match(/(\d)/g);
				if (inn.length == 10) {
					return inn[9] == String(((
								2 * inn[0] + 4 * inn[1] + 10 * inn[2] +
								3 * inn[3] + 5 * inn[4] + 9 * inn[5] +
								4 * inn[6] + 6 * inn[7] + 8 * inn[8]
							) % 11) % 10);
				} else if (inn.length == 12) {
					return inn[10] == String(((
								7 * inn[0] + 2 * inn[1] + 4 * inn[2] +
								10 * inn[3] + 3 * inn[4] + 5 * inn[5] +
								9 * inn[6] + 4 * inn[7] + 6 * inn[8] +
								8 * inn[9]
							) % 11) % 10) && inn[11] == String(((
								3 * inn[0] + 7 * inn[1] + 2 * inn[2] +
								4 * inn[3] + 10 * inn[4] + 3 * inn[5] +
								5 * inn[6] + 9 * inn[7] + 4 * inn[8] +
								6 * inn[9] + 8 * inn[10]
							) % 11) % 10);
				}

				return false;
			},
			//Проверка валидности огрн
			isValidOgrn: function (ogrn) {
				// проверка на число
				if (ogrn.match(/\D/)) {
					//alert("Введённый ОГРН не является числом");
					return false;
				}

				// проверка на 13 и 15 цифр
				if (ogrn.length != 13 && ogrn.length != 15) {
					return false;
				}

				// проверка ОГРН для ЮЛ
				if (ogrn.length == 13) {
					// проверка по контрольным цифрам
					var num12 = ogrn;
					num12 = Math.floor((num12 / 10) % 11);
					if (num12 == 10) {
						dgt13 = 0;
					} else {
						dgt13 = num12;
					}
					if (ogrn[12] == dgt13) {
						return true;
					}
					//alert("Введённый ОГРН не прошёл проверку по контрольным цифрам");
					return false;
				}

				// проверка ОГРН для ИП
				if (ogrn.length == 15) {
					// проверка по контрольным цифрам
					var num14 = ogrn;
					num14 = Math.floor((num14 / 10) % 13);
					var dgt15 = num14 % 10;
					if (ogrn[14] == dgt15) {
						return true;
					}
					//alert("Введённый ОГРН не прошёл проверку по контрольным цифрам");
					return false;
				}
			},
			isValidBik: function (bik) {
				// проверка на число
				if (bik.match(/\D/)) {
					//alert("Введённый ОГРН не является числом");
					return false;
				}

				// проверка на 9 цифр
				if (bik.length != 9) {
					return false;
				}
				//начинается на 04
				if (bik.slice(0, 2) != '04') {
					return false;
				}
				return true;
			},
			isValidEmail: function (email) {
				email = email.replace(/^\s+|\s+$/g, '');
				//return (/^([a-zа-я0-9_\-]+\.)*[a-zа-я0-9_\-]+@([a-zа-я0-9][a-zа-я0-9\-]*[a-zа-я0-9]\.)+[a-zа-я]{2,4}$/i).test(email);
				return (/^([a-zA-Zа-яА-Я_\-]+\.)*[-a-zA-Zа-яА-Я0-9_\.\-]+@([a-zA-Zа-яА-Я0-9][-a-zA-Zа-яА-Я0-9_\-]*[a-zA-Zа-яА-Я0-9]\.)+[a-zA-Zа-яА-Я]{2,4}$/i).test(email);
				//return (/^[a-zA-Zа-яА-Я_\d][-a-zA-Zа-яА-Я0-9_\.\d]*\@[a-zA-Zа-яА-Я\d][-a-zA-Zа-яА-Я\.\d]*\.[a-zA-Zа-яА-Я]{2,4}$/i).test(email);
			},
			showError: function (object, msg_key) {
				var form = $(this);
				var settings = form.data('avfd_settings');
				var msg = settings.error_msgs[msg_key];
				if ($.isPlainObject(msg)) {
					msg = msg[settings.show_errors];
				}
				//console.log(msg);
				//регистрируем новое сообщение об ошибке
				if (!settings.errors[msg_key]) {
					settings.errors[msg_key] = msg;
					var show = 1;	//флаг для глобальных сообщений, такое сообщение еще не выводилось
				} else {
					var show = 0;	//флаг для глобальных сообщений, такое сообщение уже выводилось
				}
				object.each(function(){
					var block = $(this).parent();
					block.addClass(settings.parentErrorClass);

					if (settings.show_errors != "global") {
						block.append('<p class="error_notify">' + msg + '</p>');
					}
				});

				if (settings.show_errors == "global") {
					//убедимся, что такое сообщение еще не зарегистрировано
					if (show) {
						settings.error_block.append(msg + "<br>").show();
					}
				}
			},
			clearErrors: function () {
				var form = $(this);
				var settings = form.data('avfd_settings');
				//сообщения об ошибке и успешной отправке соответственно
				var error_msg = settings.error_block;//form.find(".error_msg");
				var success_msg = settings.success_block;//form.find(".success_msg");
				error_msg.text('').hide();
				success_msg.text('').hide();
				$("." + settings.parentErrorClass, form).removeClass(settings.parentErrorClass);
				$(".error_notify", form).remove();
				settings.errors = [];
			},
			clearError: function (object) {
				var form = $(this);
				var settings = form.data('avfd_settings');
				var block = object.closest("." + settings.parentErrorClass);
				block.removeClass(settings.parentErrorClass);
				$(".error_notify", block).remove();
			},
			isError: function (object) {
				var form = $(this);
				var settings = form.data('avfd_settings');
				if (object.parent().is("." + settings.parentErrorClass)) {
					return true;
				} else {
					return false;
				}
			},
			countCharacters: function (input) {
				var allowed = '';
				/*
				 allowed = (((allowed || '') + '')
				 .toLowerCase()
				 .match(/<[a-z][a-z0-9]*>/g) || [])
				 .join('') // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
				 */
				var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
					commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi
				var normalizedText = input.replace(commentsAndPhpTags, '')
					.replace(tags, function ($0, $1) {
						return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
					});

				return (normalizedText.length);
			},
			validation: function () {
				var form = $(this);
				//var settings = form.data('avfd_settings');

				//скрываем ранее выведенные сообщения
				methods.clearErrors.call(form);
				var valid = true;
				//проверка обязательных полей
				$('input[required][type!="radio"][type!="checkbox"], textarea[required]', form).each(function () {
					var object = $(this);
					//в валидации участвуют только поля, имеющие аттрибут name
					if (object.attr('name')) {
						if (object.attr('placeholder') == object.val() || object.val()/*.toString()*/.length < 1) {
							//methods.showError(object, "required", settings);
							methods.showError.call(form, object, "required");
							valid = false;
						}
					}
				});

				//особые правила для radio и checkbox
				//TODO придумать более оптимальный алгоритм
				//группируем элементы по name
				var radios = [];
				$('input[required][type="radio"], input[required][type="checkbox"]', form).each(function () {
					var name = $(this).attr('name');
					//в валидации участвуют только поля, имеющие аттрибут name
					if (name) {
						var val = $(this).val();
						if (!radios[name]) {
							radios[name] = [];//{val:$(this)};
						}
						radios[name][val] = $(this);
					}
				});
				if (radios.length > 0) {
					for (var input_name in radios) {
						var prev_valid = false;		//флаг указатель на то, что ни один из  radio или checkbox не отмечен
						var common_parent = null;	//общий родительский элемент для всех radio и checkbox
						var common_parent_finded = false;	//указатель на то, что общий родитель найден. Флаг для того, чтоб не выполнять повторно одни и те же действия
						for (var input in radios[input_name]) {
							var object = radios[input_name][input];
							//смотрим чекнут ли инпут, если да, проверка пройдена
							if (prev_valid || object.prop('checked')) {
								//methods.showError(object, "required", settings);
								prev_valid = true;
							}

							//ищем общего родителя, к которому будет привязываться сообщение об ошибке
							if (!prev_valid) {	//если проверка пройдена, то нет смысла искать родителя
								if (!common_parent) {	//первый проход
									common_parent = object.parent();
								} else if (!common_parent_finded) {
									while (!common_parent_finded) {
										object.parents().each(function () {
											if (!common_parent_finded && $(this).get(0) == common_parent.get(0)) {
												common_parent_finded = true;
											}
										});
										if (!common_parent_finded) {
											if (common_parent.parent().length > 0) {
												common_parent = common_parent.parent();
											} else {
												common_parent_finded = true;	//ничего не найдено, но и родительские элементы закончились (все очень-очень плохо ;( )
											}
										}
									}
								}
							}
						}
						if (!prev_valid) {
							//предаем не common_parent, а первый вложенный элемент, так как ошибка должна подсветиться уже на common_parent
							methods.showError.call(form, $('*:first', common_parent), "required");
							valid = false;
						}
					}
				}

				//особые правила для выпадающих списков
				$('select[required]', form).each(function () {
					var object = $(this);
					//в валидации участвуют только поля, имеющие аттрибут name
					if (object.attr('name')) {
						if ($(object).val() == '' || $(object).val() == '0') {
							//methods.showError(object, "required", settings);
							methods.showError.call(form, object, "required");
							valid = false;
						}
					}
				});


				//проверка email
				form.find('.email, input[type="email"]').each(function () {
					var object = $(this);
					//в валидации участвуют только поля, имеющие аттрибут name
					if (object.attr('name')) {
						//ошибка уже есть, например на предидущем шаге
						if (/*methods.isError(object)*/ methods.isError.call(form, object) === false) {
							//if ((object.is('.even_one') && object.val().toString().length > 2) || !object.is('.even_one')) { //ecли поле не обязательно, но одно из обязательных
							if (object.val() && !methods.isValidEmail.call(form, object.val())) {
								//methods.showError(object, 'email', settings);
								methods.showError.call(form, object, "email");
								valid = false;
							}
						}
					}
				});


				//проверка на число
				form.find('.number, input[type="number"]').each(function () {
					var object = $(this);
					//в валидации участвуют только поля, имеющие аттрибут name
					if (object.attr('name')) {
						//ошибка уже есть, например на предидущем шаге
						if (methods.isError.call(form, object) === false) {
							//if ((object.is('.even_one') && object.val().toString().length > 2) || !object.is('.even_one')) { //ecли поле не обязательно, но одно из обязательных
							if (object.val() && !methods.isValidNumber.call(form, object.val())) {
								methods.showError.call(form, object, "number");
								valid = false;
							}
						}
					}
				});


				//Проверка валидности ИНН
				form.find('input[class="inn"]').each(function () {
					var object = $(this);
					//в валидации участвуют только поля, имеющие аттрибут name
					if (object.attr('name')) {
						//ошибка уже есть, например на предидущем шаге
						if (/*methods.isError(object)*/ methods.isError.call(form, object) === false) {
							//if ((object.is('.even_one') && object.val().toString().length > 2) || !object.is('.even_one')) { //ecли поле не обязательно, но одно из обязательных
							if (object.val() && !methods.isValidInn.call(form, object.val())) {
								//methods.showError(object, 'email', settings);
								methods.showError.call(form, object, "inn");
								valid = false;
							}
						}
					}
				});


				//Проверка валидности ОГРН
				form.find('input[class="ogrn"]').each(function () {
					var object = $(this);
					//в валидации участвуют только поля, имеющие аттрибут name
					if (object.attr('name')) {
						//ошибка уже есть, например на предидущем шаге
						if (/*methods.isError(object)*/ methods.isError.call(form, object) === false) {
							//if ((object.is('.even_one') && object.val().toString().length > 2) || !object.is('.even_one')) { //ecли поле не обязательно, но одно из обязательных
							if (object.val() && !methods.isValidOgrn.call(form, object.val())) {
								//methods.showError(object, 'email', settings);
								methods.showError.call(form, object, "ogrn");
								valid = false;
							}
						}
					}
				});

				//проверка на макс значение
				form.find('textarea[data-maxlength], input[type="text"][data-maxlength]').each(function () {
					/*
					 var myval = object.val();
					 if (maxval > 0 && myval > maxval) {
					 showError(object);
					 valid = false;
					 }*/
					var object = $(this);
					var maxlength = parseInt(object.attr('data-maxlength'));
					//в валидации участвуют только поля, имеющие аттрибут name
					if (object.attr('name')) {
						//ошибка уже есть, например на предидущем шаге
						if (/*methods.isError(object)*/ methods.isError.call(form, object) === false) {
							//if ((object.is('.even_one') && object.val().toString().length > 2) || !object.is('.even_one')) { //ecли поле не обязательно, но одно из обязательных
							if (maxlength < methods.countCharacters.call(form, object.val())) {
								//methods.showError(object, 'email', settings);
								methods.showError.call(form, object, "maxlength");
								valid = false;
							}
						}
					}
				});

				//одно из полей обязательно должно быть заполнено
				var has_val = (form.find('.even_one').length == 0);
				form.find('.even_one').each(function () {
					var object = $(this);

					//в валидации участвуют только поля, имеющие аттрибут name
					if (object.attr('name')) {
						if ( $(object).val() ) {
							has_val = true;
						}
					}
				});

				if(!has_val) {
					methods.showError.call(form, form.find('.even_one'), "even_one");
					valid = false;
				}

				/*//проверка капчи
				 form.find('.captcha').each(function () {
				 var object = $(this);
				 if (isError(object) == false) {
				 var value = object.val();

				 $.ajax({
				 url: "./templates/default/js/handlers/check_captcha.php?captcha=" + value,
				 async: false,
				 success: function (data) {
				 if (data == "false") {
				 showError(object);
				 valid = false;
				 }
				 }
				 });
				 }
				 });*/


				/*
				 //проверка на макс значение
				 form.find('input[minval]').each(function () {
				 var object = $(this);
				 var minval = parseInt(object.attr('minval'));
				 var myval = object.val();
				 if (myval < minval) {
				 showError(object);
				 valid = false;
				 }
				 });
				 */


				/*
				 //проверка совпадения паролей
				 form.find("input[name='password']").each(function(){
				 if(form.find("input").attr('name')=='password_confirm'){
				 if($(this).val()!=form.find("input[name='password_confirm']").val()){
				 if(!form.find("input[name='password_confirm']").next().hasClass('error_msg')){
				 form.find("input[name='password_confirm']").after('<label class="error_msg">'+messages_pass+'</label>');
				 }
				 $(this).addClass('error_input');
				 form.find("input[name='password_confirm']").addClass('error_input');
				 valid = false;
				 }
				 }
				 });

				 //обязательный checkbox
				 form.find('.rcheckbox').each(function(){
				 if(!$(this).is(':checked')){
				 $(this).addClass('error_input');
				 if(!$(this).next().hasClass('error_msg')){
				 $(this).after('<label class="error_msg">Обязательное условие</label>');
				 }
				 valid = false;
				 }
				 });
				 */

				return valid;
			},
			submit: function () {
				var form = this;
				var settings = form.data('avfd_settings');


				if (settings.validate === false) {	//валидация отключена
					methods.clearErrors.call(form);		//скрыть старые сообщения об ошибках
				} else {
					if (methods.validation.call(form) === false)	//валидация формы
						return false;
				}

				settings.onBeforeSend(form, settings);
				if (settings.ajax.need === false) {
					form.submit();
					return false;
				} else {
					//защита от повторной отправки формы
					if (form.data("sending") !== 1) {
						form.data("sending", 1);
						//if (settings.ajax.upload_files === false) {

						if (settings.show_loader === true) {
							showLoader(form);
						}
						$.ajax({
							dataType: 'json', //все данные принимаем в json
							//contentType: false, //'multipart/form-data',	//для поддрежки загрузки файлов на ajax
							//processData: false, //для поддрежки загрузки файлов на ajax
							url: (settings.ajax.action) ? settings.ajax.action : form.attr('action'),
							data: /*(settings.ajax.method == 'POST' || settings.ajax.method == 'post') ? (settings.formData || new FormData(form[0])) : */(settings.formData) ? settings.formData : form.serialize(),
							//data: settings.formData || new FormData(form[0])/*form.serialize()*/,
							type: settings.ajax.method,
							success: function (result) {
								if (result.errors || result.error) {
									if (result.errors) {
										var errors = result.errors;
									} else {
										var errors = result.error;
									}

									if ($.isArray(errors) || $.isPlainObject(errors)) {
										var msg = '';
										for (var key in errors) {
											console.log(errors[key]);
											msg += errors[key] + '<br/>';
										}
									} else {
										msg = errors;
									}

									/*if (result.location) {
									 msg += '<br/>Выполняется перенаправление';
									 }*/
									settings.error_block.html(msg).show();
								} else if (result.success) {
									//после отправки, форму нужно скрыть
									if (settings.hideForm === true) {
										$(">*", form).fadeOut(300);
									}

									if (result.location) {
										msg += '<br/>Выполняется перенаправление';
									}

									setTimeout(function () {
										settings.success_block.html(result.success).fadeIn();
									}, 300);


									settings.onAjaxSendSuccess(form, settings, result);
								}

								if (result.location) {
									setTimeout(function () {
										document.location.href = result.location;
									}, 500); //делаем небольшую паузу, чтоб пользователь успел прочесть сообщение
								}
							}, error: function (object, type, msg) {

								console.log(type + ': ' + msg);
								console.log(object);

								if (object && object.responseJSON) {
									var errors = object.responseJSON;
									if ($.isArray(errors) || $.isPlainObject(errors)) {
										var txt = '';
										for (var key in errors) {
											console.log(errors[key]);
											txt += errors[key] + '<br/>';
										}
										settings.error_block.html(txt).show();
									} else {
										settings.error_block.html(error).show();
									}
								} else {
									settings.error_block.html("Во время выполнения запроса возникла ошибка. Перезагрузите страницу и повторите попытку или сообщите нам об ошибке").show();
								}
							}, complete: function () {
								form.data("sending", 0);
								//if (settings.show_loader === true) {
									hideLoader(form);
								//}
								settings.onAjaxSendComplete(form, settings);
							}/*, statusCode:{
							 302:function(){
							 setTimeout(function () {
							 document.location.href = "";
							 }, 500); //делаем небольшую паузу, чтоб пользователь успел прочесть сообщение
							 }
							 }*/
						});
						/*} else {
						 var http = new XMLHttpRequest(); // Создаем объект XHR, через который далее скинем файл на сервер.
						 // Процесс загрузки
						 if (http.upload && http.upload.addEventListener) {
						 http.onreadystatechange = function () {
						 // Действия после загрузки файлов
						 if (this.readyState === 4) { // Считываем только 4 результат, так как их 4 штуки и полная инфа о загрузке находится
						 if (this.status === 200) { // Если все прошло гладко
						 // Действия после успешной загрузки.
						 var result = $.parseJSON(this.response);
						 if (result.success) {
						 $("textarea", form).val("");
						 $(".success_msg", form).html(result.success).fadeIn();
						 callback();	//функция обатного вызова
						 return false;
						 } else if (result.error) {
						 $(".error_msg", form).html(result.error).show();
						 }
						 }

						 $(".error_msg", form).html("Возникла ошибка. Перезагрузите страницу и попробуйте еще раз.").show();
						 return false;
						 }
						 };

						 // Паникуем, если возникла ошибка!
						 http.upload.addEventListener('error', function (e) {
						 $(".error_msg", form).html("Возникла ошибка. Перезагрузите страницу и попробуйте еще раз.").show();
						 return false;
						 });
						 }

						 var fd = new FormData(); // Создаем объект формы.
						 $("input, textarea", form).each(function () {
						 if ($(this).attr("name") && $(this).val()) {
						 if ($(this).attr("type") === "file") {
						 var file_input = $(this);
						 if (file_input.length > 0 && file_input[0].files.length > 0) {
						 var file = file_input[0].files[0];
						 fd.append($(this).attr("name"), file);
						 }
						 } else {
						 fd.append($(this).attr("name"), $(this).val());
						 }
						 fd.append("ajax", 1);
						 }
						 });

						 http.open('POST', form.attr("action")); // Открываем коннект до сервера.
						 http.send(fd); // И отправляем форму, в которой наши файлы. Через XHR.
						 }*/
					}
				}
				return false;
			}

		};


		/*if (options ==='isValidEmail') {
		 return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
		 }else */
		if (methods[options]) {
			//регистрациия плагина
			methods.init.apply(this, Array.prototype.slice.call(arguments, 1));
			//выполнение необходимых действий
			var result = methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
			//деактивация плагина
			methods.destroy();
			//возвращаем требуемое значение
			return result;
		} else if (typeof options === 'object' || !options) {   //!options || $.isPlainObject(options
			return methods.init.apply(this, arguments);
		} else {
			$.error('Метод с именем ' + options + ' не существует для jQuery.ajaxValidFormSender');
		}

	};

})(jQuery);
//})(lastJQ,lastJQ);