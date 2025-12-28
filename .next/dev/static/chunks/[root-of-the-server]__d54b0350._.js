(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/// <reference path="../../../shared/runtime-types.d.ts" />
/// <reference path="../../runtime/base/dev-globals.d.ts" />
/// <reference path="../../runtime/base/dev-protocol.d.ts" />
/// <reference path="../../runtime/base/dev-extensions.ts" />
__turbopack_context__.s([
    "connect",
    ()=>connect,
    "setHooks",
    ()=>setHooks,
    "subscribeToUpdate",
    ()=>subscribeToUpdate
]);
function connect({ addMessageListener, sendMessage, onUpdateError = console.error }) {
    addMessageListener((msg)=>{
        switch(msg.type){
            case 'turbopack-connected':
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn('[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.');
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error('A separate HMR handler was already registered');
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: ([chunkPath, callback])=>{
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: 'turbopack-subscribe',
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: 'turbopack-unsubscribe',
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: 'ChunkListUpdate',
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted' || updateA.type === 'deleted' && updateB.type === 'added') {
        return undefined;
    }
    if (updateA.type === 'partial') {
        invariant(updateA.instruction, 'Partial updates are unsupported');
    }
    if (updateB.type === 'partial') {
        invariant(updateB.instruction, 'Partial updates are unsupported');
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: 'EcmascriptMergedUpdate',
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted') {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === 'deleted' && updateB.type === 'added') {
        const added = [];
        const deleted = [];
        const deletedModules = new Set(updateA.modules ?? []);
        const addedModules = new Set(updateB.modules ?? []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: 'partial',
            added,
            deleted
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'partial') {
        const added = new Set([
            ...updateA.added ?? [],
            ...updateB.added ?? []
        ]);
        const deleted = new Set([
            ...updateA.deleted ?? [],
            ...updateB.deleted ?? []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: 'partial',
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === 'added' && updateB.type === 'partial') {
        const modules = new Set([
            ...updateA.modules ?? [],
            ...updateB.added ?? []
        ]);
        for (const moduleId of updateB.deleted ?? []){
            modules.delete(moduleId);
        }
        return {
            type: 'added',
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'deleted') {
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set(updateB.modules ?? []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: 'deleted',
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error(`Invariant: ${message}`);
}
const CRITICAL = [
    'bug',
    'error',
    'fatal'
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    'bug',
    'fatal',
    'error',
    'warning',
    'info',
    'log'
];
const CATEGORY_ORDER = [
    'parse',
    'resolve',
    'code generation',
    'rendering',
    'typescript',
    'other'
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case 'issues':
            break;
        case 'partial':
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === 'notFound') {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}),
"[project]/src/data/characters.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/data/characters.ts
__turbopack_context__.s([
    "characters",
    ()=>characters,
    "charactersById",
    ()=>charactersById
]);
const characters = [
    {
        id: "holmes",
        name: "ホームズ",
        tags: [
            "論理",
            "観察",
            "緊張",
            "冷静沈着",
            "陰鬱",
            "天才的",
            "頭脳明晰"
        ]
    },
    {
        id: "little_prince",
        name: "星の王子さま",
        tags: [
            "純粋",
            "孤独",
            "超越",
            "友情",
            "本当に大切なものは目に見えない"
        ]
    },
    {
        id: "izanami",
        name: "イザナミ",
        tags: [
            "死",
            "神",
            "創生",
            "境界",
            "虚無",
            "冥界",
            "呪い",
            "ネガティブに変化する愛情"
        ]
    },
    {
        id: "yeti",
        name: "イエティ",
        tags: [
            "孤立",
            "未開",
            "未知",
            "異形",
            "自然",
            "雪",
            "人に危害を加えない"
        ]
    },
    {
        id: "square_flatland",
        name: "フラットランドの正方形",
        tags: [
            "次元",
            "歪み",
            "不合理",
            "数学的",
            "現状批判"
        ]
    },
    {
        id: "alice",
        name: "アリス",
        tags: [
            "好奇心",
            "混乱",
            "冒険",
            "異形",
            "異世界",
            "非論理的"
        ]
    },
    {
        id: "ludwig_ii",
        name: "ルートヴィヒ2世",
        tags: [
            "理想",
            "崩壊",
            "空想",
            "デカダン",
            "耽美",
            "芸術愛好家"
        ]
    },
    {
        id: "kingyo_ataishi",
        name: "金魚のあたい",
        tags: [
            "好奇心",
            "不安定",
            "空想",
            "愛らしい",
            "擬人化"
        ]
    },
    {
        id: "snufkin",
        name: "スナフキン",
        tags: [
            "自由",
            "放浪",
            "空白",
            "疎外感",
            "孤独の楽しさ",
            "自然と共存",
            "飄々とした"
        ]
    },
    {
        id: "honda_tadakatsu",
        name: "本田忠勝",
        tags: [
            "忠義",
            "戦",
            "武士道",
            "戦士",
            "最強の武将",
            "晩年の不遇"
        ]
    },
    {
        id: "tinkerbell",
        name: "ティンカーベル",
        tags: [
            "魔法",
            "消失",
            "小生意気",
            "いたずら",
            "頑固で短気",
            "愛らしい"
        ]
    },
    {
        id: "ragnar",
        name: "ラグナル",
        tags: [
            "策略",
            "崩壊",
            "権力",
            "残虐",
            "バイキング",
            "戦士",
            "統治"
        ]
    },
    {
        id: "lupin",
        name: "ルパン三世",
        tags: [
            "狡猾",
            "遊戯",
            "女たらし",
            "頭脳明晰",
            "大胆不敵",
            "女性にモテる"
        ]
    },
    {
        id: "puss_in_boots",
        name: "長靴をはいた猫",
        tags: [
            "策略",
            "成功",
            "下剋上",
            "擬人化",
            "頭脳明晰",
            "忠誠"
        ]
    },
    {
        id: "marie_antoinette",
        name: "マリー・アントワネット",
        tags: [
            "権力",
            "崩壊",
            "美貌",
            "衰退",
            "没落",
            "運命に翻弄される"
        ]
    }
];
const charactersById = Object.fromEntries(characters.map((c)=>[
        c.id,
        c
    ]));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/themes/beauty_and_cruelty.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "beauty_and_cruelty",
    ()=>beauty_and_cruelty
]);
const beauty_and_cruelty = {
    id: "beauty_and_cruelty",
    label: "美と残酷",
    categoryID: "",
    keywords: []
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/themes/between_life_and_death.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "between_life_and_death",
    ()=>between_life_and_death
]);
const between_life_and_death = {
    id: "between_life_and_death",
    label: "生と死のあわい",
    categoryID: "",
    keywords: []
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/themes/collapse_of_reality.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "collapse_of_reality",
    ()=>collapse_of_reality
]);
const collapse_of_reality = {
    id: "collapse_of_reality",
    label: "崩れる現実",
    categoryID: "",
    keywords: []
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/themes/collective_madness.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "collective_madness",
    ()=>collective_madness
]);
const collective_madness = {
    id: "collective_madness",
    label: "集団狂気",
    categoryID: "",
    keywords: []
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/themes/distorted_justice.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "distorted_justice",
    ()=>distorted_justice
]);
const distorted_justice = {
    id: "distorted_justice",
    label: "正義の歪み",
    categoryID: "",
    keywords: []
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/themes/erosion_of_love.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "erosion_of_love",
    ()=>erosion_of_love
]);
const erosion_of_love = {
    id: "erosion_of_love",
    label: "侵食する愛",
    categoryID: "",
    keywords: []
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/themes/forbidden_knowledge.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "forbidden_knowledge",
    ()=>forbidden_knowledge
]);
const forbidden_knowledge = {
    id: "forbidden_knowledge",
    label: "知識の禁忌",
    categoryID: "",
    keywords: []
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/themes/genesis_and_apocalypse.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "genesis_and_apocalypse",
    ()=>genesis_and_apocalypse
]);
const genesis_and_apocalypse = {
    id: "genesis_and_apocalypse",
    label: "創世と終焉",
    categoryID: "",
    keywords: []
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/themes/inevitable_end.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "inevitable_end",
    ()=>inevitable_end
]);
const inevitable_end = {
    id: "inevitable_end",
    label: "避けられぬ終焉",
    categoryID: "",
    keywords: []
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/themes/logic_of_the_night.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "logic_of_the_night",
    ()=>logic_of_the_night
]);
const logic_of_the_night = {
    id: "logic_of_the_night",
    label: "夜の論理",
    categoryID: "",
    keywords: []
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/themes/loneliness_and_collapse.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loneliness_and_collapse",
    ()=>loneliness_and_collapse
]);
const loneliness_and_collapse = {
    id: "loneliness_and_collapse",
    label: "孤独と崩壊",
    categoryID: "",
    keywords: []
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/themes/salvation_without_god.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "salvation_without_god",
    ()=>salvation_without_god
]);
const salvation_without_god = {
    id: "salvation_without_god",
    label: "神なき救済",
    categoryID: "",
    keywords: []
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/themes/self_denial_and_fragmentation.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "self_denial_and_fragmentation",
    ()=>self_denial_and_fragmentation
]);
const self_denial_and_fragmentation = {
    id: "self_denial_and_fragmentation",
    label: "自己否定と分裂",
    categoryID: "",
    keywords: []
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/themes/sin_and_retribution.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sin_and_retribution",
    ()=>sin_and_retribution
]);
const sin_and_retribution = {
    id: "sin_and_retribution",
    label: "罪と報い",
    categoryID: "",
    keywords: []
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/themes/violence_of_memory_and_time.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "violence_of_memory_and_time",
    ()=>violence_of_memory_and_time
]);
const violence_of_memory_and_time = {
    id: "violence_of_memory_and_time",
    label: "記憶と時間の暴力",
    categoryID: "",
    keywords: []
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/themes/themeList.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/themes/themeList.ts
__turbopack_context__.s([
    "themes",
    ()=>themes
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$index$2e$ts__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/themes/index.ts [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$beauty_and_cruelty$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/beauty_and_cruelty.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$between_life_and_death$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/between_life_and_death.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$collapse_of_reality$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/collapse_of_reality.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$collective_madness$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/collective_madness.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$distorted_justice$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/distorted_justice.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$erosion_of_love$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/erosion_of_love.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$forbidden_knowledge$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/forbidden_knowledge.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$genesis_and_apocalypse$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/genesis_and_apocalypse.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$inevitable_end$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/inevitable_end.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$logic_of_the_night$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/logic_of_the_night.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$loneliness_and_collapse$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/loneliness_and_collapse.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$salvation_without_god$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/salvation_without_god.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$self_denial_and_fragmentation$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/self_denial_and_fragmentation.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$sin_and_retribution$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/sin_and_retribution.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$violence_of_memory_and_time$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/violence_of_memory_and_time.ts [client] (ecmascript)");
;
const themes = [
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$beauty_and_cruelty$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["beauty_and_cruelty"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$between_life_and_death$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["between_life_and_death"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$collapse_of_reality$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["collapse_of_reality"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$collective_madness$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["collective_madness"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$distorted_justice$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["distorted_justice"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$erosion_of_love$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["erosion_of_love"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$forbidden_knowledge$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["forbidden_knowledge"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$genesis_and_apocalypse$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["genesis_and_apocalypse"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$inevitable_end$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["inevitable_end"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$logic_of_the_night$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["logic_of_the_night"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$loneliness_and_collapse$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["loneliness_and_collapse"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$salvation_without_god$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["salvation_without_god"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$self_denial_and_fragmentation$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["self_denial_and_fragmentation"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$sin_and_retribution$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["sin_and_retribution"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$violence_of_memory_and_time$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["violence_of_memory_and_time"]
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/themes/index.ts [client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

// src/themes/index.ts
__turbopack_context__.s([
    "themesById",
    ()=>themesById
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$themeList$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/themeList.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$sin_and_retribution$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/sin_and_retribution.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$distorted_justice$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/distorted_justice.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$erosion_of_love$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/erosion_of_love.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$loneliness_and_collapse$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/loneliness_and_collapse.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$self_denial_and_fragmentation$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/self_denial_and_fragmentation.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$violence_of_memory_and_time$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/violence_of_memory_and_time.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$collapse_of_reality$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/collapse_of_reality.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$forbidden_knowledge$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/forbidden_knowledge.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$salvation_without_god$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/salvation_without_god.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$genesis_and_apocalypse$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/genesis_and_apocalypse.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$between_life_and_death$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/between_life_and_death.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$logic_of_the_night$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/logic_of_the_night.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$beauty_and_cruelty$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/beauty_and_cruelty.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$collective_madness$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/collective_madness.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$inevitable_end$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/inevitable_end.ts [client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const themesById = Object.fromEntries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$themeList$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["themes"].map((t)=>[
        t.id,
        t
    ]));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/voices/neutral.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "neutral",
    ()=>neutral
]);
const neutral = {
    id: "neutral",
    label: "ニュートラル",
    keywords: [
        "客観的",
        "淡々",
        "標準的",
        "バランス",
        "説明的",
        "読みやすい"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/voices/poetic.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "poetic",
    ()=>poetic
]);
const poetic = {
    id: "poetic",
    label: "詩的",
    keywords: [
        "lyrical",
        "metaphorical",
        "evocative",
        "rhythmic",
        "symbolic"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/voices/melancholic.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "melancholic",
    ()=>melancholic
]);
const melancholic = {
    id: "melancholic",
    label: "メランコリック",
    keywords: [
        "sorrow",
        "reflective",
        "nostalgic",
        "regret",
        "gentle sadness"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/voices/cold.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cold",
    ()=>cold
]);
const cold = {
    id: "cold",
    label: "冷酷",
    keywords: [
        "detached",
        "rational",
        "analytical",
        "unemotional",
        "harsh truth"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/voices/scholarly.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "scholarly",
    ()=>scholarly
]);
const scholarly = {
    id: "scholarly",
    label: "学者風",
    keywords: [
        "intellectual",
        "precise",
        "informed",
        "didactic",
        "systematic"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/voices/mystic.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mystic",
    ()=>mystic
]);
const mystic = {
    id: "mystic",
    label: "神秘的",
    keywords: [
        "spiritual",
        "enigmatic",
        "dreamlike",
        "symbolic",
        "esoteric"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/voices/heroic.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "heroic",
    ()=>heroic
]);
const heroic = {
    id: "heroic",
    label: "威風堂々",
    keywords: [
        "brave",
        "inspiring",
        "epic",
        "resolute",
        "determined"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/voices/childlike.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "childlike",
    ()=>childlike
]);
const childlike = {
    id: "childlike",
    label: "子どもっぽい",
    keywords: [
        "innocent",
        "curious",
        "simple",
        "wonder",
        "naive"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/voices/playful.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "playful",
    ()=>playful
]);
const playful = {
    id: "playful",
    label: "陽気",
    keywords: [
        "humor",
        "light",
        "cheerful",
        "casual",
        "spontaneous"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/voices/osaka_obahan.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "osaka_obahan",
    ()=>osaka_obahan
]);
const osaka_obahan = {
    id: "osaka_obahan",
    label: "大阪のオバハン風",
    keywords: [
        "kansai dialect",
        "direct",
        "emotional",
        "humorous",
        "streetwise"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/voices/voiceList.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/voices/voiceList.ts
__turbopack_context__.s([
    "voices",
    ()=>voices,
    "voicesById",
    ()=>voicesById
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$index$2e$ts__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/voices/index.ts [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$neutral$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/neutral.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$poetic$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/poetic.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$melancholic$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/melancholic.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$cold$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/cold.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$scholarly$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/scholarly.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$mystic$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/mystic.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$heroic$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/heroic.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$childlike$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/childlike.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$playful$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/playful.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$osaka_obahan$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/osaka_obahan.ts [client] (ecmascript)");
;
const voices = [
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$neutral$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["neutral"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$poetic$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["poetic"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$melancholic$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["melancholic"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$cold$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["cold"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$scholarly$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["scholarly"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$mystic$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["mystic"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$heroic$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["heroic"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$childlike$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["childlike"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$playful$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["playful"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$osaka_obahan$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["osaka_obahan"]
];
const voicesById = Object.fromEntries(voices.map((v)=>[
        v.id,
        v
    ]));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/voices/index.ts [client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

// src/voices/index.ts
__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$neutral$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/neutral.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$poetic$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/poetic.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$melancholic$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/melancholic.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$cold$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/cold.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$scholarly$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/scholarly.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$mystic$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/mystic.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$heroic$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/heroic.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$childlike$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/childlike.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$playful$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/playful.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$osaka_obahan$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/osaka_obahan.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$voiceList$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/voiceList.ts [client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/affinities/icons/strong.png (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.v("/_next/static/media/strong.cfdbe0b4.png");}),
"[project]/src/affinities/icons/strong.png.mjs { IMAGE => \"[project]/src/affinities/icons/strong.png (static in ecmascript, tag client)\" } [client] (structured image object with data url, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$affinities$2f$icons$2f$strong$2e$png__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/src/affinities/icons/strong.png (static in ecmascript, tag client)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$affinities$2f$icons$2f$strong$2e$png__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    width: 256,
    height: 256,
    blurWidth: 8,
    blurHeight: 8,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAcElEQVR42mXNMQ5FUBRF0av71S/UpqJUmYpOdFoJQyBEp1CIQqNiDEZkXzmNuMlKXvYpntn7YvncDyFSCdWei5BjwiGTmm82o8OCS/zdarMdDTacsqn59vxZo0QmpZpv9keBAav0ar5ZgAQjKhnVghtlWhoJ5xePTAAAAABJRU5ErkJggg=="
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/affinities/icons/neutral.png (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.v("/_next/static/media/neutral.7731acee.png");}),
"[project]/src/affinities/icons/neutral.png.mjs { IMAGE => \"[project]/src/affinities/icons/neutral.png (static in ecmascript, tag client)\" } [client] (structured image object with data url, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$affinities$2f$icons$2f$neutral$2e$png__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/src/affinities/icons/neutral.png (static in ecmascript, tag client)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$affinities$2f$icons$2f$neutral$2e$png__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    width: 256,
    height: 256,
    blurWidth: 8,
    blurHeight: 8,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAaklEQVR42m3PsQmAMBQE0J8N0lplE0sXcA+xDjhAZnAY0Y1iYwgEvcAZf+HBa+4+hIh8MTCRkZ9YOMjqYYARPJzk2dVNNrigwE2FXd3EwQpZHWR27n2mh6gOIruWGRLslNi17y0QoKPAzjwDvh5F0IsFPgAAAABJRU5ErkJggg=="
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/affinities/icons/mismatch.png (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.v("/_next/static/media/mismatch.aff40319.png");}),
"[project]/src/affinities/icons/mismatch.png.mjs { IMAGE => \"[project]/src/affinities/icons/mismatch.png (static in ecmascript, tag client)\" } [client] (structured image object with data url, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$affinities$2f$icons$2f$mismatch$2e$png__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/src/affinities/icons/mismatch.png (static in ecmascript, tag client)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$affinities$2f$icons$2f$mismatch$2e$png__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    width: 256,
    height: 256,
    blurWidth: 8,
    blurHeight: 8,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAg0lEQVR42nXOPQqDQBCG4SWEkCJ9QhJImcZGtPAAXsADeAFre6+hB7CzsBXExlYrK72BVxD8eRd2wUIHnma+YWaEOK8LbkeBDQN/fPfBCx4qFAjw0OEdPkpMmFHD0bdcZBixKgt6OWAiRauaUo4YkRwIkaDDgAaW2iyJN574KR9c9XMbY30WdpkPkWIAAAAASUVORK5CYII="
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/affinity/AffinityMatrix.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/components/affinity/AffinityMatrix.tsx
__turbopack_context__.s([
    "default",
    ()=>AffinityMatrix
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$affinities$2f$icons$2f$strong$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$affinities$2f$icons$2f$strong$2e$png__$28$static__in__ecmascript$2c$__tag__client$2922$__$7d$__$5b$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/affinities/icons/strong.png.mjs { IMAGE => "[project]/src/affinities/icons/strong.png (static in ecmascript, tag client)" } [client] (structured image object with data url, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$affinities$2f$icons$2f$neutral$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$affinities$2f$icons$2f$neutral$2e$png__$28$static__in__ecmascript$2c$__tag__client$2922$__$7d$__$5b$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/affinities/icons/neutral.png.mjs { IMAGE => "[project]/src/affinities/icons/neutral.png (static in ecmascript, tag client)" } [client] (structured image object with data url, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$affinities$2f$icons$2f$mismatch$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$affinities$2f$icons$2f$mismatch$2e$png__$28$static__in__ecmascript$2c$__tag__client$2922$__$7d$__$5b$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/affinities/icons/mismatch.png.mjs { IMAGE => "[project]/src/affinities/icons/mismatch.png (static in ecmascript, tag client)" } [client] (structured image object with data url, ecmascript)');
;
;
;
;
;
const ICON_MAP = {
    '◎': __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$affinities$2f$icons$2f$strong$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$affinities$2f$icons$2f$strong$2e$png__$28$static__in__ecmascript$2c$__tag__client$2922$__$7d$__$5b$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__["default"].src,
    '◯': __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$affinities$2f$icons$2f$neutral$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$affinities$2f$icons$2f$neutral$2e$png__$28$static__in__ecmascript$2c$__tag__client$2922$__$7d$__$5b$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__["default"].src,
    '△': __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$affinities$2f$icons$2f$mismatch$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$affinities$2f$icons$2f$mismatch$2e$png__$28$static__in__ecmascript$2c$__tag__client$2922$__$7d$__$5b$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__["default"].src
};
const VOICE_FIRST = 'neutral';
const VOICE_LAST = 'osaka_obahan';
const sortVoices = (voices)=>{
    const core = voices.filter((v)=>v !== VOICE_FIRST && v !== VOICE_LAST);
    return [
        ...voices.includes(VOICE_FIRST) ? [
            VOICE_FIRST
        ] : [],
        ...core,
        ...voices.includes(VOICE_LAST) ? [
            VOICE_LAST
        ] : []
    ];
};
function AffinityMatrix({ map, selectedSituation, selectedVoice, situationLabelMap, voiceLabelMap }) {
    const situations = Object.keys(map);
    if (situations.length === 0) return null;
    const voices = sortVoices(Object.keys(map[situations[0]] ?? {}));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontSize: 13,
                    marginBottom: 12,
                    textAlign: 'center',
                    fontWeight: 'bold'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$affinities$2f$icons$2f$strong$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$affinities$2f$icons$2f$strong$2e$png__$28$static__in__ecmascript$2c$__tag__client$2922$__$7d$__$5b$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__["default"].src,
                        alt: "strong",
                        style: {
                            width: 14,
                            verticalAlign: 'middle'
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/affinity/AffinityMatrix.tsx",
                        lineNumber: 55,
                        columnNumber: 7
                    }, this),
                    " = 好相性で王道",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$affinities$2f$icons$2f$neutral$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$affinities$2f$icons$2f$neutral$2e$png__$28$static__in__ecmascript$2c$__tag__client$2922$__$7d$__$5b$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__["default"].src,
                        alt: "neutral",
                        style: {
                            width: 14,
                            verticalAlign: 'middle'
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/affinity/AffinityMatrix.tsx",
                        lineNumber: 56,
                        columnNumber: 7
                    }, this),
                    " = 自然な物語が成立",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$affinities$2f$icons$2f$mismatch$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$affinities$2f$icons$2f$mismatch$2e$png__$28$static__in__ecmascript$2c$__tag__client$2922$__$7d$__$5b$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__["default"].src,
                        alt: "mismatch",
                        style: {
                            width: 14,
                            verticalAlign: 'middle'
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/affinity/AffinityMatrix.tsx",
                        lineNumber: 57,
                        columnNumber: 7
                    }, this),
                    " = ズレを楽しむ"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/affinity/AffinityMatrix.tsx",
                lineNumber: 54,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'grid',
                    gridTemplateColumns: `120px repeat(${voices.length}, 1fr)`,
                    gap: 2
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {}, void 0, false, {
                        fileName: "[project]/src/components/affinity/AffinityMatrix.tsx",
                        lineNumber: 67,
                        columnNumber: 7
                    }, this),
                    voices.map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: 11,
                                textAlign: 'center',
                                opacity: 0.7
                            },
                            children: voiceLabelMap[v] ?? v
                        }, `h-${v}`, false, {
                            fileName: "[project]/src/components/affinity/AffinityMatrix.tsx",
                            lineNumber: 69,
                            columnNumber: 9
                        }, this)),
                    situations.map((situation)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 11,
                                        opacity: 0.7,
                                        whiteSpace: 'nowrap'
                                    },
                                    children: situationLabelMap[situation] ?? situation
                                }, void 0, false, {
                                    fileName: "[project]/src/components/affinity/AffinityMatrix.tsx",
                                    lineNumber: 79,
                                    columnNumber: 11
                                }, this),
                                voices.map((voice)=>{
                                    const cell = map[situation]?.[voice];
                                    if (!cell) {
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                height: 28
                                            }
                                        }, `${situation}-${voice}`, false, {
                                            fileName: "[project]/src/components/affinity/AffinityMatrix.tsx",
                                            lineNumber: 93,
                                            columnNumber: 17
                                        }, this);
                                    }
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        title: cell.comment,
                                        style: {
                                            border: '1px solid #333',
                                            height: 28,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 4,
                                            background: situation === selectedSituation || voice === selectedVoice ? 'rgba(0,0,0,0.05)' : 'transparent'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: ICON_MAP[cell.level],
                                            alt: cell.level,
                                            style: {
                                                width: 14,
                                                height: 14
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/affinity/AffinityMatrix.tsx",
                                            lineNumber: 118,
                                            columnNumber: 17
                                        }, this)
                                    }, `${situation}-${voice}`, false, {
                                        fileName: "[project]/src/components/affinity/AffinityMatrix.tsx",
                                        lineNumber: 101,
                                        columnNumber: 15
                                    }, this);
                                })
                            ]
                        }, situation, true, {
                            fileName: "[project]/src/components/affinity/AffinityMatrix.tsx",
                            lineNumber: 78,
                            columnNumber: 9
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/affinity/AffinityMatrix.tsx",
                lineNumber: 60,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/affinity/AffinityMatrix.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
_c = AffinityMatrix;
var _c;
__turbopack_context__.k.register(_c, "AffinityMatrix");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/data/reactionRules.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/data/reactionRules.ts
__turbopack_context__.s([
    "reactionRules",
    ()=>reactionRules
]);
const M = (n)=>n;
_c = M;
const P = (r = 0, t = 0, d = 0, c = 0, v = 0, x = 0)=>({
        resonance: M(r),
        tension: M(t),
        distortion: M(d),
        collapse: M(c),
        void: M(v),
        transcendence: M(x)
    });
_c1 = P;
const reactionRules = {
    holmes: {
        beauty_and_cruelty: P(0, 0, 4, 0, 0, 0),
        between_life_and_death: P(0, 4, 0, 0, 0, 0),
        collapse_of_reality: P(0, 0, 5, 0, 0, 0),
        collective_madness: P(0, 3, 0, 0, 0, 0),
        distorted_justice: P(0, 0, 4, 0, 0, 0),
        erosion_of_love: P(0, 0, 0, 0, 3, 0),
        forbidden_knowledge: P(0, 0, 5, 0, 0, 0),
        genesis_and_apocalypse: P(0, 3, 0, 0, 0, 0),
        inevitable_end: P(0, 0, 0, 0, 4, 0),
        logic_of_the_night: P(4, 0, 0, 0, 0, 0),
        loneliness_and_collapse: P(0, 0, 0, 0, 4, 0),
        salvation_without_god: P(0, 0, 3, 0, 0, 0),
        self_denial_and_fragmentation: P(0, 0, 4, 0, 0, 0),
        sin_and_retribution: P(0, 4, 0, 0, 0, 0),
        violence_of_memory_and_time: P(0, 0, 4, 0, 0, 0)
    },
    little_prince: {
        beauty_and_cruelty: P(3, 0, 0, 0, 0, 0),
        between_life_and_death: P(0, 0, 0, 0, 0, 4),
        collapse_of_reality: P(0, 0, 0, 0, 3, 0),
        collective_madness: P(0, 0, 0, 0, 3, 0),
        distorted_justice: P(0, 2, 0, 0, 0, 0),
        erosion_of_love: P(4, 0, 0, 0, 0, 0),
        forbidden_knowledge: P(0, 0, 0, 0, 3, 0),
        genesis_and_apocalypse: P(0, 0, 0, 0, 0, 5),
        inevitable_end: P(0, 0, 0, 0, 0, 4),
        logic_of_the_night: P(4, 0, 0, 0, 0, 0),
        loneliness_and_collapse: P(0, 0, 0, 0, 4, 0),
        salvation_without_god: P(0, 0, 0, 0, 0, 4),
        self_denial_and_fragmentation: P(0, 0, 0, 0, 3, 0),
        sin_and_retribution: P(0, 2, 0, 0, 0, 0),
        violence_of_memory_and_time: P(0, 0, 0, 0, 3, 0)
    },
    izanami: {
        beauty_and_cruelty: P(0, 0, 4, 0, 0, 0),
        between_life_and_death: P(0, 0, 0, 5, 0, 0),
        collapse_of_reality: P(0, 0, 0, 5, 0, 0),
        collective_madness: P(0, 0, 4, 0, 0, 0),
        distorted_justice: P(0, 0, 0, 4, 0, 0),
        erosion_of_love: P(0, 0, 0, 5, 0, 0),
        forbidden_knowledge: P(0, 0, 4, 0, 0, 0),
        genesis_and_apocalypse: P(0, 0, 0, 5, 0, 0),
        inevitable_end: P(0, 0, 0, 0, 4, 0),
        logic_of_the_night: P(0, 0, 3, 0, 0, 0),
        loneliness_and_collapse: P(0, 0, 0, 0, 4, 0),
        salvation_without_god: P(0, 0, 0, 4, 0, 0),
        self_denial_and_fragmentation: P(0, 0, 4, 0, 0, 0),
        sin_and_retribution: P(0, 0, 0, 4, 0, 0),
        violence_of_memory_and_time: P(0, 0, 0, 5, 0, 0)
    },
    yeti: {
        beauty_and_cruelty: P(0, 0, 0, 0, 3, 0),
        between_life_and_death: P(0, 0, 0, 0, 4, 0),
        collapse_of_reality: P(0, 0, 0, 0, 3, 0),
        collective_madness: P(0, 0, 0, 0, 4, 0),
        distorted_justice: P(0, 0, 0, 0, 3, 0),
        erosion_of_love: P(0, 0, 0, 0, 3, 0),
        forbidden_knowledge: P(0, 0, 0, 0, 3, 0),
        genesis_and_apocalypse: P(0, 0, 0, 0, 2, 0),
        inevitable_end: P(0, 0, 0, 0, 4, 0),
        logic_of_the_night: P(3, 0, 0, 0, 0, 0),
        loneliness_and_collapse: P(0, 0, 0, 0, 5, 0),
        salvation_without_god: P(0, 0, 0, 0, 3, 0),
        self_denial_and_fragmentation: P(0, 0, 0, 0, 4, 0),
        sin_and_retribution: P(0, 0, 0, 0, 3, 0),
        violence_of_memory_and_time: P(0, 0, 0, 0, 4, 0)
    },
    square_flatland: {
        beauty_and_cruelty: P(0, 0, 4, 0, 0, 0),
        between_life_and_death: P(0, 0, 3, 0, 0, 0),
        collapse_of_reality: P(0, 0, 5, 0, 0, 0),
        collective_madness: P(0, 0, 4, 0, 0, 0),
        distorted_justice: P(0, 0, 4, 0, 0, 0),
        erosion_of_love: P(0, 0, 0, 0, 3, 0),
        forbidden_knowledge: P(0, 0, 5, 0, 0, 0),
        genesis_and_apocalypse: P(0, 0, 3, 0, 0, 0),
        inevitable_end: P(0, 0, 0, 0, 3, 0),
        logic_of_the_night: P(4, 0, 0, 0, 0, 0),
        loneliness_and_collapse: P(0, 0, 0, 0, 3, 0),
        salvation_without_god: P(0, 0, 4, 0, 0, 0),
        self_denial_and_fragmentation: P(0, 0, 5, 0, 0, 0),
        sin_and_retribution: P(0, 0, 4, 0, 0, 0),
        violence_of_memory_and_time: P(0, 0, 4, 0, 0, 0)
    },
    snufkin: {
        beauty_and_cruelty: P(3, 0, 0, 0, 0, 0),
        between_life_and_death: P(0, 0, 0, 0, 4, 0),
        collapse_of_reality: P(0, 0, 0, 0, 3, 0),
        collective_madness: P(0, 0, 0, 0, 4, 0),
        distorted_justice: P(0, 0, 0, 0, 3, 0),
        erosion_of_love: P(0, 0, 0, 0, 3, 0),
        forbidden_knowledge: P(0, 0, 0, 0, 3, 0),
        genesis_and_apocalypse: P(0, 0, 0, 0, 2, 0),
        inevitable_end: P(0, 0, 0, 0, 4, 0),
        logic_of_the_night: P(4, 0, 0, 0, 0, 0),
        loneliness_and_collapse: P(0, 0, 0, 0, 5, 0),
        salvation_without_god: P(0, 0, 0, 0, 3, 0),
        self_denial_and_fragmentation: P(0, 0, 0, 0, 4, 0),
        sin_and_retribution: P(0, 0, 0, 0, 3, 0),
        violence_of_memory_and_time: P(0, 0, 0, 0, 4, 0)
    },
    honda_tadakatsu: {
        beauty_and_cruelty: P(0, 3, 0, 0, 0, 0),
        between_life_and_death: P(0, 4, 0, 0, 0, 0),
        collapse_of_reality: P(0, 0, 0, 3, 0, 0),
        collective_madness: P(0, 3, 0, 0, 0, 0),
        distorted_justice: P(0, 4, 0, 0, 0, 0),
        erosion_of_love: P(0, 0, 0, 0, 2, 0),
        forbidden_knowledge: P(0, 3, 0, 0, 0, 0),
        genesis_and_apocalypse: P(0, 4, 0, 0, 0, 0),
        inevitable_end: P(0, 0, 0, 0, 3, 0),
        logic_of_the_night: P(3, 0, 0, 0, 0, 0),
        loneliness_and_collapse: P(0, 0, 0, 0, 3, 0),
        salvation_without_god: P(0, 3, 0, 0, 0, 0),
        self_denial_and_fragmentation: P(0, 0, 0, 3, 0, 0),
        sin_and_retribution: P(0, 5, 0, 0, 0, 0),
        violence_of_memory_and_time: P(0, 4, 0, 0, 0, 0)
    },
    tinkerbell: {
        beauty_and_cruelty: P(0, 0, 3, 0, 0, 0),
        between_life_and_death: P(0, 0, 3, 0, 0, 0),
        collapse_of_reality: P(0, 0, 4, 0, 0, 0),
        collective_madness: P(0, 0, 3, 0, 0, 0),
        distorted_justice: P(0, 0, 3, 0, 0, 0),
        erosion_of_love: P(0, 0, 4, 0, 0, 0),
        forbidden_knowledge: P(0, 0, 3, 0, 0, 0),
        genesis_and_apocalypse: P(0, 0, 3, 0, 0, 0),
        inevitable_end: P(0, 0, 0, 0, 2, 0),
        logic_of_the_night: P(0, 0, 3, 0, 0, 0),
        loneliness_and_collapse: P(0, 0, 0, 0, 3, 0),
        salvation_without_god: P(0, 0, 3, 0, 0, 0),
        self_denial_and_fragmentation: P(0, 0, 4, 0, 0, 0),
        sin_and_retribution: P(0, 0, 3, 0, 0, 0),
        violence_of_memory_and_time: P(0, 0, 3, 0, 0, 0)
    },
    ragnar: {
        beauty_and_cruelty: P(0, 0, 0, 4, 0, 0),
        between_life_and_death: P(0, 0, 0, 4, 0, 0),
        collapse_of_reality: P(0, 0, 0, 5, 0, 0),
        collective_madness: P(0, 0, 0, 4, 0, 0),
        distorted_justice: P(0, 0, 0, 5, 0, 0),
        erosion_of_love: P(0, 0, 0, 4, 0, 0),
        forbidden_knowledge: P(0, 0, 3, 0, 0, 0),
        genesis_and_apocalypse: P(0, 0, 0, 5, 0, 0),
        inevitable_end: P(0, 0, 0, 0, 3, 0),
        logic_of_the_night: P(0, 3, 0, 0, 0, 0),
        loneliness_and_collapse: P(0, 0, 0, 0, 3, 0),
        salvation_without_god: P(0, 0, 0, 4, 0, 0),
        self_denial_and_fragmentation: P(0, 0, 0, 4, 0, 0),
        sin_and_retribution: P(0, 0, 0, 5, 0, 0),
        violence_of_memory_and_time: P(0, 0, 0, 5, 0, 0)
    },
    lupin: {
        beauty_and_cruelty: P(4, 0, 0, 0, 0, 0),
        between_life_and_death: P(0, 3, 0, 0, 0, 0),
        collapse_of_reality: P(0, 0, 4, 0, 0, 0),
        collective_madness: P(0, 0, 3, 0, 0, 0),
        distorted_justice: P(0, 0, 4, 0, 0, 0),
        erosion_of_love: P(3, 0, 0, 0, 0, 0),
        forbidden_knowledge: P(0, 0, 4, 0, 0, 0),
        genesis_and_apocalypse: P(0, 3, 0, 0, 0, 0),
        inevitable_end: P(0, 0, 0, 0, 3, 0),
        logic_of_the_night: P(4, 0, 0, 0, 0, 0),
        loneliness_and_collapse: P(0, 0, 0, 0, 3, 0),
        salvation_without_god: P(0, 0, 3, 0, 0, 0),
        self_denial_and_fragmentation: P(0, 0, 3, 0, 0, 0),
        sin_and_retribution: P(0, 3, 0, 0, 0, 0),
        violence_of_memory_and_time: P(0, 0, 4, 0, 0, 0)
    },
    puss_in_boots: {
        beauty_and_cruelty: P(4, 0, 0, 0, 0, 0),
        between_life_and_death: P(0, 3, 0, 0, 0, 0),
        collapse_of_reality: P(0, 0, 3, 0, 0, 0),
        collective_madness: P(0, 0, 3, 0, 0, 0),
        distorted_justice: P(0, 0, 4, 0, 0, 0),
        erosion_of_love: P(3, 0, 0, 0, 0, 0),
        forbidden_knowledge: P(0, 0, 3, 0, 0, 0),
        genesis_and_apocalypse: P(0, 3, 0, 0, 0, 0),
        inevitable_end: P(0, 0, 0, 0, 2, 0),
        logic_of_the_night: P(4, 0, 0, 0, 0, 0),
        loneliness_and_collapse: P(0, 0, 0, 0, 2, 0),
        salvation_without_god: P(0, 0, 3, 0, 0, 0),
        self_denial_and_fragmentation: P(0, 0, 3, 0, 0, 0),
        sin_and_retribution: P(0, 3, 0, 0, 0, 0),
        violence_of_memory_and_time: P(0, 0, 3, 0, 0, 0)
    },
    marie_antoinette: {
        beauty_and_cruelty: P(0, 0, 0, 4, 0, 0),
        between_life_and_death: P(0, 0, 0, 4, 0, 0),
        collapse_of_reality: P(0, 0, 0, 5, 0, 0),
        collective_madness: P(0, 0, 4, 0, 0, 0),
        distorted_justice: P(0, 0, 0, 5, 0, 0),
        erosion_of_love: P(0, 0, 0, 0, 3, 0),
        forbidden_knowledge: P(0, 0, 3, 0, 0, 0),
        genesis_and_apocalypse: P(0, 0, 0, 4, 0, 0),
        inevitable_end: P(0, 0, 0, 0, 4, 0),
        logic_of_the_night: P(0, 0, 3, 0, 0, 0),
        loneliness_and_collapse: P(0, 0, 0, 0, 4, 0),
        salvation_without_god: P(0, 0, 0, 4, 0, 0),
        self_denial_and_fragmentation: P(0, 0, 0, 4, 0, 0),
        sin_and_retribution: P(0, 0, 0, 5, 0, 0),
        violence_of_memory_and_time: P(0, 0, 0, 5, 0, 0)
    },
    alice: {
        beauty_and_cruelty: P(0, 0, 3, 0, 0, 0),
        between_life_and_death: P(0, 0, 3, 0, 0, 0),
        collapse_of_reality: P(0, 0, 5, 0, 0, 0),
        collective_madness: P(0, 0, 4, 0, 0, 0),
        distorted_justice: P(0, 0, 3, 0, 0, 0),
        erosion_of_love: P(0, 0, 0, 0, 2, 0),
        forbidden_knowledge: P(0, 0, 4, 0, 0, 0),
        genesis_and_apocalypse: P(0, 0, 3, 0, 0, 0),
        inevitable_end: P(0, 0, 0, 0, 2, 0),
        logic_of_the_night: P(0, 0, 4, 0, 0, 0),
        loneliness_and_collapse: P(0, 0, 0, 0, 2, 0),
        salvation_without_god: P(0, 0, 3, 0, 0, 0),
        self_denial_and_fragmentation: P(0, 0, 4, 0, 0, 0),
        sin_and_retribution: P(0, 0, 3, 0, 0, 0),
        violence_of_memory_and_time: P(0, 0, 4, 0, 0, 0)
    },
    kingyo_ataishi: {
        beauty_and_cruelty: P(3, 0, 0, 0, 0, 0),
        between_life_and_death: P(0, 0, 3, 0, 0, 0),
        collapse_of_reality: P(0, 0, 4, 0, 0, 0),
        collective_madness: P(0, 0, 3, 0, 0, 0),
        distorted_justice: P(0, 0, 3, 0, 0, 0),
        erosion_of_love: P(3, 0, 0, 0, 0, 0),
        forbidden_knowledge: P(0, 0, 3, 0, 0, 0),
        genesis_and_apocalypse: P(0, 0, 3, 0, 0, 0),
        inevitable_end: P(0, 0, 0, 0, 3, 0),
        logic_of_the_night: P(3, 0, 0, 0, 0, 0),
        loneliness_and_collapse: P(0, 0, 0, 0, 3, 0),
        salvation_without_god: P(0, 0, 3, 0, 0, 0),
        self_denial_and_fragmentation: P(0, 0, 4, 0, 0, 0),
        sin_and_retribution: P(0, 0, 3, 0, 0, 0),
        violence_of_memory_and_time: P(0, 0, 3, 0, 0, 0)
    },
    ludwig_ii: {
        beauty_and_cruelty: P(0, 0, 0, 4, 0, 0),
        between_life_and_death: P(0, 0, 0, 4, 0, 0),
        collapse_of_reality: P(0, 0, 0, 5, 0, 0),
        collective_madness: P(0, 0, 4, 0, 0, 0),
        distorted_justice: P(0, 0, 0, 4, 0, 0),
        erosion_of_love: P(0, 0, 0, 0, 3, 0),
        forbidden_knowledge: P(0, 0, 4, 0, 0, 0),
        genesis_and_apocalypse: P(0, 0, 0, 4, 0, 0),
        inevitable_end: P(0, 0, 0, 0, 4, 0),
        logic_of_the_night: P(0, 0, 3, 0, 0, 0),
        loneliness_and_collapse: P(0, 0, 0, 0, 4, 0),
        salvation_without_god: P(0, 0, 0, 4, 0, 0),
        self_denial_and_fragmentation: P(0, 0, 0, 5, 0, 0),
        sin_and_retribution: P(0, 0, 0, 4, 0, 0),
        violence_of_memory_and_time: P(0, 0, 0, 5, 0, 0)
    }
};
var _c, _c1;
__turbopack_context__.k.register(_c, "M");
__turbopack_context__.k.register(_c1, "P");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/data/characterProfileBias.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/data/characterProfileBias.ts
__turbopack_context__.s([
    "characterProfileBias",
    ()=>characterProfileBias
]);
const characterProfileBias = {
    holmes: [
        "tension",
        "resonance",
        "distortion"
    ],
    little_prince: [
        "transcendence",
        "resonance",
        "void"
    ],
    izanami: [
        "collapse",
        "void",
        "transcendence"
    ],
    yeti: [
        "void",
        "distortion"
    ],
    square_flatland: [
        "distortion",
        "tension"
    ],
    alice: [
        "distortion",
        "tension",
        "transcendence"
    ],
    ludwig_ii: [
        "distortion",
        "void",
        "collapse"
    ],
    kingyo_atai: [
        "void",
        "distortion",
        "transcendence"
    ],
    snufkin: [
        "void",
        "tension"
    ],
    honda_tadakatsu: [
        "resonance",
        "tension"
    ],
    tinkerbell: [
        "distortion",
        "collapse"
    ],
    ragnar: [
        "collapse",
        "resonance",
        "tension",
        "transcendence"
    ],
    lupin: [
        "resonance",
        "tension"
    ],
    puss_in_boots: [
        "resonance",
        "tension"
    ],
    marie_antoinette: [
        "tension",
        "collapse"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/getReactionProfile.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/getReactionProfile.ts
__turbopack_context__.s([
    "getReactionProfile",
    ()=>getReactionProfile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$reactionRules$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/reactionRules.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$characterProfileBias$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/characterProfileBias.ts [client] (ecmascript)");
;
;
function getReactionProfile(characterId, motifId) {
    // ① 明示ルール（正）
    const ruleForCharacter = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$reactionRules$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["reactionRules"][characterId];
    if (ruleForCharacter && ruleForCharacter[motifId]) {
        return ruleForCharacter[motifId] // ReactionProfile をそのまま返す
        ;
    }
    // ② キャラ固有バイアス
    const bias = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$characterProfileBias$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["characterProfileBias"][characterId];
    if (bias && bias.length > 0) {
        return profileFromAxes(bias, bias.map((_, i)=>clampMagnitude(5 - i)));
    }
    // ③ デフォルト（安全）
    return emptyProfile();
}
function emptyProfile() {
    return {
        resonance: 0,
        tension: 0,
        distortion: 0,
        collapse: 0,
        void: 0,
        transcendence: 0
    };
}
function profileFromAxes(axes, magnitudes) {
    const profile = emptyProfile();
    axes.forEach((axis, i)=>{
        profile[axis] = magnitudes[i];
    });
    return profile;
}
function clampMagnitude(n) {
    if (n <= 0) return 0;
    if (n >= 5) return 5;
    return n;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/getDominantAxis.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/getDominantAxis.ts
__turbopack_context__.s([
    "getDominantAxis",
    ()=>getDominantAxis
]);
function getDominantAxis(profile) {
    return Object.entries(profile).sort((a, b)=>b[1] - a[1])[0][0];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/reaction/CharacterThemeMatrix.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/components/reaction/CharacterThemeMatrix.tsx
__turbopack_context__.s([
    "CharacterThemeMatrix",
    ()=>CharacterThemeMatrix
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$characters$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/characters.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$index$2e$ts__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/themes/index.ts [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$themeList$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/themeList.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$getReactionProfile$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/getReactionProfile.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$getDominantAxis$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/getDominantAxis.ts [client] (ecmascript)");
;
;
;
;
;
const AXIS_COLOR = {
    resonance: "#2563eb",
    tension: "#c2410c",
    distortion: "#6b21a8",
    collapse: "#b91c1c",
    void: "#525252",
    transcendence: "#16a34a"
};
function LevelBar({ level, color }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            gap: 2,
            marginTop: 4,
            justifyContent: "center"
        },
        children: Array.from({
            length: 5
        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: 10,
                    height: 6,
                    borderRadius: 2,
                    background: i < level ? color : "#e0e0e0"
                }
            }, i, false, {
                fileName: "[project]/src/components/reaction/CharacterThemeMatrix.tsx",
                lineNumber: 28,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/components/reaction/CharacterThemeMatrix.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
_c = LevelBar;
function CharacterThemeMatrix() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            overflowX: "auto"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                children: "反応マトリクス（参考）"
            }, void 0, false, {
                fileName: "[project]/src/components/reaction/CharacterThemeMatrix.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: `140px repeat(${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$themeList$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["themes"].length}, 1fr)`,
                    gap: 8
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {}, void 0, false, {
                        fileName: "[project]/src/components/reaction/CharacterThemeMatrix.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this),
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$themeList$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["themes"].map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: 11,
                                textAlign: "center",
                                opacity: 0.8
                            },
                            children: t.label
                        }, t.id, false, {
                            fileName: "[project]/src/components/reaction/CharacterThemeMatrix.tsx",
                            lineNumber: 57,
                            columnNumber: 11
                        }, this)),
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$characters$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["characters"].map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 12,
                                        fontWeight: 600,
                                        whiteSpace: "nowrap"
                                    },
                                    children: c.name
                                }, c.id, false, {
                                    fileName: "[project]/src/components/reaction/CharacterThemeMatrix.tsx",
                                    lineNumber: 72,
                                    columnNumber: 13
                                }, this),
                                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$themeList$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["themes"].map((t)=>{
                                    const profile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$getReactionProfile$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["getReactionProfile"])(c.id, t.id);
                                    const axis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$getDominantAxis$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["getDominantAxis"])(profile);
                                    const level = profile[axis];
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: "#f4f4f4",
                                            borderRadius: 8,
                                            padding: 6,
                                            textAlign: "center",
                                            fontSize: 10
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontWeight: 600,
                                                    color: AXIS_COLOR[axis]
                                                },
                                                children: axis
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/reaction/CharacterThemeMatrix.tsx",
                                                lineNumber: 99,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LevelBar, {
                                                level: level,
                                                color: AXIS_COLOR[axis]
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/reaction/CharacterThemeMatrix.tsx",
                                                lineNumber: 108,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, `${c.id}-${t.id}`, true, {
                                        fileName: "[project]/src/components/reaction/CharacterThemeMatrix.tsx",
                                        lineNumber: 89,
                                        columnNumber: 17
                                    }, this);
                                })
                            ]
                        }, void 0, true))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/reaction/CharacterThemeMatrix.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/reaction/CharacterThemeMatrix.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
_c1 = CharacterThemeMatrix;
var _c, _c1;
__turbopack_context__.k.register(_c, "LevelBar");
__turbopack_context__.k.register(_c1, "CharacterThemeMatrix");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/crowded/circus.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "circus",
    ()=>circus
]);
const circus = {
    id: "circus",
    categoryId: "crowded",
    label: "サーカス",
    keywords: [
        "circus",
        "tent",
        "performance_space",
        "spectacle",
        "illusion",
        "crowd",
        "temporary_structure",
        "misplaced_spectacle",
        "cruel_amusement",
        "innocence_exposed",
        "beauty_under_coercion",
        "applause_as_pressure",
        "rules_never_explained",
        "smiling_menace",
        "body_as_display",
        "exit_uncertain",
        "too_bright_to_question",
        "roles_assigned_before_entry",
        "color_as_rule",
        "play_that_continues",
        "smiles_with_obligation",
        "wonder_with_cost",
        "stage_that_teaches",
        "audience_included",
        "beauty_that_does_not_excuse"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/crowded/neon_district.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "neon_district",
    ()=>neon_district
]);
const neon_district = {
    id: "neon_district",
    categoryId: "crowded",
    label: "ネオン街",
    keywords: [
        "city",
        "neon_lights",
        "night",
        "crowds",
        "noise",
        "layers",
        "movement",
        "lived_in_space",
        "artificial_light",
        "street_level",
        "small_shops",
        "signboards"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/crowded/royal_court.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "royal_court",
    ()=>royal_court
]);
const royal_court = {
    id: "royal_court",
    categoryId: "crowded",
    label: "王宮",
    keywords: [
        "royal_court",
        "palace",
        "hierarchy",
        "authority",
        "ceremony",
        "tradition",
        "politics"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/crowded/shopping_mall.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "shopping_mall",
    ()=>shopping_mall
]);
const shopping_mall = {
    id: "shopping_mall",
    categoryId: "crowded",
    label: "巨大ショッピングモール",
    keywords: [
        "shopping_mall",
        "indoor_space",
        "artificial_environment",
        "controlled_climate",
        "bright_lighting",
        "repetitive_layout",
        "escalators",
        "storefronts",
        "constant_music"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/crowded/wall_street.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "wall_street",
    ()=>wall_street
]);
const wall_street = {
    id: "wall_street",
    categoryId: "crowded",
    label: "NYのウォール街",
    keywords: [
        "financial_district",
        "daytime",
        "crowded",
        "business_attire",
        "skyscrapers",
        "gray_palette",
        "numbers",
        "screens",
        "transactions",
        "pressure",
        "non_residential_space"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/nature/snowy_mountains.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "snowy_mountains",
    ()=>snowy_mountains
]);
const snowy_mountains = {
    id: "snowy_mountains",
    categoryId: "nature",
    label: "雪山",
    keywords: [
        "snowy_mountain",
        "steep_paths",
        "sudden_weather_change",
        "whiteout",
        "low_visibility",
        "cold_wind",
        "mountain_folklore",
        "isolation",
        "lost_trails"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/nature/tropical_beach.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "tropical_beach",
    ()=>tropical_beach
]);
const tropical_beach = {
    id: "tropical_beach",
    categoryId: "nature",
    label: "異国のビーチ",
    keywords: [
        "coast",
        "sea",
        "sand",
        "sunlight",
        "horizon",
        "salt_air",
        "open_space",
        "distant_land"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/nature/deep_forest.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deep_forest",
    ()=>deep_forest
]);
const deep_forest = {
    id: "deep_forest",
    categoryId: "nature",
    label: "深い森",
    keywords: [
        "forest",
        "dense_trees",
        "shade",
        "layers",
        "silence",
        "unknown_paths",
        "filtered_light"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/nature/lost_undersea_kingdom.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "lost_undersea_kingdom",
    ()=>lost_undersea_kingdom
]);
const lost_undersea_kingdom = {
    id: "lost_undersea_kingdom",
    categoryId: "nature",
    label: "失われた海底王国",
    keywords: [
        "deep_sea",
        "high_pressure",
        "dark_water",
        "sunken_ruins",
        "ancient_civilization",
        "silence",
        "slow_movement",
        "bioluminescence",
        "lost_world"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/closed/room_all_to_oneself.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "room_all_to_oneself",
    ()=>room_all_to_oneself
]);
const room_all_to_oneself = {
    id: "room_all_to_oneself",
    categoryId: "closed",
    label: "一人きりの部屋",
    keywords: [
        "solitude",
        "enclosed space",
        "introspection",
        "isolation",
        "stagnation",
        "self-dialogue",
        "shadows",
        "uninterrupted_thought",
        "mind_spiraling",
        "self_amplification",
        "presence_without_proof",
        "after_the_event",
        "safety_or_threat",
        "closed_world_freedom",
        "time_losing_shape",
        "room_as_mirror"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/closed/ruined_tower.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ruined_tower",
    ()=>ruined_tower
]);
const ruined_tower = {
    id: "ruined_tower",
    categoryId: "closed",
    label: "朽ちた塔",
    keywords: [
        "tower",
        "ruins",
        "collapsed_structure",
        "stone",
        "height",
        "exposure",
        "remnants"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/closed/space_station.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "space_station",
    ()=>space_station
]);
const space_station = {
    id: "space_station",
    categoryId: "closed",
    label: "宇宙ステーション",
    keywords: [
        "space_station",
        "artificial_habitat",
        "sealed_environment",
        "zero_gravity",
        "controlled_systems",
        "outside_void",
        "observation_windows",
        "orbit",
        "silence",
        "fragile_life_support"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/boundary/boundary_to_another_world.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "boundary_to_another_world",
    ()=>boundary_to_another_world
]);
const boundary_to_another_world = {
    id: "boundary_to_another_world",
    categoryId: "boundary",
    label: "異界との狭間",
    keywords: [
        "boundary",
        "threshold",
        "between_worlds",
        "transition",
        "fog",
        "unstable_space",
        "fading_landscape"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/boundary/train_with_no_known_destination.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "train_with_no_known_destination",
    ()=>train_with_no_known_destination
]);
const train_with_no_known_destination = {
    id: "train_with_no_known_destination",
    categoryId: "boundary",
    label: "誰も行き先を知らない列車",
    keywords: [
        "phantom_train",
        "between_realities",
        "non_place",
        "looping_route",
        "vanishing_stations",
        "erased_maps",
        "dream_logic",
        "invisible_control",
        "passive_life_flow",
        "unknown_destination",
        "endless_journey",
        "liminal_travel",
        "suspension_of_purpose",
        "collective_uncertainty",
        "anonymous_passengers"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/boundary/steampunk_planet.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "steampunk_planet",
    ()=>steampunk_planet
]);
const steampunk_planet = {
    id: "steampunk_planet",
    categoryId: "boundary",
    label: "スチームパンクの惑星",
    keywords: [
        "industrial_world",
        "steam_power",
        "mechanical_systems",
        "pressure",
        "pipes",
        "gears",
        "metal_structures",
        "constant_motion",
        "smoke",
        "engine_noise"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/daily_shift/quiet_village.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "quiet_village",
    ()=>quiet_village
]);
const quiet_village = {
    id: "quiet_village",
    categoryId: "human_secular",
    label: "のどかな村",
    keywords: [
        "village",
        "rural",
        "silence",
        "routine",
        "tradition",
        "slow_time",
        "community"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/daily_shift/zoo_on_a_rainy_day.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "zoo_on_a_rainy_day",
    ()=>zoo_on_a_rainy_day
]);
const zoo_on_a_rainy_day = {
    id: "zoo_on_a_rainy_day",
    categoryId: "daily_shift",
    label: "雨の日の動物園",
    keywords: [
        "misplaced_center",
        "gaze_without_owner",
        "asymmetric_observation",
        "enclosure_as_frame",
        "reversal_of_reference",
        "meaning_leaking_outward",
        "observer_becoming_example",
        "quiet_axiom_break",
        "animals_not_moving",
        "eyes_meeting",
        "time_stalling",
        "visitor_self_awareness",
        "rain",
        "empty paths",
        "watching eyes",
        "enclosure",
        "quiet unease",
        "reversed gaze",
        "damp silence",
        "lonely animals",
        "suspended time"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/daily_shift/twilight_library.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "twilight_library",
    ()=>twilight_library
]);
const twilight_library = {
    id: "twilight_library",
    categoryId: "daily_shift",
    label: "夕暮れの図書館",
    keywords: [
        "ordinary_place",
        "slight_discomfort",
        "something_off",
        "unremarkable_time",
        "muted_routine",
        "quiet_misalignment",
        "unnoticed_change",
        "familiar_but_wrong",
        "daily_life_distortion",
        "quiet_pressure",
        "watching_without_eyes",
        "stillness_with_intent",
        "space_holding_its_breath",
        "soft_unreality",
        "twilight",
        "fading light",
        "dusty shelves",
        "unfinished stories",
        "lingering silence",
        "time slowing",
        "threshold",
        "memory",
        "unspoken knowledge"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/daily_shift/artificial_garden.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "artificial_garden",
    ()=>artificial_garden
]);
const artificial_garden = {
    id: "artificial_garden",
    categoryId: "fantasy_cosmos",
    label: "人工庭園",
    keywords: [
        "artificialGarden",
        "fragileStructure",
        "glassLikeMaterials",
        "invisibleForms",
        "sensorySpace",
        "scent",
        "birdsong",
        "pollinators",
        "controlledNature",
        "designedEcosystem"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/outsider/infinite_labyrinth.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "infinite_labyrinth",
    ()=>infinite_labyrinth
]);
const infinite_labyrinth = {
    id: "infinite_labyrinth",
    categoryId: "outsider",
    label: "無限の迷宮",
    keywords: [
        "labyrinth",
        "endless_structure",
        "topological_loop",
        "mobius_like_space",
        "dimensionless",
        "negative_dimension",
        "shifting_layout",
        "unstable_exits",
        "non_linear_space",
        "choice_points",
        "observer_dependent",
        "self_reflective_space"
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/situationCategories.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/situations/situationCategories.ts
// Crowded
__turbopack_context__.s([
    "situationCategories",
    ()=>situationCategories,
    "situations",
    ()=>situations
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$crowded$2f$circus$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/crowded/circus.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$crowded$2f$neon_district$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/crowded/neon_district.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$crowded$2f$royal_court$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/crowded/royal_court.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$crowded$2f$shopping_mall$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/crowded/shopping_mall.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$crowded$2f$wall_street$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/crowded/wall_street.ts [client] (ecmascript)");
// Nature
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$nature$2f$snowy_mountains$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/nature/snowy_mountains.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$nature$2f$tropical_beach$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/nature/tropical_beach.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$nature$2f$deep_forest$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/nature/deep_forest.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$nature$2f$lost_undersea_kingdom$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/nature/lost_undersea_kingdom.ts [client] (ecmascript)");
// Closed
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$closed$2f$room_all_to_oneself$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/closed/room_all_to_oneself.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$closed$2f$ruined_tower$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/closed/ruined_tower.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$closed$2f$space_station$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/closed/space_station.ts [client] (ecmascript)");
// Boundary
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$boundary$2f$boundary_to_another_world$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/boundary/boundary_to_another_world.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$boundary$2f$train_with_no_known_destination$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/boundary/train_with_no_known_destination.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$boundary$2f$steampunk_planet$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/boundary/steampunk_planet.ts [client] (ecmascript)");
// Daily Shift
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$daily_shift$2f$quiet_village$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/daily_shift/quiet_village.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$daily_shift$2f$zoo_on_a_rainy_day$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/daily_shift/zoo_on_a_rainy_day.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$daily_shift$2f$twilight_library$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/daily_shift/twilight_library.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$daily_shift$2f$artificial_garden$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/daily_shift/artificial_garden.ts [client] (ecmascript)");
// Outsider
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$outsider$2f$infinite_labyrinth$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/outsider/infinite_labyrinth.ts [client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const situationCategories = [
    {
        id: 'crowded',
        label: '人の集まる場所',
        categoryId: 'crowded',
        situations: [
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$crowded$2f$circus$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["circus"],
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$crowded$2f$neon_district$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["neon_district"],
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$crowded$2f$royal_court$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["royal_court"],
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$crowded$2f$shopping_mall$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["shopping_mall"],
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$crowded$2f$wall_street$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["wall_street"]
        ],
        notes: '人の存在が世界を歪ませる'
    },
    {
        id: 'nature',
        label: '自然・外界',
        categoryId: 'nature',
        situations: [
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$nature$2f$snowy_mountains$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["snowy_mountains"],
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$nature$2f$tropical_beach$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["tropical_beach"],
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$nature$2f$deep_forest$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["deep_forest"],
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$nature$2f$lost_undersea_kingdom$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["lost_undersea_kingdom"]
        ],
        notes: '人間の理解や管理が及ばない領域'
    },
    {
        id: 'closed',
        label: '閉じた空間・構造物',
        categoryId: 'closed',
        situations: [
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$closed$2f$room_all_to_oneself$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["room_all_to_oneself"],
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$closed$2f$ruined_tower$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["ruined_tower"],
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$closed$2f$space_station$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["space_station"]
        ],
        notes: '内側で時間や意味が停滞'
    },
    {
        id: 'boundary',
        label: '境界・異界',
        categoryId: 'boundary',
        situations: [
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$boundary$2f$boundary_to_another_world$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["boundary_to_another_world"],
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$boundary$2f$train_with_no_known_destination$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["train_with_no_known_destination"],
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$boundary$2f$steampunk_planet$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["steampunk_planet"]
        ],
        notes: '狭間にいるのか別世界か'
    },
    {
        id: 'daily_shift',
        label: '日常の歪み',
        categoryId: 'daily_shift',
        situations: [
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$daily_shift$2f$quiet_village$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["quiet_village"],
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$daily_shift$2f$zoo_on_a_rainy_day$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["zoo_on_a_rainy_day"],
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$daily_shift$2f$twilight_library$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["twilight_library"],
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$daily_shift$2f$artificial_garden$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["artificial_garden"]
        ],
        notes: '見慣れた風景が少しだけ信用できない'
    },
    {
        id: 'outsider',
        label: '枠外・異端',
        categoryId: 'outsider',
        situations: [
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$outsider$2f$infinite_labyrinth$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["infinite_labyrinth"]
        ],
        notes: '概念外'
    }
];
const situations = situationCategories.flatMap((c)=>c.situations);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/applyTransition.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/applyTransition.ts
__turbopack_context__.s([
    "applyTransition",
    ()=>applyTransition
]);
function applyTransition(profile, _situationId) {
    switch(profile){
        case "distortion":
            return "destabilize";
        case "tension":
            return "amplify";
        case "void":
            return "fix";
        case "collapse":
            return "collapse";
        case "transcendence":
            return "invert";
        case "resonance":
        default:
            return "stabilize";
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/reaction/ReactionSituationMatrix.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/components/reaction/ReactionSituationMatrix.tsx
__turbopack_context__.s([
    "default",
    ()=>ReactionSituationMatrix
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$situationCategories$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/situationCategories.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$applyTransition$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/applyTransition.ts [client] (ecmascript)");
;
;
;
;
const REACTION_AXES = [
    "resonance",
    "tension",
    "distortion",
    "collapse",
    "void",
    "transcendence"
];
const TRANSITION_LABEL_MAP = {
    fix: "固定",
    destabilize: "不安定化",
    amplify: "増幅",
    transform: "変形",
    suppress: "抑制",
    invert: "反転"
};
function ReactionSituationMatrix() {
    const categories = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$situationCategories$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["situationCategories"].map((c)=>({
            id: c.categoryId,
            label: c.label
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                children: "Situation Category × ReactionProfile"
            }, void 0, false, {
                fileName: "[project]/src/components/reaction/ReactionSituationMatrix.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    fontSize: 12,
                    opacity: 0.7
                },
                children: "デフォルト遷移表（Phase2 下敷き）"
            }, void 0, false, {
                fileName: "[project]/src/components/reaction/ReactionSituationMatrix.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: `140px repeat(${categories.length}, 1fr)`,
                    gap: 2
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {}, void 0, false, {
                        fileName: "[project]/src/components/reaction/ReactionSituationMatrix.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this),
                    categories.map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: 12,
                                textAlign: "center",
                                fontWeight: "bold"
                            },
                            children: cat.label
                        }, cat.id, false, {
                            fileName: "[project]/src/components/reaction/ReactionSituationMatrix.tsx",
                            lineNumber: 49,
                            columnNumber: 11
                        }, this)),
                    REACTION_AXES.map((axis)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 12,
                                        fontWeight: "bold",
                                        whiteSpace: "nowrap"
                                    },
                                    children: axis
                                }, void 0, false, {
                                    fileName: "[project]/src/components/reaction/ReactionSituationMatrix.tsx",
                                    lineNumber: 60,
                                    columnNumber: 13
                                }, this),
                                categories.map((cat)=>{
                                    const transition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$applyTransition$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["applyTransition"])(axis, cat.id);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            border: "1px solid #333",
                                            borderRadius: 4,
                                            padding: "6px 4px",
                                            fontSize: 12,
                                            textAlign: "center"
                                        },
                                        children: TRANSITION_LABEL_MAP[transition] ?? transition
                                    }, `${axis}-${cat.id}`, false, {
                                        fileName: "[project]/src/components/reaction/ReactionSituationMatrix.tsx",
                                        lineNumber: 73,
                                        columnNumber: 17
                                    }, this);
                                })
                            ]
                        }, axis, true, {
                            fileName: "[project]/src/components/reaction/ReactionSituationMatrix.tsx",
                            lineNumber: 59,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/reaction/ReactionSituationMatrix.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/reaction/ReactionSituationMatrix.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_c = ReactionSituationMatrix;
var _c;
__turbopack_context__.k.register(_c, "ReactionSituationMatrix");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/common/ReferencePanel.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/components/common/ReferencePanel.tsx
__turbopack_context__.s([
    "ReferencePanel",
    ()=>ReferencePanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
function ReferencePanel({ title, children, defaultOpen = false }) {
    _s();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(defaultOpen);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            marginTop: 24
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setOpen(!open),
                style: {
                    background: "none",
                    border: "none",
                    color: "#c9a86a",
                    fontSize: 14,
                    cursor: "pointer",
                    padding: 0
                },
                children: [
                    open ? "▼" : "▶",
                    " ",
                    title
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/common/ReferencePanel.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 12
                },
                children: children
            }, void 0, false, {
                fileName: "[project]/src/components/common/ReferencePanel.tsx",
                lineNumber: 34,
                columnNumber: 16
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/common/ReferencePanel.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_s(ReferencePanel, "pG0khZI24VrkSmCZcWM9qqrVMh4=");
_c = ReferencePanel;
var _c;
__turbopack_context__.k.register(_c, "ReferencePanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/structure/structuralFunctionLabels.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/structure/structuralFunctionLabels.ts
__turbopack_context__.s([
    "structuralFunctionLabelMap",
    ()=>structuralFunctionLabelMap
]);
const structuralFunctionLabelMap = {
    ordered_world: "秩序前提",
    taboo: "禁忌",
    temptation: "誘惑",
    transgression: "侵犯",
    division: "分裂",
    exile: "追放／逸脱",
    stagnation: "停滞",
    erosion: "侵食",
    inversion: "反転",
    observer_distortion: "観測歪み",
    consequence: "帰結",
    void_ending: "未完結／空白"
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/worldModifier/worldModifierLabels.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "worldModifierLabelMap",
    ()=>worldModifierLabelMap
]);
const worldModifierLabelMap = {
    distortion: "歪曲",
    inversion: "反転",
    fixation: "固着",
    erosion: "侵食",
    voidification: "欠落",
    failed_transcendence: "超越失敗",
    observer_bias: "観測歪み",
    emergent_possibility: "好転の可能性"
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/reaction/reactionLabels.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/reaction/reactionAxisLabels.ts
__turbopack_context__.s([
    "reactionAxisLabelMap",
    ()=>reactionAxisLabelMap
]);
const reactionAxisLabelMap = {
    resonance: "共鳴",
    tension: "緊張",
    distortion: "歪曲",
    collapse: "崩壊",
    void: "空虚",
    transcendence: "超越"
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/metrics/PlannedMetricsPanel.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/components/metrics/PlannedMetricsPanel.tsx
// ReactionAxis 日本語ラベル適用・最終版
__turbopack_context__.s([
    "PlannedMetricsPanel",
    ()=>PlannedMetricsPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$common$2f$ReferencePanel$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/common/ReferencePanel.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$structure$2f$structuralFunctionLabels$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/structure/structuralFunctionLabels.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$worldModifier$2f$worldModifierLabels$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/worldModifier/worldModifierLabels.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reaction$2f$reactionLabels$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/reaction/reactionLabels.ts [client] (ecmascript)");
;
;
;
;
;
function PlannedMetricsPanel({ data }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$common$2f$ReferencePanel$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["ReferencePanel"], {
        title: "生成前メトリクス（条件）",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                fontSize: 13,
                lineHeight: 1.6
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        opacity: 0.7,
                        marginBottom: 8
                    },
                    children: "この条件で関与する構造と歪み"
                }, void 0, false, {
                    fileName: "[project]/src/components/metrics/PlannedMetricsPanel.tsx",
                    lineNumber: 14,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: "構造機能："
                        }, void 0, false, {
                            fileName: "[project]/src/components/metrics/PlannedMetricsPanel.tsx",
                            lineNumber: 19,
                            columnNumber: 11
                        }, this),
                        data.requiredFunctions.length ? data.requiredFunctions.map((f)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$structure$2f$structuralFunctionLabels$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["structuralFunctionLabelMap"][f]).join(", ") : "なし"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/metrics/PlannedMetricsPanel.tsx",
                    lineNumber: 18,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: "世界修飾子："
                        }, void 0, false, {
                            fileName: "[project]/src/components/metrics/PlannedMetricsPanel.tsx",
                            lineNumber: 28,
                            columnNumber: 11
                        }, this),
                        data.plannedModifiers.length ? data.plannedModifiers.map((m)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$worldModifier$2f$worldModifierLabels$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["worldModifierLabelMap"][m]).join(", ") : "なし"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/metrics/PlannedMetricsPanel.tsx",
                    lineNumber: 27,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: "反応プロファイル："
                        }, void 0, false, {
                            fileName: "[project]/src/components/metrics/PlannedMetricsPanel.tsx",
                            lineNumber: 37,
                            columnNumber: 11
                        }, this),
                        Object.entries(data.reactionProfile).map(([k, v])=>`${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reaction$2f$reactionLabels$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["reactionAxisLabelMap"][k]}:${v}`).join(", ")
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/metrics/PlannedMetricsPanel.tsx",
                    lineNumber: 36,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/metrics/PlannedMetricsPanel.tsx",
            lineNumber: 13,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/metrics/PlannedMetricsPanel.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
_c = PlannedMetricsPanel;
var _c;
__turbopack_context__.k.register(_c, "PlannedMetricsPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/metrics/MetricsPanel.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/components/metrics/MetricsPanel.tsx
// src/components/metrics/MetricsPanel.tsx
// 完全版（翻訳・表示これで終了）
__turbopack_context__.s([
    "MetricsPanel",
    ()=>MetricsPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$common$2f$ReferencePanel$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/common/ReferencePanel.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$worldModifier$2f$worldModifierLabels$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/worldModifier/worldModifierLabels.ts [client] (ecmascript)");
;
;
;
function MetricsPanel({ metrics }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$common$2f$ReferencePanel$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["ReferencePanel"], {
        title: "生成後メトリクス（結果）",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                fontSize: 13,
                lineHeight: 1.6
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        opacity: 0.7,
                        marginBottom: 8
                    },
                    children: "実際に物語内で起きた構造変化の結果"
                }, void 0, false, {
                    fileName: "[project]/src/components/metrics/MetricsPanel.tsx",
                    lineNumber: 15,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: "適用された世界修飾子："
                        }, void 0, false, {
                            fileName: "[project]/src/components/metrics/MetricsPanel.tsx",
                            lineNumber: 20,
                            columnNumber: 11
                        }, this),
                        metrics.appliedModifiers.length ? metrics.appliedModifiers.map((m)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$worldModifier$2f$worldModifierLabels$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["worldModifierLabelMap"][m]).join(", ") : "なし"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/metrics/MetricsPanel.tsx",
                    lineNumber: 19,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: "無効化された構造数："
                        }, void 0, false, {
                            fileName: "[project]/src/components/metrics/MetricsPanel.tsx",
                            lineNumber: 29,
                            columnNumber: 11
                        }, this),
                        metrics.inactiveCount
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/metrics/MetricsPanel.tsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: "反転した構造数："
                        }, void 0, false, {
                            fileName: "[project]/src/components/metrics/MetricsPanel.tsx",
                            lineNumber: 34,
                            columnNumber: 11
                        }, this),
                        metrics.invertedCount
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/metrics/MetricsPanel.tsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: "平均歪み強度："
                        }, void 0, false, {
                            fileName: "[project]/src/components/metrics/MetricsPanel.tsx",
                            lineNumber: 39,
                            columnNumber: 11
                        }, this),
                        metrics.avgWeight.toFixed(2)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/metrics/MetricsPanel.tsx",
                    lineNumber: 38,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/metrics/MetricsPanel.tsx",
            lineNumber: 14,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/metrics/MetricsPanel.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = MetricsPanel;
var _c;
__turbopack_context__.k.register(_c, "MetricsPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/affinities/affinityMap.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/affinities/affinityMap.ts
__turbopack_context__.s([
    "affinityMap",
    ()=>affinityMap
]);
const affinityMap = {
    circus: {
        neutral: {
            level: "◯",
            comment: "バランスの取れた語り口がサーカスの多様性を引き立てる"
        },
        poetic: {
            level: "◎",
            comment: "幻想的な描写がサーカスの魅力を増幅"
        },
        melancholic: {
            level: "△",
            comment: "華やかさとの対比が独特の余韻を残す"
        },
        cold: {
            level: "△",
            comment: "冷静な視点が非現実感を強調"
        },
        scholarly: {
            level: "◯",
            comment: "歴史的・文化的視点で奥行きが出る"
        },
        mystic: {
            level: "◎",
            comment: "魔術的雰囲気が世界観を深化"
        },
        heroic: {
            level: "△",
            comment: "サーカスを舞台にした英雄譚に"
        },
        childlike: {
            level: "◎",
            comment: "驚きと楽しさに満ちた語りが合う"
        },
        playful: {
            level: "◎",
            comment: "混沌とユーモアがマッチする"
        },
        osaka_obahan: {
            level: "◎",
            comment: "騒がしさと混沌が共鳴"
        }
    },
    deep_forest: {
        neutral: {
            level: "◯",
            comment: "自然の描写に最適な落ち着いた文体"
        },
        poetic: {
            level: "◎",
            comment: "自然と抒情の調和"
        },
        melancholic: {
            level: "◎",
            comment: "静けさと孤独感が際立つ"
        },
        cold: {
            level: "△",
            comment: "やや淡白だがミステリアスさは出せる"
        },
        scholarly: {
            level: "◯",
            comment: "生態学的な視点で深みが出る"
        },
        mystic: {
            level: "◎",
            comment: "森の神秘と相性抜群"
        },
        heroic: {
            level: "△",
            comment: "やや非現実的だが冒険譚になりうる"
        },
        childlike: {
            level: "◯",
            comment: "不思議の森として描写できる"
        },
        playful: {
            level: "△",
            comment: "静けさとのギャップが鍵"
        },
        osaka_obahan: {
            level: "△",
            comment: "自然とのギャップでユニークに"
        }
    },
    snowy_mountains: {
        neutral: {
            level: "◯",
            comment: "冷静な語りで雪の静寂を表現"
        },
        poetic: {
            level: "◎",
            comment: "雪の描写と詩情がマッチ"
        },
        melancholic: {
            level: "◎",
            comment: "孤独と記憶を呼び起こす"
        },
        cold: {
            level: "◯",
            comment: "感情を排した語りが合う"
        },
        scholarly: {
            level: "△",
            comment: "やや情緒に欠けるが考察には向く"
        },
        mystic: {
            level: "◎",
            comment: "雪と神秘が融合"
        },
        heroic: {
            level: "△",
            comment: "厳しい自然が試練の舞台に"
        },
        childlike: {
            level: "△",
            comment: "幻想的な雪遊びの世界になる"
        },
        playful: {
            level: "△",
            comment: "ギャップがユーモラスに働く"
        },
        osaka_obahan: {
            level: "△",
            comment: "雪山でのテンションの差が面白い"
        }
    },
    quiet_village: {
        neutral: {
            level: "◎",
            comment: "日常の空気感を素直に描ける"
        },
        poetic: {
            level: "◯",
            comment: "静けさが抒情に映える"
        },
        melancholic: {
            level: "◎",
            comment: "過去や喪失の匂いと合う"
        },
        cold: {
            level: "△",
            comment: "人情との距離がズレになる"
        },
        scholarly: {
            level: "△",
            comment: "分析的すぎると温度が下がる"
        },
        mystic: {
            level: "◯",
            comment: "隠れた伝承の村になる"
        },
        heroic: {
            level: "△",
            comment: "英雄性が浮きやすい"
        },
        childlike: {
            level: "◯",
            comment: "素朴な昔話風"
        },
        playful: {
            level: "△",
            comment: "静寂との対比が鍵"
        },
        osaka_obahan: {
            level: "△",
            comment: "生活感の暴力が面白い"
        }
    },
    royal_court: {
        neutral: {
            level: "◯",
            comment: "状況整理に向く"
        },
        poetic: {
            level: "◎",
            comment: "権威と美の誇張が映える"
        },
        melancholic: {
            level: "◯",
            comment: "栄華の陰を描ける"
        },
        cold: {
            level: "◎",
            comment: "権力構造と相性抜群"
        },
        scholarly: {
            level: "◎",
            comment: "政治・制度描写が強い"
        },
        mystic: {
            level: "△",
            comment: "魔術色を足す必要あり"
        },
        heroic: {
            level: "◯",
            comment: "叙事詩的展開に"
        },
        childlike: {
            level: "△",
            comment: "複雑さが壁になる"
        },
        playful: {
            level: "△",
            comment: "風刺寄りなら成立"
        },
        osaka_obahan: {
            level: "△",
            comment: "宮廷ゴシップ化する"
        }
    },
    tropical_beach: {
        neutral: {
            level: "◯",
            comment: "異国感を整理できる"
        },
        poetic: {
            level: "◎",
            comment: "光と海の表現が強い"
        },
        melancholic: {
            level: "◯",
            comment: "旅の終わり感"
        },
        cold: {
            level: "△",
            comment: "開放感と噛み合わない"
        },
        scholarly: {
            level: "△",
            comment: "観光記録寄りになる"
        },
        mystic: {
            level: "◯",
            comment: "海の伝承と相性"
        },
        heroic: {
            level: "△",
            comment: "戦場化しない工夫が必要"
        },
        childlike: {
            level: "◎",
            comment: "冒険と遊びの海"
        },
        playful: {
            level: "◎",
            comment: "陽気さが噛み合う"
        },
        osaka_obahan: {
            level: "◎",
            comment: "海外テンション全開"
        }
    },
    boundary_to_another_world: {
        neutral: {
            level: "◯",
            comment: "状況説明に向く"
        },
        poetic: {
            level: "◎",
            comment: "曖昧さを美にできる"
        },
        melancholic: {
            level: "◎",
            comment: "別れと選択の場"
        },
        cold: {
            level: "◯",
            comment: "境界管理者視点"
        },
        scholarly: {
            level: "◯",
            comment: "世界構造の説明向き"
        },
        mystic: {
            level: "◎",
            comment: "王道の相性"
        },
        heroic: {
            level: "◎",
            comment: "越境の物語になる"
        },
        childlike: {
            level: "△",
            comment: "抽象度が高い"
        },
        playful: {
            level: "△",
            comment: "軽くすると不思議寄り"
        },
        osaka_obahan: {
            level: "△",
            comment: "異界ツッコミ役"
        }
    },
    ruined_tower: {
        neutral: {
            level: "◯",
            comment: "状況説明がしやすい"
        },
        poetic: {
            level: "◎",
            comment: "崩壊と時間の比喩が映える"
        },
        melancholic: {
            level: "◎",
            comment: "失われた栄光と相性良し"
        },
        cold: {
            level: "◯",
            comment: "遺構として淡々と描ける"
        },
        scholarly: {
            level: "◎",
            comment: "建築・歴史考察向き"
        },
        mystic: {
            level: "◯",
            comment: "封印や呪いを匂わせられる"
        },
        heroic: {
            level: "◎",
            comment: "攻略対象として成立"
        },
        childlike: {
            level: "△",
            comment: "危険さが強い"
        },
        playful: {
            level: "△",
            comment: "軽さとのズレ"
        },
        osaka_obahan: {
            level: "△",
            comment: "廃墟ツッコミ役"
        }
    },
    neon_district: {
        neutral: {
            level: "◯",
            comment: "情報量を制御できる"
        },
        poetic: {
            level: "◎",
            comment: "光と孤独の都市詩"
        },
        melancholic: {
            level: "◎",
            comment: "夜の虚無と相性抜群"
        },
        cold: {
            level: "◎",
            comment: "無機質な都市感覚"
        },
        scholarly: {
            level: "△",
            comment: "レポート調になりがち"
        },
        mystic: {
            level: "△",
            comment: "SF寄り調整が必要"
        },
        heroic: {
            level: "◯",
            comment: "アンチヒーロー向き"
        },
        childlike: {
            level: "△",
            comment: "刺激が強い"
        },
        playful: {
            level: "◯",
            comment: "カオスな楽しさ"
        },
        osaka_obahan: {
            level: "◎",
            comment: "街ツッコミが炸裂"
        }
    },
    wall_street: {
        neutral: {
            level: "◯",
            comment: "現実的描写に向く"
        },
        poetic: {
            level: "△",
            comment: "抽象化が必要"
        },
        melancholic: {
            level: "◯",
            comment: "欲望の虚しさ"
        },
        cold: {
            level: "◎",
            comment: "数字と非情さが噛み合う"
        },
        scholarly: {
            level: "◎",
            comment: "経済構造の語り"
        },
        mystic: {
            level: "△",
            comment: "比喩的処理向き"
        },
        heroic: {
            level: "△",
            comment: "英雄像がズレる"
        },
        childlike: {
            level: "△",
            comment: "理解が難しい"
        },
        playful: {
            level: "△",
            comment: "皮肉寄りになる"
        },
        osaka_obahan: {
            level: "◎",
            comment: "金の話が主役"
        }
    },
    shopping_mall: {
        neutral: {
            level: "◯",
            comment: "空間整理に向く"
        },
        poetic: {
            level: "△",
            comment: "日常感が強い"
        },
        melancholic: {
            level: "◯",
            comment: "空虚な消費空間"
        },
        cold: {
            level: "◯",
            comment: "人工性が強調される"
        },
        scholarly: {
            level: "△",
            comment: "社会分析寄り"
        },
        mystic: {
            level: "△",
            comment: "異界化が必要"
        },
        heroic: {
            level: "△",
            comment: "スケールがズレる"
        },
        childlike: {
            level: "◎",
            comment: "巨大な遊び場"
        },
        playful: {
            level: "◎",
            comment: "カオスと相性良し"
        },
        osaka_obahan: {
            level: "◎",
            comment: "日常トーク無双"
        }
    },
    space_station: {
        neutral: {
            level: "◯",
            comment: "SF描写が安定"
        },
        poetic: {
            level: "◎",
            comment: "孤独と宇宙の詩"
        },
        melancholic: {
            level: "◎",
            comment: "隔絶感と相性良し"
        },
        cold: {
            level: "◎",
            comment: "無重力の非情さ"
        },
        scholarly: {
            level: "◎",
            comment: "技術描写向き"
        },
        mystic: {
            level: "△",
            comment: "科学寄り調整"
        },
        heroic: {
            level: "◯",
            comment: "防衛・救出劇"
        },
        childlike: {
            level: "△",
            comment: "理解が難しい"
        },
        playful: {
            level: "△",
            comment: "緊張感が崩れる"
        },
        osaka_obahan: {
            level: "△",
            comment: "宇宙で世話焼き"
        }
    },
    artificial_garden: {
        neutral: {
            level: "◯",
            comment: "構造を整理できる"
        },
        poetic: {
            level: "◎",
            comment: "人工と自然の対比"
        },
        melancholic: {
            level: "◯",
            comment: "作られた楽園感"
        },
        cold: {
            level: "◯",
            comment: "管理視点と合う"
        },
        scholarly: {
            level: "◎",
            comment: "設計思想を描ける"
        },
        mystic: {
            level: "△",
            comment: "神秘性は薄め"
        },
        heroic: {
            level: "△",
            comment: "戦いの場ではない"
        },
        childlike: {
            level: "◎",
            comment: "不思議な庭園"
        },
        playful: {
            level: "◯",
            comment: "実験場として楽しい"
        },
        osaka_obahan: {
            level: "◯",
            comment: "世話焼き視点"
        }
    },
    steampunk_planet: {
        neutral: {
            level: "◯",
            comment: "世界説明向き"
        },
        poetic: {
            level: "◎",
            comment: "煙と歯車の詩"
        },
        melancholic: {
            level: "◯",
            comment: "時代遅れの哀愁"
        },
        cold: {
            level: "◎",
            comment: "機械文明と相性"
        },
        scholarly: {
            level: "◎",
            comment: "技術史的に強い"
        },
        mystic: {
            level: "△",
            comment: "魔法寄り調整"
        },
        heroic: {
            level: "◎",
            comment: "反乱・革命譚"
        },
        childlike: {
            level: "△",
            comment: "複雑すぎる"
        },
        playful: {
            level: "◯",
            comment: "ガジェット感"
        },
        osaka_obahan: {
            level: "△",
            comment: "煙への文句"
        }
    },
    lost_undersea_kingdom: {
        neutral: {
            level: "◯",
            comment: "状況整理が必要"
        },
        poetic: {
            level: "◎",
            comment: "沈黙と光の世界"
        },
        melancholic: {
            level: "◎",
            comment: "滅びの美学"
        },
        cold: {
            level: "◯",
            comment: "深海の非情さ"
        },
        scholarly: {
            level: "◎",
            comment: "文明考古学向き"
        },
        mystic: {
            level: "◎",
            comment: "伝説との親和性"
        },
        heroic: {
            level: "◯",
            comment: "探索譚になる"
        },
        childlike: {
            level: "△",
            comment: "怖さが勝る"
        },
        playful: {
            level: "△",
            comment: "雰囲気維持が難しい"
        },
        osaka_obahan: {
            level: "△",
            comment: "水圧ツッコミ"
        }
    },
    infinite_labyrinth: {
        neutral: {
            level: "◯",
            comment: "構造整理が重要"
        },
        poetic: {
            level: "◎",
            comment: "終わりなき比喩"
        },
        melancholic: {
            level: "◎",
            comment: "迷いと絶望"
        },
        cold: {
            level: "◎",
            comment: "非人間的空間"
        },
        scholarly: {
            level: "◯",
            comment: "論理迷宮向き"
        },
        mystic: {
            level: "◎",
            comment: "存在論的世界"
        },
        heroic: {
            level: "◎",
            comment: "試練の極致"
        },
        childlike: {
            level: "△",
            comment: "難解すぎる"
        },
        playful: {
            level: "△",
            comment: "緊張感が崩れる"
        },
        osaka_obahan: {
            level: "△",
            comment: "永遠に迷うオチ"
        }
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/data/situationPresets.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/data/situationPresets.ts
__turbopack_context__.s([
    "SITUATION_PRESETS",
    ()=>SITUATION_PRESETS
]);
const SITUATION_PRESETS = [
    // 1. 人の集う場所
    {
        id: "circus",
        label: "サーカス",
        sceneId: "circus_tent",
        worldModifierId: "inversion",
        notes: "非日常的で夢のような演じられた世界"
    },
    {
        id: "neon_district",
        label: "ネオン街",
        sceneId: "neon_district",
        worldModifierId: "observer_bias",
        notes: "妖しいネオンが照らし出すもの"
    },
    {
        id: "royal_court",
        label: "王宮",
        sceneId: "royal_court",
        worldModifierId: "inversion",
        notes: "豪華絢爛な歴史と権力の象徴"
    },
    {
        id: "shopping_mall",
        label: "巨大ショッピングモール",
        sceneId: "shopping_mall",
        worldModifierId: "voidification",
        notes: "無数のありきたりな幸せが同時に存在"
    },
    {
        id: "wall_street",
        label: "ニューヨークのウォール街",
        sceneId: "wall_street",
        worldModifierId: "inversion",
        notes: "巨万の富と思惑が渦巻く都会の喧騒"
    },
    // 2. 自然・外界 
    {
        id: "snowy_mountains",
        label: "雪山",
        sceneId: "snowy_mountains",
        worldModifierId: "fixation",
        notes: "手足も悴む真っ白な厳しさ"
    },
    {
        id: "tropical_beach",
        label: "異国のビーチ",
        sceneId: "tropical_beach",
        worldModifierId: "distortion",
        notes: "楽園のはずなのに違和感"
    },
    {
        id: "deep_forest",
        label: "深い森",
        sceneId: "deep_forest",
        worldModifierId: "distortion",
        notes: "空を覆われ方角も感覚も消えていく場所"
    },
    {
        id: "lost_undersea_kingdom",
        label: "失われた海底世界",
        sceneId: "lost_undersea_world",
        worldModifierId: "voidification",
        notes: "過ぎ去った栄華が囁く海底深く沈んだ領域"
    },
    // 3. 閉じた空間・構造物
    {
        id: "room_all_to_oneself",
        label: "一人きりの部屋",
        sceneId: "room_all_to_oneself",
        worldModifierId: "observer_bias",
        notes: "安らぎの聖域か心の空洞か"
    },
    {
        id: "ruined_tower",
        label: "朽ちた塔",
        sceneId: "ruined_tower",
        worldModifierId: "erosion",
        notes: "過去や歴史の崩壊が残した遺物"
    },
    {
        id: "space_station",
        label: "宇宙ステーション",
        sceneId: "space_station",
        worldModifierId: "fixation",
        notes: "人間の存在がちっぽけで無力"
    },
    // 4. 境界・異界
    {
        id: "boundary_to_another_world",
        label: "異界との境界",
        sceneId: "boundary_to_another_world",
        worldModifierId: "observer_bias",
        notes: "越えてはいないが戻れないかも"
    },
    {
        id: "train_with_no_known_destination",
        label: "誰も行き先を知らない列車",
        sceneId: "train_with_no_known_destination",
        worldModifierId: "Voidification",
        notes: "終点も目的もないまま走り続ける"
    },
    {
        id: "steampunk_planet",
        label: "スチームパンクの惑星",
        sceneId: "steampunk_planet",
        worldModifierId: "distortion",
        notes: "機械的でノスタルジック、でも未来的"
    },
    // 5. 日常の歪み
    {
        id: "quiet_village",
        label: "静かな村",
        sceneId: "quiet_village",
        worldModifierId: "emergent_possibility",
        notes: "何も起こらないはずの場所"
    },
    {
        id: "zoo_on_a_rainy_day",
        label: "雨の日の動物園",
        sceneId: "zoo_on_a_rainy_day",
        worldModifierId: "observer_bias",
        notes: "観ているはずが観られている"
    },
    {
        id: "artificial_garden",
        label: "人工庭園",
        sceneId: "artificial_garden",
        worldModifierId: "inversion",
        notes: "どこか無機質な庭園"
    },
    {
        id: "twilight_library",
        label: "夕暮れの図書館",
        sceneId: "twilight_library",
        worldModifierId: "fixation",
        notes: "何かが静かに止まり始めるのか動き始めるのか"
    },
    // 6. 枠外・異端
    {
        id: "infinite_labyrinth",
        label: "無限の迷宮",
        sceneId: "infinite_labyrinth",
        worldModifierId: "fixation",
        notes: "形も時間も空間も全ての概念が不安定で変動的"
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/types/situationPreset.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/types/situationPreset.ts
__turbopack_context__.s([]);
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/boundary/index.ts [client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$boundary$2f$steampunk_planet$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/boundary/steampunk_planet.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$boundary$2f$boundary_to_another_world$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/boundary/boundary_to_another_world.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$boundary$2f$train_with_no_known_destination$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/boundary/train_with_no_known_destination.ts [client] (ecmascript)");
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/closed/index.ts [client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$closed$2f$space_station$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/closed/space_station.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$closed$2f$ruined_tower$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/closed/ruined_tower.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$closed$2f$room_all_to_oneself$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/closed/room_all_to_oneself.ts [client] (ecmascript)");
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/crowded/index.ts [client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$crowded$2f$circus$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/crowded/circus.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$crowded$2f$neon_district$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/crowded/neon_district.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$crowded$2f$royal_court$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/crowded/royal_court.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$crowded$2f$shopping_mall$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/crowded/shopping_mall.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$crowded$2f$wall_street$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/crowded/wall_street.ts [client] (ecmascript)");
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/daily_shift/index.ts [client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$daily_shift$2f$twilight_library$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/daily_shift/twilight_library.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$daily_shift$2f$zoo_on_a_rainy_day$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/daily_shift/zoo_on_a_rainy_day.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$daily_shift$2f$quiet_village$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/daily_shift/quiet_village.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$daily_shift$2f$artificial_garden$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/daily_shift/artificial_garden.ts [client] (ecmascript)");
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/nature/index.ts [client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$nature$2f$deep_forest$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/nature/deep_forest.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$nature$2f$snowy_mountains$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/nature/snowy_mountains.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$nature$2f$lost_undersea_kingdom$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/nature/lost_undersea_kingdom.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$nature$2f$tropical_beach$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/nature/tropical_beach.ts [client] (ecmascript)");
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/outsider/index.ts [client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$outsider$2f$infinite_labyrinth$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/outsider/infinite_labyrinth.ts [client] (ecmascript)");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/situationMap.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "situationsById",
    ()=>situationsById
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$situationCategories$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/situationCategories.ts [client] (ecmascript)");
;
const situationsById = Object.fromEntries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$situationCategories$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["situations"].map((s)=>[
        s.id,
        s
    ]));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/situations/index.ts [client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

// src/situations/index.ts
__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$situationPreset$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/situationPreset.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$situationCategories$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/situationCategories.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$boundary$2f$index$2e$ts__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/situations/boundary/index.ts [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$closed$2f$index$2e$ts__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/situations/closed/index.ts [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$crowded$2f$index$2e$ts__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/situations/crowded/index.ts [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$daily_shift$2f$index$2e$ts__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/situations/daily_shift/index.ts [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$nature$2f$index$2e$ts__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/situations/nature/index.ts [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$outsider$2f$index$2e$ts__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/situations/outsider/index.ts [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$situationMap$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/situationMap.ts [client] (ecmascript)");
;
;
;
;
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/utils/situationLabelMap.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/utils/situationLabelMap.ts
__turbopack_context__.s([
    "situationLabelMap",
    ()=>situationLabelMap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$index$2e$ts__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/situations/index.ts [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$situationCategories$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/situations/situationCategories.ts [client] (ecmascript)");
;
const situationLabelMap = Object.fromEntries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$situations$2f$situationCategories$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["situationCategories"].flatMap((cat)=>cat.situations.map((s)=>[
            s.id,
            s.label
        ])));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/utils/voiceLabelMap.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "voiceLabelMap",
    ()=>voiceLabelMap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$voiceList$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/voiceList.ts [client] (ecmascript)");
;
const voiceLabelMap = Object.fromEntries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$voiceList$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["voices"].map((v)=>[
        v.id,
        v.label
    ]));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/mapSituationToWorldModifiers.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/mapSituationToWorldModifiers.ts
__turbopack_context__.s([
    "mapSituationToWorldModifiers",
    ()=>mapSituationToWorldModifiers
]);
function mapSituationToWorldModifiers(situationId, reactionProfile) {
    const modifiers = [];
    switch(situationId){
        case "circus":
            modifiers.push("distortion");
            modifiers.push("observer_bias");
            break;
        case "deep_forest":
            modifiers.push("erosion");
            modifiers.push("voidification");
            break;
        case "steampunk_planet":
            modifiers.push("fixation");
            break;
        case "train_with_no_known_destination":
            modifiers.push("inversion");
            modifiers.push("observer_bias");
            break;
    }
    return modifiers;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/mapSituationToRequiredFunctions.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mapSituationToRequiredFunctions",
    ()=>mapSituationToRequiredFunctions
]);
function mapSituationToRequiredFunctions(situationId) {
    switch(situationId){
        case "circus":
            return [
                "observer_distortion",
                "division"
            ];
        case "deep_forest":
            return [
                "erosion",
                "void_ending"
            ];
        case "steampunk_planet":
            return [
                "stagnation",
                "consequence"
            ];
        case "train_with_no_known_destination":
            return [
                "inversion",
                "observer_distortion"
            ];
        default:
            return [];
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/pages/story/index.tsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/pages/story/index.tsx
__turbopack_context__.s([
    "default",
    ()=>StoryPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$characters$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/characters.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$index$2e$ts__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/themes/index.ts [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$themeList$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/themes/themeList.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$index$2e$ts__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/voices/index.ts [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$voiceList$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/voices/voiceList.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$affinity$2f$AffinityMatrix$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/affinity/AffinityMatrix.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$reaction$2f$CharacterThemeMatrix$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/reaction/CharacterThemeMatrix.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$reaction$2f$ReactionSituationMatrix$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/reaction/ReactionSituationMatrix.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$common$2f$ReferencePanel$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/common/ReferencePanel.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$metrics$2f$PlannedMetricsPanel$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/metrics/PlannedMetricsPanel.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$metrics$2f$MetricsPanel$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/metrics/MetricsPanel.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$affinities$2f$affinityMap$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/affinities/affinityMap.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$situationPresets$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/situationPresets.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$situationLabelMap$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/situationLabelMap.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$voiceLabelMap$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/voiceLabelMap.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$getReactionProfile$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/getReactionProfile.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapSituationToWorldModifiers$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mapSituationToWorldModifiers.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapSituationToRequiredFunctions$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mapSituationToRequiredFunctions.ts [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function StoryPage() {
    _s();
    const [selectedTheme, setSelectedTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedSituation, setSelectedSituation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedVoice, setSelectedVoice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedCharacter, setSelectedCharacter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [generatedStory, setGeneratedStory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [resultMetrics, setResultMetrics] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])("faker");
    const [showApiKeyPopup, setShowApiKeyPopup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const hasApiKey = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_HAS_OPENAI_KEY === "true";
    const MODES = [
        {
            id: "faker",
            label: "Faker Only",
            locked: false
        },
        {
            id: "llm",
            label: "LLM Only",
            locked: !hasApiKey
        },
        {
            id: "faker_llm",
            label: "Faker × LLM",
            locked: !hasApiKey
        }
    ];
    // ===== 生成前 Metrics（表示専用）=====
    const reactionProfile = selectedCharacter && selectedTheme ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$getReactionProfile$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["getReactionProfile"])(selectedCharacter, selectedTheme.id) : null;
    const plannedMetrics = selectedSituation && reactionProfile ? {
        requiredFunctions: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapSituationToRequiredFunctions$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["mapSituationToRequiredFunctions"])(selectedSituation),
        plannedModifiers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapSituationToWorldModifiers$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["mapSituationToWorldModifiers"])(selectedSituation, reactionProfile),
        reactionProfile
    } : null;
    async function handleGenerateStory() {
        if ((mode === "faker_llm" || mode === "llm") && !hasApiKey) {
            alert("This mode requires an API key");
            return;
        }
        if (!selectedTheme || !selectedSituation || !selectedVoice || !selectedCharacter) {
            return;
        }
        const res = await fetch("/api/mode3", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                characterId: selectedCharacter,
                themeId: selectedTheme.id,
                situationId: selectedSituation,
                voiceId: selectedVoice
            })
        });
        const json = await res.json();
        if (!res.ok || !json.ok) {
            alert(json.error ?? "Mode3 generation failed");
            return;
        }
        setGeneratedStory(json.text);
        setResultMetrics(null);
    }
    function showApiKeyHelp() {
        alert("このモードを使うには OpenAI API key が必要です。\n\n" + "1. OpenAIでAPI keyを取得\n" + "2. .env.local に OPENAI_API_KEY を設定\n" + "3. NEXT_PUBLIC_HAS_OPENAI_KEY=true を設定\n" + "4. 開発サーバーを再起動");
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        style: {
            padding: 32
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                children: "Story Generator"
            }, void 0, false, {
                fileName: "[project]/pages/story/index.tsx",
                lineNumber: 113,
                columnNumber: 6
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                style: {
                    marginBottom: 32
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "モード"
                    }, void 0, false, {
                        fileName: "[project]/pages/story/index.tsx",
                        lineNumber: 117,
                        columnNumber: 8
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: 24,
                            marginTop: 16
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                padding: 16,
                                borderRadius: 12,
                                border: "1px solid #444",
                                color: "#fff",
                                background: mode === "faker_llm" ? "#222" : "#111",
                                opacity: hasApiKey ? 1 : 0.5
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>{
                                        if (hasApiKey) setMode("faker_llm");
                                        else setShowApiKeyPopup(true);
                                    },
                                    style: {
                                        width: "100%",
                                        marginBottom: 12,
                                        padding: "8px 0",
                                        fontWeight: 600
                                    },
                                    children: [
                                        "Faker × LLM ",
                                        hasApiKey ? "" : "🔒"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/story/index.tsx",
                                    lineNumber: 139,
                                    columnNumber: 12
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 12,
                                        lineHeight: 1.6,
                                        opacity: 0.8
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "API key 必須"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/story/index.tsx",
                                            lineNumber: 156,
                                            columnNumber: 14
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            children: "Fakerが物語構造・制約・歪みを先に確定し、 LLMは文章表現のみを担当します。"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/story/index.tsx",
                                            lineNumber: 157,
                                            columnNumber: 14
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            children: "※ 物語の意味や構造はLLMに委ねられません。"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/story/index.tsx",
                                            lineNumber: 161,
                                            columnNumber: 14
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/story/index.tsx",
                                    lineNumber: 155,
                                    columnNumber: 12
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/story/index.tsx",
                            lineNumber: 129,
                            columnNumber: 10
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/pages/story/index.tsx",
                        lineNumber: 119,
                        columnNumber: 8
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/story/index.tsx",
                lineNumber: 116,
                columnNumber: 6
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "キャラクター"
                    }, void 0, false, {
                        fileName: "[project]/pages/story/index.tsx",
                        lineNumber: 171,
                        columnNumber: 8
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8
                        },
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$characters$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["characters"].map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setSelectedCharacter(c.id);
                                    setSelectedTheme(null);
                                    setSelectedSituation(null);
                                    setSelectedVoice(null);
                                    setGeneratedStory("");
                                    setResultMetrics(null);
                                },
                                style: {
                                    padding: "6px 12px",
                                    borderRadius: 999,
                                    fontSize: 12,
                                    background: c.id === selectedCharacter ? "#555" : "#222",
                                    color: "#fff",
                                    border: "1px solid #444"
                                },
                                children: c.name
                            }, c.id, false, {
                                fileName: "[project]/pages/story/index.tsx",
                                lineNumber: 174,
                                columnNumber: 12
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/pages/story/index.tsx",
                        lineNumber: 172,
                        columnNumber: 8
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/story/index.tsx",
                lineNumber: 170,
                columnNumber: 6
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                style: {
                    marginTop: 32,
                    opacity: selectedCharacter ? 1 : 0.4
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "テーマ"
                    }, void 0, false, {
                        fileName: "[project]/pages/story/index.tsx",
                        lineNumber: 201,
                        columnNumber: 8
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8
                        },
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$themes$2f$themeList$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["themes"].map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setSelectedTheme(t);
                                    setSelectedSituation(null);
                                    setSelectedVoice(null);
                                    setGeneratedStory("");
                                    setResultMetrics(null);
                                },
                                style: {
                                    padding: "6px 12px",
                                    borderRadius: 999,
                                    fontSize: 12,
                                    background: t.id === selectedTheme?.id ? "#555" : "#222",
                                    color: "#fff",
                                    border: "1px solid #444"
                                },
                                children: t.label
                            }, t.id, false, {
                                fileName: "[project]/pages/story/index.tsx",
                                lineNumber: 205,
                                columnNumber: 12
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/pages/story/index.tsx",
                        lineNumber: 203,
                        columnNumber: 8
                    }, this),
                    selectedTheme && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$common$2f$ReferencePanel$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["ReferencePanel"], {
                        title: "Character × Theme Reaction（参考）",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$reaction$2f$CharacterThemeMatrix$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["CharacterThemeMatrix"], {}, void 0, false, {
                            fileName: "[project]/pages/story/index.tsx",
                            lineNumber: 230,
                            columnNumber: 12
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/pages/story/index.tsx",
                        lineNumber: 229,
                        columnNumber: 10
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/story/index.tsx",
                lineNumber: 200,
                columnNumber: 6
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                style: {
                    marginTop: 32,
                    opacity: selectedCharacter ? 1 : 0.4
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "シチュエーション"
                    }, void 0, false, {
                        fileName: "[project]/pages/story/index.tsx",
                        lineNumber: 237,
                        columnNumber: 8
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8
                        },
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$situationPresets$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["SITUATION_PRESETS"].map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setSelectedSituation(s.id);
                                    setSelectedVoice(null);
                                    setGeneratedStory("");
                                    setResultMetrics(null);
                                },
                                style: {
                                    padding: "6px 12px",
                                    borderRadius: 999,
                                    fontSize: 12,
                                    background: s.id === selectedSituation ? "#555" : "#222",
                                    color: "#fff",
                                    border: "1px solid #444"
                                },
                                children: s.label
                            }, s.id, false, {
                                fileName: "[project]/pages/story/index.tsx",
                                lineNumber: 241,
                                columnNumber: 12
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/pages/story/index.tsx",
                        lineNumber: 239,
                        columnNumber: 8
                    }, this),
                    selectedSituation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$common$2f$ReferencePanel$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["ReferencePanel"], {
                        title: "Reaction × Situation Structure（参考）",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$reaction$2f$ReactionSituationMatrix$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/pages/story/index.tsx",
                            lineNumber: 265,
                            columnNumber: 14
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/pages/story/index.tsx",
                        lineNumber: 264,
                        columnNumber: 12
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/story/index.tsx",
                lineNumber: 236,
                columnNumber: 6
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                style: {
                    marginTop: 32,
                    opacity: selectedCharacter ? 1 : 0.4
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "文調"
                    }, void 0, false, {
                        fileName: "[project]/pages/story/index.tsx",
                        lineNumber: 272,
                        columnNumber: 8
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8
                        },
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$voices$2f$voiceList$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["voices"].map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setSelectedVoice(v.id);
                                    setGeneratedStory("");
                                    setResultMetrics(null);
                                },
                                style: {
                                    padding: "6px 12px",
                                    borderRadius: 999,
                                    fontSize: 12,
                                    background: v.id === selectedVoice ? "#555" : "#222",
                                    color: "#fff",
                                    border: "1px solid #444"
                                },
                                children: v.label
                            }, v.id, false, {
                                fileName: "[project]/pages/story/index.tsx",
                                lineNumber: 276,
                                columnNumber: 12
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/pages/story/index.tsx",
                        lineNumber: 274,
                        columnNumber: 8
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$common$2f$ReferencePanel$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["ReferencePanel"], {
                        title: "Situation × Voice Affinity（参考）",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$affinity$2f$AffinityMatrix$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                            map: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$affinities$2f$affinityMap$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["affinityMap"],
                            selectedSituation: selectedSituation,
                            selectedVoice: selectedVoice,
                            situationLabelMap: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$situationLabelMap$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["situationLabelMap"],
                            voiceLabelMap: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$voiceLabelMap$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["voiceLabelMap"]
                        }, void 0, false, {
                            fileName: "[project]/pages/story/index.tsx",
                            lineNumber: 298,
                            columnNumber: 12
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/pages/story/index.tsx",
                        lineNumber: 297,
                        columnNumber: 10
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/story/index.tsx",
                lineNumber: 271,
                columnNumber: 6
            }, this),
            plannedMetrics && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                style: {
                    marginTop: 32
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$metrics$2f$PlannedMetricsPanel$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["PlannedMetricsPanel"], {
                    data: plannedMetrics
                }, void 0, false, {
                    fileName: "[project]/pages/story/index.tsx",
                    lineNumber: 311,
                    columnNumber: 10
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/story/index.tsx",
                lineNumber: 310,
                columnNumber: 8
            }, this),
            selectedTheme && selectedSituation && selectedVoice && selectedCharacter && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                style: {
                    marginTop: 32
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: handleGenerateStory,
                    style: {
                        padding: "12px 24px",
                        background: "#222",
                        color: "#fff",
                        borderRadius: 8,
                        fontSize: 16,
                        fontWeight: 600
                    },
                    children: "物語を生成する"
                }, void 0, false, {
                    fileName: "[project]/pages/story/index.tsx",
                    lineNumber: 318,
                    columnNumber: 10
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/story/index.tsx",
                lineNumber: 317,
                columnNumber: 8
            }, this),
            generatedStory && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                style: {
                    marginTop: 32
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "生成された物語"
                    }, void 0, false, {
                        fileName: "[project]/pages/story/index.tsx",
                        lineNumber: 337,
                        columnNumber: 10
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                        style: {
                            whiteSpace: "pre-wrap"
                        },
                        children: generatedStory
                    }, void 0, false, {
                        fileName: "[project]/pages/story/index.tsx",
                        lineNumber: 338,
                        columnNumber: 10
                    }, this),
                    resultMetrics && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$metrics$2f$MetricsPanel$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["MetricsPanel"], {
                        metrics: resultMetrics
                    }, void 0, false, {
                        fileName: "[project]/pages/story/index.tsx",
                        lineNumber: 340,
                        columnNumber: 28
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/story/index.tsx",
                lineNumber: 336,
                columnNumber: 8
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/pages/story/index.tsx",
        lineNumber: 112,
        columnNumber: 4
    }, this);
}
_s(StoryPage, "7LtzyqHd/o4bPpx21AA5yIculTE=");
_c = StoryPage;
var _c;
__turbopack_context__.k.register(_c, "StoryPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/pages/story/index.tsx [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/story";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/pages/story/index.tsx [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if (module.hot) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}),
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/pages/story/index.tsx\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/pages/story/index.tsx [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__d54b0350._.js.map