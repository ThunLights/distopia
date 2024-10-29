export const sleep = async (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms))
