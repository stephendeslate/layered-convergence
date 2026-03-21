"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SseService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
let SseService = class SseService {
    subjects = new Map();
    getDashboardStream(dashboardId) {
        if (!this.subjects.has(dashboardId)) {
            this.subjects.set(dashboardId, new rxjs_1.Subject());
        }
        return new rxjs_1.Observable((subscriber) => {
            const subject = this.subjects.get(dashboardId);
            const subscription = subject.subscribe(subscriber);
            subscriber.next({
                data: { type: 'connected', dashboardId },
                retry: 15000,
            });
            return () => {
                subscription.unsubscribe();
            };
        });
    }
    emit(dashboardId, data) {
        const subject = this.subjects.get(dashboardId);
        if (subject) {
            subject.next({
                data,
                retry: 15000,
            });
        }
    }
    removeStream(dashboardId) {
        const subject = this.subjects.get(dashboardId);
        if (subject) {
            subject.complete();
            this.subjects.delete(dashboardId);
        }
    }
};
exports.SseService = SseService;
exports.SseService = SseService = __decorate([
    (0, common_1.Injectable)()
], SseService);
//# sourceMappingURL=sse.service.js.map