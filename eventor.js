/**
* Attach an event
*
* Untargeted (Global) Event:
*   $E.attach (string type, function listener);
* Targeted Event:
*   $E.attach (object target, string type, function listener);
*/

if (typeof $E == "undefined") {
    $E = (function (){
        return {
            on:{},
            targeted:{}
        };
    })();

    $E.attach = function () {
            var target, type, listener;

            switch (arguments.length) {
                case 2:
                    type = arguments[0];
                    listener = arguments[1];
                    break;
                case 3:
                    target = arguments[0];
                    type = arguments[1];
                    listener = arguments[2];
                    break;
                default:
                    throw "Invalid parameter count";
                    return false;
            }

            if (typeof type != "string" || typeof listener != "function") {
                throw "Invalid parameter types";
                return false;
            }

            if (target) {
                var targetName = target.tagName + target.id + (target.getAttribute ? target.getAttribute("name") : "");

                this.targeted[targetName] || (this.targeted[targetName] = {on:{}});
                this.targeted[targetName].on[type] || (this.targeted[targetName].on[type] = []);

                for (var i = 0; i < this.targeted[targetName].on[type].length; i++) {
                    if (this.targeted[targetName].on[type][i] === listener) {
                        return false;
                    }
                }

                this.targeted[targetName].on[type].push (listener);

                if (!this.targeted[targetName].on[type].attached) {
                    if (target.addEventListener) {
                        target.addEventListener (type, function(e){$E.fire (e)}, false);
                        this.targeted[targetName].on[type].attached = true;
                    } else if (target.attachEvent) {
                        target.attachEvent ("on"+type, function(){$E.fire (event)});
                        this.targeted[targetName].on[type].attached == true;
                    } else {
                        return false;
                    }
                }
            } else {
                this.on[type] || (this.on[type] = []);
                for (var i = 0; i < this.on[type].length; i++) {
                    if (this.on[type][i] === listener) {
                        return false;
                    }
                }

                this.on[type].push (listener);
            }
            
            return true;
    };

    /**
    * Detach an event
    *
    * Untargeted (Global) Event:
    *   $E.detach (string type, function listener);
    * Targeted Event:
    *   $E.detach (object target, string type, function listener);
    */
    $E.detach = function () {
        var target, type, listener;

        switch (arguments.length) {
            case 2:
                type = arguments[0];
                listener = arguments[1];
                break;
            case 3:
                target = arguments[0];
                type = arguments[1];
                listener = arguments[2];
                break;
            default:
                throw "Invalid parameter count";
                return false;
        }

        if (typeof type != "string" || typeof listener != "function") {
            throw "Invalid parameter types";
            return false;
        }

        if (target) {
            var targetName = target.tagName + target.id + (target.getAttribute ? target.getAttribute("name") : "");

            if (!this.targeted[targetName].on[type]) {
                return false;
            }

            for (var i = 0; i < this.targeted[targetName].on[type].length; i++) {
                if (this.targeted[targetName].on[type][i] === listener) {
                    this.targeted[targetName].on[type].splice (i, 1);
                    return true;
                }
            };
        } else {
            if (!this.on[type]) {
                return false;
            }

            for (var i = 0; i < this.on[type].length; i++) {
                if (this.on[type][i] === listener) {
                    this.on[type].splice (i, 1);
                    return true;
                }
            };
        }
    };

    /**
    * Fire an event
    *
    * $E.fire (string type);
    * $E.fire (Event e);
    * $E.fire (string type, object target, object data);
    */
    $E.fire = function () {
        if (arguments.length < 1) {
            throw "Invalid parameters count";
            return false;
        }

        var e = {};
        if (arguments.length == 1) {
            if (typeof arguments[0] == "string") {
                e.type = arguments[0];
            } else {
                e.type = arguments[0].type;
                e.target = arguments[0].currentTarget || arguments[0].srcElement;
                e.data = arguments[0].data;
                e.srcEvent = arguments[0];
            }
        } else {
                e.type = arguments[0];
                e.target = arguments[1];
                e.data = arguments[2];
        }

        e.target && (e.targetName = e.target.tagName + e.target.id + (e.target.getAttribute ? e.target.getAttribute("name") : ""));

        var previousResult = null;

        if (e.target && this.targeted[e.targetName] && this.targeted[e.targetName].on[e.type]) {
            for (var i = 0; i < this.targeted[e.targetName].on[e.type].length; i++) {
                var listener = this.targeted[e.targetName].on[e.type][i];

                var result = listener.call (e, previousResult);

                if (result === false) {
                    if (e.srcEvent) {
                        e.srcEvent.returnValue = false;
                        e.srcEvent.preventDefault && e.srcEvent.preventDefault ();
                        e.srcEvent.stopPropagation && e.srcEvent.stopPropagation ();
                        e.srcEvent.cancelBubble === false && (e.srcEvent.cancelBubble = true);
                    }
                    break;
                    return true;
                }

                previousResult = result;
            }
        }

        if (this.on[e.type]) {
            for (var i = 0; i < this.on[e.type].length; i++) {
                var listener = this.on[e.type][i];

                var result = listener.call (e, previousResult);

                if (result === false) {
                    if (e.srcEvent) {
                        e.srcEvent.preventDefault && e.srcEvent.preventDefault ();
                        e.srcEvent.stopPropagation && e.srcEvent.stopPropagation ();
                        e.srcEvent.cancelBubble === false && (e.srcEvent.cancelBubble = true);
                    }
                    break;
                }

                previousResult = result;
            }
        }

        return true;
    };
}