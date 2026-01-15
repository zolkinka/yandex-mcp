"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../settings/config");
const YandexTrackerAPI_1 = require("../yandex_api/YandexTrackerAPI");
const yandex_tracker_client_1 = require("yandex-tracker-client");
const user_1 = require("../models/user");
async function test0() {
    const api = new yandex_tracker_client_1.Tracker(config_1.config.YANDEX_TRACKER_TOKEN, undefined, config_1.config.YANDEX_TRACKER_CLOUD_ORG_ID, config_1.config.YANDEX_TRACKER_BASE_URL);
    const res = await api.get("myself");
    console.log(res);
    var usr = user_1.userSchemaSimple.parse(res);
    console.log(usr);
}
async function test1() {
    const api = YandexTrackerAPI_1.YandexTrackerAPI.getInstance();
    const usr = await api.getMyself();
    console.log(usr);
}
async function test2() {
    const api = YandexTrackerAPI_1.YandexTrackerAPI.getInstance();
    const params = {
        filter: {
            queue: "MAJOR",
            type: {
                id: 1,
            },
            tags: ["backend"],
        },
        order: "+status",
    };
    const usr = await api.manualPost("issues/_search?perPage=1&page=2", params);
    console.log(usr);
}
async function test3() {
    const api = YandexTrackerAPI_1.YandexTrackerAPI.getInstance();
    const ques = await api.getQueues({
        expand: ["team"],
    });
    console.log(ques);
}
async function test4() {
    const api = YandexTrackerAPI_1.YandexTrackerAPI.getInstance();
    const usr = await api.getIssue("MAJOR-1100");
    console.log(usr);
}
async function test5() {
    const api = YandexTrackerAPI_1.YandexTrackerAPI.getInstance();
    const issues = await api.searchIssueSimple("жилой");
    console.log(issues);
}
async function test6() {
    const api = YandexTrackerAPI_1.YandexTrackerAPI.getInstance();
    const queue = await api.getQueue("DISCO");
    console.log(queue);
}
async function test7() {
    const api = YandexTrackerAPI_1.YandexTrackerAPI.getInstance();
    const user = await api.getUsers();
    console.log(user);
}
async function test8() {
    const api = YandexTrackerAPI_1.YandexTrackerAPI.getInstance();
    const user = await api.getUser("major-homme");
    console.log(user);
}
async function test9() {
    const api = YandexTrackerAPI_1.YandexTrackerAPI.getInstance();
    const issues = await api.searchIssueByFilter({
        queue: "DISCO",
        createdBy: 8000000000000025,
    }, "+createdAt");
    console.log(issues);
}
async function test10() {
    const api = YandexTrackerAPI_1.YandexTrackerAPI.getInstance();
    const priorities = await api.getPriorities();
    console.log(priorities);
}
async function test11() {
    const api = YandexTrackerAPI_1.YandexTrackerAPI.getInstance();
    const issueTypes = await api.getIssueTypes();
    console.log(issueTypes);
}
async function test12() {
    const api = YandexTrackerAPI_1.YandexTrackerAPI.getInstance();
    const status = await api.getStatuses();
    console.log(status);
}
async function test13() {
    const api = YandexTrackerAPI_1.YandexTrackerAPI.getInstance();
    const issues = await api.searchIssueByQuery('Queue: DISCO "Sort by": Updated DESC', false, 1, 1);
    console.log(issues);
}
test13();
//# sourceMappingURL=yandex_api1.test.js.map