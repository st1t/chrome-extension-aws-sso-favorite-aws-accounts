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
const portalInstanceListPath = 'body > app > portal-ui > div > div > div.container > centered-content > portal-dashboard > portal-application-list > sso-expander > portal-instance-list';
function searchAwsAccountNodes() {
    const nodes = Array.from(document.querySelectorAll(portalInstanceListPath + ' > div'));
    return nodes.filter(ac => ac.className.match(/ng-tns-c16-/));
}
function searchFavoriteAwsAccountIdsByCookie() {
    const cookies = Array.from(document.cookie.split('; '));
    const accountIds = [];
    const accountCookies = cookies.filter(cookie => cookie.match(/favorite_account_/));
    accountCookies.forEach(account => {
        accountIds.push(account.split('=')[1]);
    });
    return accountIds;
}
function addCheckbox() {
    searchAwsAccountNodes().forEach(accountNode => {
        const instanceBlock = accountNode.querySelector('div > div > div');
        const overlayDiv = document.createElement("div");
        const atr = document.createAttribute("_ngcontent-c16");
        overlayDiv.className = "instance-icon-block";
        overlayDiv.setAttributeNode(atr);
        overlayDiv.setAttribute('style', 'text-align:center');
        // クッキーの状態からチェックボックスがチェック済みか判定
        const accountId = accountNode.querySelector('#instance-metadata > span.accountId').textContent.replace(/#/g, '');
        if (searchFavoriteAwsAccountIdsByCookie().find((v) => v === accountId)) {
            overlayDiv.innerHTML = `<input _ngcontent-c16 checked class="instance-icon" type="checkbox" id="check_${accountId}" name="subscribe">`;
        }
        else {
            overlayDiv.innerHTML = `<input _ngcontent-c16 class="instance-icon" type="checkbox" id="check_${accountId}" name="subscribe">`;
        }
        instanceBlock.prepend(overlayDiv);
        // チェックボックスが押された時にクッキーに状態を保存する
        accountNode.querySelector(`div > div > div > div > #check_${accountId}`).addEventListener('change', () => {
            // チェックボタンを押した後に処理が実行される
            const checkAccountId = document.querySelector(`#check_${accountId}`);
            if (checkAccountId === null) {
                console.error('Not found checkAccountId');
                return;
            }
            if (!checkAccountId.checked) {
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
        for (let i = 0, instanceId; i < instances.length; i++) {
            const instance = instances[i].querySelector('#instance-metadata > .accountId');
            if (instance === null) {
                console.error('Not found accountId');
                return;
            }
            const instanceText = instance.textContent;
            if (instanceText === null) {
                console.error('Not found instanceText');
                return;
            }
            instanceId = instanceText.replace(/#/g, '');
            if (instanceId === accountId) {
                accountList.prepend(instances[i]);
                break;
            }
        }
    });
}
const _sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
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
            yield target.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                yield _sleep(80);
                if (document.querySelector(portalInstanceListPath)) {
                    yield addCheckbox();
                    yield sortAccounts();
                }
            }));
            yield target.click();
        });
    }
}, false);
