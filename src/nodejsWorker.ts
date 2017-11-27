// *HACK BEGIN*
// Temporary workaround for https://github.com/nodejs/node/issues/8897
//
// In standalone mode, c:\home is a junction which maps to a directory on the host (docker run -v c:\home:c:\home <container name>)
// This hack filters all requests to fs.realpathSync and special cases the result for c:\home 

var scriptMode = process.env['AzureWebJobsScriptMode'];

if (scriptMode !== undefined && scriptMode.toLowerCase() === 'standalone') {
    var fs = require('fs');

    var originalFunc = fs.realpathSync;

    fs.realpathSync = function () {
        var path = arguments[0];
        // For now, just hardcode c:\home
        if (path !== undefined && (path.toLowerCase().indexOf('c:\\home') === 0 || path.toLowerCase().indexOf('c:\\home\\') === 0)) {
            return path;
        }

        return originalFunc.apply(this, arguments);
    }
}

// *HACK END*

var worker;
try {
    worker = require("../../worker-bundle.js");
} catch (err) {
    console.error(`Couldn't require bundle, falling back to Worker.js. ${err}`);
    worker = require("./Worker.js");
}

worker.startNodeWorker(process.argv);