import { z } from "zod"

function structCheckerCore<T extends z.ZodRawShape, K extends z.infer<z.ZodObject<T>>>(obj: unknown, zodSchema: z.ZodObject<T>): obj is K {
	try {
		zodSchema.parse(obj)
		return true
	} catch {
		return false
	}
}

function structChecker<T extends z.ZodRawShape>(obj: unknown, zodSchema: z.ZodObject<T>) {
	if (typeof obj === "object" && structCheckerCore(obj, zodSchema)) {
		const newobj: z.infer<typeof zodSchema> = obj
		return newobj
	} else {
		return null
	}
}

export {
	structChecker,
}
