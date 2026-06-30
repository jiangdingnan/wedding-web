/**
 * 婚礼邀请函 Web 版
 * 蒋丁男 & 刘楠楠 | 2026.10.03
 * 全部使用本地文件，无云端依赖
 */

// ===== Configuration =====
var CONFIG = {
  groom: '蒋丁男',
  bride: '刘楠楠',
  weddingDate: '2026-10-03',
  weddingTime: '11:48',
  venue: '雲宴婚礼庄园',
  venueAddress: '银川市兴庆区雲宴婚礼庄园·圣托里尼厅',
  venueLat: 38.511467,
  venueLng: 106.316966,
  // Local file paths
  coverImage: 'images/couple-silhouette.jpg',
  videoUrl: 'images/wedding.mp4',
  musicUrl: '',
  // Photos: 14 total
  // Sticker photos: photo-1, photo-2, photo-3, photo-14
  // Gallery photos: photo-4 ~ photo-13 (10 photos)
  photos: [
    'images/photo-1.jpg',   // 0 - sticker
    'images/photo-2.jpg',   // 1 - sticker (right side)
    'images/photo-3.jpg',   // 2 - sticker (left side)
    'images/photo-4.jpg',   // 3 - gallery
    'images/photo-5.jpg',   // 4 - gallery
    'images/photo-6.jpg',   // 5 - gallery
    'images/photo-7.jpg',   // 6 - gallery
    'images/photo-8.jpg',   // 7 - gallery
    'images/photo-9.jpg',   // 8 - gallery
    'images/photo-10.jpg',  // 9 - gallery
    'images/photo-11.jpg',  // 10 - gallery
    'images/photo-12.jpg',  // 11 - gallery
    'images/photo-13.jpg',  // 12 - gallery
    'images/photo-14.jpg'   // 13 - sticker
  ],
  rsvpEndpoint: ''  // Set your backend endpoint here if needed
}

// ===== Countdown =====
var timer = null

function initCountdown() {
  var weddingDate = new Date(2026, 9, 3, 11, 48, 0)

  function update() {
    var now = new Date()
    var diff = weddingDate.getTime() - now.getTime()

    if (diff <= 0) {
      document.getElementById('days').textContent = '0'
      document.getElementById('hours').textContent = '00'
      document.getElementById('minutes').textContent = '00'
      document.getElementById('seconds').textContent = '00'
      return
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24))
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    var seconds = Math.floor((diff % (1000 * 60)) / 1000)

    document.getElementById('days').textContent = String(days)
    document.getElementById('hours').textContent = String(hours).padStart(2, '0')
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0')
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0')
  }

  update()
  timer = setInterval(update, 1000)
}

// ===== Wedding Date Display =====
function initDateDisplay() {
  var date = new Date(2026, 9, 3)
  var weekDays = ['日', '一', '二', '三', '四', '五', '六']
  var display = date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日 星期' + weekDays[date.getDay()]

  document.getElementById('weddingDateDisplay').textContent = display
  document.getElementById('weddingDateText').textContent = display
  document.getElementById('footerDate').textContent = display
}

// ===== Background Music =====
var bgAudio = null
var musicPlaying = false
var musicBtn = null
var musicAutoStarted = false

function initMusic() {
  bgAudio = document.getElementById('bgMusic')
  musicBtn = document.getElementById('musicBtn')

  // Try autoplay on first user interaction (browser policy)
  tryStartAutoplay()

  // Music button toggle
  musicBtn.addEventListener('click', function() {
    if (musicPlaying) {
      pauseMusic()
    } else {
      playMusic()
    }
  })
}

function tryStartAutoplay() {
  // Strategy 1: Try immediately (some mobile browsers allow autoplay after first page load)
  bgAudio.muted = true
  bgAudio.play().then(function() {
    // Autoplay succeeded (muted), try to unmute on first interaction
    musicAutoStarted = true
    var unmuted = false
    function tryUnmute() {
      if (unmuted) return
      unmuted = true
      bgAudio.muted = false
      musicPlaying = true
      musicBtn.classList.add('playing')
      document.removeEventListener('touchstart', tryUnmute)
      document.removeEventListener('click', tryUnmute)
      document.removeEventListener('scroll', tryUnmute, { passive: true })
    }
    // Try to unmute immediately
    tryUnmute()
    // Fallback: unmute on first interaction
    document.addEventListener('touchstart', tryUnmute, { passive: true })
    document.addEventListener('click', tryUnmute)
    document.addEventListener('scroll', tryUnmute, { passive: true })
  }).catch(function() {
    // Autoplay fully blocked, play on first interaction
    var started = false
    function attemptPlay() {
      if (started) return
      started = true
      bgAudio.muted = false
      playMusic().then(function() {
        musicAutoStarted = true
      }).catch(function() {
        started = false
      })
      ['touchstart', 'click', 'scroll'].forEach(function(e) {
        document.removeEventListener(e, attemptPlay)
      })
    }
    ['touchstart', 'click', 'scroll'].forEach(function(e) {
      document.addEventListener(e, attemptPlay, { passive: true })
    })
  })
}

