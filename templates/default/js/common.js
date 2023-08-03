$(document).ready(function() {
	$('.fotorama').fotorama();

	$('body').on('click', function(){
        $('.formGroup .formGroup__el').each(function(){
            var text_value=$(this).val();
            if(text_value!='')
            {
                $(this).parent().addClass('hasValue');
            } else {
                $(this).parent().removeClass('hasValue');
            }
        });
    });

	$('input[placeholder], textarea[placeholder]').placeholder();
	
	$(document).foundation();

	$('select.select-custom').niceSelect();
	$('.ie select.select-custom').niceSelect('destroy');

	$('body').on('click', function(){
		var dropdown_pane = $('.dropdown-pane');
		if(dropdown_pane.length > 0) {
			dropdown_pane.foundation('close');
		} 
	});

	/* vladimir
	$('#areaSelect_1 a').on('click', function(){
		$('#areaSelect_sup').foundation('toggle');
	});

	$('#areaSelect_2 a').on('click', function(){
		$('#areaSelect_sup_1').foundation('toggle');
	});

	$('#areaSelect_3 a').on('click', function(){
		$('#areaSelect_sup_2').foundation('toggle');
	});
	*/

	/* vladimir
	$('#delivery_type a').on('click', function(){
		// e.preventDefault();
		$('#delivery_type_sup_2').foundation('toggle');
		var text = $(this).text();
		$('.cartForm__deliveryTarget span').text(text);
	});


	$('.areaSelect .areaSelect__sity a').on('click', function(e){
		e.preventDefault();
		var text = $(this).text();
		$('.areaSelect__sity_target span').text(text);
	});
	*/

	$('.header__search_button').on('click', function(e){
		e.preventDefault();
		$('.header__search').addClass('active');
	});

	$(document).mouseup(function (e) {
		var container = $('.header__search');
		var container_m = $('.header__search_wrap_m');
		if (container.has(e.target).length === 0) {
			container.removeClass('active');
		}
		if (container_m.has(e.target).length === 0) {
			container_m.removeClass('active');
		}
	});


	$('.mobileSearch__toggle').on('click', function(e){
		e.preventDefault();
		$('.header__search_wrap_m').toggleClass('active');
	});
	///// modals events

	/* vladimir
	$('input[name=cphone]').mask('+7(999)999-99-99');
	 */

	$(document).on('open.zf.reveal', function(){
		$('html').addClass('modal_open');
	});
	$(document).on('closed.zf.reveal', function(){
		$('html').removeClass('modal_open');
	});

	//// customTabs
	var customTabs = function(){
		var width = 0;
		$('.customTabs .tabs li').each(function() {
			width += $(this).outerWidth( true );
		});
		$('.customTabs .tabs').css('width', width + 50);
	};
	customTabs();



	$('.header__toggleLeft').on('click', function(e){
		e.preventDefault();
		$('body').toggleClass('left_open');
		$('html').toggleClass('modal_open');
	});
	$('.page_close').on('click', function(){
		$('body').removeClass('left_open');
	});
	$('.mobileCatalog__o').on('click', function(e){
		e.preventDefault();
		$('body').addClass('mobileCatalog__open');
		$('html').addClass('modal_open');
	});
	$('.mobileCatalog__c').on('click', function(e){
		e.preventDefault();
		$('body').removeClass('mobileCatalog__open');
		$('body').removeClass('left_open');
		$('html').removeClass('modal_open');
	});



	// $('a[href^="#"]').on('click', function(event) {
	// 	var target = $(this.getAttribute('href'));
	// 	if( target.length ) {
	// 		event.preventDefault();
	// 		$('html, body').stop().animate({
	// 			scrollTop: target.offset().top
	// 		}, 1000);
	// 	}
	// });

	$('.simpleAction__mobile_content').owlCarousel({
		loop: true,
		center: false,
		margin: 0,
		nav: false,
		autoWidth: true,
		items: 1,
		autoHeight: true
	});

	//Показать полноэранную фотораму
	function fullrama(params) {
		var ramaMeta = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
			siteMeta = '',
			ramaToSiteMeta = 'initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
			scrollTop = $(window).scrollTop(),
			$body = $('body'),
			$meta = $body.data('fullrama-meta'),
			$ramaWrap = $('<div style="width: 100px; height: 100px; left: -200%; position: fixed; top: 0;"><div class="fullrama"><img src="" alt="" /></div></div>'),
			$rama = $ramaWrap.find('.fullrama'),

		defaults = {
			fit: 'scaledown',
			nav: 'thumbs',
			allowfullscreen: true,
			transitionduration: 1200
		};

		if (!$body.data('fullScreenHack')) {
			$body.append($('\
				<style>\
			        .fullscreen {\
			            min-width: 100%;\
			            position: relative;\
			        }\
		        </style>\
		    '));
			$body.data('fullScreenHack', true);
		}

		// if (!$meta) {
		// 	$meta = $('<meta name="viewport" content="" />').appendTo($('head'));
		// 	$body.data('fullrama-meta', $meta);
		// }	

		$ramaWrap.appendTo($body);

		$rama
			.on('fotorama:ready', function(e, fotorama) {
				fotorama.requestFullScreen();
			})
			.on('fotorama:fullscreenenter', function(e, fotorama) {
				// $meta.attr('content', ramaMeta);
				$(window).trigger('resize');
			})
			.on('fotorama:fullscreenexit', function(e, fotorama) {
				$meta.attr('content', ramaToSiteMeta).attr('content', siteMeta);
				fotorama.destroy();
				$(window).scrollTop(scrollTop);
				$rama.remove();
			})
			.fotorama($.extend(defaults, params));
		}

	//
	$(function() {
		$('.js-gorama').each(function() {
			var $wrapper = $(this),
				$links = $wrapper.find('a'),
				data = [];

			$links.each(function() {
				var $this = $(this);
				data.push({img: $this.attr('href'), thumb: $this.data('thumb'), full: $this.find('img').data('original')});
			});

			$wrapper
				.on('gorama', function(e, startindex) {
					fullrama( $.extend($wrapper.data(), {data: data, startindex: e.params.startindex}) );
				})
				.on('click', 'a', function(e) {
					var $link = $(e.target).closest('a');

					e.preventDefault();
					$wrapper.trigger({type: 'gorama', params: {
						startindex: $links.index($link),
					}});
				});
		});
	});

	$('.listingFilter__toggle').click(function(e){
		$('.listingFilter__inner').slideToggle();
		$(this).find('.toggle-arrow').toggleClass('fa-angle-up').toggleClass('fa-angle-down')
	});

	/** vladimir */
	/*$('.listing__viewSwitch a').click(function(e){
		e.preventDefault();
		$(this).toggleClass('active').siblings().removeClass('active');
		$('.listing__inner').toggleClass('list-view');
		$('.listing__inner').find('.columns').toggleClass('medium-6').toggleClass('large-4');
	});*/

	$('.listing__labelsToggle').click(function(e){
		e.preventDefault();
		$(this).hide();
		$(this).closest('.listing__labels').find('a.hide').toggleClass('hide');
	});

	$('.listingMenu__toggle').click(function(e){
		e.preventDefault();
		$(this).toggleClass('opened');
		if ($(this).hasClass('opened')){
			$(this).text('Свернуть');
		} else {
			$(this).text('Еще разделы');
		}
		$(this).closest('.listingMenu').find('.listingMenu__listHidden').slideToggle(300);
	});

	 $("#cartFormSticky").stick_in_parent();


	$('.vacancies-list .vacancies-item__top').on('click', function(){
		var container = $(this).closest('.vacancies-item');
		container.find('.vacancies-item__hide').slideToggle();
		container.find('.vacancies-item__top').toggleClass('active');
	});


	$('a[data-open="vakansii_callback"][data-text]').on('click', function(){
		var modal = $('#vakansii_callback');
		if(!modal.find('input[name="data[new][vacancy]"]').length){
			modal.find('form').append('<input type="hidden" name="data[new][vacancy]">');
		}

		modal.find('input[name="data[new][vacancy]"]').val( $(this).attr('data-text') );
	});
});