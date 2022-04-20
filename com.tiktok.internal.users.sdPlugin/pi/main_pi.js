let websocket = null,
    uuid = null,
    actionInfo = {};

function connectElgatoStreamDeckSocket(
    inPort,
    inPropertyInspectorUUID,
    inRegisterEvent,
    inInfo,
    inActionInfo
) {
    uuid = inPropertyInspectorUUID;
    actionInfo = JSON.parse(inActionInfo);

    websocket = new WebSocket("ws://localhost:" + inPort);

    websocket.onopen = function () {
        // WebSocket is connected, register the Property Inspector
        let json = {
            event: inRegisterEvent,
            uuid: inPropertyInspectorUUID,
        };
        websocket.send(JSON.stringify(json));

        json = {
            event: "getSettings",
            context: uuid,
        };
        websocket.send(JSON.stringify(json));

        json = {
            event: "getGlobalSettings",
            context: uuid,
        };
        websocket.send(JSON.stringify(json));
    };

    websocket.onmessage = function (evt) {
        // Received message from Stream Deck
        const jsonObj = JSON.parse(evt.data);
        if (jsonObj.event === "didReceiveSettings") {
            const payload = jsonObj.payload.settings;
            initiateElement("APIKey", payload.APIKey);
            initiateElement("Username", payload.Username);
        }
    };
}

function initiateElement(element, value, fallback = "") {
    if (typeof value === "undefined") {
        document.getElementById(element).value = fallback;
        return;
    }
    document.getElementById(element).value = value;
}

function updateSettings() {
    if (websocket && websocket.readyState === 1) {
        let payload = {};

        ['APIKey', 'Username'].forEach(f => {
            payload[f] = document.getElementById(f).value;
        });

        const json = {
            event: "setSettings",
            context: uuid,
            payload: payload,
        };
        websocket.send(JSON.stringify(json));
    }
}

function updateGlobal() {
    if (websocket && websocket.readyState === 1) {
        let payload = {};

        ['APIKey', 'Username'].forEach(f => {
            payload[f] = document.getElementById(f).value;
        });

        const json = {
            event: "setGlobalSettings",
            context: uuid,
            payload,
        };
        websocket.send(JSON.stringify(json));
    }
}

function openPage(site) {
    if (websocket && websocket.readyState === 1) {
        const json = {
            event: "openUrl",
            payload: {
                url: `https://${site}`,
            },
        };
        websocket.send(JSON.stringify(json));
    }
}