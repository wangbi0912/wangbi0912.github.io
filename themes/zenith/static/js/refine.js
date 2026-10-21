/* Zenith · Refinement Layer
   为代码块注入顶部工具条：左侧语言标识 + 右侧复制按钮。
   纯增强，失败不影响页面其它功能。 */
(function () {
  "use strict";

  var LANG_ALIAS = {
    sh: "shell", bash: "shell", zsh: "shell", console: "shell",
    "c++": "cpp", cc: "cpp", cxx: "cpp",
    js: "javascript", ts: "typescript",
    py: "python", rb: "ruby", yml: "yaml",
    md: "markdown", "": "text", plaintext: "text", text: "text"
  };

  function detectLang(block) {
    var code = block.querySelector("code[data-lang]");
    if (code) {
      var raw = (code.getAttribute("data-lang") || "").toLowerCase();
      return LANG_ALIAS[raw] || raw;
    }
    code = block.querySelector("code[class*='language-']");
    if (code) {
      var m = /language-([a-zA-Z0-9+#-]+)/.exec(code.className);
      if (m) {
        var key = m[1].toLowerCase();
        return LANG_ALIAS[key] || key;
      }
    }
    return "code";
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy") ? resolve() : reject();
      } catch (e) {
        reject();
      }
      document.body.removeChild(ta);
    });
  }

  function enhance(block) {
    if (!block || block.querySelector(":scope > .code-bar")) return;
    var code = block.querySelector("code") || block;
    var bar = document.createElement("div");
    bar.className = "code-bar";

    var lang = document.createElement("span");
    lang.className = "code-lang";
    lang.textContent = detectLang(block);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "code-copy";
    btn.textContent = "复制";
    btn.setAttribute("aria-label", "复制代码");
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      copyText(code.innerText || code.textContent || "").then(function () {
        btn.textContent = "已复制";
        btn.classList.add("copied");
        setTimeout(function () {
          btn.textContent = "复制";
          btn.classList.remove("copied");
        }, 1600);
      });
    });

    bar.appendChild(lang);
    bar.appendChild(btn);
    block.insertBefore(bar, block.firstChild);
  }

  function run() {
    var blocks = document.querySelectorAll(".post-content .highlight, .post-content pre");
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      // .highlight 内层的 pre 跳过，只增强外层，避免双重工具条
      if (b.tagName === "PRE" && b.parentNode && b.parentNode.classList.contains("highlight")) continue;
      // 裸 pre（无 .highlight 包裹）需要容器定位上下文
      if (!b.classList.contains("highlight")) {
        b.style.position = "relative";
        b.style.paddingTop = "2.15rem";
      }
      enhance(b);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
