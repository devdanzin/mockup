
export async function request({
    method = "GET",
    vocabularyUrl = null,
    attributes = {},
    path = null,
    uids = null,
    params = null,
}) {
    let vocabQuery;

    if (path) {
        vocabQuery = {
            criteria: [
                {
                    i: "path",
                    o: "plone.app.querystring.operation.string.path",
                    v: `${path}::1`,
                },
            ],
            sort_on: "getObjPositionInParent",
            sort_order: "ascending",
        };
    }
    if (uids) {
        vocabQuery = {
            criteria: [
                {
                    i: "UID",
                    o: "plone.app.querystring.operation.list.contains",
                    v: uids,
                },
            ],
        };
    }
    let url = `${vocabularyUrl}&query=${JSON.stringify(
        vocabQuery
    )}&attributes=${JSON.stringify(attributes)}&batch=${JSON.stringify({
        page: 1,
        size: 100,
    })}`;

    // store.update((data) => {
    //     delete data.errors;
    //     data.loading = true;
    //     return data;
    // });

    let headers = new Headers();
    // headers.set("Content-type", "application/json");
    headers.set("Accept", "application/json");
    const body = params ? JSON.stringify(params) : undefined;

    const response = await fetch(url, { method, body, headers });
    const json = await response.json();

    if (response.ok) {
        return json;
    } else {
        // store.update((data) => {
        //     data.loading = false;
        //     data.errors = json.errors;
        //     return data;
        // });
        // return {};
        return json.errors;
    }
}
