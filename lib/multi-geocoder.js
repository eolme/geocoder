import * as providers from "./providers/index";
import inherit from "inherit";

const MultiGeoCoder = inherit({
    __constructor(options) {
        this._options = options || {};
        this._queue = null;
        this.setProvider(this._options.provider || "yandexCache");
    },
    getProvider() {
        return this._provider;
    },
    setProvider(key) {
        this._provider = new providers[key](this._options);
        return this;
    },
    geocode(points, options) {
        const provider = this._provider,
            queue = this._queue = new Queue({
                weightLimit: 10
            }),
            tasks = [],
            enqueue = (task) => tasks.push(queue.enqueue(task, {
                priority: 1,
                weight: 1
            })),
            getProgress = (num) => Math.round(num * 100 / tasks.length);
        points.forEach((point) => {
            enqueue(provider.geocode.bind(provider, point, options));
        });
        queue.start();
        return vow.allResolved(tasks).
            then((results) => {
                const features = [],
                    errors = [];
                results.forEach((promise, index) => {
                    const value = promise.valueOf();
                    if (promise.isFulfilled()) {
                        features.push(value);
                    } else {
                        errors.push({
                            request: points[index],
                            index: index,
                            reason: value instanceof Error ? value.message : value
                        });
                    }
                });
                return {
                    result: {
                        type: "FeatureCollection",
                        features: features
                    },
                    errors: errors
                };
            }).
            progress((message) => {
                const stats = queue.getStats();
                return {
                    message: message,
                    processed: getProgress(stats.processedTasksCount),
                    processing: getProgress(stats.processingTasksCount)
                };
            });
    },
    abort() {
        this._queue.stop();
        return this;
    }
});

export { MultiGeoCoder };
