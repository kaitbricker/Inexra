"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationStatus = exports.Platform = exports.AccountStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["CREATOR"] = "CREATOR";
    UserRole["BASIC_USER"] = "BASIC_USER";
})(UserRole || (exports.UserRole = UserRole = {}));
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["ACTIVE"] = "ACTIVE";
    AccountStatus["SUSPENDED"] = "SUSPENDED";
    AccountStatus["INACTIVE"] = "INACTIVE";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
var Platform;
(function (Platform) {
    Platform["INSTAGRAM"] = "INSTAGRAM";
    Platform["LINKEDIN"] = "LINKEDIN";
    Platform["TWITTER"] = "TWITTER";
})(Platform || (exports.Platform = Platform = {}));
var ConversationStatus;
(function (ConversationStatus) {
    ConversationStatus["OPEN"] = "OPEN";
    ConversationStatus["ACTIVE"] = "ACTIVE";
    ConversationStatus["ARCHIVED"] = "ARCHIVED";
})(ConversationStatus || (exports.ConversationStatus = ConversationStatus = {}));
