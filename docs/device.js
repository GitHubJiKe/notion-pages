(function () {
    function isMobileDevice() {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /iPhone|iPod|iPad|Android|BlackBerry|Opera Mini|IEMobile/.test(
            userAgent
        );
    }

    function insertStyle() {
        const styleEle = document.createElement("style");
        styleEle.id = "SPECIAL_STYLE";
        styleEle.innerHTML = `code[class*=language-],pre[class*=language-] {font-size:2rem !important;`;
        document.head.appendChild(styleEle);
    }

    function judge() {
        const ele = document.getElementById("SPECIAL_STYLE");
        if (isMobileDevice() && !ele) {
            insertStyle();
        } else {
            if (ele) {
                ele.remove();
            }
        }
    }

    window.addEventListener("resize", judge);

    judge();
})();
