
export function saveToken(token: string) {
    localStorage.setItem("token", token)
}

export function getToken() {
    return localStorage.getItem("token")
}

export function resetToken() {
    localStorage.removeItem("token");
}

export function logout() {
    resetToken();
    location.reload();
}
