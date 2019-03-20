import extend from "lodash-es/extend";
import { EventEmitter } from "events";
import { format } from "util";
import inherit from "inherit";
import vow from "vow";
import Queue from "vow-queue";
import { axios } from "@eolme/fetchit/ext/axios";

const BaseGeoCodeProvider = inherit({
    __constructor(options) {
        this.events = new EventEmitter();
        this._options = extend({}, options);
    },
    geocode(point, options) {
        const defer = vow.defer(),
            {
                events
            } = this,
            onFail = (err) => {
                events.emit("requestfail", err);
                defer.reject(err);
            },
            onSuccess = (result) => {
                events.emit("requestsuccess", result);
                defer.resolve(result);
            };
        this.events.emit("requeststart");
        axios.get(this.getRequestUrl(), {
            params: extend({}, this.getRequestParams(point), options),
            responseType: 'json'
        }).then((err, res) => {
            defer.notify(format("Processed: \"%s\"", this.getText(point)));
            if (err) {
                return onFail(err);
            }
            try {
                onSuccess(this.process(res.body));
            } catch (err) {
                return onFail(err);
            }
            this.events.emit("requestend");
        });
        return defer.promise();
    },
    process(result) {
        return result;
    },
    getRequestUrl() {
        return "";
    },
    getRequestParams(point) {
        return {};
    },
    getText(point) {
        return point;
    }
});