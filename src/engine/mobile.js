/* 移动端桥接：系统菜单按钮、返回键顺序、触屏布局开关。
 * 只使用经典脚本与现有 VN.ui 接口，不引入模块、依赖或网络请求。
 */
(function () {
  'use strict';
  var VN = (window.VN = window.VN || {});
  var MOBILE_CLASS = 'longway-mobile';
  var menuButton = null;
  var refreshQueued = false;

  function byId(id) { return document.getElementById(id); }

  function isAndroid() {
    return /Android/i.test(navigator.userAgent || '');
  }

  function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
  }

  function shortSide() {
    var w = window.innerWidth || (window.screen && screen.width) || 0;
    var h = window.innerHeight || (window.screen && screen.height) || 0;
    return Math.min(w, h);
  }

  function shouldUseMobileLayout() {
    if (isAndroid()) return true;
    if (isTouchDevice() && shortSide() <= 900) return true;
    /* 桌面窄窗口也启用同一套触控友好的布局。 */
    return window.innerWidth <= 1100 || window.innerHeight <= 620;
  }

  function isMenuAvailable() {
    if (!VN.ui || typeof VN.ui.showSystem !== 'function') return false;
    if (!VN.state || !VN.state.running || VN.state.choice) return false;
    var stage = byId('stage');
    if (!stage) return false;
    if (stage.classList.contains('ui-hidden') || stage.classList.contains('overlay-open')) return false;
    if (byId('modal-wrap')) return false;
    var choice = byId('choice-layer');
    if (choice && !choice.classList.contains('hidden')) return false;
    var dialogue = byId('dialogue');
    if (!dialogue || dialogue.classList.contains('hidden')) return false;
    return true;
  }

  function refreshMenu() {
    if (!menuButton) return;
    var show = document.documentElement.classList.contains(MOBILE_CLASS) && isMenuAvailable();
    menuButton.classList.toggle('on', show);
    menuButton.setAttribute('aria-hidden', show ? 'false' : 'true');
  }

  function scheduleRefresh() {
    if (refreshQueued) return;
    refreshQueued = true;
    var run = function () {
      refreshQueued = false;
      refreshMenu();
    };
    if (window.requestAnimationFrame) window.requestAnimationFrame(run);
    else setTimeout(run, 16);
  }

  function createMenuButton() {
    var stage = byId('stage');
    if (!stage) return;
    if (byId('mobile-menu-btn')) {
      menuButton = byId('mobile-menu-btn');
      return;
    }
    menuButton = document.createElement('button');
    menuButton.type = 'button';
    menuButton.id = 'mobile-menu-btn';
    menuButton.textContent = '☰';
    menuButton.setAttribute('aria-label', '系统菜单');
    menuButton.setAttribute('title', '系统菜单');
    menuButton.setAttribute('aria-hidden', 'true');
    menuButton.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (!isMenuAvailable()) return;
      VN.ui.showSystem();
      scheduleRefresh();
    });
    stage.appendChild(menuButton);
  }

  function clickResultPrimary() {
    var result = document.querySelector('.result-screen');
    if (!result) return false;
    var buttons = result.querySelectorAll('.menu-item');
    if (!buttons.length) return false;
    buttons[buttons.length - 1].click();
    scheduleRefresh();
    return true;
  }

  /* 当前最上层的覆盖层。open() 按打开顺序把 .ov 追加到 DOM，最后一项即栈顶。 */
  function topOverlay() {
    var list = document.querySelectorAll('.ov');
    return list.length ? list[list.length - 1] : null;
  }

  function closeTopOverlay() {
    if (!VN.ui || typeof VN.ui.closeTop !== 'function') return false;
    var before = typeof VN.ui.stackDepth === 'function' ? VN.ui.stackDepth() : 0;
    VN.ui.closeTop();
    var after = typeof VN.ui.stackDepth === 'function' ? VN.ui.stackDepth() : 0;
    scheduleRefresh();
    /* 没有 stackDepth 时无法比较，按“已处理”计算。 */
    return typeof VN.ui.stackDepth === 'function' ? after < before : true;
  }

  /* Android 返回键先交给页面处理；返回 false 时才由原生层退出应用。 */
  function onBack() {
    var modal = byId('modal-wrap');
    if (modal) {
      if (modal.parentNode) modal.parentNode.removeChild(modal);
      scheduleRefresh();
      return true;
    }

    var choice = byId('choice-layer');
    if (choice && !choice.classList.contains('hidden')) {
      /* 选项阶段不能用返回键误退出游戏；必须先明确选择。 */
      return true;
    }

    if (clickResultPrimary()) return true;

    /* 标题画面下面可能压着章节选择/图鉴/设置等覆盖层，
       所以不能“只要 DOM 里有 .title-screen 就当自己在标题页”——
       这里只看最上层那一个。 */
    var top = topOverlay();
    if (top) {
      if (top.classList.contains('title-screen')) {
        scheduleRefresh();
        return false;
      }
      if (closeTopOverlay()) return true;
      if (top.parentNode) {
        top.parentNode.removeChild(top);
        scheduleRefresh();
        return true;
      }
    }

    if (VN.state && VN.state.running && VN.ui && typeof VN.ui.showSystem === 'function') {
      VN.ui.showSystem();
      scheduleRefresh();
      return true;
    }

    return false;
  }

  function installObservers() {
    if (!window.MutationObserver) return;
    var targets = [
      byId('stage'), byId('dialogue'), byId('choice-layer'), byId('overlay'), byId('app')
    ];
    var observer = new MutationObserver(scheduleRefresh);
    targets.forEach(function (node) {
      if (!node) return;
      observer.observe(node, {
        attributes: true,
        attributeFilter: ['class'],
        childList: true,
        subtree: node.id === 'app' || node.id === 'overlay'
      });
    });
  }

  function bootMobile() {
    if (shouldUseMobileLayout()) document.documentElement.classList.add(MOBILE_CLASS);
    createMenuButton();
    installObservers();
    refreshMenu();
    window.addEventListener('resize', scheduleRefresh);
    window.addEventListener('orientationchange', scheduleRefresh);
    window.addEventListener('pageshow', scheduleRefresh);
    document.addEventListener('visibilitychange', scheduleRefresh);
    /* 低频率兜底：覆盖 UI 自行改 DOM 但未触发上面监听的分支。 */
    setInterval(scheduleRefresh, 1200);
  }

  window.VNMobile = {
    onBack: onBack,
    refresh: scheduleRefresh,
    isMobile: function () { return document.documentElement.classList.contains(MOBILE_CLASS); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootMobile);
  else bootMobile();
})();
