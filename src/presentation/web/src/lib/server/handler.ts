import type { AppTypes, LayoutParams } from "$app/types";
import type { MaybePromise } from "$lib/shared/types/Promise";
import type { UserAuth } from "$lib/shared/types/UserAuth";
import { errorJson } from "./res";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { json, type RequestEvent } from "@sveltejs/kit";

export async function authHandler<
  RouteParams extends LayoutParams<RouteId>,
  RouteId extends ReturnType<AppTypes["RouteId"]>,
>(
  handler: (
    event: RequestEvent<RouteParams, RouteId> & { locals: { user: UserAuth } },
  ) => MaybePromise<Response>,
): Promise<(event: RequestEvent<RouteParams, RouteId>) => MaybePromise<Response>> {
  return async (e) => {
    const { user } = e.locals;

    if (!user) {
      return json(
        {
          content: "Invalid User",
        },
        { status: 400 },
      );
    }

    return await handler({ ...e, locals: { ...e.locals, user } });
  };
}

export async function validateHandler<
  SchemaInput,
  SchemaOutput,
  RouteParams extends LayoutParams<RouteId>,
  RouteId extends ReturnType<AppTypes["RouteId"]>,
>(
  schema: StandardSchemaV1<SchemaInput, SchemaOutput>,
  handler: (
    event: RequestEvent<RouteParams, RouteId>,
    body: SchemaOutput,
  ) => MaybePromise<Response>,
): Promise<(event: RequestEvent<RouteParams, RouteId>) => MaybePromise<Response>> {
  return async (e) => {
    const body = await schema["~standard"].validate(await e.request.json());

    if (body.issues) {
      return errorJson("Invalid Body: " + body.issues.map(({ message }) => message).join("; "));
    }

    return await handler(e, body.value);
  };
}

export async function authAndValidateHandler<
  SchemaInput,
  SchemaOutput,
  RouteParams extends LayoutParams<RouteId>,
  RouteId extends ReturnType<AppTypes["RouteId"]>,
>(
  schema: StandardSchemaV1<SchemaInput, SchemaOutput>,
  handler: (
    event: RequestEvent<RouteParams, RouteId> & { locals: { user: UserAuth } },
    body: SchemaOutput,
  ) => MaybePromise<Response>,
): Promise<(event: RequestEvent<RouteParams, RouteId>) => MaybePromise<Response>> {
  return async (e) => {
    const { user } = e.locals;
    const body = await schema["~standard"].validate(await e.request.json());

    if (!user) {
      return errorJson("Invalid User");
    }

    if (body.issues) {
      return errorJson("Invalid Body: " + body.issues.map(({ message }) => message).join("; "));
    }

    return await handler({ ...e, locals: { ...e.locals, user } }, body.value);
  };
}
