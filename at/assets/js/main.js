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
 * Helper for filling select options of a form
 *
 * @param $select
 * @param data
 */
function addSelectOptions($select, data) {
    $.each(data, function (i, item) {
        var option = $('<option>', {
            value: item.value,
            text: item.name
        });
        $select.append(option);
    });
};

/**
 * Shows the country selector, triggers an action when country is selected
 */
function initCountrySelector() {
    var $countrySelect = $('#request-form-country-select');
    // only if country selector is present in page
    if ($countrySelect && $countrySelect.length) {

        // add listener on selected country
        $('select').on('change', function (e) {
            var valueSelected = this.value;
            if (valueSelected != "none") {
                window.location.href = '../' + valueSelected;
            }
        });

        var showCountryModalOnLoad = true;

        if (showCountryModalOnLoad) {
            $('#modal-select-country').modal('show');
            var showExpandedOnLoad = false;
            if (showExpandedOnLoad) {
                window.setTimeout(function () {
                    $('.selectpicker').selectpicker('toggle');
                }, 500)
            }
        }
    }
}

/**
 * Helper function to return correct path in staging environment
 */
function getUrlPrefix() {
    var location = window.location.href;
    if (location.indexOf('preview-patient') >= 0) {
        // stage
        var version = (location.split('/')[3])
        return "/" + version + "/dist/"
    } else {
        // production
        return '/'
    }


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
    initCountrySelector()
});


