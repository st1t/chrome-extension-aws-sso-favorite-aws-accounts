"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const portalInstanceListPath = 'body > app > portal-ui > div > div > div.container > centered-content > portal-dashboard > div > portal-application-list > sso-expander > portal-instance-list';
function searchAwsAccountNodes() {
    return document.querySelectorAll(portalInstanceListPath + ' > div');
}
function searchFavoriteAwsAccountIdsByCookie() {
    const cookies = document.cookie.split('; ');
    const accountIds = [];
    const accountCookies = cookies.filter(cookie => cookie.match(/favorite_account_/));
    accountCookies.forEach(account => {
        accountIds.push(account.split('=')[1]);
    });
    return accountIds;
}
function createCheckbox(accountId, isChecked) {
    const checkbox = document.createElement('input');
    checkbox.setAttribute('_ngcontent-c16', '');
    checkbox.className = 'instance-icon';
    checkbox.type = 'checkbox';
    checkbox.id = `check_${accountId}`;
    checkbox.name = 'subscribe';
    checkbox.checked = isChecked;
    return checkbox;
}
function addCheckbox() {
    searchAwsAccountNodes().forEach(accountNode => {
        var _a;
        const instanceBlock = accountNode.querySelector('div > div > div');
        if (!instanceBlock) {
            console.error('Instance block not found');
            return;
        }
        const accountIdElem = accountNode.querySelector('#instance-metadata > span.accountId');
        if (!accountIdElem) {
            console.error('Account ID element not found');
            return;
        }
        const accountId = (_a = accountIdElem.textContent) === null || _a === void 0 ? void 0 : _a.replace(/#/g, '');
        if (!accountId) {
            console.error('Account ID not found');
            return;
        }
        const isChecked = searchFavoriteAwsAccountIdsByCookie().includes(accountId);
        const checkbox = createCheckbox(accountId, isChecked);
        const overlayDiv = document.createElement("div");
        overlayDiv.className = "instance-icon-block";
        overlayDiv.setAttribute("_ngcontent-c16", "");
        overlayDiv.setAttribute('style', 'text-align:center');
        overlayDiv.appendChild(checkbox);
        instanceBlock.prepend(overlayDiv);
        checkbox.addEventListener('change', () => {
            if (!checkbox.checked) {
                document.cookie = `favorite_account_${accountId}=;max-age=0`;
            }
            else {
                const maxAge = 60 * 60 * 24 * 365;
                document.cookie = `favorite_account_${accountId}=${accountId};max-age=${maxAge}`;
            }
        });
    });
}
function sortAccounts() {
    const accountList = document.querySelector(portalInstanceListPath);
    searchFavoriteAwsAccountIdsByCookie().forEach(accountId => {
        const instances = Array.from(searchAwsAccountNodes());
        for (const instance of instances) {
            const instanceElem = instance.querySelector('#instance-metadata > .accountId');
            if (!instanceElem) {
                console.error('Not found accountId');
                return;
            }
            const instanceText = instanceElem.textContent;
            if (!instanceText) {
                console.error('Not found instanceText');
                return;
            }
            const instanceId = instanceText.replace(/#/g, '');
            if (instanceId === accountId) {
                accountList.prepend(instance);
                break;
            }
        }
    });
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
window.addEventListener('load', () => {
    const jsInitCheckTimer = setInterval(jsLoaded, 100);
    function jsLoaded() {
        return __awaiter(this, void 0, void 0, function* () {
            if (document.querySelector('#app-03e8643328913682') != null) {
                clearInterval(jsInitCheckTimer);
            }
            else {
                return;
            }
            const target = document.querySelector('[title="AWS Account"]');
            if (!target) {
                console.error('Target element not found');
                return;
            }
            target.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                yield sleep(80);
                if (document.querySelector(portalInstanceListPath)) {
                    yield addCheckbox();
                    yield sortAccounts();
                }
            }));
            yield target.click();
        });
    }
}, false);