function playMusic() {
  if (!bgAudio) return Promise.reject(new Error('no audio'))
  return bgAudio.play().then(function() {
    musicPlaying = true
    musicBtn.classList.add('playing')
  }).catch(function(e) {
    // Autoplay blocked
    musicPlaying = false
    throw e
  })
}

function pauseMusic() {
  if (!bgAudio) return
  bgAudio.pause()
  musicPlaying = false
  musicBtn.classList.remove('playing')
}

// ===== Video <-> Music coordination =====
function initVideoMusicSync() {
  var video = document.getElementById('weddingVideo')
  if (!video) return

  // When video plays, pause music
  video.addEventListener('play', function() {
    if (musicPlaying) {
      pauseMusic()
    }
  })

  // When video pauses, resume music
  video.addEventListener('pause', function() {
    if (musicAutoStarted || musicPlaying) {
      // Small delay to avoid rapid toggle
      setTimeout(function() {
        if (!video.paused && !video.ended) return
        playMusic().catch(function() {})
      }, 300)
    }
  })

  // When video ends, resume music
  video.addEventListener('ended', function() {
    if (musicAutoStarted) {
      playMusic().catch(function() {})
    }
  })
}

// ===== Load Resources =====
// Images and video src are set directly in HTML for reliability
function loadResources() {
  // Music and video sync initialized separately
}

// ===== Gallery Swiper =====
var galleryCurrent = 0
var galleryTimer = null

function initGallery() {
  var track = document.getElementById('galleryTrack')
  var dots = document.getElementById('galleryDots')
  var slides = track.querySelectorAll('.gallery-item')
  var total = slides.length

  // Build dots
  dots.innerHTML = ''
  for (var i = 0; i < total; i++) {
    var dot = document.createElement('div')
    dot.className = 'gallery-dot' + (i === 0 ? ' active' : '')
    dots.appendChild(dot)
  }

  // Click to preview
  slides.forEach(function(slide, index) {
    slide.addEventListener('click', function() {
      var img = slide.querySelector('img')
      if (img) window.open(img.src, '_blank')
    })
  })

  // Start autoplay after first image loads
  var firstImg = track.querySelector('img')
  if (firstImg) {
    firstImg.addEventListener('load', function() {
      setTimeout(startGalleryAutoplay, 2000)
    })
  }

  // Touch/swipe
  var swiper = document.getElementById('gallerySwiper')
  var startX = 0
  var isDragging = false

  swiper.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX
    isDragging = true
    stopGalleryAutoplay()
  })

  swiper.addEventListener('touchmove', function(e) {
    if (!isDragging) return
    var diff = e.touches[0].clientX - startX
    var offset = -galleryCurrent * swiper.offsetWidth + diff
    track.style.transform = 'translateX(' + offset + 'px)'
    track.style.transition = 'none'
  })

  swiper.addEventListener('touchend', function(e) {
    if (!isDragging) return
    isDragging = false
    track.style.transition = ''

    var diff = e.changedTouches[0].clientX - startX
    if (Math.abs(diff) > 50) {
      if (diff < 0 && galleryCurrent < total - 1) galleryCurrent++
      else if (diff > 0 && galleryCurrent > 0) galleryCurrent--
    }
    goToGallery(galleryCurrent)
    startGalleryAutoplay()
  })

  // Mouse drag for desktop
  var mouseStartX = 0
  var mouseDragging = false
  swiper.addEventListener('mousedown', function(e) {
    mouseStartX = e.clientX
    mouseDragging = true
    stopGalleryAutoplay()
  })
  swiper.addEventListener('mousemove', function(e) {
    if (!mouseDragging) return
    var diff = e.clientX - mouseStartX
    var offset = -galleryCurrent * swiper.offsetWidth + diff
    track.style.transform = 'translateX(' + offset + 'px)'
    track.style.transition = 'none'
  })
  swiper.addEventListener('mouseup', function(e) {
    if (!mouseDragging) return
    mouseDragging = false
    track.style.transition = ''
    var diff = e.clientX - mouseStartX
    if (Math.abs(diff) > 50) {
      if (diff < 0 && galleryCurrent < total - 1) galleryCurrent++
      else if (diff > 0 && galleryCurrent > 0) galleryCurrent--
    }
    goToGallery(galleryCurrent)
    startGalleryAutoplay()
  })
  swiper.addEventListener('mouseleave', function() {
    if (mouseDragging) { mouseDragging = false; track.style.transition = ''; goToGallery(galleryCurrent); startGalleryAutoplay() }
  })
}

