package com.longway.game;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.graphics.Color;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.util.Log;
import android.view.DisplayCutout;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.JsResult;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;

import java.util.Locale;

/* 原生 WebView 壳：只负责承载 file:///android_asset/www，不改变游戏的零网络架构。 */
public final class MainActivity extends Activity {
    private static final String TAG = "LongWayGame";
    private static final String START_URL = "file:///android_asset/www/index.html";
    private static final long BACK_DEBOUNCE_MS = 450L;

    private WebView webView;
    private boolean loadErrorShown;
    private boolean backInFlight;
    private long lastBackAt;
    private Object backCallback;
    private int insetLeftCss;
    private int insetTopCss;
    private int insetRightCss;
    private int insetBottomCss;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(7, 9, 15));
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        setContentView(webView);

        configureWebView();
        installWebClients();
        enterImmersiveMode();

        webView.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
            @Override
            public WindowInsets onApplyWindowInsets(View view, WindowInsets insets) {
                captureInsets(insets);
                return insets;
            }
        });

        if (Build.VERSION.SDK_INT >= 33) {
            backCallback = BackApi33.register(this);
        }

        boolean restored = false;
        if (savedInstanceState != null) {
            restored = webView.restoreState(savedInstanceState) != null;
        }
        if (!restored) webView.loadUrl(START_URL);
    }

    @SuppressWarnings("deprecation")
    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setBlockNetworkLoads(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setTextZoom(100);
        settings.setDefaultTextEncodingName("UTF-8");
        settings.setGeolocationEnabled(false);
        settings.setNeedInitialFocus(false);

        String ua = settings.getUserAgentString();
        settings.setUserAgentString(ua + " LongWayGameAndroid/1.0");
    }

    private void installWebClients() {
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return shouldBlockNavigation(request == null ? null : request.getUrl());
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return shouldBlockNavigation(Uri.parse(url));
            }

            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                loadErrorShown = false;
                super.onPageStarted(view, url, favicon);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                applyInsetsToPage();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request != null && request.isForMainFrame()) {
                    String detail = error == null ? "" : String.valueOf(error.getDescription());
                    showLoadError(detail);
                }
            }

            @Override
            @SuppressWarnings("deprecation")
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                if (failingUrl != null && failingUrl.equals(view.getUrl())) {
                    showLoadError(description == null ? "" : description);
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage message) {
                if (message == null) return true;
                String line = "网页控制台 " + message.sourceId() + ":" + message.lineNumber()
                        + " " + message.message();
                switch (message.messageLevel()) {
                    case ERROR:
                        Log.e(TAG, line);
                        break;
                    case WARNING:
                        Log.w(TAG, line);
                        break;
                    default:
                        Log.i(TAG, line);
                        break;
                }
                return true;
            }

            @Override
            public boolean onJsAlert(WebView view, String url, String message, final JsResult result) {
                if (isFinishing()) {
                    result.cancel();
                    return true;
                }
                new AlertDialog.Builder(MainActivity.this)
                        .setTitle("长征 · 万水千山")
                        .setMessage(message)
                        .setPositiveButton("确定", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                result.confirm();
                            }
                        })
                        .setOnCancelListener(new DialogInterface.OnCancelListener() {
                            @Override
                            public void onCancel(DialogInterface dialog) {
                                result.cancel();
                            }
                        })
                        .show();
                return true;
            }

            @Override
            public boolean onJsConfirm(WebView view, String url, String message, final JsResult result) {
                if (isFinishing()) {
                    result.cancel();
                    return true;
                }
                new AlertDialog.Builder(MainActivity.this)
                        .setTitle("长征 · 万水千山")
                        .setMessage(message)
                        .setPositiveButton("确定", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                result.confirm();
                            }
                        })
                        .setNegativeButton("取消", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                result.cancel();
                            }
                        })
                        .setOnCancelListener(new DialogInterface.OnCancelListener() {
                            @Override
                            public void onCancel(DialogInterface dialog) {
                                result.cancel();
                            }
                        })
                        .show();
                return true;
            }
        });
    }

    private boolean shouldBlockNavigation(Uri uri) {
        if (uri == null) return true;
        if (!"file".equals(uri.getScheme())) return true;
        if (!"android_asset".equals(uri.getHost())) return true;
        String path = uri.getPath();
        if (path == null || !path.startsWith("/www/")) return true;
        String lower = path.toLowerCase(Locale.US);
        return lower.contains("..") || lower.contains("%2e");
    }

    private void showLoadError(String detail) {
        if (loadErrorShown || isFinishing()) return;
        loadErrorShown = true;
        if (detail != null && detail.length() > 0) {
            Log.e(TAG, "内置页面载入失败：" + detail);
        }
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (isFinishing()) return;
                new AlertDialog.Builder(MainActivity.this)
                        .setTitle("无法载入游戏")
                        .setMessage("内置页面没有成功载入。请重新安装 APK 后再试。")
                        .setCancelable(false)
                        .setPositiveButton("退出", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                finish();
                            }
                        })
                        .show();
            }
        });
    }

    private void captureInsets(WindowInsets windowInsets) {
        if (windowInsets == null) return;
        int left;
        int top;
        int right;
        int bottom;

        if (Build.VERSION.SDK_INT >= 30) {
            int[] bars = Api30.systemBarsInsets(windowInsets);
            left = bars[0];
            top = bars[1];
            right = bars[2];
            bottom = bars[3];
        } else {
            left = windowInsets.getSystemWindowInsetLeft();
            top = windowInsets.getSystemWindowInsetTop();
            right = windowInsets.getSystemWindowInsetRight();
            bottom = windowInsets.getSystemWindowInsetBottom();
        }

        if (Build.VERSION.SDK_INT >= 28) {
            int[] cutout = Api28.cutoutInsets(windowInsets);
            if (cutout != null) {
                left = Math.max(left, cutout[0]);
                top = Math.max(top, cutout[1]);
                right = Math.max(right, cutout[2]);
                bottom = Math.max(bottom, cutout[3]);
            }
        }

        float density = getResources().getDisplayMetrics().density;
        if (density <= 0f) density = 1f;
        int leftCss = Math.round(left / density);
        int topCss = Math.round(top / density);
        int rightCss = Math.round(right / density);
        int bottomCss = Math.round(bottom / density);

        if (leftCss == insetLeftCss && topCss == insetTopCss
                && rightCss == insetRightCss && bottomCss == insetBottomCss) {
            return;
        }
        insetLeftCss = leftCss;
        insetTopCss = topCss;
        insetRightCss = rightCss;
        insetBottomCss = bottomCss;
        applyInsetsToPage();
    }

    private void applyInsetsToPage() {
        if (webView == null) return;
        String js = "(function(){var s=document.documentElement.style;"
                + "s.setProperty('--inset-left','" + insetLeftCss + "px');"
                + "s.setProperty('--inset-top','" + insetTopCss + "px');"
                + "s.setProperty('--inset-right','" + insetRightCss + "px');"
                + "s.setProperty('--inset-bottom','" + insetBottomCss + "px');"
                + "if(window.VNMobile&&VNMobile.refresh){VNMobile.refresh();}"
                + "})();";
        webView.evaluateJavascript(js, null);
    }

    @SuppressWarnings("deprecation")
    private void enterImmersiveMode() {
        Window window = getWindow();
        if (Build.VERSION.SDK_INT >= 30) {
            Api30.enterImmersive(window);
        } else {
            window.getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                            | View.SYSTEM_UI_FLAG_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        }
    }

    private void handleBack() {
        if (isFinishing() || webView == null) return;
        long now = SystemClock.uptimeMillis();
        if (backInFlight || now - lastBackAt < BACK_DEBOUNCE_MS) return;
        lastBackAt = now;
        backInFlight = true;
        webView.evaluateJavascript(
                "window.VNMobile && window.VNMobile.onBack ? String(window.VNMobile.onBack()) : 'false'",
                new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String value) {
                        backInFlight = false;
                        boolean handled = value != null
                                && value.replace("\"", "").trim().equals("true");
                        if (!handled && !isFinishing()) finish();
                    }
                });
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        handleBack();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        if (webView != null) webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
        enterImmersiveMode();
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.onPause();
        super.onPause();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) enterImmersiveMode();
    }

    @Override
    protected void onDestroy() {
        if (Build.VERSION.SDK_INT >= 33 && backCallback != null) {
            BackApi33.unregister(this, backCallback);
            backCallback = null;
        }
        if (webView != null) {
            ViewGroup parent = (ViewGroup) webView.getParent();
            if (parent != null) parent.removeView(webView);
            webView.stopLoading();
            webView.setWebChromeClient(null);
            webView.setWebViewClient(null);
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    /* API 28：横屏刘海/挖孔安全区。 */
    @SuppressWarnings("NewApi")
    private static final class Api28 {
        static int[] cutoutInsets(WindowInsets windowInsets) {
            DisplayCutout cutout = windowInsets.getDisplayCutout();
            if (cutout == null) return null;
            return new int[] {
                    cutout.getSafeInsetLeft(),
                    cutout.getSafeInsetTop(),
                    cutout.getSafeInsetRight(),
                    cutout.getSafeInsetBottom()
            };
        }
    }

    /* API 30：边到边与系统栏隐藏。 */
    @SuppressWarnings("NewApi")
    private static final class Api30 {
        static void enterImmersive(Window window) {
            window.setDecorFitsSystemWindows(false);
            WindowInsetsController controller = window.getInsetsController();
            if (controller == null) return;
            controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
            controller.setSystemBarsBehavior(
                    WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        }

        static int[] systemBarsInsets(WindowInsets windowInsets) {
            Insets insets = windowInsets.getInsets(
                    WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
            return new int[] { insets.left, insets.top, insets.right, insets.bottom };
        }
    }

    /* API 33：预测式返回键。独立成类，避免旧系统加载不存在的系统类。 */
    @SuppressWarnings("NewApi")
    private static final class BackApi33 {
        static Object register(final MainActivity activity) {
            OnBackInvokedCallback callback = new OnBackInvokedCallback() {
                @Override
                public void onBackInvoked() {
                    activity.handleBack();
                }
            };
            activity.getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT, callback);
            return callback;
        }

        static void unregister(MainActivity activity, Object callback) {
            if (!(callback instanceof OnBackInvokedCallback)) return;
            activity.getOnBackInvokedDispatcher().unregisterOnBackInvokedCallback(
                    (OnBackInvokedCallback) callback);
        }
    }
}
