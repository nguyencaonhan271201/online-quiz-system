module.exports = async (content) => {
    var buf = new ArrayBuffer(content.length*2);
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen = content.length; i < strLen; i++) {
        bufView[i] = content.charCodeAt(i);
    }
    return bufView;
};

