// HTTP caching: the handler sets Cache-Control by hand; Marko Run has no data cache API.
let hits = 0;

export const GET = Run.GET(() => {
  hits += 1;
  return Response.json(
    { value: Date.now(), hits },
    { headers: { "Cache-Control": "public, max-age=3, s-maxage=3" } },
  );
});
