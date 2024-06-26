# React 19: She's alive!

Playing around with React 19 features:

- Actions, async transitions and `useActionState`
- Forms: enhancing the native `form` and `button` elements, and a new `useFormStatus` hook
- At last! We have a `useOptimistic` hook, but what's it like to use?
- `use` with promises and conditionals: can this help us with data loading?

## Initial thoughts

These are mostly related to data handling and asynchronous state updates. With the `useTransition`
hook now allowing asynchronous transitions, we can clean our code of the ubiquitous
`void doSomethingAsyncThenUpdateState()` pattern within useEffects.

They also give a feeling of being more in control of data flow. Consider the use of `void` above: we
want to perform an asynchronous action, such as a data fetch, without blocking the UI. We call an
async function but ignore / do not await the returned promise, the implicit contract being that all
errors will be handled gracefully within the function itself. Any resulting state update is applied
within the function also, but now we've disconnected the handling of the result from the code that
initiated the action. We might end up with a positive result, such as an item being updated, or we
might see an error message appear in the UI indicating something went wrong, but in either case, the
calling code is no longer in control. It just makes me feel a little uneasy, that's all.

Of course, we could wrap the asynchronous call and the state updates (including any intermediate
"busy" state) inside a custom hook, so we have a single control unit. This is essentially what we
get with React 19 and the `useActionState` hook. You can read more in the
[React 19 Beta](https://19.react.dev/blog/2024/04/25/react-19#actions) announcement.

React 19 also introduces
[server components](https://19.react.dev/blog/2024/04/25/react-19#react-server-components)
but I won't look at those here, as they are currently tied to React frameworks such as NextJS.
