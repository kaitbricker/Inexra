"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = hasPermission;
exports.hasRole = hasRole;
exports.formatDate = formatDate;
function hasPermission(user, permissionName) {
    return user.role.permissions.some(p => p.name === permissionName);
}
function hasRole(user, roleName) {
    return user.role.name === roleName;
}
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
