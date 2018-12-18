// Taken from WABot wiki page: https://github.com/aalsuwaidi/wabot/wiki/WhatsApp-Web under heading 'Webpack and finding the Store'

// Returns promise that resolves to all installed modules
function getAllModules() {
    return new Promise((resolve) => {
        const id = _.uniqueId('fakeModule_');
        window['webpackJsonp'](
            [], {
                [id]: function(module, exports, __webpack_require__) {
                    resolve(__webpack_require__.c);
                }
            }, [id]
        );
    });
}

// Get module by ID found from the function above
function _requireById(id) {
    return webpackJsonp([], null, [id]);
}

// Module IDs
var createFromData_id = 0;
var prepareRawMedia_id = 0;
var store_id = 0;
var Store = {};
var DiffStore = [];

var modules = getAllModules()._value;

// Automatically locate modules
for (var key in modules) {
    if (modules[key].exports) {
        if (modules[key].exports.createFromData) {
            createFromData_id = modules[key].id.replace(/"/g, '"');
        }
        if (modules[key].exports.prepRawMedia) {
            prepareRawMedia_id = modules[key].id.replace(/"/g, '"');
        }
        if (modules[key].exports.default) {
            if (modules[key].exports.default.Wap) {
                store_id = modules[key].id.replace(/"/g, '"');
            }
        }
    }
}

function findAlreadyDeletedMessages() {

    for (var x = 0; x < Store.Msg.models.length; x++) {
        messageObj = Store.Msg.models[x];

        DiffStore[x] = {
            "__x_body": String(messageObj.__x_body),
            "__x_type": String(messageObj.__x_type),
        };

        if (String(messageObj.__x_body == "undefined")) {
            //console.log("wtf is it undefined?");
            //console.log(messageObj);
        }
        if (messageObj.__x_type == "revoked" && messageObj.hasOwnProperty("__x_body")) // deleted messages
        {

            //if we have older messages lets just change the type
            Store.Msg.models[x].__x_type = "revokedAndSeenByWhatsAppDoc";
        }

    }


    console.log("starting Monitor phase");

    var scanForDelete = setInterval(function() {
        //Lets DIFF BABY

        //var t0 = performance.now();

        for (var x = 0; x < Store.Msg.models.length; x++) {
            messageObj = Store.Msg.models[x];
            if (messageObj.__x_type == "revoked" && messageObj.hasOwnProperty("__x_body")) // deleted messages
            {
                // This _only_ returns chat types, for things like images/audio/video/files you'd have to get the client to download the files from the Store object and then keep them locally and it seems like a bunch of work. However you can get the thumbnail as a B64 image from the __x_body

                if (DiffStore[x].__x_type == "chat") {
                    console.log("Found a deleted chat message! Here is the original:");
                    console.log(DiffStore[x].__x_body);

                    Store.Msg.models[x].__x_type = "chat";
                    Store.Msg.models[x].__x_body = "This Message was deleted: '" + DiffStore[x].__x_body + "'";

                } else if (DiffStore[x].__x_type == "image") {
                    console.log("Found a deleted image! We only have the thumbnail, but in B64 its: " + DiffStore[x].__x_body);

                    Store.Msg.models[x].__x_type = "chat";
                    Store.Msg.models[x].__x_body = "This image was deleted but we have a B64 of it in console..";


                }

            }

        }

        //var t1 = performance.now();
        //console.log("Call to diff messages took " + (t1 - t0) + " milliseconds.")
    }, 1000);



}




/* Extension Code */
function init(initialNumber) {

    var startLogging = false;
    Store = _requireById(store_id).default;


    var keys = Object.keys(Store.Wap);

    //Here we add the messages as they come in to our 'DiffStore'
    Store.Msg.models.push = function(message) {

        Array.prototype.push.call(this, message);

        if (startLogging == true) {

            DiffStore.push({
                "__x_body": String(message.__x_body),
                "__x_type": String(message.__x_type),
            });

        }
    };

    Store.Msg.models.onPush = function(message) {
        console.log("onPush message?:");
        console.log((Store.Msg.models));
    }

    Store.Chat.models.pop = function(message) {
        Array.prototype.push.call(this, message);
        console.log("Popped chat model Message");
        this.onPush(message);

    };

    Store.Chat.models.onPop = function(message) {
        console.log("onPop chat model message:");
        console.log(message);

    }


    var initialSetup = setInterval(function() {


        if (Store.Msg.models.length >= initialNumber) {
            findAlreadyDeletedMessages();
            startLogging = true;
            clearInterval(initialSetup);
        }

    }, 500);


}




var WhatsAppWebLoaded = setInterval(function() {
    Store = _requireById(store_id).default;
    if (Store.Msg.models.length > 1) {
        clearInterval(WhatsAppWebLoaded);
        setTimeout(function() {
            console.log("Starting with " + Store.Msg.models.length + " messages in model.");
            init(Store.Msg.models.length);
            console.log("Loaded!");

        }, 3000);
    } else {
        console.log("Waiting for app...");
    }
}, 1000);