function goToGallery(index) {
  galleryCurrent = index
  var track = document.getElementById('galleryTrack')
  track.style.transform = 'translateX(' + (-index * 100) + '%)'

  document.querySelectorAll('.gallery-dot').forEach(function(dot, i) {
    dot.classList.toggle('active', i === index)
  })
}

function startGalleryAutoplay() {
  if (galleryTimer) return
  var total = document.querySelectorAll('.gallery-item').length
  galleryTimer = setInterval(function() {
    var next = galleryCurrent + 1
    if (next >= total) next = 0
    goToGallery(next)
  }, 4000)
}

function stopGalleryAutoplay() {
  if (galleryTimer) { clearInterval(galleryTimer); galleryTimer = null }
}

function previewGalleryImage(index) {
  var slides = document.querySelectorAll('.gallery-item')
  var slide = slides[index]
  if (slide) {
    var img = slide.querySelector('img')
    if (img) window.open(img.src, '_blank')
  }
}

// ===== Scroll Animations =====
// Video auto-pause when scrolled out of viewport
// Sticker photos fly-in animation when scrolled into viewport
function initScrollAnimations() {
  // ----- Video auto-pause -----
  var video = document.getElementById('weddingVideo')
  if (video) {
    var videoObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) {
          // Video scrolled out of view, pause it
          if (!video.paused) {
            video.pause()
          }
        }
      })
    }, {
      threshold: 0.15,
      // Trigger when video is mostly out of view
      rootMargin: '0px 0px -60% 0px'
    })
    videoObserver.observe(video)
  }

  // ----- Sticker photo fly-in -----
  var flyElements = document.querySelectorAll('.sticker-stick-wrap, .sticker-embed-wrap')
  // Exclude the video sticker wrapper
  flyElements = Array.prototype.filter.call(flyElements, function(el) {
    return !el.classList.contains('sticker-video')
  })

  // Add fly-in initial state
  flyElements.forEach(function(el) {
    el.classList.add('fly-in-hidden')
  })

  if ('IntersectionObserver' in window) {
    var photoObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          // Element is fully in view, trigger fly-in animation
          entry.target.classList.add('fly-in-active')
          entry.target.classList.remove('fly-in-hidden')
          photoObserver.unobserve(entry.target)
        }
      })
    }, {
      // Trigger when element is mostly visible
      threshold: 0.3
    })

    flyElements.forEach(function(el) {
      photoObserver.observe(el)
    })
  } else {
    // Fallback: show all immediately
    flyElements.forEach(function(el) {
      el.classList.remove('fly-in-hidden')
      el.classList.add('fly-in-active')
    })
  }
}

// ===== Map Navigation =====
function initMapNav() {
  var el = document.getElementById('venueWrap')
  if (el) {
    el.addEventListener('click', function() {
      var url = 'https://uri.amap.com/marker?position=106.316966,38.511467&name=' + encodeURIComponent(CONFIG.venue)
      window.open(url, '_blank')
    })
  }
}

// ===== Image Preview =====
function initImagePreview() {
  document.querySelectorAll('.sticker-embed-wrap, .sticker-stick-wrap:not(.sticker-video)').forEach(function(el) {
    el.addEventListener('click', function() {
      var img = this.querySelector('img')
      if (img && img.src) window.open(img.src, '_blank')
    })
  })
}

// ===== RSVP Scroll =====
function initRsvpScroll() {
  var btn = document.getElementById('footerRsvp')
  if (btn) {
    btn.addEventListener('click', function() {
      document.getElementById('rsvpSection').scrollIntoView({ behavior: 'smooth' })
    })
  }
}

// ===== RSVP Form =====
var rsvpForm = { attend: '', isOuttown: '', transport: '' }

