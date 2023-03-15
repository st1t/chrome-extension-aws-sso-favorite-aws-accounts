const portalInstanceListPath = 'body > app > portal-ui > div > div > div.container > centered-content > portal-dashboard > div > portal-application-list > sso-expander > portal-instance-list';

function searchAwsAccountNodes(): NodeListOf<Element> {
    return document.querySelectorAll(portalInstanceListPath + ' > div');
}

function searchFavoriteAwsAccountIdsByCookie(): string[] {
    const cookies = document.cookie.split('; ');
    const accountIds: string[] = [];
    const accountCookies = cookies.filter(cookie => cookie.match(/favorite_account_/));
    accountCookies.forEach(account => {
        accountIds.push(account.split('=')[1]);
    });
    return accountIds;
}

function createCheckbox(accountId: string, isChecked: boolean): HTMLInputElement {
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
        const accountId = accountIdElem.textContent?.replace(/#/g, '');
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
            } else {
                const maxAge = 60 * 60 * 24 * 365;
                document.cookie = `favorite_account_${accountId}=${accountId};max-age=${maxAge}`;
            }
        });
    });
}

function sortAccounts() {
    const accountList = document.querySelector(portalInstanceListPath) as HTMLElement;
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

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

window.addEventListener('load', () => {
    const jsInitCheckTimer = setInterval(jsLoaded, 100);

    async function jsLoaded() {
        if (document.querySelector('#app-03e8643328913682') != null) {
            clearInterval(jsInitCheckTimer);
        } else {
            return;
        }
        const target = document.querySelector('[title="AWS Account"]') as HTMLElement;
        if (!target) {
            console.error('Target element not found');
            return;
        }
        target.addEventListener('click', async () => {
            await sleep(80);
            if (document.querySelector(portalInstanceListPath)) {
                await addCheckbox();
                await sortAccounts();
            }
        });
        await target.click();
    }
}, false);
