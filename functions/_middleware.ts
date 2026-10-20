export const onRequest: PagesFunction<{ ENVIRONMENT?: string }> = async (context) => {
  const response = await context.next();
  const url = new URL(context.request.url);
  const headers = new Headers(response.headers);
  if (
    context.env.ENVIRONMENT !== 'production' ||
    (url.search && /\/(machines|makineler|categories|kategoriler)\//.test(url.pathname))
  )
    headers.set('X-Robots-Tag', 'noindex, follow');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