function initRSVP() {
  document.getElementById('attendYes').addEventListener('click', function() {
    rsvpForm.attend = 'yes'
    document.getElementById('attendYes').classList.add('active')
    document.getElementById('attendNo').classList.remove('active-no')
    document.getElementById('guestCountItem').style.display = 'block'
    document.getElementById('tripDivider').style.display = 'flex'
    document.getElementById('outtownItem').style.display = 'block'
  })

  document.getElementById('attendNo').addEventListener('click', function() {
    rsvpForm.attend = 'no'
    document.getElementById('attendNo').classList.add('active-no')
    document.getElementById('attendYes').classList.remove('active')
    hideTripFields()
  })

  document.getElementById('outtownYes').addEventListener('click', function() {
    rsvpForm.isOuttown = 'yes'
    document.getElementById('outtownYes').classList.add('active')
    document.getElementById('outtownNo').classList.remove('active-no')
    showTripFields()
  })

  document.getElementById('outtownNo').addEventListener('click', function() {
    rsvpForm.isOuttown = 'no'
    document.getElementById('outtownNo').classList.add('active-no')
    document.getElementById('outtownYes').classList.remove('active')
    hideTripFields()
  })

  document.getElementById('decreaseGuests').addEventListener('click', function() {
    var v = parseInt(document.getElementById('guestCount').textContent)
    if (v > 1) document.getElementById('guestCount').textContent = v - 1
  })

  document.getElementById('increaseGuests').addEventListener('click', function() {
    var v = parseInt(document.getElementById('guestCount').textContent)
    if (v < 10) document.getElementById('guestCount').textContent = v + 1
  })

  document.querySelectorAll('#transportOptions .diet-tag').forEach(function(el) {
    el.addEventListener('click', function() {
      var val = this.getAttribute('data-value')
      if (rsvpForm.transport === val) {
        rsvpForm.transport = ''
        this.classList.remove('active')
      } else {
        document.querySelectorAll('#transportOptions .diet-tag').forEach(function(t) { t.classList.remove('active') })
        rsvpForm.transport = val
        this.classList.add('active')
      }
    })
  })

  document.getElementById('submitBtn').addEventListener('click', submitRSVP)
}

function hideTripFields() {
  document.getElementById('guestCountItem').style.display = 'none'
  document.getElementById('tripDivider').style.display = 'none'
  document.getElementById('outtownItem').style.display = 'none'
  ;['departCityItem', 'transportItem', 'arriveItem', 'flightNoItem', 'departItem'].forEach(function(id) {
    var el = document.getElementById(id)
    if (el) el.style.display = 'none'
  })
}

function showTripFields() {
  ;['departCityItem', 'transportItem', 'arriveItem', 'flightNoItem', 'departItem'].forEach(function(id) {
    var el = document.getElementById(id)
    if (el) el.style.display = 'block'
  })
}

function submitRSVP() {
  var name = document.getElementById('rsvpName').value.trim()
  var phone = document.getElementById('rsvpPhone').value.trim()

  if (!name) { alert('请输入姓名'); return }
  if (!phone || !/^1\d{10}$/.test(phone)) { alert('请输入正确手机号'); return }
  if (!rsvpForm.attend) { alert('请选择是否出席'); return }

  var btn = document.getElementById('submitBtn')
  btn.classList.add('disabled')

  var data = {
    name: name,
    phone: phone,
    attend: rsvpForm.attend,
    guestCount: rsvpForm.attend === 'yes' ? parseInt(document.getElementById('guestCount').textContent) : 0,
    diet: rsvpForm.diet || '',
    isOuttown: rsvpForm.isOuttown || '',
    departCity: document.getElementById('departCity').value.trim(),
    transport: rsvpForm.transport || '',
    arriveDate: document.getElementById('arriveDate').value,
    arriveTime: document.getElementById('arriveTime').value,
    arriveFull: document.getElementById('arriveDate').value + ' ' + document.getElementById('arriveTime').value,
    flightNo: document.getElementById('flightNo').value.trim(),
    departDate: document.getElementById('departDate').value,
    departTime: document.getElementById('departTime').value,
    departFull: document.getElementById('departDate').value + ' ' + document.getElementById('departTime').value,
    needHotel: rsvpForm.needHotel || '',
    hotelNights: rsvpForm.needHotel === 'yes' ? parseInt(document.getElementById('hotelNights').textContent) : 0,
    remark: document.getElementById('rsvpRemark').value.trim(),
    timeStr: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  }

  // 直接写入腾讯文档
  submitToTencentDoc(data, btn)
}

