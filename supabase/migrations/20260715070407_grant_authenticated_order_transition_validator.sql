-- The status trigger runs in the authenticated request context. Its pure
-- validator must therefore be executable by that role; direct order updates
-- remain protected by the admin-only RLS policy.
grant execute on function public.is_valid_order_status_transition(text, text) to authenticated;
