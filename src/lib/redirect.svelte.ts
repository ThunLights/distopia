
export function redirectUrl(url: string) {
    return (() => {
        location.href = url;
    })
}
