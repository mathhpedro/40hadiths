-- The trigger still runs (it executes as the function owner), but the function
-- should not be invocable directly through the public REST API (RPC).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
