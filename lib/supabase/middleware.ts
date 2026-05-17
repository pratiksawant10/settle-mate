import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getSafeNextPath(value: string | null, fallback = "/planner") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

function getRequestOrigin(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");

  if (!host) {
    return request.nextUrl.origin;
  }

  return `${protocol}://${host}`;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });

          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPlannerRoute = pathname.startsWith("/planner");
  const isAskAiRoute = pathname.startsWith("/ask-ai");
  const isLoginRoute = pathname === "/login";

  if ((isPlannerRoute || isAskAiRoute) && !user) {
    const redirectUrl = new URL("/login", getRequestOrigin(request));
    redirectUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);

    return NextResponse.redirect(redirectUrl);
  }

  if (isLoginRoute && user) {
    return NextResponse.redirect(
      new URL(getSafeNextPath(request.nextUrl.searchParams.get("next")), getRequestOrigin(request)),
    );
  }

  return response;
}
