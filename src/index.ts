const portalInstanceListPath: string = 'body > app > portal-ui > div > div > div.container > centered-content > portal-dashboard > portal-application-list > sso-expander > portal-instance-list';

function searchAwsAccountNodes() {
    const nodes: any[] = Array.from(document.querySelectorAll(portalInstanceListPath + ' > div'));
    return nodes.filter(ac => ac.className.match(/ng-tns-c16-/));
}

function searchFavoriteAwsAccountIdsByCookie() {
    const cookies = Array.from(document.cookie.split('; '));
    const accountIds: string[] = [];
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
        } else {
            overlayDiv.innerHTML = `<input _ngcontent-c16 class="instance-icon" type="checkbox" id="check_${accountId}" name="subscribe">`;
        }
        instanceBlock.prepend(overlayDiv);

        // チェックボックスが押された時にクッキーに状態を保存する
        accountNode.querySelector(`div > div > div > div > #check_${accountId}`).addEventListener('change', () => {
            // チェックボタンを押した後に処理が実行される
            const checkAccountId = document.querySelector(`#check_${accountId}`) as HTMLInputElement;
            if (checkAccountId === null) {
                console.error('Not found checkAccountId');
                return;
            }
            if (!checkAccountId.checked) {
                document.cookie = `favorite_account_${accountId}=;max-age=0`;
            } else {
                const maxAge: number = 60 * 60 * 24 * 365;
                document.cookie = `favorite_account_${accountId}=${accountId};max-age=${maxAge}`;
            }
        });
    });
}

function sortAccounts() {
    const accountList: HTMLElement = document.querySelector(portalInstanceListPath) as HTMLInputElement;
    searchFavoriteAwsAccountIdsByCookie().forEach(accountId => {
        const instances: HTMLElement[] = Array.from(searchAwsAccountNodes());
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

const _sleep = (ms: number) => new Promise((resolve: TimerHandler) => window.setTimeout(resolve, ms));

window.addEventListener('load', () => {
    const jsInitCheckTimer = setInterval(jsLoaded, 100);

    async function jsLoaded() {
        if (document.querySelector('#app-03e8643328913682') != null) {
            clearInterval(jsInitCheckTimer);
        } else {
            console.error('Not found #app-03e8643328913682');
            return;
        }
        const target: HTMLElement = document.querySelector('[title="AWS Account"]') as HTMLInputElement;
        await target.addEventListener('click', async () => {
            await _sleep(80);
            if (document.querySelector(portalInstanceListPath)) {
                await addCheckbox();
                await sortAccounts();
            }
        });
        await target.click();
    }
}, false);
