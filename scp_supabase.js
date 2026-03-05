// ── SCP PORTAL — SUPABASE CLIENT ─────────────────────────────────────────────
const SB_URL = 'https://esgunecokerphecjrtjw.supabase.co';
const SB_KEY = 'sb_publishable_gpAwHw7AVgLdBCCrL1NHWw_kDCgMtkl';

async function sbReq(method, path, body = null, params = '') {
    const url = `${SB_URL}/rest/v1/${path}${params ? '?' + params : ''}`;
    const opts = {
        method,
        headers: {
            'apikey': SB_KEY,
            'Authorization': 'Bearer ' + SB_KEY,
            'Content-Type': 'application/json',
            'Prefer': method === 'POST' ? 'return=representation' : 'return=representation'
        }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    if (!res.ok) {
        const err = await res.text();
        console.error('Supabase error:', err);
        return null;
    }
    const text = await res.text();
    return text ? JSON.parse(text) : [];
}

// ── ACCOUNTS ─────────────────────────────────────────────────────────────────
async function dbGetAccounts() {
    return await sbReq('GET', 'accounts', null, 'deleted=eq.false&order=username.asc') || [];
}
async function dbGetAccount(username) {
    const r = await sbReq('GET', 'accounts', null, `username=ilike.${encodeURIComponent(username)}&deleted=eq.false`);
    return r && r[0] ? r[0] : null;
}
async function dbGetDeletedAccounts() {
    return await sbReq('GET', 'accounts', null, 'deleted=eq.true&order=deleted_at.desc') || [];
}
async function dbUpsertAccount(acc) {
    return await sbReq('POST', 'accounts', acc, 'on_conflict=username');
}
async function dbUpdateAccount(username, updates) {
    return await sbReq('PATCH', 'accounts', updates, `username=ilike.${encodeURIComponent(username)}`);
}
async function dbDeleteAccount(username) {
    return await sbReq('PATCH', 'accounts', { deleted: true, deleted_at: Date.now() }, `username=ilike.${encodeURIComponent(username)}`);
}
async function dbPurgeAccount(username) {
    return await sbReq('DELETE', 'accounts', null, `username=ilike.${encodeURIComponent(username)}`);
}

// ── PENDING ACCOUNTS ──────────────────────────────────────────────────────────
async function dbGetPending() {
    return await sbReq('GET', 'pending_accounts', null, 'order=requested_at.asc') || [];
}
async function dbAddPending(req) {
    return await sbReq('POST', 'pending_accounts', req);
}
async function dbRemovePending(id) {
    return await sbReq('DELETE', 'pending_accounts', null, `id=eq.${id}`);
}

// ── MESSAGES ──────────────────────────────────────────────────────────────────
async function dbGetMessages(user1, user2) {
    // DM between two users
    const p = `or=(and(from_user.ilike.${encodeURIComponent(user1)},to_user.ilike.${encodeURIComponent(user2)}),and(from_user.ilike.${encodeURIComponent(user2)},to_user.ilike.${encodeURIComponent(user1)}))&group_id=is.null&order=timestamp.asc`;
    return await sbReq('GET', 'messages', null, p) || [];
}
async function dbGetGroupMessages(groupId) {
    return await sbReq('GET', 'messages', null, `group_id=eq.${groupId}&order=timestamp.asc`) || [];
}
async function dbSendMessage(msg) {
    return await sbReq('POST', 'messages', msg);
}
async function dbUpdateMessage(id, updates) {
    return await sbReq('PATCH', 'messages', updates, `id=eq.${id}`);
}
async function dbDeleteMessage(id) {
    return await sbReq('DELETE', 'messages', null, `id=eq.${id}`);
}
async function dbGetAllMessages() {
    return await sbReq('GET', 'messages', null, 'order=timestamp.asc') || [];
}

// ── GROUPS ────────────────────────────────────────────────────────────────────
async function dbGetGroups() {
    return await sbReq('GET', 'groups', null, 'deleted=eq.false&order=created.asc') || [];
}
async function dbGetGroup(id) {
    const r = await sbReq('GET', 'groups', null, `id=eq.${id}`);
    return r && r[0] ? r[0] : null;
}
async function dbCreateGroup(group) {
    return await sbReq('POST', 'groups', group);
}
async function dbUpdateGroup(id, updates) {
    return await sbReq('PATCH', 'groups', updates, `id=eq.${id}`);
}
async function dbGetAllGroups() {
    return await sbReq('GET', 'groups', null, 'order=created.asc') || [];
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
async function dbGetSetting(key) {
    const r = await sbReq('GET', 'settings', null, `key=eq.${key}`);
    return r && r[0] ? r[0].value : null;
}
async function dbSetSetting(key, value) {
    return await sbReq('POST', 'settings', { key, value }, 'on_conflict=key');
}

// ── VIOLATIONS ────────────────────────────────────────────────────────────────
async function dbLogViolation(username, type, detail) {
    return await sbReq('POST', 'violations', { username, type, detail, timestamp: Date.now() });
}
async function dbGetViolations() {
    return await sbReq('GET', 'violations', null, 'order=timestamp.desc') || [];
}

// ── AUDIT LOG ─────────────────────────────────────────────────────────────────
async function dbAudit(adminUser, action, target, detail) {
    return await sbReq('POST', 'audit_log', { admin_user: adminUser, action, target, detail, timestamp: Date.now() });
}
async function dbGetAudit() {
    return await sbReq('GET', 'audit_log', null, 'order=timestamp.desc') || [];
}

// ── SESSION (still localStorage — just user/token, not data) ─────────────────
function sessionGet() { return localStorage.getItem('loggedInUser'); }
function sessionSet(u) { localStorage.setItem('loggedInUser', u); }
function sessionClear() { localStorage.removeItem('loggedInUser'); sessionStorage.clear(); }
function getTheme() { return JSON.parse(localStorage.getItem('scpTheme') || '{}'); }
function setTheme(t) { localStorage.setItem('scpTheme', JSON.stringify(t)); }
