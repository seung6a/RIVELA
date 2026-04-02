AOS.init({
    once: false
});

// -----------------------------------
// 0. 영상 재생 복구
// -----------------------------------
document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
        document.querySelectorAll('video').forEach(function (video) {
            video.play().catch(function () {});
        });
    }
});

window.addEventListener('pageshow', function () {
    document.querySelectorAll('video').forEach(function (video) {
        video.play().catch(function () {});
    });
});

$(document).ready(function () {
    // -----------------------------------
    // 1. 프로그램 섹션 호버 활성화
    // -----------------------------------
    function activateSection($target) {
        if (!$target.length) return;

        const $allSections = $('#program_wrap > section');
        const $otherSections = $target.siblings('section');

        $allSections.removeClass('active activeSize');
        $('.bg').removeClass('active activeSize');
        $('.contents > div').removeClass('active');
        $('.contents > h2').addClass('activeSize');

        $target.addClass('active');
        $target.find('.contents > div').addClass('active');
        $target.find('.bg').addClass('active');

        $otherSections.addClass('activeSize');
        $otherSections.find('.bg').addClass('activeSize');
    }

    const $firstSec = $('#program_wrap > section').first();
    activateSection($firstSec);

    $('#program_wrap > section').mouseenter(function () {
        activateSection($(this));
    });

    // -----------------------------------
    // 2. 비디오 헬퍼
    // -----------------------------------
    function playVideoInSection($section) {
        const video = $section.find('video').get(0);
        if (video) {
            video.play().catch(function () {});
        }
    }

    function pauseVideosOutsideSection($section) {
        $('video').each(function () {
            if (!$section.find(this).length) {
                this.pause();
            }
        });
    }

    // -----------------------------------
    // 3. Swiper 변수 선언
    // -----------------------------------
    let mainSwiper = null;
    let productSwiper = null;
    let storySwiper = null;
    let reservationPanelOpened = false;
    let reservationWheelLock = false;

    if (document.querySelector('.main_banner .swiper')) {
        mainSwiper = new Swiper('.main_banner .swiper', {
            effect: 'fade',
            fadeEffect: { crossFade: true },
            loop: true,
            speed: 1500,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false
            }
        });
    }

    if (document.querySelector('.product-slider')) {
        productSwiper = new Swiper('.product-slider', {
            slidesPerView: 1,
            loop: true,
            speed: 800,
            grabCursor: true,
            simulateTouch: true,
            navigation: {
                nextEl: '.product-slider .swiper-button-next',
                prevEl: '.product-slider .swiper-button-prev'
            }
        });
    }

    if (document.querySelector('.brandstory_wrap .swiper')) {
        storySwiper = new Swiper('.brandstory_wrap .swiper', {
            loop: true,
            speed: 1000,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: false
            },
            observer: true,
            observeParents: true
        });
    }

    // -----------------------------------
    // 4. 예약 패널 제어
    // -----------------------------------
    const $reservationSection = $('#section5');
    const reservationSectionIndex = $('.section').index($reservationSection) + 1;

    function openReservationPanel() {
        $reservationSection.addClass('panel-open').removeClass('intro-restored');
        reservationPanelOpened = true;
    }

    function closeReservationPanel(restoreIntro = true) {
        $reservationSection.removeClass('panel-open');

        if (restoreIntro) {
            $reservationSection.addClass('intro-restored');
        } else {
            $reservationSection.removeClass('intro-restored');
        }

        reservationPanelOpened = false;
    }

    function resetReservationPanel() {
        $reservationSection.removeClass('panel-open intro-restored');
        reservationPanelOpened = false;
    }

    function isReservationSectionActive() {
        return $('.section.active').index() + 1 === reservationSectionIndex;
    }

    function lockReservationWheel(ms) {
        reservationWheelLock = true;
        $.fn.fullpage.setAllowScrolling(false);
        $.fn.fullpage.setKeyboardScrolling(false);

        setTimeout(function () {
            reservationWheelLock = false;
            $.fn.fullpage.setAllowScrolling(true);
            $.fn.fullpage.setKeyboardScrolling(true);
        }, ms);
    }

    if ($('#section5 .booking_box').length === 0) {
        console.warn('booking_box가 #section5 안에 없습니다. 예약 박스를 #section5 안으로 옮겨주세요.');
    }

    // -----------------------------------
    // 5. 예약 패널 닫기용 wheel 제어
    // -----------------------------------
    $(document).on('wheel mousewheel DOMMouseScroll', function (e) {
        if (!$('#fullpage').length) return;
        if (!isReservationSectionActive()) return;
        if (!reservationPanelOpened) return;
        if (reservationWheelLock) {
            e.preventDefault();
            return false;
        }

        const oe = e.originalEvent;
        let deltaY = 0;

        if (typeof oe.deltaY === 'number') {
            deltaY = oe.deltaY;
        } else if (typeof oe.wheelDelta === 'number') {
            deltaY = -oe.wheelDelta;
        } else if (typeof oe.detail === 'number') {
            deltaY = oe.detail;
        }

        if (deltaY < 0) {
            e.preventDefault();
            e.stopPropagation();

            closeReservationPanel(true);
            lockReservationWheel(700);

            return false;
        }
    });

    // -----------------------------------
    // 6. fullPage 설정
    // -----------------------------------
    if ($('#fullpage').length) {
        $('#fullpage').fullpage({
            menu: '#gnb',
            anchors: [
                'intro',
                'story',
                'program',
                'product',
                'event',
                'reservation',
                'reviews',
                'location',
                'contact',
                'footer'
            ],
            navigation: true,
            navigationPosition: 'right',
            navigationTooltips: [
                'INTRO',
                'STORY',
                'PROGRAMS',
                'PRODUCTS',
                'EVENT',
                'RESERVATION',
                'REVIEWS',
                'LOCATION',
                'CONTACT'
            ],
            showActiveTooltip: true,
            verticalCentered: false,
            fitToSection: true,
            scrollOverflow: false,

            afterRender: function () {
                $('.section.active [data-aos]').addClass('aos-animate');

                if (mainSwiper) {
                    mainSwiper.autoplay.stop();
                    mainSwiper.slideToLoop(0, 0);
                    mainSwiper.autoplay.start();
                }

                const $activeSection = $('.section.active');
                playVideoInSection($activeSection);
                pauseVideosOutsideSection($activeSection);

                $('#topBtn').removeClass('show footer-mode');
                resetReservationPanel();
            },

            onLeave: function (index, nextIndex, direction) {
                $('.section').eq(index - 1).find('[data-aos]').removeClass('aos-animate');

                if (
                    index === reservationSectionIndex &&
                    direction === 'down' &&
                    !reservationPanelOpened
                ) {
                    openReservationPanel();
                    lockReservationWheel(900);
                    return false;
                }
            },

            afterLoad: function (anchorLink, index) {
                const $currentSection = $('.section').eq(index - 1);
                $currentSection.find('[data-aos]').addClass('aos-animate');

                if (index === 1 && mainSwiper) {
                    mainSwiper.autoplay.stop();
                    mainSwiper.slideToLoop(0, 0);
                    mainSwiper.autoplay.start();
                }

                playVideoInSection($currentSection);
                pauseVideosOutsideSection($currentSection);

                if (index === reservationSectionIndex && !reservationPanelOpened) {
                    resetReservationPanel();
                    setTimeout(function () {
                        $('#section5 .reservation_intro [data-aos]').addClass('aos-animate');
                    }, 30);
                }

                if (index !== reservationSectionIndex) {
                    resetReservationPanel();
                }

                // -----------------------------------
                // TOP 버튼 표시 제어
                // 2페이지부터 보이기
                // -----------------------------------
                if (index > 1) {
                    $('#topBtn').addClass('show');
                } else {
                    $('#topBtn').removeClass('show');
                }

                // -----------------------------------
                // TOP 버튼 색상 제어
                // program / footer 에서 밝은색
                // -----------------------------------
                if (anchorLink === 'program' || anchorLink === 'footer') {
                    $('#topBtn').addClass('footer-mode');
                } else {
                    $('#topBtn').removeClass('footer-mode');
                }
            }
        });
    }

    // -----------------------------------
    // 7. GNB 클릭 이동
    // 현재 HTML의 GNB 링크가 "#" 상태여도 강제 이동
    // -----------------------------------
    $('.gnb li').eq(0).on('click', function (e) {
        e.preventDefault();
        if ($('#fullpage').length) $.fn.fullpage.moveTo('story');
    });

    $('.gnb li').eq(1).on('click', function (e) {
        e.preventDefault();
        if ($('#fullpage').length) $.fn.fullpage.moveTo('program');
    });

    $('.gnb li').eq(2).on('click', function (e) {
        e.preventDefault();
        if ($('#fullpage').length) $.fn.fullpage.moveTo('product');
    });

    $('.gnb li').eq(3).on('click', function (e) {
        e.preventDefault();
        if ($('#fullpage').length) $.fn.fullpage.moveTo('reservation');
    });

    // 메인 배너 예약하기 버튼도 예약 섹션으로 이동
    $('.button a').on('click', function (e) {
        e.preventDefault();
        if ($('#fullpage').length) $.fn.fullpage.moveTo('reservation');
    });

    // -----------------------------------
    // 8. TOP 버튼
    // -----------------------------------
    $('#topBtn').on('click', function () {
        if ($('#fullpage').length) {
            $.fn.fullpage.moveTo('intro');
        } else {
            $('html, body').animate({ scrollTop: 0 }, 600);
        }
    });

    // -----------------------------------
    // 9. 예약 페이지
    // -----------------------------------
    const $programSelect = $('#program_select');
    const $dateItems = $('.date_list li');
    const $timeButtons = $('.time_grid button');
    const $reserveBtn = $('.res_confirm_btn');

    const $reserveModal = $('#reserveModal');
    const $modalProgram = $('#modalProgram');
    const $modalDate = $('#modalDate');
    const $modalTime = $('#modalTime');
    const $modalClose = $('#reserveModalClose');
    const $modalConfirm = $('#reserveModalConfirm');
    const $modalOverlay = $('.reserve_modal_overlay');

    $dateItems.on('click', function () {
        $dateItems.removeClass('active');
        $(this).addClass('active');
    });

    $timeButtons.on('click', function () {
        $timeButtons.removeClass('selected');
        $(this).addClass('selected');
    });

    function openReserveModal(programText, dateText, timeText) {
        $modalProgram.text(programText);
        $modalDate.text(dateText);
        $modalTime.text(timeText);

        $reserveModal.addClass('show');
        $('body').addClass('modal_open');
    }

    function closeReserveModal() {
        $reserveModal.removeClass('show');
        $('body').removeClass('modal_open');
    }

    $reserveBtn.on('click', function (e) {
        e.preventDefault();

        const selectedProgram = $programSelect.val();
        const selectedProgramText = $programSelect.find('option:selected').text();
        const $activeDate = $('.date_list li.active');
        const $activeTime = $('.time_grid button.selected');

        if (selectedProgram === 'none') {
            alert('프로그램을 선택해 주세요.');
            return;
        }

        if (!$activeDate.length) {
            alert('날짜를 선택해 주세요.');
            return;
        }

        if (!$activeTime.length) {
            alert('시간을 선택해 주세요.');
            return;
        }

        const selectedDate = $activeDate.clone().children().remove().end().text().trim();
        const selectedDay = $activeDate.find('span').text().trim();
        const selectedTime = $activeTime.text().trim();

        openReserveModal(
            selectedProgramText,
            selectedDate + ' (' + selectedDay + ')',
            selectedTime
        );
    });

    $modalClose.on('click', closeReserveModal);
    $modalConfirm.on('click', closeReserveModal);
    $modalOverlay.on('click', closeReserveModal);

    // -----------------------------------
    // 10. 문의하기 모달
    // -----------------------------------
    const $inquiryName = $('#inquiry_name');
    const $inquiryPhone = $('#inquiry_phone');
    const $inquiryProgram = $('#inquiry_program');
    const $inquiryMessage = $('#inquiry_message');
    const $inquirySubmitBtn = $('.inquiry-submit-btn');

    const $inquiryModal = $('#inquiryModal');
    const $inquiryModalName = $('#inquiryModalName');
    const $inquiryModalPhone = $('#inquiryModalPhone');
    const $inquiryModalProgram = $('#inquiryModalProgram');
    const $inquiryModalMessage = $('#inquiryModalMessage');
    const $inquiryModalClose = $('#inquiryModalClose');
    const $inquiryModalConfirm = $('#inquiryModalConfirm');
    const $inquiryModalOverlay = $('.inquiry_modal_overlay');

    function openInquiryModal(name, phone, program, message) {
        $inquiryModalName.text(name);
        $inquiryModalPhone.text(phone);
        $inquiryModalProgram.text(program);
        $inquiryModalMessage.text(message);

        $inquiryModal.addClass('show');
        $('body').addClass('modal_open');
    }

    function closeInquiryModal() {
        $inquiryModal.removeClass('show');
        $('body').removeClass('modal_open');
    }

    $inquirySubmitBtn.on('click', function (e) {
        e.preventDefault();

        const name = $inquiryName.val().trim();
        const phone = $inquiryPhone.val().trim();
        const programVal = $inquiryProgram.val();
        const programText = $inquiryProgram.find('option:selected').text().trim();
        const message = $inquiryMessage.val().trim();

        if (!name) {
            alert('성함을 입력해 주세요.');
            return;
        }

        if (!phone) {
            alert('전화번호를 입력해 주세요.');
            return;
        }

        if (!programVal) {
            alert('프로그램을 선택해 주세요.');
            return;
        }

        if (!message) {
            alert('문의 내용을 입력해 주세요.');
            return;
        }

        openInquiryModal(name, phone, programText, message);
    });

    $inquiryModalClose.on('click', closeInquiryModal);
    $inquiryModalConfirm.on('click', closeInquiryModal);
    $inquiryModalOverlay.on('click', closeInquiryModal);

    // -----------------------------------
    // 11. ESC로 모달 닫기
    // -----------------------------------
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape') {
            if ($reserveModal.hasClass('show')) {
                closeReserveModal();
            }
            if ($inquiryModal.hasClass('show')) {
                closeInquiryModal();
            }
        }
    });
});

// 리뷰페이지==========================================

let reviewSwiper = new Swiper('.review_card', {
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: 30,
    loop: true,
    speed: 1800,
    autoplay: {
        delay: 3000,
        disableOnInteraction: false
    }
});