/**
 * Forward References
 */
var $navBarWrapper = $('.navbar-wrapper');
var $window = $(window);
var debouncedPageScrollUpdates = $.throttle(50, pageScrollListener);
var $nav = $('.navbar-collapse');
var $menuItems = $('.navbar-nav .nav-item');
var $sections = $('[data-section]');


/**
 * Throttled listener for page scroll events
 */
function pageScrollListener() {
    updateStickyNav()
    highliteMenuItemByPageScroll()
}

/**
 * Listener Function to update sticky top nav styles
 *
 */
function updateStickyNav() {
    const scroll = $window.scrollTop(); // current page scroll
    if (scroll > 10) {
        // activate sticky
        $navBarWrapper.addClass('navbar-wrapper--isSticky')
    } else {
        // deactivate sticky
        $navBarWrapper.removeClass('navbar-wrapper--isSticky')
    }
}

/**
 * Based on scroll positon, make menu link active
 */
function highliteMenuItemByPageScroll() {
    if ($menuItems.length == 0) return;
    if ($sections.length == 0) return;

    var scroll = $window.scrollTop(); // current page scroll
    var topOfScreen = $window.scrollTop();
    var bottomOfScreen = $window.scrollTop() + $window.innerHeight();
    var positions = [];
    var correction = 40; // compensate sticky menu

    $.each($sections, function (i, section) {
        var $section = $(section)

        if ($section.length && $section.offset()) {
            var sectionOffset = $section.offset().top - correction;
            var elementPos = (scroll - sectionOffset); // is positive when above top browser edge
            var isInScreen = (elementPos < 0)
            positions.push({
                elementPos: Math.abs(elementPos),
                sectionId: $section.data('section'),
                isInScreen: isInScreen
            });
        }
    })

    // get section whose top edge is  closest to top edge of browser window
    positions.sort(function (a, b) {
        return (a.elementPos > b.elementPos) ? 1 : -1;
    })

    const mostVisibleSection = positions.length ? positions[0] : null;
    if (mostVisibleSection) {
        var id = mostVisibleSection.sectionId;
        highliteMenuItem(id)
    }
}

/**
 * Makes menu item active, others inactive
 *
 * @param id
 */
function highliteMenuItem(id) {
    if (!id || !$menuItems.length) {
        return;
    }
    $menuItems.removeClass('active');
    $.each($menuItems, function (i, item) {
        var linkId = $(item).data('section-id')
        if (linkId == id) {
            $(item).addClass('active')
        }
    })
}

/**
 * Image Lightbox
 */
$(document).on('click', '[data-toggle="image-lightbox"]', function (event) {
    event.preventDefault();
    $(this).ekkoLightbox();
});


/**
 * Quick scroll to anchor by hash in url on page load (visit from privacy/terms pages)
 *
 */
$(document).ready(function () {
    var hash = window.location.hash;
    if (hash) {
        var target = $(hash);
        target = target.length ? target : $('[name=' + hash.slice(1) + ']');
        // Does a scroll target exist?
        if (target.length) {
            // Only prevent default if animation is actually gonna happen
            var currentNavHeight = $('.navbar-wrapper').height()
            $('html, body').animate({
                scrollTop: (target.offset().top - currentNavHeight)
            }, 30, function () {
                // Callback after animation
                // Must change focus!
                var $target = $(target);
                $target.focus();
                if ($target.is(":focus")) { // Checking if the target was focused
                    return false;
                } else {
                    $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
                    $target.focus(); // Set focus again
                }
                ;
            });
        }
    }
});

/**
 * Smooth scrolling of anchors
 */
// Select all links with hashes
$('a[href*="#"]')
    // Remove links that don't actually link to anything
    .not('[href="#"]')
    .not('[href="#0"]')
    .click(function (event) {
        // On-page links
        if (
            location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '')
            &&
            location.hostname == this.hostname
        ) {
            // Figure out element to scroll to
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            // Does a scroll target exist?
            if (target.length) {
                // Only prevent default if animation is actually gonna happen
                event.preventDefault();
                var currentNavHeight = $('.navbar-wrapper').height()
                $('html, body').animate({
                    scrollTop: (target.offset().top - currentNavHeight)
                }, 1000, function () {
                    // Callback after animation
                    // Must change focus!
                    var $target = $(target);
                    $target.focus();
                    if ($target.is(":focus")) { // Checking if the target was focused
                        return false;
                    } else {
                        $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
                        $target.focus(); // Set focus again
                    }
                    ;
                });
            }
        }
    });


/**
 *  Center bootstrap modals vertically in screen
 *  @link https://stackoverflow.com/a/20444744
 *
 */
(function ($) {
    "use strict";

    function centerModal() {
        $(this).css('display', 'block');
        var $dialog = $(this).find(".modal-dialog"),
            offset = ($(window).height() - $dialog.height()) / 2,
            bottomMargin = parseInt($dialog.css('marginBottom'), 10);

        // Make sure you don't hide the top part of the modal w/ a negative margin if it's longer than the screen height, and keep the margin equal to the bottom margin of the modal
        if (offset < bottomMargin) offset = bottomMargin;
        $dialog.css("margin-top", offset);
    }

    $(document).on('show.bs.modal', '.gate-modal', centerModal);
    $(window).on("resize", function () {
        $('.modal:visible').each(centerModal);
    });
}($));


