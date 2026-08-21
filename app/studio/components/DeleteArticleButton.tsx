"use client";

import { useRef } from "react";

export default function DeleteArticleButton({ id, title, csrf }: { id: number; title: string; csrf: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return <><button type="button" className="dangerLink" onClick={() => dialogRef.current?.showModal()}>Delete</button><dialog ref={dialogRef} className="confirmDialog" onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current?.close(); }}><div><small>DESTRUCTIVE ACTION</small><h2>Delete this article?</h2><p>“{title}” will be permanently removed. This cannot be undone.</p><div className="confirmActions"><button type="button" onClick={() => dialogRef.current?.close()}>Cancel</button><form action={`/api/admin/articles/${id}`} method="post"><input type="hidden" name="intent" value="delete"/><input type="hidden" name="_csrf" value={csrf}/><button type="submit" className="confirmDanger">Delete article</button></form></div></div></dialog></>;
}
