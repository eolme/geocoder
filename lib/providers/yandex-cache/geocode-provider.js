import { YandexGeoCodeProvider } from "../yandex/geocode-provider";
import LRU from "lru-cache";
import inherit from "inherit";
import extend from 'lodash-es/extend';

const cache = LRU({
    max: 1000,
    // Cache for a month as default
    maxAge: 1000 * 60 * 60 * 24 * 30
});

const YandexCacheGeoCodeProvider = inherit(YandexGeoCodeProvider, {
    geocode(point, options) {
        const cacheKey = this.createCacheKey(point, options);

        if (cache.has(cacheKey)) {
            this.events.emit("requestfound", cacheKey);
            return vow.resolve(cache.get(cacheKey));
        }

        return this.__base.apply(this, arguments).then((res) => {
            cache.set(cacheKey, res);
            this.events.emit("requestsaved", cacheKey);
            return res;
        }, this);
    },
    createCacheKey(point, options) {
        const params = extend({}, this.getRequestParams(point), options);
        return Object.keys(params).reduce((cacheKey, param) => [
            cacheKey,
            param,
            params[param]
        ].join("~"), "").substring(1);
    },
    getCacheLength() {
        return cache.itemCount();
    },
    dropCache() {
        cache.reset();
    }
});

export { YandexCacheGeoCodeProvider };
