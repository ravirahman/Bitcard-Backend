window.onload = function() {
    function getJsonFromUrl() {
        var query = location.search.substr(1);
        var result = {};
        query.split("&").forEach(function(part) {
            var item = part.split("=");
            result[item[0]] = decodeURIComponent(item[1]);
        });
        return result;
    }
    var qp = getJsonFromUrl();
    console.log("qp",qp);
    chrome.storage.sync.set(qp, function() {
        // Notify that we saved.
        var daddy = window.self;
        daddy.opener = window.self;
        daddy.close();
    });
};