/**
 * Shows the country selector, triggers an action when country is selected
 *
 */
function countrySelector_init() {


    var $countrySelect = $('#request-form-country-select');
    // only if country selector is present in page
    if ($countrySelect && $countrySelect.length) {
        // init selectpicker library
        $countrySelect.selectpicker();

        /**
         * After dropdown is constructed and inserted to DOM, than bind events
         * to menu items
         */
        $countrySelect.on('shown.bs.select', function (e) {
            countrySelector_hideCountryLanguages(); //
            countrySelector_addCountryEvents($countrySelect);
        });

        /**
         * When dropdown is requested to be hidden, than unbind events
         */
        $countrySelect.on('hide.bs.select', function (e) {
            // remove events
            $('a.option-country-parent').unbind('click')
        });


        /**
         * When conuntry/language is selected
         */
        $countrySelect.on('change', function (e) {
            var valueSelected = this.value;
            if (valueSelected != "none") {
                window.location.href = valueSelected;
            }
        });

        var showCountryModalOnLoad = true;

        if (showCountryModalOnLoad) {
            $('#modal-select-country').modal('show');
            var showExpandedOnLoad = false; // enable for developmnet
            if (showExpandedOnLoad) {
                window.setTimeout(function () {
                    $countrySelect.selectpicker('toggle');
                }, 500)
            }
        }
    }
}

/**
 * For country items with country-specific-languages, adds events
 *
 * @param $countrySelect
 */
function countrySelector_addCountryEvents($countrySelect) {

    $('a.option-country-parent').click(function (e) {
        e.preventDefault();
        e.stopPropagation();

        var countryCode = countrySelector_extractCountryCode(e.currentTarget, 'option-country-parent-');

        $('a.option-country-child').each(
            function (i, item) {
                var itemParentCountryCode = (countrySelector_extractCountryCode(item, 'option-country-child-'));
                if (countryCode == itemParentCountryCode) {
                    $(item).slideToggle()
                }
            }
        )
    })
}

/**
 *  Extract classes from element, searchs for pattern, returns part of class
 *
 * "option-country-parent-be" => "be"
 *
 * @param elem
 * @return {string}
 */
function countrySelector_extractCountryCode(elem, pattern) {
    var classes = $(elem).attr('class').split(' ')
    var result
    for (var i = 0; i <= classes.length; i++) {
        if (classes[i].indexOf(pattern) >= 0) {
            result = classes[i].split('-').pop()
            break
        }
    }
    return result
}

/**
 * On Country Selector initiation, hide country-specific-languages for
 * countries by default.
 */
function countrySelector_hideCountryLanguages() {
    $('a.option-country-child').each(
        function (i, item) {
            $(item).hide()
        }
    )
}


/**
 * Load, Resize and Scroll Page Listeners
 */
$window.on("load resize scroll", function (e) {
    debouncedPageScrollUpdates();
});


/**
 * Actions after page is loaded
 */
$window.on("load", function (e) {
    countrySelector_init()
});


//------------- Content Area Min Heihgt -----------
let calculateAndApplyMinHeight = function () {
    let topbarHeight = $('.top-ribbon-blue').outerHeight();
    let navbarHeight = $('.navbar-wrapper').outerHeight();
    let headerHeight = $('.navbar-wrapper').length > 0 ? topbarHeight+navbarHeight: 0;
    let footerHeight = $('footer').outerHeight();
    let windowHeight = $(window).outerHeight();
    let contentAreaHeight = windowHeight - (footerHeight + headerHeight);
    $('main').css('min-height', contentAreaHeight > 0 ? contentAreaHeight : 0);
  };
  
  $(document).ready(function () {
    if(self === top){
      setTimeout(function () {
        calculateAndApplyMinHeight();
      }, 0);
    }
  });


 
$(document).ready(function () {
    'use strict';
    var externalModal = "#confirmModal";
    var excluded = $('.external-link-popup > .domains').text();
    if ($('.external-link-popup > .domains').length > 0) {
        let el = $('#confirmModal .headline-text .cmp-text');
        let defaultText = el.html();
        $('a[href^="http"]').each(function () {
            if($('#confirmModal').has(this).length) {
                $(this).on('click', function() {
                    $(externalModal).modal('toggle');
                })
            } else {
                var href = $(this).attr('href');
                var domain = $('<a>').attr('href', href).prop('hostname');
                if (excluded.indexOf(domain) < 0) {
                    let popupData = $(this).data('ext-link-popup-text');
                    $(this).on('click', function (e) {
                        e.preventDefault();
                        if (popupData){
                            let customizedText = `<p>${popupData}</p>`;
                            el.html(customizedText);
                        } else {
                            el.html(defaultText);
                        }
                        var button = $(externalModal).find('#btnYes').find("a");
                        button.attr('href', href);
                        $(externalModal).modal();
                    });
                } else {
                    if ($(this).has("data-dismiss")) {
                        $(this).attr("data-dismiss", "");
                    }
                }
            }
        });
    }
});

$(document).on('click', '#btnYes a', function(e){
    $('#confirmModal').modal('hide');
});


//------------------ for header flicking issue ---------
$(document).ready(function () {
    $('.modal').on('show.bs.modal', function (e) {
        $('.header-area__inner').removeClass('nav-down');
    });
    $('#confirmModal').modal('hide');
});