// ===== Submit RSVP via Cloudflare Worker proxy =====
var RSVP_PROXY = 'https://1342775914-lhdbtbfk8j.ap-guangzhou.tencentscf.com/'

function submitToTencentDoc(data, btn) {
  fetch(RSVP_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(function(r) { return r.json() })
  .then(function(res) {
    if (res.success) {
      try {
        var existing = JSON.parse(localStorage.getItem('wedding_rsvp') || '[]')
        existing.unshift(data)
        localStorage.setItem('wedding_rsvp', JSON.stringify(existing))
      } catch(e) {}
      showRSVPSuccess(data)
    } else if (res.alreadyExists) {
      alert('该手机号已提交过回执')
    } else {
      alert(res.message || '提交失败，请稍后重试')
    }
  })
  .catch(function(err) {
    try {
      var existing = JSON.parse(localStorage.getItem('wedding_rsvp') || '[]')
      if (existing.some(function(i) { return i.phone === data.phone })) {
        alert('该手机号已提交过回执')
        return
      }
      existing.unshift(data)
      localStorage.setItem('wedding_rsvp', JSON.stringify(existing))
      showRSVPSuccess(data)
    } catch(e) {
      alert('提交失败，请稍后重试')
    }
  })
  .finally(function() {
    btn.classList.remove('disabled')
  })
}

function showRSVPSuccess(data) {
  document.getElementById('rsvpForm').style.display = 'none'
  document.getElementById('rsvpResult').style.display = 'block'
  var msg = data.attend === 'yes' && data.isOuttown === 'yes'
    ? '已收到行程，为您备好住宿！'
    : '感谢您的回复，期待与您相见！'
  document.querySelector('.result-desc').textContent = msg
  document.getElementById('resultInfo').textContent = data.attend === 'yes'
    ? '已确认 ' + data.guestCount + ' 位宾客出席' : ''
}

function updateStats(stats) {
  if (!stats) return
  document.getElementById('statsCard').style.display = 'block'
  document.getElementById('statsTotal').textContent = stats.total || 0
  document.getElementById('statsAttending').textContent = stats.attending || 0
  document.getElementById('statsDeclined').textContent = stats.declined || 0
  document.getElementById('statsTotalGuests').textContent = stats.totalGuests || 0
}

function updateStatsFromLocal() {
  try {
    var data = JSON.parse(localStorage.getItem('wedding_rsvp') || '[]')
    updateStats({
      total: data.length,
      attending: data.filter(function(d) { return d.attend === 'yes' }).length,
      declined: data.filter(function(d) { return d.attend !== 'yes' }).length,
      totalGuests: data.reduce(function(s, d) { return s + (d.attend === 'yes' ? d.guestCount : 0) }, 0)
    })
  } catch(e) {}
}

// ===== Date Range =====
function initDateRanges() {
  var today = new Date().toISOString().split('T')[0]
  var arriveDate = document.getElementById('arriveDate')
  var departDate = document.getElementById('departDate')
  if (arriveDate) { arriveDate.setAttribute('min', today); arriveDate.setAttribute('max', '2026-10-04') }
  if (departDate) { departDate.setAttribute('min', '2026-10-03'); departDate.setAttribute('max', '2026-10-10') }
}

// ===== Init =====
function init() {
  // Set absolute URL for share meta tags (works on GitHub Pages)
  var ogImage = document.querySelector('meta[property="og:image"]')
  var itemImage = document.querySelector('meta[itemprop="image"]')
  var twImage = document.querySelector('meta[name="twitter:image"]')
  var ogUrl = document.querySelector('meta[property="og:url"]')
  var base = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/')
  if (ogImage) ogImage.setAttribute('content', base + 'images/share-cover.jpg')
  if (itemImage) itemImage.setAttribute('content', base + 'images/share-cover.jpg')
  if (twImage) twImage.setAttribute('content', base + 'images/share-cover.jpg')
  if (ogUrl) ogUrl.setAttribute('content', window.location.href)

  initDateDisplay()
  initCountdown()
  initDateRanges()
  loadResources()
  initMusic()
  initVideoMusicSync()
  initGallery()
  initScrollAnimations()
  initMapNav()
  initImagePreview()
  initRsvpScroll()
  initRSVP()
  updateStatsFromLocal()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
